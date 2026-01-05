import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicWorkflowRunner } from "@/components/console/workflow/public-workflow-runner";
import PageSection from "@/components/core/page-section";
import { prisma } from "@/lib/utils/db";
import { getAppBaseUrl } from "@/lib/utils/url";

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

  if (!workflow || !workflow.published) {
    return notFound();
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

