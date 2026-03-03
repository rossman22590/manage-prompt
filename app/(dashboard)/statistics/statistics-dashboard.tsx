"use client";

import PageTitle from "@/components/layout/page-title";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  BarChart3,
  Clock,
  Cpu,
  Globe,
  Key,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import React, { useRef } from "react";

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
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const hr = (h: number): string => {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
};

const CardHeader = ({
  icon: Icon,
  title,
  sub,
  right,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  right?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20">
        <Icon className="h-4 w-4 text-pink-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
    {right}
  </div>
);

const BarChart = ({
  items,
  delayBase = 0.5,
}: {
  items: { key: string; pct: number; highlight: boolean; tooltip: string }[];
  delayBase?: number;
}) => (
  <div className="flex items-end gap-[3px] h-28">
    {items.map((bar, i) => (
      <motion.div
        key={bar.key}
        initial={{ height: 0 }}
        animate={{ height: `${Math.max(bar.pct, 3)}%` }}
        transition={{ duration: 0.6, delay: delayBase + i * 0.015, ease }}
        className={cn(
          "flex-1 rounded-t-sm cursor-default transition-colors duration-200",
          bar.highlight
            ? "bg-pink-500"
            : "bg-pink-300/40 dark:bg-pink-500/25 hover:bg-pink-400/60 dark:hover:bg-pink-500/40"
        )}
        title={bar.tooltip}
        role="img"
        aria-label={bar.tooltip}
      />
    ))}
  </div>
);

type Props = {
  totalCalls: number;
  totalTokens: number;
  successRate: number;
  activeModels: { name: string; label: string; calls: number }[];
  callsByDay: { date: string; total: number; tokens: number }[];
  callsByHour: { hour: number; calls: number }[];
  recentRuns: {
    id: number;
    workflowShortId: string;
    model: string;
    modelLabel: string;
    tokens: number;
    createdAt: string;
  }[];
  activeKeyCount: number;
};

export default function StatisticsDashboard({
  totalCalls,
  totalTokens,
  successRate,
  activeModels,
  callsByDay,
  callsByHour,
  recentRuns,
  activeKeyCount,
}: Props) {
  const maxDay = Math.max(...callsByDay.map((d) => d.total), 1);
  const maxHour = Math.max(...callsByHour.map((h) => h.calls), 1);
  const hasData = totalCalls > 0;

  const stats = [
    { label: "Total Calls", value: fmt(totalCalls), icon: Zap },
    { label: "Total Tokens", value: fmt(totalTokens), icon: Layers },
    { label: "Success Rate", value: `${successRate.toFixed(1)}%`, icon: Activity },
    { label: "API Keys", value: activeKeyCount.toString(), icon: Key },
  ];

  return (
    <div className="min-h-screen">
      <PageTitle
        title="Statistics"
        subTitle="Monitor your API performance and usage — last 30 days"
      />

      <div className="mx-auto max-w-screen-xl px-4 lg:px-8 py-8 space-y-5">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="group relative rounded-2xl border border-border/60 bg-card px-5 py-5 transition-shadow duration-300 hover:shadow-card-hover overflow-hidden">
                <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-pink-500/[0.06] blur-2xl transition-all duration-500 group-hover:bg-pink-500/[0.12]" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20">
                    <s.icon className="h-4 w-4 text-pink-500" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                </div>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  {s.value}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Two charts side by side ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* API Traffic (30 days) */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <CardHeader
                icon={BarChart3}
                title="API Traffic"
                sub="Calls per day — 30 days"
                right={
                  hasData ? (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
                      <p className="text-sm font-bold text-foreground">
                        {fmt(callsByDay[callsByDay.length - 1]?.total ?? 0)}
                      </p>
                    </div>
                  ) : undefined
                }
              />
              {hasData ? (
                <>
                  <BarChart
                    items={callsByDay.map((d, i) => ({
                      key: d.date,
                      pct: (d.total / maxDay) * 100,
                      highlight: i === callsByDay.length - 1,
                      tooltip: `${d.date}: ${d.total} calls`,
                    }))}
                  />
                  <div className="mt-2.5 flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{callsByDay[0]?.date ?? ""}</span>
                    <span>{callsByDay[callsByDay.length - 1]?.date ?? ""}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-28 text-sm text-muted-foreground">
                  No API calls yet
                </div>
              )}
            </div>
          </Reveal>

          {/* Peak Hours (24h) */}
          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <CardHeader
                icon={Clock}
                title="Peak Hours"
                sub="24h distribution (UTC)"
                right={
                  hasData
                    ? (() => {
                        const peak = callsByHour.reduce((a, b) => (b.calls > a.calls ? b : a), callsByHour[0]);
                        return (
                          <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Peak</p>
                            <p className="text-sm font-bold text-pink-500">
                              {hr(peak.hour)} <span className="text-foreground/60 font-normal">({fmt(peak.calls)})</span>
                            </p>
                          </div>
                        );
                      })()
                    : undefined
                }
              />
              {hasData ? (
                <>
                  <BarChart
                    items={callsByHour.map((e) => ({
                      key: String(e.hour),
                      pct: (e.calls / maxHour) * 100,
                      highlight: e.calls === maxHour && e.calls > 0,
                      tooltip: `${hr(e.hour)}: ${e.calls} calls`,
                    }))}
                    delayBase={0.55}
                  />
                  <div className="mt-2.5 flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>12am</span>
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                    <span>11pm</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-28 text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* ── Active Models + Recent Runs ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Active Models */}
          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <CardHeader
                icon={Cpu}
                title="Active Models"
                sub={`${activeModels.length} model${activeModels.length !== 1 ? "s" : ""} used`}
              />
              {activeModels.length > 0 ? (
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                  {activeModels.map((model, i) => {
                    const maxCalls = activeModels[0]?.calls ?? 1;
                    const pct = (model.calls / maxCalls) * 100;
                    return (
                      <motion.div
                        key={model.name}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.5 + i * 0.06, ease }}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-pink-50/40 dark:hover:bg-pink-950/10"
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                          {model.label}
                        </span>
                        <div className="hidden sm:block w-20 h-1 rounded-full bg-pink-100 dark:bg-pink-950/40 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.7 + i * 0.06, ease }}
                            className="h-full rounded-full bg-pink-400"
                          />
                        </div>
                        <span className="shrink-0 w-12 text-right text-[11px] font-mono text-muted-foreground">
                          {fmt(model.calls)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-28 text-sm text-muted-foreground">
                  No models used yet
                </div>
              )}
            </div>
          </Reveal>

          {/* Recent Runs */}
          <Reveal delay={0.25}>
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <CardHeader
                icon={Globe}
                title="Recent Runs"
                sub="Latest API executions"
                right={<Sparkles className="h-4 w-4 text-pink-400/50" />}
              />
              {recentRuns.length > 0 ? (
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                  {recentRuns.map((run, i) => (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + i * 0.05, ease }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-pink-50/40 dark:hover:bg-pink-950/10"
                    >
                      <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        200
                      </span>
                      <span className="flex-1 truncate text-[12px] font-mono text-foreground/80">
                        {run.workflowShortId}
                      </span>
                      <span className="hidden sm:inline shrink-0 text-[11px] font-medium text-pink-500/70">
                        {run.modelLabel}
                      </span>
                      <span className="shrink-0 w-14 text-right text-[11px] font-mono text-muted-foreground">
                        {fmt(run.tokens)} tok
                      </span>
                      <span className="shrink-0 w-16 text-right text-[10px] text-muted-foreground">
                        {new Date(run.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-28 text-sm text-muted-foreground">
                  No runs yet
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* ── Summary strip ── */}
        <Reveal delay={0.3}>
          <div className="relative overflow-hidden rounded-2xl border border-pink-200/60 dark:border-pink-500/20 bg-gradient-to-r from-pink-50 via-pink-50/50 to-white dark:from-pink-950/30 dark:via-pink-950/10 dark:to-card px-6 py-5">
            <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-pink-400/10 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/15 ring-1 ring-pink-500/30">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {hasData ? "Your API is active" : "Get started"}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {hasData
                      ? `${fmt(totalCalls)} calls across ${activeModels.length} model${activeModels.length !== 1 ? "s" : ""} this month`
                      : "Create a workflow and make your first API call"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: "Total Calls", value: fmt(totalCalls) },
                  { label: "Tokens Used", value: fmt(totalTokens) },
                  { label: "API Keys", value: activeKeyCount.toString() },
                ].map((item) => (
                  <div key={item.label} className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
