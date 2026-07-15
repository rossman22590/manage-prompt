import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/utils/url";

const aiToolsRoutes = [
  "proof-reading",
  "summarise-text",
  "black-and-white-to-color",
  "image-upscale",
  "remove-background",
  "photo-realistic-image-creator",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppBaseUrl();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/ai-tools`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...aiToolsRoutes.map<{
      url: string;
      lastModified?: string | Date;
      changeFrequency?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
      priority?: number;
    }>((route: string) => ({
      url: `${baseUrl}/ai-tools/${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
