import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

const pricingPerks = [
  "Unlimited workflows",
  "Every major AI model",
  "Streaming responses",
  "Email support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="border-b border-border/60 surface-raised py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Pricing
            </span>
            <h1 className="mt-6 text-display-sm sm:text-display-md text-foreground">
              Simple, transparent pricing
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              No surprises. Pay for what you use, scale when you&apos;re ready.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Pay as you go */}
              <div className="flex flex-col rounded-3xl border border-border/60 bg-card p-8 sm:p-10 transition-shadow duration-300 hover:shadow-card-hover">
                <h2 className="text-xl font-bold text-foreground">Pay as you go</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start free, buy credit packs when needed.
                </p>
                <div className="mt-8 mb-8">
                  <span className="text-5xl font-extrabold text-foreground">$0</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <div className="border-t border-border/60 pt-6 mb-8">
                  <ul className="space-y-3">
                    {pricingPerks.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-foreground/80">
                        <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/workflows"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "mt-auto w-full rounded-2xl border-border/70 font-semibold",
                    "hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary transition-all duration-300"
                  )}
                >
                  Get started free
                </Link>
              </div>

              {/* Enterprise */}
              <div className="relative flex flex-col rounded-3xl border-2 border-primary/40 bg-card p-8 sm:p-10 transition-shadow duration-300 hover:shadow-glow-md">
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.06)_0%,transparent_50%)]" />
                <div className="flex items-center gap-3 relative">
                  <h2 className="text-xl font-bold text-foreground">Enterprise</h2>
                  <span className="rounded-full bg-primary/10 ring-1 ring-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                    Popular
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground relative">
                  Priority routing, SLAs, and dedicated infra.
                </p>
                <div className="mt-8 mb-8 relative">
                  <span className="text-5xl font-extrabold text-foreground">$150</span>
                  <span className="text-sm text-muted-foreground ml-1">/10M tokens</span>
                </div>
                <div className="border-t border-border/60 pt-6 mb-8 relative">
                  <ul className="space-y-3">
                    {["Priority model routing", "99.9% uptime SLA", "Dedicated support", ...pricingPerks].map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-foreground/80">
                        <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/billing"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "relative mt-auto w-full rounded-2xl bg-primary text-primary-foreground font-semibold",
                    "shadow-glow-sm hover:shadow-glow-md transition-all duration-300"
                  )}
                >
                  Start enterprise plan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border/60 surface-raised py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="text-display-sm text-foreground">How pricing works</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Usage is metered by tokens: input and output tokens from the AI models you call.
              One credit equals 100 tokens. Buy credit packs when you need them; there are no
              monthly minimums. Enterprise customers get volume pricing, priority routing, and
              a 99.9% uptime SLA.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              New accounts receive free credits so you can try the API before spending.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
