"use client";

import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShowHideKeyProps {
  keyValue: string;
}

export function ShowHideKey({ keyValue }: ShowHideKeyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopied(true);
      toast.success("Key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy key");
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex-1 font-mono text-sm break-all overflow-wrap-anywhere whitespace-pre-wrap">
        {isVisible ? keyValue : "•".repeat(Math.min(keyValue.length, 40))}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0"
        aria-label="Copy key"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="h-8 w-8 p-0"
        aria-label={isVisible ? "Hide key" : "Show key"}
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

