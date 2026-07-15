import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// No explicit baseURL: NEXT_PUBLIC_ env vars are inlined into the client
// bundle at build time, so a hardcoded value here would permanently point
// every deployment's bundle at whichever single domain was set at build
// time -- regardless of which of our domains actually serves it, causing
// cross-origin requests (and CORS failures) from any other domain. Left
// unset, better-auth's client falls back to the browser's own
// window.location.origin at runtime, matching whichever domain the page
// actually loaded from.
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
