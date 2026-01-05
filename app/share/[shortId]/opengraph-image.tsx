import { ImageResponse } from "next/og";
import { prisma } from "@/lib/utils/db";

export const alt = "Workflow";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  
  const workflow = await prisma.workflow.findUnique({
    where: {
      shortId,
    },
  });

  if (!workflow) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div>Workflow Not Found</div>
      </div>,
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              marginBottom: "40px",
              lineHeight: 1.2,
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {workflow.name}
          </div>
          <div
            style={{
              fontSize: 36,
              opacity: 0.95,
              marginTop: "20px",
              fontWeight: 500,
            }}
          >
            Run this workflow instantly - no login required
          </div>
          <div
            style={{
              fontSize: 28,
              opacity: 0.85,
              marginTop: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>✨</span>
            <span>Powered by AI Tutor API</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

