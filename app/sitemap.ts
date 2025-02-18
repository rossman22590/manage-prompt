import type { MetadataRoute } from "next";

const aiToolsRoutes = [
  "proof-reading",
  "summarise-text",
  "black-and-white-to-color",
  "image-upscale",
  "remove-background",
  "photo-realistic-image-creator",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://aitutor-api.vercel.app",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://aitutor-api.vercel.app/sign-in",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://aitutor-api.vercel.app/sign-up",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://aitutor-api.vercel.app/ai-tools",
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
      url: `https://aitutor-api.vercel.app/ai-tools/${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
