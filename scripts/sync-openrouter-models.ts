// scripts/sync-openrouter-models.ts
// Dev-only tool: re-run manually (npm run sync-models) to check the curated model
// catalog in data/workflow.ts against OpenRouter's live /api/v1/models response.
// This script is never imported or run by the app itself.

import { AIModelMeta, AIModels, modelToProviderId } from "../data/workflow";

const CURATED_COMPANY_PREFIXES: Record<string, string> = {
  OpenAI: "openai/",
  Anthropic: "anthropic/",
  Google: "google/",
  xAI: "x-ai/",
  Perplexity: "perplexity/",
  Meta: "meta-llama/",
  Mistral: "mistralai/",
  DeepSeek: "deepseek/",
  Qwen: "qwen/",
  Cohere: "cohere/",
};

type OpenRouterModel = { id: string };
type OpenRouterModelsResponse = { data: OpenRouterModel[] };

async function main() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) {
    console.error(`Failed to fetch OpenRouter models: HTTP ${res.status}`);
    process.exit(1);
  }
  const body = (await res.json()) as OpenRouterModelsResponse;
  const liveIds = new Set(body.data.map((m) => m.id));

  console.log(`Fetched ${liveIds.size} live models from OpenRouter.\n`);

  console.log("=== Curated model status ===");
  for (const key of AIModels) {
    const providerId = modelToProviderId[key];
    const isLive = liveIds.has(providerId);
    const meta = AIModelMeta[key];
    const alreadyDeprecated = Boolean(meta?.deprecated);

    if (isLive && alreadyDeprecated) {
      console.log(`⚠ ${key} (${providerId}) is marked deprecated but IS live again — consider un-deprecating.`);
    } else if (!isLive && !alreadyDeprecated) {
      console.log(`✗ ${key} (${providerId}) is NOT live and NOT marked deprecated — mark it deprecated.`);
    } else if (!isLive && alreadyDeprecated) {
      console.log(`  ${key} (${providerId}) still deprecated, confirmed absent.`);
    }
    // isLive && !alreadyDeprecated: healthy, nothing to print
  }

  console.log("\n=== New models available per curated company (not yet in the catalog) ===");
  const curatedProviderIds = new Set(Object.values(modelToProviderId));
  for (const [company, prefix] of Object.entries(CURATED_COMPANY_PREFIXES)) {
    const newOnes = [...liveIds].filter(
      (id) => id.startsWith(prefix) && !curatedProviderIds.has(id) && !id.startsWith("~"),
    );
    if (newOnes.length > 0) {
      console.log(`${company}:`);
      newOnes.forEach((id) => console.log(`  ${id}`));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
