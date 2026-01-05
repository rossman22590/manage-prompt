"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { Spinner } from "./loaders";

export default function StreamingText({
  url,
  body,
  fallbackText,
  className,
  renderMarkdown = false,
  onCompleted,
  onResultChange,
}: {
  url: string;
  body?: any;
  fallbackText: string;
  className?: string;
  renderMarkdown?: boolean;
  onCompleted?: () => void;
  onResultChange?: (result: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  // Use useEffect to call onResultChange when result changes, avoiding setState during render
  useEffect(() => {
    if (result && onResultChange) {
      onResultChange(result);
    }
  }, [result, onResultChange]);

  const getData = useCallback(async () => {
    setLoading(true);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Stream error:", response.status, errorText);
      setError(errorText || `HTTP ${response.status}`);
      setLoading(false);
      return null;
    }

    const data = response.body;
    if (!data) {
      setResult(fallbackText);
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    setLoading(false);

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResult((prev) => (prev ?? "") + chunkValue);
    }

    onCompleted?.();
  }, [url, fallbackText, body, onCompleted]);

  useEffect(() => {
    if (url && !hasStarted.current) {
      hasStarted.current = true;
      getData();
    }
  }, [url, getData]);

  if (error) {
    return (
      <p className={`${className} text-red-500`}>
        Error: {error}
      </p>
    );
  }

  return loading ? (
    <Spinner className={className} />
  ) : renderMarkdown ? (
    <Markdown className="prose dark:prose-invert prose-a:text-primary">
      {result}
    </Markdown>
  ) : (
    <p className={className}>{result}</p>
  );
}
