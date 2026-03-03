"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import logo from "../../public/images/logo.png";
import { UserButton } from "../core/auth";
import { ThemeToggle } from "../core/theme-toggle";

type Props = { isPublicPage?: boolean; showAdminLink?: boolean };

export default function NavBar({ isPublicPage = false, showAdminLink = false }: Props) {
  const path = usePathname();
  const params = useParams();

  const tabs = useMemo(() => {
    if ("workflowId" in params) {
      return [
        { name: "Editor",     href: `/workflows/${params.workflowId}`,          current: path === `/workflows/${params.workflowId}` || path === `/workflows/${params.workflowId}/edit` },
        { name: "Branches",   href: `/workflows/${params.workflowId}/branches`, current: path === `/workflows/${params.workflowId}/branches` || path === `/workflows/${params.workflowId}/branches/new` },
        { name: "Tests",      href: `/workflows/${params.workflowId}/tests`,    current: path === `/workflows/${params.workflowId}/tests` },
        { name: "Executions", href: `/workflows/${params.workflowId}/runs`,     current: path === `/workflows/${params.workflowId}/runs` },
        { name: "Usage",      href: `/workflows/${params.workflowId}/usage`,    current: path === `/workflows/${params.workflowId}/usage` },
      ];
    }
    const base = [
      { name: "Workflows",  href: "/workflows",  current: path.startsWith("/workflows") },
      { name: "Statistics", href: "/statistics", current: path === "/statistics" },
      { name: "Settings",   href: "/settings",   current: path === "/settings" },
    ];
    if (showAdminLink) base.push({ name: "Admin", href: "/admin", current: path === "/admin" });
    return base;
  }, [path, params, showAdminLink]);

  return (
    <>
      <nav className="sticky top-0 z-40 flex-shrink-0 nav-glass border-b border-border/60">
        <div className="mx-auto max-w-screen-2xl px-4 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" prefetch={false} aria-label="Home" className="group flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40">
                <Image src={logo} alt="" width={16} height={16} />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-foreground">AI Tutor</span>
              <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-primary/20 px-1.5 py-0.5 rounded-md">API</span>
            </Link>
            {!isPublicPage && (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserButton />
              </div>
            )}
          </div>
        </div>
      </nav>

      {!isPublicPage && (
        <div className="sticky top-14 z-30 nav-glass border-b border-border/60">
          <div className="mx-auto max-w-screen-2xl px-4 lg:px-8">
            <div className="flex min-w-0 overflow-x-auto overflow-y-hidden">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  prefetch={false}
                  aria-current={tab.current ? "page" : undefined}
                  className={cn(
                    "relative flex items-center whitespace-nowrap px-1 py-3 mr-1 text-[13px] font-medium transition-colors duration-200",
                    tab.current ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.current && (
                    <span className="absolute bottom-0 inset-x-0 h-[2px] rounded-t-full bg-primary" />
                  )}
                  <span className={cn(
                    "rounded-lg px-3 py-1.5 transition-colors duration-200",
                    tab.current ? "bg-primary/[0.06]" : "hover:bg-muted"
                  )}>
                    {tab.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
