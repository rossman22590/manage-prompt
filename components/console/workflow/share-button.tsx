"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareButtonProps {
  workflowShortId: string;
  workflowName: string;
}

export function ShareButton({ workflowShortId, workflowName }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/share/${workflowShortId}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-pink-900/40 dark:hover:text-pink-300"
      >
        <Share2 className="mr-1 h-4 w-4" aria-hidden="true" />
        Share
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              Share Workflow
            </DialogTitle>
            <DialogDescription>
              Share this workflow publicly. Anyone with this link can run it without logging in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopy} variant="default" size="sm">
                  Copy
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-pink-50 dark:bg-pink-950/30 p-4 border border-pink-200 dark:border-pink-800">
              <p className="text-sm text-pink-800 dark:text-pink-200">
                <strong>Note:</strong> Running this workflow will use credits from your account.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

