export function isAgentsFeatureEnabled(): boolean {
  return process.env.AGENTS_FEATURE_ENABLED !== "false";
}

// Opt-in (not opt-out like the flag above): dev/local convenience only,
// must never be on by default in a deployed environment.
export function isPasswordAuthEnabled(): boolean {
  return process.env.ENABLE_PASSWORD_AUTH === "true";
}
