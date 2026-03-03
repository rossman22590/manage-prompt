import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { JSX, PropsWithChildren } from "react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subTitle?: string;
  actionLink?: string;
  actionLabel?: string;
  backUrl?: string;
  actions?: JSX.Element;
}

export default function PageTitle({ title, subTitle, backUrl, actionLink, actionLabel, children, actions }: PropsWithChildren<Props>) {
  return (
    <div className="border-b border-border/60 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-8 pt-6 pb-7">
        {backUrl && (
          <Link href={backUrl} prefetch={false} className="group mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back
          </Link>
        )}
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            {subTitle && <p className="mt-1.5 text-sm text-muted-foreground">{subTitle}</p>}
            {children && <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>}
          </div>
          {actionLink && actionLabel && (
            <Link
              href={actionLink} prefetch={false}
              className={cn(buttonVariants({ size: "sm" }), "shrink-0 rounded-xl bg-primary text-primary-foreground shadow-glow-xs hover:shadow-glow-sm font-semibold transition-all duration-200")}
            >
              {actionLabel}
            </Link>
          )}
          {actions ?? null}
        </div>
      </div>
    </div>
  );
}
