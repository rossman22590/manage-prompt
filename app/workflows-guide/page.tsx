"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainIcon,
  ChevronRight,
  Code2,
  Copy,
  CheckIcon,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  Mail,
  Network,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Variable,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */
const ease = [0.22, 1, 0.36, 1] as const;

const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
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

/* ═══════════════════════════════════════════════════════════════════════════
   WORKFLOW TEMPLATES — the star of the page
   ═══════════════════════════════════════════════════════════════════════════ */
type WorkflowTemplate = {
  id: string;
  title: string;
  description: string;
  icon: typeof Workflow;
  color: string;
  glowColor: string;
  model: string;
  systemPrompt: string;
  userTemplate: string;
  variables: string[];
  category: string;
};

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "blog-generator",
    title: "Blog Post Generator",
    description:
      "Generate SEO-optimized blog posts with custom tone, length, and structure. Perfect for content teams that need to scale output without sacrificing quality.",
    icon: FileText,
    color: "from-rose-500 to-pink-600",
    glowColor: "rose",
    model: "GPT-5",
    systemPrompt:
      "You are an expert content writer. Write engaging, SEO-optimized blog posts with clear structure, compelling headers, and actionable insights. Match the requested tone and target word count.",
    userTemplate:
      "Write a blog post about {{topic}} in a {{tone}} tone. Target length: {{word_count}} words. Include an introduction, 3-5 key sections with headers, and a conclusion with a call to action.",
    variables: ["topic", "tone", "word_count"],
    category: "Content",
  },
  {
    id: "code-reviewer",
    title: "Code Review Assistant",
    description:
      "Automated code review that catches bugs, suggests improvements, and enforces your team's style guide. Integrates directly into your CI pipeline.",
    icon: Code2,
    color: "from-violet-500 to-purple-600",
    glowColor: "violet",
    model: "Claude Sonnet 4.5",
    systemPrompt:
      "You are a senior software engineer performing a code review. Analyze the code for bugs, security vulnerabilities, performance issues, and style violations. Provide specific, actionable feedback with code examples.",
    userTemplate:
      "Review this {{language}} code:\n\n```\n{{code}}\n```\n\nFocus on: {{review_focus}}",
    variables: ["language", "code", "review_focus"],
    category: "Developer Tools",
  },
  {
    id: "email-composer",
    title: "Smart Email Composer",
    description:
      "Draft professional emails from bullet points. Handles everything from cold outreach to internal updates, adapting formality and structure automatically.",
    icon: Mail,
    color: "from-amber-500 to-orange-600",
    glowColor: "amber",
    model: "GPT-4.1",
    systemPrompt:
      "You are an expert business communicator. Transform rough notes into polished, professional emails. Adapt tone and formality to the context. Keep emails concise and action-oriented.",
    userTemplate:
      "Compose a {{email_type}} email to {{recipient_context}}.\n\nKey points to cover:\n{{bullet_points}}\n\nTone: {{tone}}",
    variables: ["email_type", "recipient_context", "bullet_points", "tone"],
    category: "Business",
  },
  {
    id: "data-extractor",
    title: "Document Data Extractor",
    description:
      "Extract structured data from unstructured documents — contracts, invoices, research papers. Returns clean JSON you can pipe directly into your database.",
    icon: Layers,
    color: "from-emerald-500 to-teal-600",
    glowColor: "emerald",
    model: "Gemini 2.5 Pro",
    systemPrompt:
      "You are a data extraction specialist. Parse unstructured documents and extract structured data according to the provided schema. Return valid JSON. Handle ambiguity by marking fields as null with a confidence note.",
    userTemplate:
      "Extract data from this document:\n\n{{document_text}}\n\nSchema: {{output_schema}}\n\nReturn valid JSON matching the schema.",
    variables: ["document_text", "output_schema"],
    category: "Data Processing",
  },
  {
    id: "tutor-engine",
    title: "Adaptive Tutor Engine",
    description:
      "Personalized learning experiences that adapt in real-time. Explains concepts at the student's level, generates practice problems, and tracks comprehension.",
    icon: GraduationCap,
    color: "from-sky-500 to-blue-600",
    glowColor: "sky",
    model: "GPT-5",
    systemPrompt:
      "You are a patient, expert tutor. Explain concepts step-by-step at the student's level. Use analogies and examples. After explaining, ask a follow-up question to check understanding. Adjust complexity based on responses.",
    userTemplate:
      "Subject: {{subject}}\nDifficulty: {{difficulty_level}}\nStudent question: {{student_question}}\n\nPrevious context: {{conversation_history}}",
    variables: [
      "subject",
      "difficulty_level",
      "student_question",
      "conversation_history",
    ],
    category: "Education",
  },
  {
    id: "research-analyst",
    title: "Research Analyst",
    description:
      "Web-grounded research with citations. Ask a question and get a structured analysis with real sources, perfect for market research and competitive analysis.",
    icon: Globe,
    color: "from-cyan-500 to-blue-600",
    glowColor: "cyan",
    model: "Perplexity Sonar Pro",
    systemPrompt:
      "You are a research analyst. Provide comprehensive, well-sourced analysis. Structure your response with an executive summary, key findings, detailed analysis, and sources. Always cite your sources with URLs.",
    userTemplate:
      "Research topic: {{research_query}}\n\nDepth: {{analysis_depth}}\nFocus areas: {{focus_areas}}",
    variables: ["research_query", "analysis_depth", "focus_areas"],
    category: "Research",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   INTERACTIVE TEMPLATE CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const TemplateCard = ({
  template,
  isSelected,
  onSelect,
}: {
  template: WorkflowTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const Icon = template.icon;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-300 w-full",
        isSelected
          ? "border-primary/50 bg-primary/[0.04] shadow-glow-sm"
          : "border-border/60 bg-card hover:border-primary/30 hover:shadow-card-hover"
      )}
      aria-label={`Select ${template.title} template`}
      tabIndex={0}
    >
      <div
        className={cn(
          "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300",
          template.color,
          isSelected ? "shadow-lg" : "opacity-80 group-hover:opacity-100"
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
        {template.category}
      </span>
      <h3 className="text-sm font-bold text-foreground">{template.title}</h3>
      {isSelected && (
        <motion.div
          layoutId="template-indicator"
          className="absolute -right-px -top-px h-6 w-6 overflow-hidden rounded-tr-2xl rounded-bl-xl"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="flex h-full w-full items-center justify-center bg-primary">
            <CheckIcon className="h-3 w-3 text-white" />
          </div>
        </motion.div>
      )}
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE DETAIL PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const TemplateDetail = ({ template }: { template: WorkflowTemplate }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const Icon = template.icon;

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease }}
      className="flex flex-col h-full"
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
            template.color
          )}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
            {template.category}
          </span>
          <h3 className="text-xl font-bold text-foreground mt-0.5">
            {template.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {template.description}
          </p>
        </div>
      </div>

      {/* Model badge */}
      <div className="flex items-center gap-2 mb-5">
        <BrainIcon className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          Recommended model:
        </span>
        <span className="rounded-full bg-primary/10 ring-1 ring-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary">
          {template.model}
        </span>
      </div>

      {/* Variables */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Variable className="h-3.5 w-3.5 text-primary" />
          Input Variables
        </p>
        <div className="flex flex-wrap gap-1.5">
          {template.variables.map((v) => (
            <span
              key={v}
              className="inline-flex items-center rounded-lg bg-muted/60 border border-border/40 px-2.5 py-1 font-mono text-[11px] text-foreground/70"
            >
              {`{{${v}}}`}
            </span>
          ))}
        </div>
      </div>

      {/* System Prompt */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            System Instructions
          </p>
          <button
            type="button"
            onClick={() => handleCopy(template.systemPrompt, "system")}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
            aria-label="Copy system prompt"
          >
            {copied === "system" ? (
              <CheckIcon className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied === "system" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="rounded-xl bg-muted/40 border border-border/40 p-4">
          <p className="text-[13px] font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {template.systemPrompt}
          </p>
        </div>
      </div>

      {/* User Template */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            User Prompt Template
          </p>
          <button
            type="button"
            onClick={() => handleCopy(template.userTemplate, "user")}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
            aria-label="Copy user prompt template"
          >
            {copied === "user" ? (
              <CheckIcon className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied === "user" ? "Copied" : "Copy"}
          </button>
        </div>
        <div
          className="rounded-xl border border-border/40 p-4 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.5) 100%)",
          }}
        >
          <pre className="text-[13px] font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {template.userTemplate}
          </pre>
        </div>
      </div>

      {/* Use this template CTA */}
      <div className="mt-auto pt-4">
        <Link
          href="/workflows"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-2xl btn-primary-hover font-semibold",
            "shadow-glow-sm hover:shadow-glow-md",
            "group"
          )}
        >
          <span className="flex items-center gap-2">
            Use this template
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS STEPS
   ═══════════════════════════════════════════════════════════════════════════ */
const timelineSteps = [
  {
    icon: Workflow,
    title: "Create a workflow",
    desc: 'Open the dashboard and click "New Workflow." Give it a name that describes its purpose.',
    visual: "wf_blog_generator",
  },
  {
    icon: Variable,
    title: "Define your inputs",
    desc: "Add dynamic input variables like {{topic}}, {{tone}}, or {{customer_question}} — these become the API parameters.",
    visual: "{{topic}}, {{tone}}, {{word_count}}",
  },
  {
    icon: FileText,
    title: "Write your prompts",
    desc: "Craft a system instruction and user template. Use the built-in editor with live preview to iterate fast.",
    visual: "System + User template",
  },
  {
    icon: BrainIcon,
    title: "Choose your model",
    desc: "Pick from 50+ models — GPT-5 for reasoning, Gemini Flash for speed, Perplexity Sonar for web-grounded answers.",
    visual: "GPT-5 | Claude | Gemini",
  },
  {
    icon: Sparkles,
    title: "Test in the console",
    desc: "Use the Compose tab to test with real inputs. Toggle streaming. Iterate until the output is perfect.",
    visual: "▶ Run workflow",
  },
  {
    icon: Rocket,
    title: "Publish & deploy",
    desc: "Hit Publish and your workflow gets a live REST endpoint. Call it from your app — it's live instantly.",
    visual: "POST /api/v1/run/wf_...",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════════════════ */
const features = [
  {
    icon: BrainIcon,
    title: "50+ AI Models",
    desc: "GPT-5, Claude Sonnet 4.5, Gemini 2.5 Pro, Grok 3, Llama, DeepSeek, and more. Switch models without changing integration code.",
  },
  {
    icon: Zap,
    title: "Real-time Streaming",
    desc: "Stream responses token-by-token. Compatible with Vercel AI SDK, React useChat, and any HTTP client.",
  },
  {
    icon: ShieldCheck,
    title: "Production Security",
    desc: "Bearer auth, single-use Redis tokens, server-derived rate limiting, and fail-closed error handling.",
  },
  {
    icon: Network,
    title: "Auto-scaling Infra",
    desc: "Edge-deployed with zero cold starts. Auto-scaling serverless functions, 300s max duration.",
  },
  {
    icon: Globe,
    title: "Web Search",
    desc: "Ground AI responses in real-time web data. Citations with source URLs returned automatically.",
  },
  {
    icon: BookOpen,
    title: "Versioning",
    desc: "Branch and iterate on prompts without breaking production. Roll back to any version instantly.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   API CODE EXAMPLES
   ═══════════════════════════════════════════════════════════════════════════ */
type CodeLang = "javascript" | "python" | "curl";

const apiExamples: Record<CodeLang, string> = {
  javascript: `const res = await fetch(
  "https://api.aitutor.com/v1/run/wf_blog_gen",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer sk_live_...",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: "AI workflow automation",
      tone: "professional",
      word_count: "1500",
    }),
  }
);

const { output } = await res.json();`,

  python: `import requests

response = requests.post(
    "https://api.aitutor.com/v1/run/wf_blog_gen",
    headers={"Authorization": "Bearer sk_live_..."},
    json={
        "topic": "AI workflow automation",
        "tone": "professional",
        "word_count": "1500",
    }
)

print(response.json()["output"])`,

  curl: `curl -X POST https://api.aitutor.com/v1/run/wf_blog_gen \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "AI workflow automation",
    "tone": "professional",
    "word_count": "1500"
  }'`,
};

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
      {copied ? (
        <CheckIcon className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   VISUAL PIPELINE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const PipelineNode = ({
  label,
  sublabel,
  active,
  delay,
}: {
  label: string;
  sublabel: string;
  active?: boolean;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay, ease }}
    className={cn(
      "relative flex flex-col items-center gap-1.5 rounded-2xl border px-5 py-4 transition-all duration-300",
      active
        ? "border-primary/50 bg-primary/[0.06] shadow-glow-sm"
        : "border-border/60 bg-card"
    )}
  >
    <span className="text-xs font-bold text-foreground">{label}</span>
    <span className="text-[10px] font-mono text-muted-foreground">
      {sublabel}
    </span>
    {active && (
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
  </motion.div>
);

const PipelineConnector = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ duration: 0.4, delay, ease }}
    className="hidden sm:flex items-center"
  >
    <div className="h-px w-8 bg-border/60 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-primary/40"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
    <ChevronRight className="h-3 w-3 text-muted-foreground -ml-1" />
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function WorkflowsGuidePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [codeLang, setCodeLang] = useState<CodeLang>("javascript");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      <main className="pt-28 pb-0">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          {/* Background atmosphere */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.06)_0%,transparent_70%)]" />
            <div className="absolute top-1/3 -right-[10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,hsl(262_83%_58%/0.04)_0%,transparent_70%)]" />
            <div className="absolute bottom-0 left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,hsl(330_81%_55%/0.03)_0%,transparent_70%)]" />
          </div>

          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease }}
            >
              <Badge>Workflows</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
              className="mt-8 text-display-md sm:text-display-lg tracking-tight"
            >
              <span className="text-foreground">Build </span>
              <span className="text-gradient">AI workflows</span>
              <br className="hidden sm:block" />
              <span className="text-foreground">not chatbots</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
              className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground"
            >
              Workflows are reusable AI pipelines: a model, a prompt template,
              input variables, and a live API endpoint. Create once, deploy
              instantly, call from anywhere. Pick a template below and ship in
              minutes.
            </motion.p>

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
                  Create your first workflow
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <a
                href="#templates"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-2xl border-border/70 bg-card px-8 text-[14px] font-semibold",
                  "hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary",
                  "transition-all duration-300 active:scale-[0.97]"
                )}
              >
                Explore templates
              </a>
            </motion.div>
          </div>

          {/* Visual Pipeline Mockup */}
          <div className="mx-auto mt-20 max-w-4xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease }}
              className="relative"
            >
              <div className="pointer-events-none absolute -inset-[1px] rounded-[1.6rem] bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
              <div className="relative rounded-[1.5rem] border border-border/60 bg-card p-6 sm:p-10 shadow-float-lg">
                {/* Beam */}
                <div className="pointer-events-none absolute -top-px left-0 right-0 h-px overflow-hidden rounded-t-[1.5rem]">
                  <div className="animate-beam absolute h-full w-1/4 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                </div>

                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-6 text-center">
                  Workflow Pipeline
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-0">
                  <PipelineNode
                    label="Input"
                    sublabel="{{variables}}"
                    delay={0.8}
                  />
                  <PipelineConnector delay={1.0} />
                  <PipelineNode
                    label="System Prompt"
                    sublabel="AI persona"
                    delay={1.1}
                  />
                  <PipelineConnector delay={1.3} />
                  <PipelineNode
                    label="Model"
                    sublabel="GPT-5"
                    active
                    delay={1.4}
                  />
                  <PipelineConnector delay={1.6} />
                  <PipelineNode
                    label="Output"
                    sublabel="REST API"
                    delay={1.7}
                  />
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: "Avg Latency", value: "142ms", pct: 45 },
                    { label: "Success Rate", value: "99.9%", pct: 99 },
                    { label: "Models Available", value: "50+", pct: 78 },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border/40 bg-background/50 p-3 sm:p-4"
                    >
                      <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-lg sm:text-xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.pct}%` }}
                          transition={{
                            duration: 1.2,
                            delay: 2 + i * 0.15,
                            ease,
                          }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── WORKFLOW ANATOMY ──────────────────────────────────────── */}
        <section className="border-y border-border/60 surface-raised py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <Badge>Anatomy</Badge>
                <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                  What makes a{" "}
                  <span className="font-serif italic text-primary">
                    workflow
                  </span>
                </h2>
                <p className="mt-5 text-base text-muted-foreground max-w-2xl mx-auto">
                  A workflow is the core building block. Instead of wiring API
                  keys and prompt logic into your code, you define everything in
                  the dashboard and get a stable endpoint.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: BrainIcon,
                  label: "AI Model",
                  detail: "GPT-5, Claude, Gemini, Grok, and 50+ more",
                },
                {
                  icon: ShieldCheck,
                  label: "System Instructions",
                  detail: "The AI's personality, rules, and constraints",
                },
                {
                  icon: FileText,
                  label: "Prompt Template",
                  detail: "User message with {{variable}} placeholders",
                },
                {
                  icon: Variable,
                  label: "Input Variables",
                  detail: "Dynamic parameters your consumers provide",
                },
                {
                  icon: Sparkles,
                  label: "Model Settings",
                  detail: "Temperature, max tokens, and tuning options",
                },
                {
                  icon: Globe,
                  label: "Web Search",
                  detail: "Optional — ground responses in real-time data",
                },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] ring-1 ring-primary/15 transition-all duration-300 group-hover:ring-primary/40 group-hover:shadow-glow-xs">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEMPLATE EXPLORER ─────────────────────────────────────── */}
        <section id="templates" className="py-20 sm:py-28 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <Badge>Templates</Badge>
                <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                  Start with a{" "}
                  <span className="font-serif italic text-primary">
                    template
                  </span>
                </h2>
                <p className="mt-5 text-base text-muted-foreground max-w-2xl mx-auto">
                  Real workflow templates you can deploy in minutes. Select one
                  to see the full configuration — system prompt, user template,
                  variables, and recommended model.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
                {/* Template selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                  {workflowTemplates.map((t, i) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      isSelected={selectedTemplate === i}
                      onSelect={() => setSelectedTemplate(i)}
                    />
                  ))}
                </div>

                {/* Template detail */}
                <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 min-h-[500px]">
                  <AnimatePresence mode="wait">
                    <TemplateDetail
                      key={workflowTemplates[selectedTemplate].id}
                      template={workflowTemplates[selectedTemplate]}
                    />
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── HOW TO CREATE — TIMELINE ──────────────────────────────── */}
        <section className="border-y border-border/60 surface-raised py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <Badge>How it works</Badge>
                <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                  Six steps to{" "}
                  <span className="font-serif italic text-primary">
                    production
                  </span>
                </h2>
                <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto">
                  From zero to live API endpoint in under 10 minutes.
                </p>
              </div>
            </Reveal>

            <div className="relative">
              {/* Vertical line (desktop) */}
              <div className="hidden lg:block absolute left-[21px] top-0 bottom-0 w-px bg-border/60" />

              <div className="space-y-3">
                {timelineSteps.map((step, i) => (
                  <Reveal key={step.title} delay={i * 0.08}>
                    <div className="group relative lg:pl-14 lg:pb-3 last:pb-0">
                      {/* Timeline dot */}
                      <div className="hidden lg:flex absolute left-0 top-1.5 h-[42px] w-[42px] items-center justify-center">
                        <div className="relative flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-border/60 bg-card transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-glow-xs">
                          <step.icon className="h-4 w-4 text-primary" />
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-[4px] bg-primary text-[9px] font-bold text-white">
                            {i + 1}
                          </span>
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="rounded-2xl border border-border/60 bg-card p-5 transition-shadow duration-300 hover:shadow-card-hover"
                      >
                        <div className="flex items-center gap-3 mb-1.5 lg:hidden">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.08] ring-1 ring-primary/15">
                            <step.icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-primary/40">
                            Step {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-base font-bold text-foreground">
                              {step.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                          <div className="hidden sm:block shrink-0">
                            <span className="inline-block rounded-xl bg-muted/60 border border-border/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                              {step.visual}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PLATFORM FEATURES ─────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <Badge>Platform</Badge>
                <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                  Built for{" "}
                  <span className="font-serif italic text-primary">
                    production
                  </span>
                </h2>
                <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto">
                  Everything you get out of the box with every workflow.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-7 transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <div className="pointer-events-none absolute -top-px -right-px h-24 w-24 rounded-tr-2xl bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.06)_0%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] ring-1 ring-primary/15 transition-all duration-300 group-hover:ring-primary/40 group-hover:shadow-glow-xs">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── API CODE EXAMPLES ─────────────────────────────────────── */}
        <section className="border-y border-border/60 surface-raised py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <Badge>Integration</Badge>
                <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                  Call any workflow with{" "}
                  <span className="font-serif italic text-primary">
                    one request
                  </span>
                </h2>
                <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto">
                  Three endpoints cover every integration pattern. Copy, paste,
                  ship.
                </p>
              </div>
            </Reveal>

            {/* Endpoint cards */}
            <Reveal delay={0.1}>
              <div className="space-y-3 mb-10">
                {[
                  {
                    method: "POST",
                    path: "/api/v1/run/{workflow_id}",
                    desc: "Execute a workflow and receive the full result as JSON. Best for server-side.",
                  },
                  {
                    method: "GET",
                    path: "/api/v1/token?ttl=60",
                    desc: "Generate a single-use streaming token. Use server-side, pass to your client.",
                  },
                  {
                    method: "POST",
                    path: "/api/v1/run/{workflow_id}/stream?token=...",
                    desc: "Stream the response token-by-token. Safe for client-side use.",
                  },
                ].map((ep) => (
                  <div
                    key={ep.path}
                    className="rounded-xl border border-border/60 bg-card p-4 flex flex-col sm:flex-row gap-3"
                  >
                    <span className="inline-block self-start rounded-lg bg-primary/[0.08] ring-1 ring-primary/15 px-3 py-1 font-mono text-xs font-bold text-primary shrink-0">
                      {ep.method}
                    </span>
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {ep.path}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ep.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Code editor */}
            <Reveal delay={0.2}>
              <div className="relative">
                <div className="pointer-events-none absolute -inset-[1px] rounded-[1.4rem] bg-gradient-to-b from-white/10 via-primary/10 to-transparent" />
                <div className="pointer-events-none absolute inset-0 -z-10 rounded-[1.4rem] blur-2xl opacity-40 bg-gradient-to-b from-primary/20 to-transparent" />

                <div
                  className="relative rounded-[1.35rem] overflow-hidden shadow-float-lg"
                  style={{
                    background: "#0d1117",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="relative flex items-center justify-between px-5 py-3.5"
                    style={{
                      background: "#161b22",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/20" />
                      <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/20" />
                      <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/20" />
                    </div>

                    <div
                      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl p-1"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      {(Object.keys(apiExamples) as CodeLang[]).map((l) => {
                        const label =
                          l === "curl"
                            ? "cURL"
                            : l.charAt(0).toUpperCase() + l.slice(1);
                        const isActive = codeLang === l;
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setCodeLang(l)}
                            aria-label={`Show ${label} example`}
                            className={cn(
                              "relative px-4 py-1.5 rounded-lg text-[12px] font-mono font-medium transition-all duration-200 select-none",
                              isActive
                                ? "text-white"
                                : "text-white/35 hover:text-white/65"
                            )}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="wf-code-tab"
                                className="absolute inset-0 rounded-lg"
                                style={{
                                  background: "rgba(255,255,255,0.09)",
                                  boxShadow:
                                    "0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(255,255,255,0.08)",
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 420,
                                  damping: 32,
                                }}
                              />
                            )}
                            <span className="relative">{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <CopyButton code={apiExamples[codeLang]} />
                  </div>

                  <div className="relative overflow-x-auto">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={codeLang}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <pre
                          className="overflow-x-auto px-6 py-7 text-[0.875rem] leading-[1.85]"
                          style={{
                            fontFamily:
                              "'JetBrains Mono', 'Fira Code', monospace",
                            color: "#c9d1d9",
                          }}
                        >
                          {apiExamples[codeLang]
                            .split("\n")
                            .map((line, i) => (
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

                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                      style={{
                        background:
                          "linear-gradient(to top, #0d1117, transparent)",
                      }}
                    />
                  </div>

                  <div
                    className="flex items-center justify-between px-5 py-2"
                    style={{
                      background: "#161b22",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                      <span className="font-mono text-[10px] text-white/25">
                        api.aitutor.com
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-white/20">
                      <span>UTF-8</span>
                      <span>
                        {codeLang === "curl"
                          ? "Shell"
                          : codeLang === "javascript"
                            ? "JavaScript"
                            : "Python 3"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── TIPS ──────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <Badge>Pro Tips</Badge>
                <h2 className="mt-6 text-display-sm sm:text-display-md text-foreground">
                  Ship{" "}
                  <span className="font-serif italic text-primary">better</span>{" "}
                  workflows
                </h2>
                <p className="mt-5 text-base text-muted-foreground max-w-lg mx-auto">
                  Practical advice from teams already in production.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Be specific in system instructions",
                  desc: "Include the AI's role, tone, constraints, output format, and domain knowledge. The more context, the better the output.",
                },
                {
                  title: "Use the right model for the job",
                  desc: "GPT-5 and Claude Sonnet 4.5 for complex reasoning. Gemini Flash for speed. Perplexity Sonar for web-grounded answers.",
                },
                {
                  title: "Design inputs for flexibility",
                  desc: "Use descriptive variable names like {{customer_question}} instead of {{input}}. Add optional variables for tone and format.",
                },
                {
                  title: "Always stream for user-facing apps",
                  desc: "Streaming feels dramatically faster. Generate a token server-side, pass it to the client, use fetch ReadableStream.",
                },
                {
                  title: "Set spend limits",
                  desc: "Configure monthly limits in Settings. The API blocks requests at the cap, preventing surprise charges during traffic spikes.",
                },
                {
                  title: "Monitor with Statistics",
                  desc: "Track API calls, active models, token usage, success rates, and latency. Use this data to optimize model selection.",
                },
              ].map((tip, i) => (
                <Reveal key={tip.title} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="rounded-2xl border border-border/60 bg-card p-6 transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.08] ring-1 ring-primary/15 font-mono text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <h3 className="text-[15px] font-bold text-foreground">
                        {tip.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tip.desc}
                    </p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────────────────────── */}
        <section className="pb-20 sm:pb-28 px-6">
          <Reveal>
            <div
              className="mx-auto max-w-5xl relative overflow-hidden rounded-[2rem] p-12 sm:p-20 text-center"
              style={{
                background:
                  "linear-gradient(135deg, hsl(292 84% 38%) 0%, hsl(270 60% 28%) 50%, hsl(262 70% 32%) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/[0.06] blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/[0.15] blur-3xl" />

              <div className="pointer-events-none absolute top-0 left-0 right-0 h-px overflow-hidden">
                <div className="animate-beam absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>

              <Play className="mx-auto h-12 w-12 text-white/20 mb-6" />

              <h2 className="relative text-display-sm sm:text-display-md text-white font-extrabold tracking-tight">
                Ready to build your
                <br />
                <span className="text-gradient">first workflow?</span>
              </h2>
              <p className="relative mt-4 text-base text-white/60 max-w-lg mx-auto">
                Pick a template, customize the prompts, and deploy a live API
                endpoint in minutes. No credit card required.
              </p>
              <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/workflows"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "rounded-2xl !bg-white !text-neutral-900 font-bold px-10",
                    "shadow-lg hover:shadow-xl hover:!bg-white/90 hover:!text-neutral-900",
                    "transition-all duration-300 active:scale-[0.97]",
                    "group"
                  )}
                >
                  <span className="flex items-center gap-2">
                    Create your first workflow
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  href="https://support.myapps.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-2xl border-white/25 bg-white/[0.08] text-white font-bold px-10",
                    "hover:bg-white/[0.15] hover:border-white/40",
                    "transition-all duration-300 active:scale-[0.97]"
                  )}
                >
                  Read the API docs
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
