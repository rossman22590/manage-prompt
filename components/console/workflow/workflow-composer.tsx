"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import {
  modelHasInstruction,
  type WorkflowInput,
  WorkflowInputType,
} from "@/data/workflow";
import type { Workflow } from "@/generated/prisma-client/client";
import { ApiCodeSnippet } from "../../code/snippet";
import { Spinner } from "../../core/loaders";
import StreamingText from "../../core/streaming-text";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";

interface Props {
  workflow: Workflow;
  apiSecretKey?: string;
  branch?: string;
}

export function WorkflowComposer({ workflow, apiSecretKey }: Props) {
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
  const [resultText, setResultText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(false);
  const [tokenTtl, setTokenTtl] = useState(60);
  const [deployToken, setDeployToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isCopyingToken, setIsCopyingToken] = useState(false);
  const [isCopyingTokenCurl, setIsCopyingTokenCurl] = useState(false);
  const [isCopyingCurl, setIsCopyingCurl] = useState(false);

  const generatedTemplate = useMemo(() => {
    let result = template;

    Object.keys(inputValues).forEach((key) => {
      result = result.replace(`{{${key}}}`, inputValues[key]);
    });

    return result;
  }, [inputValues, template]);

  const geneatedInstruction = useMemo(() => {
    let result = instruction ?? "";

    Object.keys(inputValues).forEach((key) => {
      result = result.replace(`{{${key}}}`, inputValues[key]);
    });

    return result;
  }, [inputValues, instruction]);

  const sampleRequestBody = useMemo(
    () =>
      JSON.stringify(
        ((inputs ?? []) as WorkflowInput[]).reduce(
          (acc, input) =>
            Object.assign(acc, {
              [input.name]: "value",
            }),
          {},
        ),
      ),
    [inputs],
  );

  const streamCurlCommand = useMemo(() => {
    // Prefer the browser's own origin (correct regardless of which of our
    // domains is serving this page) over the build-time-baked env var,
    // which would otherwise always show whichever single domain was set
    // when this bundle was built.
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
    const tokenValue = deployToken ?? "pub_tok_xxx";

    return `curl --request POST \\
  --url ${baseUrl}/api/v1/run/${workflow.shortId}/stream?token=${tokenValue} \\
  --header 'Content-Type: application/json' \\
  --data '${sampleRequestBody}' \\
  --no-buffer`;
  }, [deployToken, sampleRequestBody, workflow.shortId]);

  const tokenCurlCommand = useMemo(() => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
    const key = apiSecretKey ?? "api-secret-key";

    return `curl --request GET \\
  --url ${baseUrl}/api/v1/token?ttl=${tokenTtl} \\
  --header 'Authorization: Bearer ${key}'`;
  }, [apiSecretKey, tokenTtl]);

  const handleRunWorkflow = async () => {
    if (!apiSecretKey) {
      toast.error("API key not available");
      return;
    }

    setIsLoading(true);
    setStreamUrl(null);
    setResultText(null);
    setError(null);

    try {
      if (useStreaming) {
        const tokenResponse = await fetch("/api/v1/token", {
          headers: {
            Authorization: `Bearer ${apiSecretKey}`,
          },
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to get streaming token");
        }

        const { token } = await tokenResponse.json();
        setStreamUrl(`/api/v1/run/${workflow.shortId}/stream?token=${token}`);
      } else {
        const response = await fetch(`/api/v1/run/${workflow.shortId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputValues),
        });

        if (!response.ok) {
          const payload = await response.text();
          throw new Error(payload || "Failed to run workflow");
        }

        const payload = await response.json();
        setResultText(payload?.result ?? "");
        toast.success("Workflow completed");
      }
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
    setResultText(null);
    setError(null);
  };

  const handleCopy = async (
    value: string,
    type: "token" | "tokenCurl" | "curl",
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      if (type === "token") {
        setIsCopyingToken(true);
        setTimeout(() => setIsCopyingToken(false), 1500);
      } else if (type === "tokenCurl") {
        setIsCopyingTokenCurl(true);
        setTimeout(() => setIsCopyingTokenCurl(false), 1500);
      } else {
        setIsCopyingCurl(true);
        setTimeout(() => setIsCopyingCurl(false), 1500);
      }
      toast.success("Copied");
    } catch (copyError) {
      console.error(copyError);
      toast.error("Failed to copy");
    }
  };

  const handleGenerateStreamToken = async () => {
    if (!apiSecretKey) {
      toast.error("API key not available");
      return;
    }

    setIsGeneratingToken(true);
    setDeployToken(null);

    try {
      const response = await fetch(`/api/v1/token?ttl=${tokenTtl}`, {
        headers: {
          Authorization: `Bearer ${apiSecretKey}`,
        },
      });

      if (!response.ok) {
        const payload = await response.text();
        throw new Error(payload || "Failed to generate token");
      }

      const payload = await response.json();
      if (!payload?.token) {
        throw new Error("No token returned");
      }

      setDeployToken(payload.token);
      toast.success("Streaming token generated");
    } catch (generateError) {
      const message =
        generateError instanceof Error
          ? generateError.message
          : "Failed to generate token";
      toast.error(message);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue={inputs?.length ? "compose" : "review"}>
        <TabsList>
          {inputs?.length ? (
            <TabsTrigger value="compose">Compose</TabsTrigger>
          ) : null}
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
        </TabsList>
        {inputs?.length ? (
          <TabsContent value="compose">
            <div className="mt-4 space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label className="uppercase">MODEL</Label>
                <p>{workflow.model}</p>
              </div>

              {(inputs as WorkflowInput[]).map(
                ({ name, type = WorkflowInputType.text, label }) => (
                  <div key={name} className="grid w-full items-center gap-1.5">
                    <Label className="uppercase">{label ?? name}</Label>

                    {type === WorkflowInputType.textarea ? (
                      <Textarea
                        rows={10}
                        placeholder={`Enter value for ${name}`}
                        value={inputValues[name] ?? ""}
                        onChange={(e) =>
                          updateInput({ [name]: e.target.value })
                        }
                      />
                    ) : null}

                    {[
                      WorkflowInputType.text,
                      WorkflowInputType.number,
                      WorkflowInputType.url,
                    ].includes(type) ? (
                      <Input
                        type={type}
                        placeholder={`Enter ${type}`}
                        value={inputValues[name] ?? ""}
                        onChange={(e) =>
                          updateInput({ [name]: e.target.value })
                        }
                      />
                    ) : null}

                    {type === WorkflowInputType.image ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Upload an image file or enter an image URL (.png,
                          .jpg, .jpeg)
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter image URL (e.g., https://example.com/image.png)"
                          value={
                            inputValues[name] &&
                            !inputValues[name].startsWith("data:")
                              ? inputValues[name]
                              : ""
                          }
                          onChange={(e) => {
                            const url = e.target.value.trim();
                            if (url) {
                              // Validate it's a valid image URL
                              try {
                                const urlObj = new URL(url);
                                const pathname = urlObj.pathname.toLowerCase();
                                if (
                                  /\.(png|jpg|jpeg|gif|webp)$/i.test(pathname)
                                ) {
                                  updateInput({ [name]: url });
                                } else {
                                  toast.error(
                                    "Please enter a valid image URL (.png, .jpg, .jpeg, .gif, or .webp)",
                                  );
                                }
                              } catch {
                                toast.error("Please enter a valid URL");
                              }
                            } else {
                              updateInput({ [name]: "" });
                            }
                          }}
                        />
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                              Or
                            </span>
                          </div>
                        </div>
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validate file type
                              const validTypes = [
                                "image/png",
                                "image/jpeg",
                                "image/jpg",
                                "image/gif",
                                "image/webp",
                              ];
                              if (!validTypes.includes(file.type)) {
                                toast.error(
                                  "Please select a valid image file (.png, .jpg, .jpeg, .gif, or .webp)",
                                );
                                return;
                              }
                              // Convert file to base64 data URL
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateInput({
                                  [name]: reader.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {inputValues[name] && (
                          <div className="mt-2">
                            <img
                              src={inputValues[name]}
                              alt="Preview"
                              className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 dark:border-gray-700"
                            />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>

            <div className="mt-2 flex justify-end">
              <div className="mr-4 flex items-center gap-2">
                <Label
                  htmlFor="stream-toggle-compose"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Stream
                </Label>
                <Switch
                  id="stream-toggle-compose"
                  checked={useStreaming}
                  onCheckedChange={setUseStreaming}
                  aria-label="Toggle streaming responses"
                />
              </div>
              <Button
                onClick={handleRunWorkflow}
                disabled={
                  !workflow.published ||
                  !apiSecretKey ||
                  isLoading ||
                  streamUrl !== null ||
                  resultText !== null ||
                  Object.keys(inputValues).length !==
                    (inputs as WorkflowInput[])?.length
                }
                className="bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
              >
                {isLoading ? (
                  <Spinner message="Loading..." />
                ) : useStreaming ? (
                  "Run (Stream)"
                ) : (
                  "Run"
                )}
              </Button>
            </div>
          </TabsContent>
        ) : null}

        <TabsContent value="review">
          <div className="border-b">
            {modelHasInstruction[model] ? (
              <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-[#1a1a1a] whitespace-pre-wrap">
                <span className="font-semibold">Instruction:</span>{" "}
                {geneatedInstruction}
              </div>
            ) : null}
            <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-[#1a1a1a] whitespace-pre-wrap">
              {generatedTemplate}
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <div className="mr-4 flex items-center gap-2">
              <Label
                htmlFor="stream-toggle-review"
                className="text-xs font-medium text-muted-foreground"
              >
                Stream
              </Label>
              <Switch
                id="stream-toggle-review"
                checked={useStreaming}
                onCheckedChange={setUseStreaming}
                aria-label="Toggle streaming responses"
              />
            </div>
            <Button
              onClick={handleRunWorkflow}
              disabled={
                !workflow.published ||
                !apiSecretKey ||
                isLoading ||
                streamUrl !== null ||
                resultText !== null ||
                Object.keys(inputValues).length !==
                  (inputs as WorkflowInput[])?.length
              }
            >
              {isLoading ? (
                <Spinner message="Loading..." />
              ) : useStreaming ? (
                "Run (Stream)"
              ) : (
                "Run"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="deploy">
          <ApiCodeSnippet
            har={{
              method: "POST",
              url: `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000"}/api/v1/run/${workflow.shortId}`,
              queryString: [],
              headers: [
                {
                  name: "Authorization",
                  value: `Bearer ${apiSecretKey ?? "api-secret-key"}`,
                },
                {
                  name: "Content-Type",
                  value: "application/json",
                },
              ],
              postData: {
                mimeType: "application/json",
                text: sampleRequestBody,
              },
            }}
          />
          <div className="mt-2 text-sm">
            ID:{" "}
            <span className="p-1 border border-secondary font-mono text-primary bg-secondary">
              {workflow.shortId}
            </span>
          </div>
        </TabsContent>

        <TabsContent value="streaming">
          <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Stream setup and test
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Streaming uses a short-lived token from
              <span className="font-mono"> /api/v1/token</span>, then calls
              <span className="font-mono">
                {" "}
                /api/v1/run/{workflow.shortId}/stream
              </span>
              .
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-36">
                <Label className="mb-1 block text-[11px] uppercase text-muted-foreground">
                  TTL (seconds)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={tokenTtl}
                  onChange={(event) =>
                    setTokenTtl(
                      Math.min(
                        300,
                        Math.max(1, Number(event.target.value || 60)),
                      ),
                    )
                  }
                />
              </div>
              <Button
                onClick={handleGenerateStreamToken}
                disabled={!apiSecretKey || isGeneratingToken}
                className="sm:mt-5"
              >
                {isGeneratingToken ? (
                  <Spinner message="Generating..." />
                ) : (
                  "Generate stream token"
                )}
              </Button>
            </div>

            <div className="mt-4">
              <Label className="text-[11px] uppercase text-muted-foreground">
                Generated token
              </Label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-2">
                <code className="min-w-0 flex-1 truncate px-1 text-xs text-foreground">
                  {deployToken ?? "Generate a token to test streaming"}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!deployToken}
                  onClick={() =>
                    deployToken && handleCopy(deployToken, "token")
                  }
                >
                  {isCopyingToken ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <Label className="text-[11px] uppercase text-muted-foreground">
                  Step 1: Get streaming token
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(tokenCurlCommand, "tokenCurl")}
                >
                  {isCopyingTokenCurl ? (
                    <>
                      <CheckIcon className="mr-1 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="mr-1 h-4 w-4" />
                      Copy curl
                    </>
                  )}
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border/60 bg-secondary p-3 text-xs whitespace-pre-wrap">
                {tokenCurlCommand}
              </pre>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <Label className="text-[11px] uppercase text-muted-foreground">
                  Step 2: Stream the response
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(streamCurlCommand, "curl")}
                >
                  {isCopyingCurl ? (
                    <>
                      <CheckIcon className="mr-1 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="mr-1 h-4 w-4" />
                      Copy curl
                    </>
                  )}
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border/60 bg-secondary p-3 text-xs whitespace-pre-wrap">
                {streamCurlCommand}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {(streamUrl || resultText !== null) && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Result</h3>
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-[#1a1a1a]">
            {streamUrl ? (
              <StreamingText
                url={streamUrl}
                body={inputValues}
                fallbackText="Failed to process workflow"
                className="text-sm leading-5 text-slate-800 dark:text-slate-100 whitespace-pre-wrap"
                onCompleted={() => toast.success("Workflow completed")}
              />
            ) : (
              <pre className="text-sm leading-5 text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                {resultText}
              </pre>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleReset}
              className="bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-700 dark:bg-pink-950/30 dark:hover:bg-pink-900/40 dark:text-pink-300 dark:hover:text-pink-300 border-pink-300 dark:border-pink-700"
            >
              Run Again
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}
