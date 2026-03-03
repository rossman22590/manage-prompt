"use client";

import PageTitle from "@/components/layout/page-title";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Clock,
  Cpu,
  Globe,
  Key,
  Layers,
  Sparkles,
  TrendingUp,
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

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const hourLabel = (hour: number): string => {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
};

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
  const maxDayCalls = Math.max(...callsByDay.map((d) => d.total), 1);
  const maxHourCalls = Math.max(...callsByHour.map((h) => h.calls), 1);

  const statCards = [
    {
      label: "Total Calls",
      value: formatNumber(totalCalls),
      icon: Zap,
      barWidth: Math.min((totalCalls / Math.max(totalCalls, 1)) * 100, 100),
    },
    {
      label: "Total Tokens",
      value: formatNumber(totalTokens),
      icon: Layers,
      barWidth: Math.min((totalTokens / Math.max(totalTokens, 1)) * 100, 100),
    },
    {
      label: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: Activity,
      barWidth: successRate,
    },
    {
      label: "API Keys",
      value: activeKeyCount.toString(),
      icon: Key,
      barWidth: Math.min(activeKeyCount * 20, 100),
    },
  ];

  const hasData = totalCalls > 0;

  return (
    <div className="min-h-screen">
      <PageTitle
        title="Statistics"
        subTitle="Monitor your API performance and usage — last 30 days"
      />

      <div className="mx-auto max-w-screen-2xl px-4 lg:px-8 py-8">
        {/* Header */}
        <Reveal>
          <div className="mb-8 flex items-center gap-2">
            <Activity className="h-5 w-5 text-pink-500" />
            <span className="text-sm font-semibold text-foreground">
              Dashboard
            </span>
            <span className="ml-2 flex items-center gap-1.5 rounded-full bg-pink-500/10 px-2.5 py-1 text-[11px] font-semibold text-pink-600 dark:text-pink-400 ring-1 ring-pink-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
              Last 30 days
            </span>
          </div>
        </Reveal>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-shadow duration-300 hover:shadow-card-hover"
              >
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-pink-500/[0.06] blur-2xl transition-all duration-500 group-hover:bg-pink-500/[0.12]" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 ring-1 ring-pink-500/20 transition-all duration-300 group-hover:ring-pink-500/40 group-hover:shadow-[0_0_12px_hsl(330_81%_60%/0.15)]">
                    <stat.icon className="h-5 w-5 text-pink-500" />
                  </div>
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </p>

                <div className="mt-4 h-1.5 rounded-full bg-pink-100 dark:bg-pink-950/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.barWidth}%` }}
                    transition={{
                      duration: 1.2,
                      delay: 0.4 + i * 0.15,
                      ease,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
                  />
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Calls by Day (traffic chart) + Active Models */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-8">
          {/* Traffic chart */}
          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20">
                    <BarChart3 className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Calls per Day
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Last 30 days
                    </p>
                  </div>
                </div>
              </div>

              {hasData ? (
                <>
                  <div className="flex items-end gap-[3px] h-40">
                    {callsByDay.map((day, i) => {
                      const pct = (day.total / maxDayCalls) * 100;
                      return (
                        <motion.div
                          key={day.date}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(pct, 2)}%` }}
                          transition={{
                            duration: 0.6,
                            delay: 0.5 + i * 0.02,
                            ease,
                          }}
                          className={cn(
                            "flex-1 rounded-t-sm transition-colors duration-200 cursor-default",
                            i === callsByDay.length - 1
                              ? "bg-pink-500"
                              : "bg-pink-300/40 dark:bg-pink-500/25 hover:bg-pink-400/60 dark:hover:bg-pink-500/40"
                          )}
                          title={`${day.date}: ${day.total} calls`}
                          role="img"
                          aria-label={`${day.date}: ${day.total} calls`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {callsByDay[0]?.date ?? ""}
                    </span>
                    <span>
                      {callsByDay[callsByDay.length - 1]?.date ?? ""}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  No API calls yet. Run a workflow to see traffic data.
                </div>
              )}
            </div>
          </Reveal>

          {/* Active Models */}
          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20">
                  <Cpu className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Active Models
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {activeModels.length} model{activeModels.length !== 1 && "s"} used
                  </p>
                </div>
              </div>

              {activeModels.length > 0 ? (
                <div className="space-y-3">
                  {activeModels.map((model, i) => (
                    <motion.div
                      key={model.name}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.6 + i * 0.08,
                        ease,
                      }}
                      className="group rounded-xl border border-border/40 bg-background/50 p-3.5 transition-all duration-200 hover:border-pink-300/40 dark:hover:border-pink-500/30 hover:bg-pink-50/30 dark:hover:bg-pink-950/10"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-sm font-bold text-foreground">
                            {model.label}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-muted-foreground">
                          {formatNumber(model.calls)} calls
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-pink-100 dark:bg-pink-950/40 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(model.calls / (activeModels[0]?.calls || 1)) * 100}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: 0.8 + i * 0.1,
                            ease,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  No models used yet
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Usage by Hour + Recent Runs */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
          {/* Usage by Hour */}
          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20">
                  <TrendingUp className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Usage by Hour
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Request distribution (UTC)
                  </p>
                </div>
              </div>

              {hasData ? (
                <div className="space-y-2">
                  {callsByHour
                    .filter((_, i) => i % 2 === 0)
                    .map((entry, i) => (
                      <motion.div
                        key={entry.hour}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + i * 0.04 }}
                        className="flex items-center gap-3"
                      >
                        <span className="w-10 text-[11px] font-mono text-muted-foreground text-right shrink-0">
                          {hourLabel(entry.hour)}
                        </span>
                        <div className="flex-1 h-5 rounded-md bg-pink-100/60 dark:bg-pink-950/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${maxHourCalls > 0 ? (entry.calls / maxHourCalls) * 100 : 0}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              delay: 0.7 + i * 0.04,
                              ease,
                            }}
                            className="h-full rounded-md bg-gradient-to-r from-pink-400 to-pink-500"
                          />
                        </div>
                        <span className="w-10 text-[11px] font-mono font-medium text-foreground text-right shrink-0">
                          {entry.calls}
                        </span>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
          </Reveal>

          {/* Recent Runs */}
          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20">
                    <Globe className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Recent Runs
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Latest API executions
                    </p>
                  </div>
                </div>
                <Sparkles className="h-4 w-4 text-pink-400/60" />
              </div>

              {recentRuns.length > 0 ? (
                <div className="space-y-2">
                  {recentRuns.map((run, i) => (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.7 + i * 0.06,
                        ease,
                      }}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 px-4 py-3 transition-all duration-200 hover:border-pink-300/40 dark:hover:border-pink-500/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          200
                        </span>
                        <span className="truncate text-[12px] font-mono text-foreground/80">
                          /v1/run/{run.workflowShortId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <span className="hidden sm:inline text-[11px] font-medium text-pink-500/80">
                          {run.modelLabel}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground w-16 text-right">
                          {formatNumber(run.tokens)} tok
                        </span>
                        <span className="text-[10px] text-muted-foreground w-20 text-right">
                          {new Date(run.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  No runs yet. Execute a workflow to see activity.
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Bottom summary bar */}
        <Reveal delay={0.25}>
          <div className="relative overflow-hidden rounded-2xl border border-pink-200/60 dark:border-pink-500/20 bg-gradient-to-r from-pink-50 via-pink-50/50 to-white dark:from-pink-950/30 dark:via-pink-950/10 dark:to-card p-6">
            <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-pink-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-pink-300/10 blur-2xl" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 ring-1 ring-pink-500/30">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {hasData ? "Your API is active" : "Get started"}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {hasData
                      ? `${formatNumber(totalCalls)} calls across ${activeModels.length} model${activeModels.length !== 1 ? "s" : ""} this month`
                      : "Create a workflow and make your first API call"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: "Total Calls", value: formatNumber(totalCalls) },
                  {
                    label: "Tokens Used",
                    value: formatNumber(totalTokens),
                  },
                  { label: "API Keys", value: activeKeyCount.toString() },
                ].map((item) => (
                  <div key={item.label} className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {item.value}
                    </p>
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
