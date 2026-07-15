"use client";

import { useCallback, useEffect, useState } from "react";
import type { AIModel } from "@/data/workflow";
import {
  getMaxOutputTokens,
  getMinOutputTokens,
  hasReasoning,
  hasStructuredOutput,
  hasWebSearch,
} from "@/data/workflow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";

export type ModelSettings = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  enableWebSearch?: boolean;
  structuredOutputSchema?: string;
  reasoningEffort?: "none" | "low" | "medium" | "high";
};

type Props = {
  defaultValue: ModelSettings;
  onChange: (settings: ModelSettings) => void;
  model?: AIModel;
};

// Fallback range used before a model has been selected upstream, matching
// the previous hardcoded ceiling.
const FALLBACK_MIN_MAX_TOKENS = 1;
const FALLBACK_MAX_MAX_TOKENS = 8192;

export function WorkflowModelSettings({
  defaultValue,
  onChange,
  model,
}: Props) {
  const [temperature, setTemperature] = useState(
    defaultValue?.temperature ?? 1,
  );
  const [maxTokens, setMaxTokens] = useState(defaultValue?.maxTokens ?? 1024);
  const minMaxTokens = model
    ? getMinOutputTokens(model)
    : FALLBACK_MIN_MAX_TOKENS;
  const maxMaxTokens = model
    ? getMaxOutputTokens(model)
    : FALLBACK_MAX_MAX_TOKENS;
  const [topP, setTopP] = useState(defaultValue?.topP ?? 1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(
    defaultValue?.frequencyPenalty ?? 0,
  );
  const [presencePenalty, setPresencePenalty] = useState(
    defaultValue?.presencePenalty ?? 0,
  );
  const [enableWebSearch, setEnableWebSearch] = useState(
    defaultValue?.enableWebSearch ?? true, // Default to true for web search capable models
  );
  const [structuredOutputEnabled, setStructuredOutputEnabled] = useState(
    Boolean(defaultValue?.structuredOutputSchema),
  );
  const [structuredOutputSchema, setStructuredOutputSchema] = useState(
    defaultValue?.structuredOutputSchema ?? "",
  );
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<
    ModelSettings["reasoningEffort"]
  >(defaultValue?.reasoningEffort ?? "none");

  const triggerChange = useCallback(
    (val: any) => {
      onChange({
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        enableWebSearch,
        structuredOutputSchema: structuredOutputEnabled
          ? structuredOutputSchema
          : undefined,
        reasoningEffort,
        ...val,
      });
    },
    [
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      enableWebSearch,
      structuredOutputEnabled,
      structuredOutputSchema,
      reasoningEffort,
      onChange,
    ],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-clamp when the selected model (and its derived max) changes, not on every maxTokens edit or triggerChange identity change.
  useEffect(() => {
    if (maxTokens > maxMaxTokens) {
      setMaxTokens(maxMaxTokens);
      triggerChange({ maxTokens: maxMaxTokens });
    }
  }, [model, maxMaxTokens]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Temperature ({temperature})</Label>
            <Slider
              defaultValue={[temperature]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(val: number[]) => {
                setTemperature(val[0]);
                triggerChange({ temperature: val[0] });
              }}
            />
            <CardDescription>
              Temperature controls the randomness of the model. Lower values
              make the model more deterministic.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Max Tokens ({maxTokens})</Label>
            <Slider
              value={[maxTokens]}
              min={minMaxTokens}
              max={maxMaxTokens}
              step={1}
              onValueChange={(val: number[]) => {
                setMaxTokens(val[0]);
                triggerChange({ maxTokens: val[0] });
              }}
            />
            <CardDescription>
              Max Tokens controls the maximum number of tokens that the model
              will generate.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Top P ({topP})</Label>
            <Slider
              defaultValue={[topP]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(val: number[]) => {
                setTopP(val[0]);
                triggerChange({ topP: val[0] });
              }}
            />
            <CardDescription>
              An alternative to sampling with temperature, called nucleus
              sampling, where the model considers the results of the tokens with
              top_p probability mass. So 0.1 means only the tokens comprising
              the top 10% probability mass are considered.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Frequency Penalty</Label>
            <Slider
              defaultValue={[frequencyPenalty]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(val: number[]) => {
                setFrequencyPenalty(val[0]);
                triggerChange({ frequencyPenalty: val[0] });
              }}
            />
            <CardDescription>
              Frequency Penalty controls the repetition of the model. Lower
              values make the model repeat less.
            </CardDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Presence Penalty</Label>
            <Slider
              defaultValue={[presencePenalty]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(val: number[]) => {
                setPresencePenalty(val[0]);
                triggerChange({ presencePenalty: val[0] });
              }}
            />
            <CardDescription>
              Presence Penalty controls the repetition of the model. Lower
              values make the model repeat less.
            </CardDescription>
          </div>

          {model && hasWebSearch(model) && (
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="web-search">Enable Web Search</Label>
                <CardDescription>
                  Enable real-time web search for this model. This will append
                  :online to the model ID.
                </CardDescription>
              </div>
              <Switch
                id="web-search"
                checked={enableWebSearch}
                onCheckedChange={(checked) => {
                  setEnableWebSearch(checked);
                  triggerChange({ enableWebSearch: checked });
                }}
              />
            </div>
          )}

          {model && hasStructuredOutput(model) && (
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="structured-output">
                    Enable Structured Output
                  </Label>
                  <CardDescription>
                    Force the model to return JSON matching a schema you
                    provide.
                  </CardDescription>
                </div>
                <Switch
                  id="structured-output"
                  checked={structuredOutputEnabled}
                  onCheckedChange={(checked) => {
                    setStructuredOutputEnabled(checked);
                    if (!checked) {
                      setSchemaError(null);
                      triggerChange({ structuredOutputSchema: undefined });
                    }
                  }}
                />
              </div>
              {structuredOutputEnabled && (
                <>
                  <textarea
                    id="structured-output-schema"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm"
                    placeholder='{"type": "object", "properties": {"answer": {"type": "string"}}, "required": ["answer"]}'
                    value={structuredOutputSchema}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStructuredOutputSchema(value);
                      try {
                        JSON.parse(value);
                        setSchemaError(null);
                        triggerChange({ structuredOutputSchema: value });
                      } catch {
                        setSchemaError("Invalid JSON — schema was not saved.");
                      }
                    }}
                  />
                  {schemaError && (
                    <p className="text-sm text-red-500">{schemaError}</p>
                  )}
                </>
              )}
            </div>
          )}

          {model && hasReasoning(model) && (
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="reasoning-effort">Reasoning Effort</Label>
              <Select
                value={reasoningEffort}
                onValueChange={(value: string) => {
                  const typedValue = value as ModelSettings["reasoningEffort"];
                  setReasoningEffort(typedValue);
                  triggerChange({ reasoningEffort: typedValue });
                }}
              >
                <SelectTrigger id="reasoning-effort" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <CardDescription>
                Higher effort spends more time reasoning before answering, at
                higher cost and latency.
              </CardDescription>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
