import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PublicWorkflowRunner } from "@/components/console/workflow/public-workflow-runner";
import PageSection from "@/components/core/page-section";
import { prisma } from "@/lib/utils/db";
import { getAppBaseUrl } from "@/lib/utils/url";
import { Button } from "@/components/ui/button";
import logo from "@/public/images/logo.png";

interface Props {
  params: Promise<{
    shortId: string;
  }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  
  const workflow = await prisma.workflow.findUnique({
    where: {
      shortId: params.shortId,
    },
  });

  if (!workflow || !workflow.published) {
    return {
      title: "Workflow Not Found",
    };
  }

  const baseUrl = getAppBaseUrl();
  const shareUrl = `${baseUrl}/share/${workflow.shortId}`;
  const ogImageUrl = `${baseUrl}/share/${workflow.shortId}/opengraph-image`;

  return {
    title: `${workflow.name} - AI Tutor API`,
    description: "Run this workflow instantly - no login required. Powered by AI Tutor API.",
    openGraph: {
      title: workflow.name,
      description: "Run this workflow instantly - no login required. Powered by AI Tutor API.",
      url: shareUrl,
      siteName: "AI Tutor API",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: workflow.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: workflow.name,
      description: "Run this workflow instantly - no login required. Powered by AI Tutor API.",
      images: [ogImageUrl],
    },
    metadataBase: new URL(baseUrl),
  };
}

export default async function PublicSharePage(props: Props) {
  const params = await props.params;
  
  const workflow = await prisma.workflow.findUnique({
    where: {
      shortId: params.shortId,
    },
  });

  // Check if workflow exists and is published
  if (!workflow || !workflow.published) {
    return notFound();
  }

  // Check if share link has expired - show custom expired page
  if (workflow.shareExpiresAt && workflow.shareExpiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src={logo}
                alt="AI Tutor API"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>

            {/* Expired Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                This Workflow Has Expired
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                The share link for this workflow is no longer available.
              </p>
            </div>

            {/* AI Tutor API Explanation */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-6 mb-8 border border-pink-200 dark:border-pink-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                What is AI Tutor API?
              </h2>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4 text-center">
                AI Tutor API is a powerful platform that lets you create, customize, and deploy AI-powered workflows. Build intelligent tutoring systems, automated assistants, and interactive AI experiences with ease.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Design Your Workflow</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create custom prompts and define input variables for your AI workflows.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Choose Your Model</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Select from OpenAI, Anthropic, Google, Meta, and more AI models.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Test & Deploy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Test your workflows and share them publicly or use via API.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Share Instantly</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create public share links for anyone to use your workflows.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-6">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Make your own amazing workflows today!
              </p>
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Get Started with AI Tutor API
                </Button>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No credit card required • Start with 10 free credits
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm sm:text-base font-medium text-center sm:text-left">
              ✨ This workflow is made using the <span className="font-bold">AI Tutor API</span> and you can make your own now!
            </p>
            <a
              href="/workflows"
              className="inline-flex items-center px-6 py-2.5 bg-white text-pink-600 font-semibold rounded-full hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Create Your Own
            </a>
          </div>
        </div>
      </div>

      <PageSection>
        <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {workflow.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Test Flow
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <PublicWorkflowRunner workflow={workflow} />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by{" "}
              <span className="font-semibold text-pink-600 dark:text-pink-400">
                AI Tutor API
              </span>
            </p>
          </div>
        </div>
      </PageSection>
    </div>
  );
}

