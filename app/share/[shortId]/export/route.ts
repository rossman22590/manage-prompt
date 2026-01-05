import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _: NextRequest,
  props: {
    params: Promise<{
      shortId: string;
    }>;
  },
) {
  const params = await props.params;
  const shortId = params.shortId;
  
  const workflow = await prisma.workflow.findUnique({
    where: {
      shortId,
    },
  });

  if (!workflow || !workflow.published) {
    return NextResponse.json(
      { error: "Workflow not found" },
      { status: 404 }
    );
  }

  // Check if share link has expired
  if (workflow.shareExpiresAt && workflow.shareExpiresAt < new Date()) {
    return NextResponse.json(
      { error: "Workflow share link has expired" },
      { status: 410 }
    );
  }

  const exportData = {
    id: workflow.shortId,
    name: workflow.name,
    model: workflow.model,
    template: workflow.template,
    inputs: workflow.inputs,
    modelSettings: JSON.stringify(workflow.modelSettings),
  };

  return NextResponse.json(exportData, {
    headers: {
      "Content-Disposition": `attachment; filename="${workflow.shortId}.json"`,
      "cache-control": "no-store, max-age=0",
    },
  });
}

