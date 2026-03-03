import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              Last updated: March 3, 2026
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-12">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing or using the AI Tutor API service (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including developers integrating the API into their applications.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI Tutor API provides a multi-model AI gateway that allows you to create workflows (reusable AI pipelines), deploy them as REST API endpoints, and access 50+ AI models from providers including OpenAI, Anthropic, Google, xAI, and others. The Service includes a web dashboard, API endpoints, streaming capabilities, and usage analytics.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Accounts & API Keys</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>You are responsible for maintaining the confidentiality of your account credentials and API secret keys. You must not share, publish, or embed API keys in client-side code.</p>
                <p>You are responsible for all activity under your account, including API calls made with your keys. If you believe your key has been compromised, revoke it immediately from your Settings dashboard.</p>
                <p>We reserve the right to suspend accounts that exhibit abusive behavior, violate rate limits through circumvention, or use the Service for prohibited activities.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">4. Billing & Credits</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>The Service operates on a credit-based billing model. Credits are purchased through credit packs and deducted based on API usage (token consumption). Prices are displayed in USD.</p>
                <p>Purchased credits do not expire. All purchases are final and non-refundable unless required by applicable law.</p>
                <p>If your credit balance reaches zero or below, API requests will be blocked until credits are replenished. You may set spend limits to control usage.</p>
                <p>Enterprise plans with custom pricing and SLAs are available by contacting our sales team.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">5. Acceptable Use</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>You agree not to use the Service to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Generate content that is illegal, harmful, threatening, abusive, or violates the rights of others</li>
                  <li>Attempt to circumvent rate limits, authentication, or billing mechanisms</li>
                  <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service</li>
                  <li>Use the Service to build a competing product or resell API access without authorization</li>
                  <li>Transmit malware, exploits, or malicious payloads through the API</li>
                  <li>Impersonate other users or forge request headers for unauthorized access</li>
                </ul>
                <p>We reserve the right to terminate or suspend access for violations of these terms without prior notice.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">6. Rate Limits</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                API requests are subject to rate limits (default: 10 requests per second per key). Rate limit information is returned in response headers. Exceeding rate limits will result in 429 responses. Persistent abuse may result in account suspension.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">7. Intellectual Property</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>You retain ownership of your workflow configurations, prompt templates, and the content generated through the API for your use.</p>
                <p>The AI Tutor API platform, including its design, code, documentation, and branding, is the intellectual property of Techulus and is protected by applicable copyright and trademark laws.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">8. AI-Generated Content</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Content generated by AI models through the Service is provided &ldquo;as-is.&rdquo; We do not guarantee the accuracy, completeness, or appropriateness of AI-generated output.</p>
                <p>You are solely responsible for reviewing, validating, and using AI-generated content in compliance with applicable laws and your own quality standards.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">9. Service Availability</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We strive for high availability but do not guarantee uninterrupted service. The Service depends on third-party AI model providers and infrastructure services. We are not liable for downtime caused by provider outages, scheduled maintenance, or circumstances beyond our control. Enterprise plans include uptime SLAs with defined remedies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, AI Tutor API and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the twelve months preceding the claim.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">11. Modifications</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. Material changes will be communicated via email or dashboard notification. Continued use of the Service after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">12. Contact</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For questions about these Terms, contact us at{" "}
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
