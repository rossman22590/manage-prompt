"use client";

import {
    type WorkflowInput,
    WorkflowInputType
} from "@/data/workflow";
import type { Workflow } from "@/generated/prisma-client/client";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import Image from "next/image";
import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import logo from "../../../public/images/logo.png";
import StreamingText from "../../core/streaming-text";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

interface Props {
  workflow: Workflow;
}

export function PublicWorkflowRunner({ workflow }: Props) {
  const { template, instruction, model } = workflow;
  const inputs = (workflow.inputs ?? []) as WorkflowInput[];

  const [inputValues, updateInput] = useReducer((state: any, action: any) => {
    return {
      ...state,
      ...action,
    };
  }, {});

  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [showQuery, setShowQuery] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  const generatedTemplate = useMemo(() => {
    let result = template;

    Object.keys(inputValues).forEach((key) => {
      result = result.replace(`{{${key}}}`, inputValues[key]);
    });

    return result;
  }, [inputValues, template]);

  const generatedInstruction = useMemo(() => {
    if (!instruction) return "";
    let result = instruction;

    Object.keys(inputValues).forEach((key) => {
      result = result.replace(`{{${key}}}`, inputValues[key]);
    });

    return result;
  }, [inputValues, instruction]);

  const handleRunWorkflow = async () => {
    setIsLoading(true);
    setStreamUrl(null);
    setError(null);

    try {
      const response = await fetch(`/api/public/run/${workflow.shortId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputValues),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to run workflow");
      }

      const { streamUrl: url } = await response.json();
      // Use relative URL for same-origin requests
      const relativeUrl = url.startsWith("http") 
        ? url.replace(/^https?:\/\/[^/]+/, "")
        : url;
      setStreamUrl(relativeUrl);
      setIsStreaming(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to run workflow";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStreamUrl(null);
    setError(null);
    setResult("");
    setShowQuery(true);
    setIsStreaming(false);
  };

  const allInputsFilled = inputs.every((input) => {
    const value = inputValues[input.name];
    return value !== undefined && value !== null && value !== "";
  });

  return (
    <div className="p-8">
      {/* Input Form */}
      {!streamUrl && (
        <div className="space-y-6">
          {inputs.length > 0 ? (
            <>
              {inputs.map((input) => {
                // Capitalize the first letter of the label/name for vanity
                const displayLabel = input.label 
                  ? input.label.charAt(0).toUpperCase() + input.label.slice(1)
                  : input.name.charAt(0).toUpperCase() + input.name.slice(1);
                
                return (
                  <div key={input.name} className="space-y-2">
                    <Label htmlFor={input.name} className="text-base font-semibold">
                      {displayLabel}
                      {input.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                  {input.type === WorkflowInputType.textarea ? (
                    <Textarea
                      id={input.name}
                      placeholder={input.placeholder || `Enter ${input.name}`}
                      rows={6}
                      value={inputValues[input.name] || ""}
                      onChange={(e) =>
                        updateInput({ [input.name]: e.target.value })
                      }
                      className="text-base"
                    />
                  ) : (
                    <Input
                      id={input.name}
                      type="text"
                      placeholder={input.placeholder || `Enter ${input.name}`}
                      value={inputValues[input.name] || ""}
                      onChange={(e) =>
                        updateInput({ [input.name]: e.target.value })
                      }
                      className="text-base"
                    />
                  )}
                </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>This workflow doesn't require any inputs.</p>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleRunWorkflow}
              disabled={isLoading || (inputs.length > 0 && !allInputsFilled)}
              size="lg"
              className="bg-pink-500 hover:bg-[hsl(330,81%,40%)] text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {isLoading ? "Running..." : "Run Workflow"}
            </Button>
          </div>
        </div>
      )}

      {/* Result Display */}
      {streamUrl && (
        <div className="space-y-6">
          {/* Query/Prompt Display */}
          <div className="border-t pt-6">
            <button
              onClick={() => setShowQuery(!showQuery)}
              className="flex items-center justify-between w-full mb-4 text-left"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Query Sent to Model
              </h3>
              {showQuery ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {showQuery && (
              <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-900 mb-4">
                {inputs.length > 0 ? (
                  <div className="space-y-3">
                    {inputs.map((input) => {
                      const value = inputValues[input.name];
                      const displayLabel = input.label 
                        ? input.label.charAt(0).toUpperCase() + input.label.slice(1)
                        : input.name.charAt(0).toUpperCase() + input.name.slice(1);
                      
                      if (!value) return null;
                      
                      return (
                        <div key={input.name}>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {displayLabel}:
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    No inputs required for this workflow.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Result Display */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Result
              </h3>
              {result && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const blob = new Blob([result], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${workflow.name || "result"}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success("Downloaded as text file!");
                    }}
                    variant="outline"
                    size="sm"
                    className="hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-pink-900/40 dark:hover:text-pink-300"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download TXT
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        // Dynamic import for jsPDF
                        const { default: jsPDF } = await import("jspdf");
                        const doc = new jsPDF();
                        
                        // Remove markdown formatting for cleaner PDF
                        const plainText = result
                          .replace(/#{1,6}\s/g, "") // Remove headers
                          .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
                          .replace(/\*(.*?)\*/g, "$1") // Remove italic
                          .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links
                          .replace(/`([^`]+)`/g, "$1"); // Remove code

                        const lines = doc.splitTextToSize(plainText, 180);
                        doc.setFontSize(12);
                        doc.text(lines, 10, 20);
                        
                        doc.save(`${workflow.name || "result"}.pdf`);
                        toast.success("Downloaded as PDF!");
                      } catch (err) {
                        console.error("PDF generation error:", err);
                        toast.error("Failed to generate PDF. Please try downloading as text.");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-pink-900/40 dark:hover:text-pink-300"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
            <div className="border rounded-xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-[200px]">
              {isStreaming && !result && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Image
                    src={logo}
                    alt="AI Tutor API"
                    width={64}
                    height={64}
                    className="animate-pulse"
                  />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Processing your request...
                  </p>
                </div>
              )}
              <StreamingText
                url={streamUrl}
                body={inputValues}
                fallbackText="Failed to process workflow"
                className="text-base leading-7 text-slate-800 dark:text-slate-100 whitespace-pre-wrap"
                renderMarkdown={true}
                onCompleted={() => {
                  setIsStreaming(false);
                  toast.success("Workflow completed!");
                }}
                onResultChange={(newResult) => {
                  if (newResult) {
                    setResult(newResult);
                    setIsStreaming(false);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleReset}
              className="bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-700 dark:bg-pink-950/30 dark:hover:bg-pink-900/40 dark:text-pink-300 dark:hover:text-pink-300 border-pink-300 dark:border-pink-700 px-6 py-3"
            >
              Run Again
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}

