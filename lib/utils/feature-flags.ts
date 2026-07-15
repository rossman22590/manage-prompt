export function isAgentsFeatureEnabled(): boolean {
  return process.env.AGENTS_FEATURE_ENABLED !== "false";
}
