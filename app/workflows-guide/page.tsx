import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, FileText, Rocket, Variable, Workflow, Zap } from "lucide-react";
import Link from "next/link";

const steps = [
  { icon: Workflow, title: "Create workflow", desc: "Use the visual builder or import a template." },
  { icon: Variable, title: "Define inputs", desc: "Set dynamic variables for flexible reuse." },
  { icon: FileText, title: "Write prompts", desc: "Craft system and user prompts in the editor." },
  { icon: Bot, title: "Choose model", desc: "Pick from GPT-4o, Claude, Gemini, and more." },
  { icon: Rocket, title: "Deploy & call", desc: "Hit your REST endpoint — it's live instantly." },
];

export default function WorkflowsGuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="border-b border-border/60 surface-raised py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Guide
            </span>
            <h1 className="mt-6 text-display-sm sm:text-display-md text-foreground">
              What are workflows?
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              Workflows are reusable AI pipelines: a prompt, a model, and optional inputs.
              Create once, call from your app with a single REST request.
            </p>
          </div>
        </section>

        {/* What you get */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="text-display-sm text-foreground">Why use workflows</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              Instead of wiring API keys and model IDs in your code, you define a workflow in
              the dashboard. You get one stable endpoint per workflow; you can change the
              model or prompt anytime without redeploying.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Zap, title: "One endpoint", desc: "Same URL for every model swap." },
                { icon: Workflow, title: "Versioning", desc: "Branches and history for prompts." },
                { icon: Bot, title: "Multi-model", desc: "GPT-4o, Claude, Gemini in one place." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-card p-6 transition-shadow duration-300 hover:shadow-card-hover"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] ring-1 ring-primary/15">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to create */}
        <section className="border-y border-border/60 surface-raised py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="text-display-sm text-foreground">How to create a workflow</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              Five steps from signup to your first API call.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border/60 bg-card p-6 transition-shadow duration-300 hover:shadow-card-hover"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] ring-1 ring-primary/15">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-primary/40">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/workflows"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-2xl bg-primary text-primary-foreground font-semibold",
                  "shadow-glow-sm hover:shadow-glow-md transition-all duration-300"
                )}
              >
                Create your first workflow
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
