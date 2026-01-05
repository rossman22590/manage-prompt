"use client";

import { Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { cn } from "@/lib/utils";
import logo from "../../public/images/logo.png";
import { UserButton } from "../core/auth";
import { ThemeToggle } from "../core/theme-toggle";

type Props = {
  isPublicPage?: boolean;
};

export default function NavBar({ isPublicPage = false }: Props) {
  const path = usePathname();
  const params = useParams();

  const [isSticky, ref] = useDetectSticky();

  const tabs = useMemo(() => {
    if ("workflowId" in params) {
      return [
        {
          name: "Editor",
          href: `/workflows/${params.workflowId}`,
          current:
            path === `/workflows/${params.workflowId}` ||
            path === `/workflows/${params.workflowId}/edit`,
        },
        {
          name: "Branches",
          href: `/workflows/${params.workflowId}/branches`,
          current:
            path === `/workflows/${params.workflowId}/branches` ||
            path === `/workflows/${params.workflowId}/branches/new`,
        },
        {
          name: "Tests",
          href: `/workflows/${params.workflowId}/tests`,
          current: path === `/workflows/${params.workflowId}/tests`,
        },
        {
          name: "Executions",
          href: `/workflows/${params.workflowId}/runs`,
          current: path === `/workflows/${params.workflowId}/runs`,
        },
        {
          name: "Usage",
          href: `/workflows/${params.workflowId}/usage`,
          current: path === `/workflows/${params.workflowId}/usage`,
        },
      ];
    }

    return [
      {
        name: "Workflows",
        href: "/workflows",
        current: path.startsWith("/workflows"),
      },
      {
        name: "Settings",
        href: "/settings",
        current: path === "/settings",
      },
    ];
  }, [path, params]);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-20 flex-shrink-0 text-black dark:text-white bg-background",
          isPublicPage && "border-b",
        )}
      >
        <div className="mx-auto px-4 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex">
              <Link href="/" className="ml-1" prefetch={false}>
                <div className="flex items-center lg:px-0">
                  <Image
                    src={logo}
                    alt="AI Tutor API"
                    width={32}
                    height={32}
                    className="mr-2"
                  />

                  <div className="-m-1.5 p-1.5">
                    <span className="sr-only">AI Tutor API Platform</span>
                    <p className="relative">
                      AI Tutor<span className="font-semibold">API</span>
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {!isPublicPage ? (
              <div className="flex ml-2 justify-center gap-2">
                <ThemeToggle />
                <UserButton />
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "sticky top-16 z-10 -mb-px flex w-full self-start border-b bg-background px-4 lg:px-8",
          isPublicPage ? "hidden" : "",
        )}
        ref={ref}
      >
        <div className="flex w-full min-w-0 space-x-1 overflow-x-auto overflow-y-hidden">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                tab.current
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                "whitespace-nowrap border-b-2 py-3 text-sm font-medium",
              )}
              aria-current={tab.current ? "page" : undefined}
              prefetch={false}
            >
              <span className="rounded-md px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-100 hover:text-black dark:hover:bg-[#2a2a2a] dark:hover:text-white">
                {tab.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
