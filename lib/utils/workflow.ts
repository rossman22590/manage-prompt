import { z } from "zod";
import {
  type AIModel,
  AIModels,
  type WorkflowInput,
  WorkflowInputType,
  WorkflowTestCondition,
} from "@/data/workflow";
import { WebpageParser } from "./firecrawl-parser";

export const MAX_GLOBAL_RATE_LIMIT_RPS = 100;
export const MAX_RATE_LIMIT_RPS = 50;

const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

export const WorkflowSchema = z.object({
  model: z.enum(zodEnum<AIModel>(AIModels)),
  name: z.string().min(2).max(150),
  template: z.string().min(1).max(9999),
  instruction: z.string().optional().default(""),
  modelSettings: z.string().optional().nullable(),
  cacheControlTtl: z.number().int().optional().default(0),
  inputs: z.array(
    z.object({
      name: z.string(),
      label: z.string().optional(),
      type: z.enum(["text", "textarea", "number", "url", "image"]).optional(),
    }),
  ),
});

export const WorkflowBranchSchema = z.object({
  shortId: z
    .string()
    .min(1)
    .max(16)
    .refine((value) => /^[a-zA-Z0-9-_]+$/.test(value ?? ""), {
      message: "Branch name must be alphanumeric",
    }),
  model: z.enum(zodEnum<AIModel>(AIModels)),
  template: z.string().min(1).max(9999),
  instruction: z.string().optional().default(""),
  modelSettings: z.string().optional().nullable(),
});

export const WorkflowTestSchema = z.object({
  id: z.number(),
  input: z.string(),
  condition: z.enum(zodEnum<string>(Object.keys(WorkflowTestCondition))),
  output: z.string(),
});

// Helper to check if a string is a valid image URL
const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(pathname);
  } catch {
    return false;
  }
};

// Helper to get media type from URL or data URL
const getMediaType = (imageData: string): string => {
  if (imageData.startsWith('data:image')) {
    const match = imageData.match(/data:image\/([^;]+)/);
    return match ? `image/${match[1]}` : 'image/png';
  }
  // For URLs, try to detect from extension
  try {
    const url = new URL(imageData);
    const ext = url.pathname.toLowerCase().split('.').pop();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
  } catch {
    // Not a valid URL, default to png
  }
  return 'image/png';
};

export const translateInputs = async ({
  inputs,
  inputValues,
  template,
}: {
  inputs: WorkflowInput[];
  inputValues: Record<string, string>;
  template: string;
}) => {
  let content = template;
  const imageParts: Array<{ url: string; mediaType: string; isDataUrl: boolean }> = [];
  const webpageParser = new WebpageParser();
  
  for (const input of inputs) {
    if (input.type === WorkflowInputType.url) {
      const pageContent = await webpageParser.getContent(
        inputValues[input.name],
      );
      content = content.replace(`{{${input.name}}}`, pageContent);
    } else if (input.type === WorkflowInputType.image) {
      const imageData = inputValues[input.name];
      if (imageData) {
        // Check if it's a base64 data URL or a valid image URL
        if (imageData.startsWith('data:image')) {
          // Base64 data URL from file upload
          imageParts.push({
            url: imageData,
            mediaType: getMediaType(imageData),
            isDataUrl: true,
          });
          content = content.replace(`{{${input.name}}}`, '[IMAGE]');
        } else if (isValidImageUrl(imageData)) {
          // Valid image URL
          imageParts.push({
            url: imageData,
            mediaType: getMediaType(imageData),
            isDataUrl: false,
          });
          content = content.replace(`{{${input.name}}}`, '[IMAGE]');
        }
      }
    } else {
      content = content.replace(`{{${input.name}}}`, inputValues[input.name]);
    }
  }
  return { content, imageParts };
};
