import { z } from "zod";

const UrlValidationSchema = z.string().url();

export class WebpageParser {
  #apiKey: string;

  constructor() {
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error("Firecrawl API key is required");
    }

    this.#apiKey = process.env.FIRECRAWL_API_KEY;
  }

  async getContent(url: string) {
    const result = UrlValidationSchema.safeParse(url);
    if (!result.success) {
      return "Invalid URL";
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.#apiKey}`
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"]
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        return "Failed to fetch content";
      }

      return data.data.markdown;
    } catch (e) {
      return "Failed to fetch content";
    }
  }
}
