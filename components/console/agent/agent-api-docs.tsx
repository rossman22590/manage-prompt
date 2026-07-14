import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  appUrl: string;
  modelId: string;
  cacheControlTtl?: number | null;
}

const inlineCode = "rounded bg-muted px-1 py-0.5 text-xs font-mono";
const codeBlock =
  "rounded-md border bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre";
const subheading = "text-sm font-semibold mb-2";

export function AgentApiDocs({ appUrl, modelId, cacheControlTtl }: Props) {
  const created = 1735843200;
  const completionId = `chatcmpl-${created}-${modelId}`;

  const nonStreamingExample = JSON.stringify(
    {
      id: completionId,
      object: "chat.completion",
      created,
      model: modelId,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Hello! How can I help you today?",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 9,
        total_tokens: 9,
      },
    },
    null,
    2,
  );

  const chunk = (delta: Record<string, unknown>, finishReason: string | null) =>
    `data: ${JSON.stringify({
      id: completionId,
      object: "chat.completion.chunk",
      created,
      model: modelId,
      choices: [{ index: 0, delta, finish_reason: finishReason }],
    })}`;

  const streamingExample = [
    chunk({ role: "assistant" }, null),
    "",
    chunk({ content: "Hello" }, null),
    "",
    chunk({ content: "!" }, null),
    "",
    chunk({}, "stop"),
    "",
    "data: [DONE]",
  ].join("\n");

  return (
    <div className="mt-8 space-y-8 border-t pt-8">
      <div>
        <h4 className={subheading}>Authentication</h4>
        <p className="text-sm text-muted-foreground">
          Requests are authenticated with a secret key sent as a bearer token:
        </p>
        <pre className={`${codeBlock} mt-2`}>
          Authorization: Bearer YOUR_SECRET_KEY
        </pre>
        <p className="mt-2 text-sm text-muted-foreground">
          Create and manage secret keys from{" "}
          <Link href="/settings" className="text-primary font-semibold">
            Settings
          </Link>
          .
        </p>
      </div>

      <div>
        <h4 className={subheading}>Request body</h4>
        <p className="text-sm text-muted-foreground mb-3">
          The body is compatible with OpenAI&apos;s Chat Completions API.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <code className={inlineCode}>model</code>
              </TableCell>
              <TableCell className="text-muted-foreground">string</TableCell>
              <TableCell className="text-muted-foreground">Yes</TableCell>
              <TableCell className="text-muted-foreground">
                This agent&apos;s ID (
                <code className={inlineCode}>{modelId}</code>
                ), used exactly like an OpenAI model name.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code className={inlineCode}>messages</code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                array&lt;{"{"} role, content {"}"}&gt;
              </TableCell>
              <TableCell className="text-muted-foreground">Yes</TableCell>
              <TableCell className="text-muted-foreground">
                Conversation history, in OpenAI Chat Completions message format.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code className={inlineCode}>stream</code>
              </TableCell>
              <TableCell className="text-muted-foreground">boolean</TableCell>
              <TableCell className="text-muted-foreground">
                No (default false)
              </TableCell>
              <TableCell className="text-muted-foreground">
                Set to true to receive a server-sent events stream instead of a
                single JSON response.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h4 className={subheading}>Response shape</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Non-streaming (<code className={inlineCode}>stream</code> omitted or
          false) returns a standard{" "}
          <code className={inlineCode}>chat.completion</code> object:
        </p>
        <pre className={codeBlock}>{nonStreamingExample}</pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Note: <code className={inlineCode}>usage.prompt_tokens</code> is
          currently always <code className={inlineCode}>0</code> — only{" "}
          <code className={inlineCode}>completion_tokens</code> and{" "}
          <code className={inlineCode}>total_tokens</code> are populated.
        </p>

        <p className="mt-4 mb-2 text-sm text-muted-foreground">
          Streaming (<code className={inlineCode}>stream: true</code>) returns{" "}
          <code className={inlineCode}>text/event-stream</code>, with one{" "}
          <code className={inlineCode}>chat.completion.chunk</code> per event
          and a final <code className={inlineCode}>[DONE]</code> marker:
        </p>
        <pre className={codeBlock}>{streamingExample}</pre>
      </div>

      <div>
        <h4 className={subheading}>Streaming with an OpenAI SDK</h4>
        <p className="text-sm text-muted-foreground">
          The stream is plain SSE in the same shape OpenAI uses, so any
          OpenAI-compatible SDK works unmodified — just point its{" "}
          <code className={inlineCode}>baseURL</code> at{" "}
          <code className={inlineCode}>{appUrl}/api/v1</code> and pass your
          secret key as the API key, e.g.{" "}
          <code className={inlineCode}>
            new OpenAI({"{"} baseURL, apiKey {"}"})
          </code>{" "}
          with <code className={inlineCode}>stream: true</code> in the request.
        </p>
      </div>

      <div>
        <h4 className={subheading}>Caching</h4>
        <p className="text-sm text-muted-foreground">
          If this agent&apos;s <strong>Cache TTL (seconds)</strong> field (set
          on the Edit page) is greater than 0, an identical request body seen
          again within that window returns the cached response instead of
          re-running the model
          {typeof cacheControlTtl === "number" && cacheControlTtl > 0 ? (
            <>
              {" "}
              — currently set to{" "}
              <code className={inlineCode}>{cacheControlTtl}s</code> for this
              agent
            </>
          ) : (
            " — currently disabled for this agent (TTL is 0)"
          )}
          . Cached streaming requests are still delivered as SSE chunks, but
          since the full response is already known they arrive as a single burst
          rather than token-by-token.
        </p>
      </div>

      <div>
        <h4 className={subheading}>Errors</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Errors use the OpenAI-compatible shape{" "}
          <code className={inlineCode}>
            {"{ error: { message, type, code } }"}
          </code>
          .
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>400</TableCell>
              <TableCell>
                <code className={inlineCode}>invalid_request_error</code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                The request body is missing{" "}
                <code className={inlineCode}>model</code> or{" "}
                <code className={inlineCode}>messages</code>.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>401</TableCell>
              <TableCell>
                <code className={inlineCode}>authentication_error</code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                The Authorization bearer token is missing or does not match a
                known secret key.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>402</TableCell>
              <TableCell>
                <code className={inlineCode}>insufficient_quota</code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                The organization has no credits left and no active subscription
                (or its spend limit has been exceeded).
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>404</TableCell>
              <TableCell>
                <code className={inlineCode}>invalid_request_error</code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                The <code className={inlineCode}>model</code> value doesn&apos;t
                match a published agent&apos;s ID for this key&apos;s
                organization.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>429</TableCell>
              <TableCell>
                <code className={inlineCode}>rate_limit_error</code>
              </TableCell>
              <TableCell className="text-muted-foreground">
                Too many requests for this secret key&apos;s configured rate
                limit (requests/sec).
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
