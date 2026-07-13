"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

type Props = {
  agentId: number;
};

function loadStoredMessages(storageKey: string): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function AgentChat({ agentId }: Props) {
  const storageKey = `agent-chat:${agentId}`;
  const [input, setInput] = useState("");
  // Guards against the "save to storage" effect running (and stomping real
  // history with "[]") before the "load from storage" effect below has had a
  // chance to populate messages from localStorage on mount.
  const hasLoadedRef = useRef(false);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: `/api/agents/${agentId}/chat` }),
    [agentId],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messages: [],
  });

  // Load stored messages only after mount (client-only), so the server-
  // rendered markup and the initial client render both start from an empty
  // array and never mismatch during hydration.
  useEffect(() => {
    hasLoadedRef.current = false;
    setMessages(loadStoredMessages(storageKey));
    hasLoadedRef.current = true;
  }, [storageKey, setMessages]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSend = () => {
    if (status !== "ready") return;
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleClear = () => {
    setMessages([]);
    window.localStorage.removeItem(storageKey);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear conversation
        </Button>
      </div>
      <div className="flex flex-col gap-3 min-h-[300px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg p-3 max-w-[80%] ${
              message.role === "user"
                ? "self-end bg-pink-500 text-white"
                : "self-start bg-slate-100 dark:bg-slate-800"
            }`}
          >
            {message.parts.filter(isTextUIPart).map((part, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: text parts have no stable id and only ever append within a message
              <p key={i} className="whitespace-pre-wrap">
                {part.text}
              </p>
            ))}
          </div>
        ))}
        {status === "streaming" && (
          <p className="text-sm text-muted-foreground self-start">Thinking…</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Send a message..."
        />
        <Button onClick={handleSend} disabled={status !== "ready"}>
          Send
        </Button>
      </div>
    </div>
  );
}
