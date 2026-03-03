import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28 pb-20">
        <section className="border-b border-border/60 surface-raised py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Legal
            </span>
            <h1 className="mt-6 text-display-sm sm:text-display-md text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              Last updated: March 3, 2026
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-12">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Account Information:</strong> When you create an account, we collect your email address and authentication details via magic link login. We do not collect passwords.
                </p>
                <p>
                  <strong className="text-foreground">Usage Data:</strong> We log API calls, token usage, model selections, and response metadata (latency, status codes) to provide analytics and enforce billing. We do not store the content of your prompts or AI-generated responses beyond the duration of the request.
                </p>
                <p>
                  <strong className="text-foreground">Payment Information:</strong> Payments are processed by Stripe. We store your Stripe customer ID and subscription details but never store credit card numbers or bank details directly.
                </p>
                <p>
                  <strong className="text-foreground">Technical Data:</strong> We collect IP addresses, browser user-agent strings, and device information for security, rate limiting, and abuse prevention.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc list-inside">
                <li>To provide, maintain, and improve the AI Tutor API service</li>
                <li>To process payments and manage your account balance</li>
                <li>To enforce rate limits, prevent abuse, and maintain security</li>
                <li>To provide usage analytics and statistics in your dashboard</li>
                <li>To send transactional emails (magic links, billing notifications)</li>
                <li>To respond to support requests</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Data Retention</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Prompt & Response Content:</strong> We do not persistently store the content of API requests or responses. Data is processed in-memory and discarded after delivery.
                </p>
                <p>
                  <strong className="text-foreground">Workflow Metadata:</strong> Workflow run records (timestamps, model used, token counts, status) are retained for billing and analytics purposes.
                </p>
                <p>
                  <strong className="text-foreground">Streaming Tokens:</strong> Single-use tokens are stored in Redis with a maximum TTL of 300 seconds and are automatically deleted after use or expiry.
                </p>
                <p>
                  <strong className="text-foreground">Account Data:</strong> Retained as long as your account is active. You may request deletion by contacting support.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">4. Third-Party Services</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>We use the following third-party services to operate the platform:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong className="text-foreground">Vercel</strong> — Hosting and serverless infrastructure</li>
                  <li><strong className="text-foreground">Stripe</strong> — Payment processing</li>
                  <li><strong className="text-foreground">Upstash Redis</strong> — Rate limiting and temporary token storage</li>
                  <li><strong className="text-foreground">OpenRouter</strong> — AI model routing to providers (OpenAI, Anthropic, Google, etc.)</li>
                  <li><strong className="text-foreground">Resend</strong> — Transactional email delivery</li>
                </ul>
                <p>Each provider processes data according to their own privacy policies. We select providers that meet industry security standards.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">5. API Keys & Security</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Your API secret keys are stored securely in our database. Bring Your Own Key (BYOK) credentials are encrypted at rest using AES encryption.</p>
                <p>We implement rate limiting, single-use token authentication for streaming, and fail-closed security patterns to protect your data and prevent unauthorized access.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">6. Your Rights</h2>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc list-inside">
                <li>Request access to your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Export your workflow configurations</li>
                <li>Revoke API keys at any time from your Settings dashboard</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">7. Cookies</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use essential cookies for authentication session management. We use Vercel Analytics for anonymous usage statistics. We do not use advertising cookies or third-party tracking pixels.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">8. Contact</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For privacy-related inquiries, contact us at{" "}
                <a href="mailto:support@mytsi.org" className="text-primary hover:underline">
                  support@mytsi.org
                </a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
