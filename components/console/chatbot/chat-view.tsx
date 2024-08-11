"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChat } from "ai/react";
import { CornerDownLeft, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { SpinnerWithSpacing } from "@/components/core/loaders";
import {
  clearChatHistory,
  getChatHistory,
  reportChatUsage,
} from "@/app/(dashboard)/console/chatbots/actions";

function ChatView({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);

  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: `/api/chat/${id}`,
    initialInput: "",
    onFinish: (response) => {
      if (response?.content) {
        const totalTokens = response?.content.split(" ").length * 0.7;
        reportChatUsage(totalTokens).then(() => {
          console.log("Chat usage reported");
        });
      }

      if (window?.scrollTo)
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
    },
  });

  useEffect(() => {
    setLoading(true);
    getChatHistory(id)
      .then((history) => {
        setMessages(history);
      })
      .finally(() => setLoading(false));
  }, [id, setMessages]);

  if (loading) {
    return <SpinnerWithSpacing />;
  }

  return (
    <TooltipProvider>
      <div className="relative flex h-full min-h-[60vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
        <Badge variant="outline" className="absolute right-3 top-3">
          Output
        </Badge>
        <div className="flex-1">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-">
              <div className="flex items-start gap-4">
                <Avatar className="hidden md:block w-8 h-8 border">
                  <AvatarFallback>
                    {message.role.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-bold font-xs capitalize">
                    {message.role}
                  </div>
                  <div className="prose text-muted-foreground">
                    <ReactMarkdown className="prose dark:prose-invert max-w-none prose-a:text-primary">
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring mt-6">
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
                setTimeout(() => {
                  setInput("");
                }, 50);
              }
            }}
          />
          <div className="flex items-center p-3 pt-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <form
                  action={async () => {
                    setMessages([]);
                    await toast.promise(clearChatHistory(id), {
                      loading: "Deleting chat history...",
                      success: "Chat history deleted",
                      error: "Failed to delete chat history",
                    });
                  }}
                >
                  <Button variant="ghost" size="icon">
                    <Trash2Icon className="size-4" />
                    <span className="sr-only">Clear history</span>
                  </Button>
                </form>
              </TooltipTrigger>
              <TooltipContent side="top">Clear history</TooltipContent>
            </Tooltip>

            <form onSubmit={handleSubmit} className="ml-auto gap-1.5">
              <Button type="submit" size="sm">
                Send
                <CornerDownLeft className="size-3.5 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default ChatView;
