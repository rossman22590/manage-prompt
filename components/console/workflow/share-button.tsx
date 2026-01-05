"use client";

import { Share2, XCircle } from "lucide-react";
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
import { expireWorkflowShare, reactivateWorkflowShare } from "@/app/(dashboard)/workflows/actions";
import { RefreshCw } from "lucide-react";

interface ShareButtonProps {
  workflowShortId: string;
  workflowId: number;
  workflowName: string;
  shareExpiresAt?: Date | null;
}

export function ShareButton({ workflowShortId, workflowId, workflowName, shareExpiresAt }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [showExpireModal, setShowExpireModal] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/share/${workflowShortId}`
    : "";
  
  const isExpired = shareExpiresAt && shareExpiresAt < new Date();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleExpire = async () => {
    setIsExpiring(true);
    try {
      const formData = new FormData();
      formData.append("id", workflowId.toString());
      await expireWorkflowShare(formData);
      toast.success("Share link expired successfully!");
      setShowExpireModal(false);
      setOpen(false);
      // Reload the page to reflect the change
      window.location.reload();
    } catch (err) {
      toast.error("Failed to expire link");
    } finally {
      setIsExpiring(false);
    }
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      const formData = new FormData();
      formData.append("id", workflowId.toString());
      await reactivateWorkflowShare(formData);
      toast.success("Share link reactivated successfully!");
      setOpen(false);
      // Reload the page to reflect the change
      window.location.reload();
    } catch (err) {
      toast.error("Failed to reactivate link");
    } finally {
      setIsReactivating(false);
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
            {isExpired && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Expired:</strong> This share link has expired and is no longer accessible.
                </p>
              </div>
            )}
            <div className="rounded-lg bg-pink-50 dark:bg-pink-950/30 p-4 border border-pink-200 dark:border-pink-800">
              <p className="text-sm text-pink-800 dark:text-pink-200">
                <strong>Note:</strong> Running this workflow will use credits from your account.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              {isExpired ? (
                <Button
                  onClick={handleReactivate}
                  variant="default"
                  size="sm"
                  disabled={isReactivating}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  {isReactivating ? "Reactivating..." : "Reactivate Share Link"}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowExpireModal(true)}
                  variant="destructive"
                  size="sm"
                  className="hover:bg-red-600"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Expire Link
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expire Confirmation Modal */}
      <Dialog open={showExpireModal} onOpenChange={setShowExpireModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              Expire Share Link?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to expire this share link? The link will no longer be accessible to anyone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExpireModal(false)}
              disabled={isExpiring}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleExpire}
              disabled={isExpiring}
              className="hover:bg-red-600"
            >
              {isExpiring ? "Expiring..." : "Yes, Expire Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

