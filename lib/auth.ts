import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { magicLinkEmail } from "@/components/emails/magic-link";
import { prisma } from "@/lib/utils/db";
import { isPasswordAuthEnabled } from "@/lib/utils/feature-flags";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Local/dev convenience only: lets local testers create an account and
  // sign in without needing real email delivery (RESEND_API_KEY). Must never
  // be enabled on a deployed environment -- gated by ENABLE_PASSWORD_AUTH,
  // which is opt-in and unset by default, not tied to NODE_ENV.
  emailAndPassword: {
    enabled: isPasswordAuthEnabled(),
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { plainText, html } = magicLinkEmail(url);
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM_EMAIL || "login@myapps.ai";
        if (!apiKey) {
          throw new Error("RESEND_API_KEY is required");
        }

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from,
            to: email,
            subject: "Your Magic Link",
            text: plainText,
            html,
          }),
        });

        if (!response.ok) {
          throw new Error(`Resend API error: ${await response.text()}`);
        }
      },
    }),
    nextCookies(),
  ],
  baseURL: process.env.APP_BASE_URL,
  trustedOrigins: [
    ...(process.env.APP_BASE_URL ? [process.env.APP_BASE_URL] : []),
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : []),
  ],
});
