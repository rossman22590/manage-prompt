import { SITE_METADATA } from "@/data/marketing";
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : SITE_METADATA.TITLE;
    const tagline = SITE_METADATA.TAGLINE;

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, hsl(292 84% 28%) 0%, hsl(270 55% 22%) 50%, hsl(262 65% 26%) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "white",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            {title}
          </div>
          {title === SITE_METADATA.TITLE ? (
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.75)",
                marginTop: 20,
                letterSpacing: "-0.02em",
                textAlign: "center",
              }}
            >
              {tagline}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            One API · Every model · Zero infrastructure
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.log(
      e instanceof Error ? e.message : "Failed to generate the image",
    );
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
