"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Bot, BrainIcon, CheckIcon, ChevronRight, CodeIcon, Copy, FileText, LogIn,
  Network, PlusCircle, Rocket, ShieldCheckIcon,
  Variable, Workflow, Zap
} from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { AiOutlineOpenAI } from "react-icons/ai";
import { DiRubyRough } from "react-icons/di";
import {
  RiCodeSSlashLine, RiJavascriptLine, RiMistFill,
  RiNextjsFill, RiNodejsLine, RiReactjsLine,
} from "react-icons/ri";
import { SiAnthropic, SiGoogle, SiMeta, SiMixcloud } from "react-icons/si";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */
type CodeLang = "python" | "javascript" | "curl";
type FAQ = { q: string; a: string };

const providers = [
  { name: "OpenAI",    Icon: AiOutlineOpenAI },
  { name: "Google",    Icon: SiGoogle },
  { name: "Meta",      Icon: SiMeta },
  { name: "Anthropic", Icon: SiAnthropic },
  { name: "Mixtral",   Icon: SiMixcloud },
  { name: "More",      Icon: RiMistFill },
];

const techStack = [
  { name: "React",      Icon: RiReactjsLine },
  { name: "Node.js",    Icon: RiNodejsLine },
  { name: "Next.js",    Icon: RiNextjsFill },
  { name: "Ruby",       Icon: DiRubyRough },
  { name: "JavaScript", Icon: RiJavascriptLine },
  { name: "Any Lang",   Icon: RiCodeSSlashLine },
];

const features = [
  { title: "Multi-Model Intelligence", desc: "GPT5, Gemini 3, Sonnet 4.5 — one unified endpoint for every major AI model.", icon: BrainIcon },
  { title: "Ship in Minutes",          desc: "Drop-in REST API with SDKs for every language. Go from zero to production in under 10 minutes.", icon: CodeIcon },
  { title: "Enterprise Security",      desc: "Single-use tokens, rate limiting, IP allowlists, and SOC-2 grade infrastructure from day one.", icon: ShieldCheckIcon },
  { title: "Real-time Streaming",      desc: "Token-by-token streaming responses for instant, snappy UX your users will love.", icon: Zap },
  { title: "Composable Workflows",     desc: "Chain prompts, models, and branching logic into reusable, versioned AI pipelines.", icon: Workflow },
  { title: "Infinite Scale",           desc: "Auto-scaling infrastructure handles millions of requests. Zero cold starts, zero ops burden.", icon: Network },
];

const steps = [
  { icon: LogIn,    title: "Sign up",        desc: "Create your free account in 30 seconds" },
  { icon: Workflow, title: "Create workflow", desc: "Use the visual builder or import a template" },
  { icon: Variable, title: "Define inputs",   desc: "Set dynamic variables for flexible reuse" },
  { icon: FileText, title: "Write prompts",   desc: "Craft system + user prompts with our editor" },
  { icon: Bot,      title: "Choose model",    desc: "Pick from GPT5, Gemini 3, Sonnet 4.5 and more" },
  { icon: Rocket,   title: "Deploy & call",   desc: "Hit your REST endpoint — it's live instantly" },
];

const pricingPerksBase = ["Unlimited workflows", "Every major AI model", "Streaming responses", "Community support"];
const pricingPerksPro  = ["Unlimited workflows", "Every major AI model", "Streaming responses", "Priority email support", "Higher rate limits", "Usage analytics"];
const pricingPerksEnt  = ["Unlimited workflows", "Every major AI model", "Streaming responses", "Dedicated support", "Priority model routing", "99.9% uptime SLA", "Custom rate limits", "SSO & team management"];

const faqs: FAQ[] = [
  {
    q: "What exactly is AI Tutor API and how does it work?",
    a: "AI Tutor API is a multi-model AI gateway that gives you a single REST endpoint to access 50+ AI models from OpenAI, Anthropic, Google, Meta, xAI, and more. You create \"workflows\" in our visual builder — each workflow is a reusable AI pipeline with a model, prompt template, and input variables. Once published, each workflow gets its own API endpoint. You send a POST request with your inputs, and we handle model routing, rate limiting, billing, and streaming. Think of it as Stripe for AI: one integration, every model, zero infrastructure."
  },
  {
    q: "Which AI models can I use?",
    a: "We support 50+ models across all major providers: GPT-5, GPT-4.1, and GPT-4o from OpenAI; Claude Sonnet 4.5, Opus 4.5, and Haiku from Anthropic; Gemini 2.5 Pro and Flash from Google; Grok 3 and 4.1 from xAI; Perplexity Sonar for web-grounded answers; plus open-source models like Llama 3, Mistral, DeepSeek, Qwen 2.5, and Command R+. New models are added within days of release. You can switch models on any workflow without changing your client code."
  },
  {
    q: "How does pricing and billing work?",
    a: "We offer three tiers: Starter (free — get started with free credits), Pro ($50 for 2,500 credits with priority support and higher rate limits), and Enterprise ($150/10M tokens with SLAs, dedicated support, and custom rate limits). Credits are deducted per workflow run based on token usage. You can set spend limits to cap usage, and unused credits never expire. There are no monthly minimums or hidden fees — you only pay for what you use."
  },
  {
    q: "How do I integrate the API into my application?",
    a: "Integration takes under 10 minutes. Create a workflow in the dashboard, publish it, then grab your API key from Settings. Make a POST request to /api/v1/run/{workflow_id} with your inputs — that's it. For real-time streaming, generate a single-use token via /api/v1/token and call the /stream endpoint. We provide code examples in Python, Node.js, and cURL, and the API is compatible with the Vercel AI SDK's useChat hook for React apps."
  },
  {
    q: "Is there real-time streaming support?",
    a: "Yes. Every workflow can stream responses token-by-token as the model generates them. This is a two-step flow: first generate a secure, single-use token from /api/v1/token (authenticated with your API key), then call the /stream endpoint with that token. The stream is plain text over HTTP — compatible with fetch ReadableStream, Python requests with stream=True, curl --no-buffer, and the Vercel AI SDK. Tokens are consumed on first use and auto-expire."
  },
  {
    q: "How secure is the API?",
    a: "Security is built in at every layer. API keys (sk_...) authenticate server-side requests. Streaming uses single-use tokens stored in Redis with a configurable TTL (max 300 seconds), so your API key never touches the client. Rate limiting is server-derived (not spoofable by clients) with a fail-closed design — if Redis goes down, requests are blocked, not allowed through. All billing checks enforce credits ≤ 0 blocking, and error messages are generic to prevent information leakage."
  },
  {
    q: "Can I use my own API keys for model providers?",
    a: "Yes. With Bring Your Own Key (BYOK), you can add your own OpenAI, Anthropic, or Google API keys in Settings. Your keys are encrypted at rest and used directly for model calls, giving you zero markup on provider costs. If you don't provide a key, we route through our shared infrastructure with usage billed via credits."
  },
  {
    q: "What are some common use cases?",
    a: "Developers use AI Tutor API for chatbots and customer support agents, content generation tools (blog posts, product descriptions, summaries), educational platforms with personalized tutoring, internal tools that summarize documents or extract data, code generation and review assistants, and any application that needs intelligent text generation. Check our Workflows Guide for detailed examples and templates."
  },
];

const codeExamples: Record<CodeLang, string> = {
  python: `import requests

response = requests.post(
    "https://api.aitutor.com/v1/run/wf_abc123",
    headers={"Authorization": "Bearer your_api_key"},
    json={"question": "Explain quantum entanglement"}
)

print(response.json()["output"])`,

  javascript: `const res = await fetch(
  "https://api.aitutor.com/v1/run/wf_abc123",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer your_api_key",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: "Explain quantum entanglement",
    }),
  }
);

const { output } = await res.json();
console.log(output);`,

  curl: `curl -X POST https://api.aitutor.com/v1/run/wf_abc123 \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"question":"Explain quantum entanglement"}'`,
};

/* ═══════════════════════════════════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */
const ease = [0.22, 1, 0.36, 1] as const;

const Reveal = ({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-dot-pulse" />
    {children}
  </span>
);

const FAQRow = ({ faq, open, toggle }: { faq: FAQ; open: boolean; toggle: () => void }) => (
  <div className="group border-b border-border/60 last:border-0">
    <button
      type="button"
      onClick={toggle}
      className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors"
    >
      <span className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
        {faq.q}
      </span>
      <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
        <PlusCircle className={cn("h-5 w-5 shrink-0 transition-colors duration-200", open ? "text-primary" : "text-muted-foreground")} />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p className="pb-6 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy code"
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-mono font-medium transition-all duration-200",
        copied
          ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
          : "bg-white/[0.06] text-white/40 hover:bg-white/[0.10] hover:text-white/70 ring-1 ring-white/10"
      )}
    >
      {copied ? <CheckIcon className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lang, setLang]       = useState<CodeLang>("python");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY     = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-24 pb-32">
        {/* Background radials */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />
          <div className="absolute top-1/4 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,hsl(262_83%_58%/0.05)_0%,transparent_70%)]" />
        </div>

        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card px-4 py-2 text-[12px] font-medium text-muted-foreground shadow-float">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-dot-pulse" />
              Now supporting GPT5 &middot; Gemini 3 &middot; Sonnet 4.5
              <ChevronRight className="h-3 w-3 text-primary" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-display-lg sm:text-display-xl tracking-tight"
          >
            <span className="text-foreground">Easy to use platform{" "}</span>
            <br className="hidden sm:block" />
            <span className="text-foreground">powered by </span>
            <span className="text-gradient">advanced AI</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground"
          >
            One endpoint, every AI model, zero infrastructure.
            Ship intelligent features your users love — in minutes, not months.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/workflows"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group relative overflow-hidden rounded-2xl btn-primary-hover",
                "px-8 text-[14px] font-semibold",
                "shadow-glow-sm hover:shadow-glow-md",
                "active:scale-[0.97]"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start building free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="https://support.myapps.ai/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-2xl border-border/70 bg-card px-8 text-[14px] font-semibold",
                "hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary",
                "transition-all duration-300 active:scale-[0.97]"
              )}
            >
              Read the docs
            </Link>
          </motion.div>

          {/* Hero floating card (dashboard mockup hint) */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease }}
            className="mt-16 mx-auto max-w-3xl"
          >
            <div className="relative rounded-2xl border border-border/60 bg-card p-1.5 shadow-float-lg">
              {/* Beam across top */}
              <div className="pointer-events-none absolute -top-px left-0 right-0 h-px overflow-hidden rounded-t-2xl">
                <div className="animate-beam absolute h-full w-1/4 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              </div>

              {/* Mini browser chrome */}
              <div className="flex items-center gap-1.5 rounded-t-xl bg-muted/50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                <div className="ml-3 flex-1 rounded-lg bg-background/60 px-3 py-1 text-[10px] font-mono text-muted-foreground">
                  api.aitutor.com/v1/run/wf_abc123
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="rounded-b-xl bg-background p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {["Total Calls", "Avg Latency", "Success Rate"].map((label, i) => (
                    <div key={label} className="rounded-xl border border-border/60 bg-card p-4">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {["1.2M", "142ms", "99.9%"][i]}
                      </p>
                      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${[78, 45, 99][i]}%` }}
                          transition={{ duration: 1.2, delay: 1 + i * 0.15, ease }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Live Traffic</span>
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      {[35, 52, 28, 64, 44, 72, 56, 80, 48, 92, 60, 76].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.6, delay: 1.3 + i * 0.05, ease }}
                          className="flex-1 rounded-sm bg-primary/30"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="w-48 rounded-xl border border-border/60 bg-card p-4">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Models</p>
                    <div className="space-y-2">
                      {["GPT5", "Gemini 3", "Sonnet 4.5"].map((m) => (
                        <div key={m} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs text-foreground">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 text-[12px] text-muted-foreground"
          >
            Trusted by developers &middot; Pay-as-you-go &middot; No lock-in
          </motion.p>
        </motion.div>
      </section>

      {/* ── PROVIDER TICKER ──────────────────────────────────────────────── */}
      <section className="border-y border-border/60 bg-muted/30 py-10 overflow-hidden">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Unified access to every major AI provider
          </p>
        </Reveal>
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {providers.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border/60 bg-card px-4 py-5 cursor-default"
                >
                  <m.Icon className="h-7 w-7 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {m.name}
                  </span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-20">
              <Badge>Platform</Badge>
              <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                We help you build complex{" "}
                <span className="font-serif italic text-primary">automations</span>{" "}
                in the simplest way.
              </h2>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Stop wrestling with API keys, rate limits, and model inconsistencies.
                We abstract the complexity so you can focus on your product.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-7 transition-shadow duration-300 hover:shadow-card-hover"
                >
                  {/* Corner glow on hover */}
                  <div className="pointer-events-none absolute -top-px -right-px h-24 w-24 rounded-tr-2xl bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08)_0%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] ring-1 ring-primary/15 transition-all duration-300 group-hover:ring-primary/40 group-hover:shadow-glow-xs">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOLD STATEMENT ────────────────────────────────────────────────── */}
      <section className="border-y border-border/60 surface-raised py-28 sm:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="text-display-sm sm:text-display-md text-foreground leading-[1.15]">
              Our goal is to build a world where{" "}
              <span className="font-serif italic text-primary">technology</span>{" "}
              serves humanity
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Our platform harnesses the power of AI to streamline processes and optimize outcomes.
              One API call is all it takes to unlock the full potential of every major language model.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10">
              <Link
                href="/workflows"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-2xl btn-primary-hover font-semibold",
                  "shadow-glow-sm hover:shadow-glow-md",
                  "px-8 active:scale-[0.97]"
                )}
              >
                Get started
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-20">
              <Badge>How it works</Badge>
              <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                We&apos;ll help you get started
              </h2>
              <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto">
                Six simple steps from signup to production — no infrastructure needed.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-7 transition-shadow duration-300 hover:shadow-card-hover"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] ring-1 ring-primary/15 transition-all duration-300 group-hover:ring-primary/40 group-hover:shadow-glow-xs">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-primary/40">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-foreground mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5}>
            <div className="mt-14 text-center">
              <Link
                href="/workflows-guide"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-2xl border-border/70 bg-card font-semibold",
                  "hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary",
                  "transition-all duration-300"
                )}
              >
                Learn more
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CODE EXAMPLES ────────────────────────────────────────────────── */}
      <section className="border-y border-border/60 surface-raised py-28 sm:py-40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge>Integration</Badge>
              <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                Integrate in minutes
              </h2>
              <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto">
                A familiar REST API that works with every language. Copy, paste, ship.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            {/* Outer glow wrapper */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-[1px] rounded-[1.4rem] bg-gradient-to-b from-white/10 via-primary/10 to-transparent" />
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-[1.4rem] blur-2xl opacity-40 bg-gradient-to-b from-primary/20 to-transparent" />

              {/* Editor window */}
              <div
                className="relative rounded-[1.35rem] overflow-hidden shadow-float-lg"
                style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Title bar */}
                <div
                  className="relative flex items-center justify-between px-5 py-3.5"
                  style={{ background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Traffic lights */}
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/20" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/20" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/20" />
                  </div>

                  {/* Language tabs — centered */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
                    {(Object.keys(codeExamples) as CodeLang[]).map((l) => {
                      const label = l === "curl" ? "cURL" : l.charAt(0).toUpperCase() + l.slice(1);
                      const isActive = lang === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLang(l)}
                          aria-label={`Show ${label} example`}
                          className={cn(
                            "relative px-4 py-1.5 rounded-lg text-[12px] font-mono font-medium transition-all duration-200 select-none",
                            isActive ? "text-white" : "text-white/35 hover:text-white/65"
                          )}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="editor-tab"
                              className="absolute inset-0 rounded-lg"
                              style={{ background: "rgba(255,255,255,0.09)", boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(255,255,255,0.08)" }}
                              transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            />
                          )}
                          <span className="relative">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Copy button */}
                  <CopyButton code={codeExamples[lang]} />
                </div>

                {/* Code area */}
                <div className="relative overflow-x-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={lang}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <pre
                        className="overflow-x-auto px-6 py-7 text-[0.875rem] leading-[1.85]"
                        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#c9d1d9" }}
                      >
                        {codeExamples[lang].split("\n").map((line, i) => (
                          <div key={i} className="flex gap-5">
                            <span
                              className="select-none shrink-0 text-right w-5 text-[0.78rem] leading-[1.85]"
                              style={{ color: "#3d444d" }}
                            >
                              {i + 1}
                            </span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </pre>
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom fade-out */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                    style={{ background: "linear-gradient(to top, #0d1117, transparent)" }}
                  />
                </div>

                {/* Status bar */}
                <div
                  className="flex items-center justify-between px-5 py-2"
                  style={{ background: "#161b22", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                    <span className="font-mono text-[10px] text-white/25">api.aitutor.com</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[10px] text-white/20">
                    <span>UTF-8</span>
                    <span>{lang === "curl" ? "Shell" : lang === "javascript" ? "JavaScript" : "Python 3"}</span>
                    <span>LF</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INTEGRATIONS ─────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-14">
              <Badge>Integrations</Badge>
              <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                Works with your stack
              </h2>
            </div>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-3.5 cursor-default"
                >
                  <t.Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {t.name}
                  </span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-y border-border/60 surface-raised py-28 sm:py-40">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge>Pricing</Badge>
              <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                Simple, transparent pricing
              </h2>
              <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto">
                No surprises. Pay for what you use, scale when you&apos;re ready.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Starter */}
            <Reveal delay={0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col rounded-3xl border border-border/60 bg-card p-8 sm:p-10 transition-shadow duration-300 hover:shadow-card-hover"
              >
                <h3 className="text-xl font-bold text-foreground">Starter</h3>
                <p className="mt-2 text-sm text-muted-foreground">Start free, buy credit packs when needed.</p>
                <div className="mt-8 mb-8">
                  <span className="text-5xl font-extrabold text-foreground">$0</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <div className="border-t border-border/60 pt-6 mb-8">
                  <ul className="space-y-3">
                    {pricingPerksBase.map((p) => (
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
              </motion.div>
            </Reveal>

            {/* Pro */}
            <Reveal delay={0.15}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex flex-col rounded-3xl border-2 border-primary/40 bg-card p-8 sm:p-10 transition-shadow duration-300 hover:shadow-glow-md"
              >
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.06)_0%,transparent_50%)]" />
                <div className="flex items-center gap-3 relative">
                  <h3 className="text-xl font-bold text-foreground">Pro</h3>
                  <span className="rounded-full bg-primary/10 ring-1 ring-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                    Popular
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground relative">For teams shipping AI-powered products.</p>
                <div className="mt-8 mb-8 relative">
                  <span className="text-5xl font-extrabold text-foreground">$50</span>
                  <span className="text-sm text-muted-foreground ml-1">/2,500 credits</span>
                </div>
                <div className="border-t border-border/60 pt-6 mb-8 relative">
                  <ul className="space-y-3">
                    {pricingPerksPro.map((p) => (
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
                    "relative mt-auto w-full rounded-2xl btn-primary-hover font-semibold",
                    "shadow-glow-sm hover:shadow-glow-md"
                  )}
                >
                  Get Pro
                </Link>
              </motion.div>
            </Reveal>

            {/* Enterprise */}
            <Reveal delay={0.2}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col rounded-3xl border border-border/60 bg-card p-8 sm:p-10 transition-shadow duration-300 hover:shadow-card-hover"
              >
                <h3 className="text-xl font-bold text-foreground">Enterprise</h3>
                <p className="mt-2 text-sm text-muted-foreground">Dedicated infrastructure and SLAs.</p>
                <div className="mt-8 mb-8">
                  <span className="text-5xl font-extrabold text-foreground">$150</span>
                  <span className="text-sm text-muted-foreground ml-1">/10M tokens</span>
                </div>
                <div className="border-t border-border/60 pt-6 mb-8">
                  <ul className="space-y-3">
                    {pricingPerksEnt.map((p) => (
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
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "mt-auto w-full rounded-2xl border-border/70 font-semibold",
                    "hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary transition-all duration-300"
                  )}
                >
                  Contact sales
                </Link>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-40">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <Badge>FAQ</Badge>
              <h2 className="mt-6 text-display-sm text-foreground">
                Frequently asked questions
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border/60 bg-card px-8 sm:px-10 py-3">
              {faqs.map((faq, i) => (
                <FAQRow
                  key={i}
                  faq={faq}
                  open={openFaq === i}
                  toggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="pb-28 px-6">
        <Reveal>
          <div
            className="mx-auto max-w-5xl relative overflow-hidden rounded-[2rem] p-12 sm:p-20 text-center"
            style={{ background: "linear-gradient(135deg, hsl(292 84% 38%) 0%, hsl(270 60% 28%) 50%, hsl(262 70% 32%) 100%)" }}
          >
            {/* Ambient circles */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/[0.06] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/[0.15] blur-3xl" />

            {/* Beam */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-px overflow-hidden">
              <div className="animate-beam absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            <h2 className="relative text-display-sm sm:text-display-md text-white font-extrabold tracking-tight">
              Ready to ship your next
              <br />
              <span className="text-gradient">AI-powered product?</span>
            </h2>
            <p className="relative mt-4 text-base text-white/60 max-w-lg mx-auto">
              Join developers building intelligent applications with one API call. Start free, scale when you&apos;re ready.
            </p>
            <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/workflows"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "rounded-2xl !bg-white !text-neutral-900 font-bold px-10",
                  "shadow-lg hover:shadow-xl hover:!bg-white/90 hover:!text-neutral-900",
                  "transition-all duration-300 active:scale-[0.97] group"
                )}
              >
                <span className="flex items-center gap-2">
                  Start building free
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                href="/workflows-guide"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-2xl border-white/25 bg-white/[0.08] text-white font-bold px-10",
                  "hover:bg-white/[0.15] hover:border-white/40",
                  "transition-all duration-300 active:scale-[0.97]"
                )}
              >
                How it works
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer isHome />
    </div>
  );
}
