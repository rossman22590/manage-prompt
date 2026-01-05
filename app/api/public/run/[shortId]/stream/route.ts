import { hasWebSearch, modelToProviderId, type WorkflowInput } from "@/data/workflow";
import { ErrorCodes, ErrorResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { hasExceededSpendLimit, isSubscriptionActive, reportUsage } from "@/lib/utils/stripe";
import { translateInputs } from "@/lib/utils/workflow";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import type Stripe from "stripe";

const getOpenRouterHeaders = () => {
  const appUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://manageprompt.com";

  const siteName = process.env.OPENROUTER_SITE_NAME || "AI Tutor API";

  const headers: Record<string, string> = {
    "HTTP-Referer": appUrl,
    "X-Title": siteName,
  };
  return headers;
};

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ shortId: string }> },
) {
  const params = await props.params;
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return ErrorResponse("Token required", 401);
  }

  try {
    // Find the workflow by shortId
    const workflow = await prisma.workflow.findUnique({
      where: {
        shortId: params.shortId,
      },
      include: {
        organization: {
          include: {
            stripe: true,
          },
        },
      },
    });

    if (!workflow || !workflow.published) {
      return ErrorResponse("Workflow not found or not published", 404);
    }

    // Check if share link has expired
    if (workflow.shareExpiresAt && workflow.shareExpiresAt < new Date()) {
      return ErrorResponse("This share link has expired", 410);
    }

    const organization = workflow.organization;

    // Block if credits are 0 (regardless of subscription status)
    if (organization?.credits === 0) {
      // If no subscription, block with invalid billing
      if (!isSubscriptionActive(organization?.stripe?.subscription)) {
        return ErrorResponse(
          "This workflow is temporarily unavailable. Please contact the workflow owner.",
          402,
          ErrorCodes.InvalidBilling,
        );
      }

      // If has subscription but spend limit exceeded, block with spend limit error
      if (
        await hasExceededSpendLimit(
          organization?.spendLimit,
          organization?.stripe?.customerId,
        )
      ) {
        return ErrorResponse(
          "This workflow is temporarily unavailable due to billing limits.",
          402,
          ErrorCodes.SpendLimitReached,
        );
      }

      // If has subscription but no spend limit exceeded, still block at 0 credits
      return ErrorResponse(
        "This workflow is temporarily unavailable. Please contact the workflow owner.",
        402,
        ErrorCodes.InvalidBilling,
      );
    }

    const body = (await req.json().catch(() => ({}))) ?? {};

    const inputs = workflow.inputs as unknown as WorkflowInput[];
    const { content, imageParts } = await translateInputs({
      inputs,
      inputValues: body,
      template: workflow.template,
    });

    // Build instruction if present
    let instruction = workflow.instruction ?? "";
    Object.keys(body).forEach((key) => {
      instruction = instruction.replace(`{{${key}}}`, body[key]);
    });

    let providerModelId = modelToProviderId[workflow.model] ?? workflow.model;
    // Append :online for web search capable models
    // Only if enableWebSearch is true (defaults to true if not specified)
    // Note: :online works for ANY model on OpenRouter (uses native search if available, otherwise Exa)
    // We enable it for models that have native/built-in web search capabilities
    const isPerplexityModel = providerModelId.startsWith('perplexity/');
    const modelSettings = (workflow.modelSettings as any) ?? {};
    const shouldEnableWebSearch = modelSettings.enableWebSearch !== false; // Default to true
    if (hasWebSearch(workflow.model as any) && !isPerplexityModel && shouldEnableWebSearch) {
      // Append :online suffix - uses native search for OpenAI/Gemini, Exa for others
      providerModelId = `${providerModelId}:online`;
    }
    
    const subscription = organization?.stripe
      ?.subscription as unknown as Stripe.Subscription | null;

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // If images are present, use messages format with parts array
    if (imageParts && imageParts.length > 0) {
      const parts: Array<{ type: 'text' | 'file'; text?: string; url?: string; mediaType?: string }> = [];
      
      // Split content by [IMAGE] placeholders and add text/file parts
      const textParts = content.split('[IMAGE]');
      for (let i = 0; i < textParts.length; i++) {
        if (textParts[i]) {
          parts.push({ type: 'text', text: textParts[i] });
        }
        if (i < imageParts.length) {
          const imagePart = imageParts[i];
          parts.push({
            type: 'file',
            url: imagePart.url,
            mediaType: imagePart.mediaType,
          });
        }
      }

      // Build content array in the correct format for Vercel AI SDK
      const messageContent = parts.map(part => 
        part.type === 'text' 
          ? { type: 'text' as const, text: part.text || '' }
          : { 
              type: 'image' as const, 
              image: part.url || ''
            }
      );

      const completion = streamText({
        model: openrouter(providerModelId),
        headers: getOpenRouterHeaders(),
        messages: [
          {
            role: 'user' as const,
            content: messageContent,
          },
        ],
        system: instruction || undefined,
        temperature: modelSettings.temperature ?? 0.7,
        topP: modelSettings.topP ?? 1,
        frequencyPenalty: modelSettings.frequencyPenalty ?? 0,
        presencePenalty: modelSettings.presencePenalty ?? 0,
        onFinish: async (result) => {
          const totalTokens = result.usage?.totalTokens ?? 0;
          if (totalTokens > 0) {
            await reportUsage(organization.id, subscription, totalTokens);
          }
        },
      });

      return completion.toTextStreamResponse({
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    // No images, use prompt format
    const completion = streamText({
      model: openrouter(providerModelId),
      headers: getOpenRouterHeaders(),
      prompt: content,
      system: instruction || undefined,
      temperature: modelSettings.temperature ?? 0.7,
      topP: modelSettings.topP ?? 1,
      frequencyPenalty: modelSettings.frequencyPenalty ?? 0,
      presencePenalty: modelSettings.presencePenalty ?? 0,
      onFinish: async (result) => {
        const totalTokens = result.usage?.totalTokens ?? 0;
        if (totalTokens > 0) {
          await reportUsage(organization.id, subscription, totalTokens);
        }
      },
    });

    return completion.toTextStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  } catch (error: any) {
    console.error("Error in public workflow stream:", error);
    return ErrorResponse(
      error?.message || "Failed to stream workflow",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}

