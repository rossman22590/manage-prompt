"use client";

import MarkdownView from "@/components/markdown/markdown-view";
import type { WorkflowRun } from "@/generated/prisma-client/client";
import { DateTime } from "@/lib/utils/datetime";
import { CheckIcon, CopyIcon, GitBranchIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "../../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

export type WorkflowRunWithUser = WorkflowRun & {
  user: {
    name: string | null;
  };
  branchId: string | null;
};

interface Props {
  workflowRun: WorkflowRunWithUser;
}

export function WorkflowRunItem({ workflowRun }: Props) {
  const { result, user, createdAt, rawRequest, totalTokenCount, branchId, rawResult } =
    workflowRun;

  const [copyingResponse, setCopyingResponse] = useState(false);
  const [copyingRequest, setCopyingRequest] = useState(false);

  const citations =
    typeof rawResult === "object" && rawResult !== null
      ? (rawResult as any).citations || []
      : [];

  const copyToClipboard = async (text: string, type: "response" | "request") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "response") {
        setCopyingResponse(true);
        setTimeout(() => setCopyingResponse(false), 2000);
      } else {
        setCopyingRequest(true);
        setTimeout(() => setCopyingRequest(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  return (
    <li className="relative overflow-x-hidden px-6 pt-5 pb-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
      {/* Meta row */}
      <div className="flex justify-between items-center gap-3 mb-3">
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-border/60 bg-muted text-muted-foreground">
            {user?.name ?? "API"}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-border/60 bg-muted text-muted-foreground">
            <GitBranchIcon className="w-3 h-3 mr-1" />
            {branchId ?? "main"}
          </span>
          {totalTokenCount ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-border/60 bg-muted text-muted-foreground">
              {totalTokenCount} tokens
            </span>
          ) : null}
        </div>
        <time
          dateTime={createdAt.toISOString()}
          className="flex-shrink-0 whitespace-nowrap text-xs text-muted-foreground"
        >
          {DateTime.fromJSDate(createdAt).toNiceFormat()}
        </time>
      </div>

      {/* Result */}
      <div className="text-foreground/80">
        <MarkdownView content={result} />
      </div>

      {/* Citations */}
      {citations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-foreground">Citations:</h4>
          <ul className="mt-2 space-y-1">
            {citations.map((citation: string, index: number) => (
              <li key={index} className="text-xs text-primary/70 hover:text-primary flex items-center">
                <LinkIcon className="w-3 h-3 mr-1 shrink-0" />
                <a
                  href={citation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate"
                >
                  {citation}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* View Raw drawer */}
      <Drawer>
        <DrawerTrigger className={buttonVariants({ variant: "link", className: "pl-0 mt-3 h-auto text-xs" })}>
          View Raw
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Raw Request &amp; Response</DrawerTitle>
          </DrawerHeader>
          <Tabs defaultValue="response">
            <TabsList className="ml-4">
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="request">Request</TabsTrigger>
            </TabsList>
            <TabsContent value="response">
              <div className="relative">
                <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px] text-xs">
                  {JSON.stringify(rawResult, null, 2)}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(JSON.stringify(rawResult, null, 2), "response")}
                >
                  {copyingResponse ? <CheckIcon className="h-4 w-4 mr-1" /> : <CopyIcon className="h-4 w-4 mr-1" />}
                  {copyingResponse ? "Copied!" : "Copy"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="request">
              <div className="relative">
                <pre className="p-4 bg-secondary overflow-scroll whitespace-pre-wrap max-h-[320px] text-xs">
                  {JSON.stringify(rawRequest, null, 2)}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(JSON.stringify(rawRequest, null, 2), "request")}
                >
                  {copyingRequest ? <CheckIcon className="h-4 w-4 mr-1" /> : <CopyIcon className="h-4 w-4 mr-1" />}
                  {copyingRequest ? "Copied!" : "Copy"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="mb-6">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </li>
  );
}
