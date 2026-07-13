"use client";

import {
  AlertTriangle,
  Braces,
  BrainCircuit,
  Eye,
  Globe,
  Layers,
} from "lucide-react";
import { useMemo } from "react";
import {
  type AIModel,
  AIModels,
  AIModelToLabel,
  getDeprecationInfo,
  getModelCompany,
  hasLargeContextWindow,
  hasReasoning,
  hasStructuredOutput,
  hasWebSearch,
  isDeprecated,
  isVisionCapable,
  type ModelCompany,
} from "@/data/workflow";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const COMPANY_ORDER: ModelCompany[] = [
  "OpenAI",
  "Anthropic",
  "Google",
  "xAI",
  "Perplexity",
  "Meta",
  "Mistral",
  "DeepSeek",
  "Qwen",
  "Cohere",
];

type Props = {
  value: AIModel;
  onChange: (model: AIModel) => void;
  search?: string;
  name?: string;
};

export function ModelPicker({
  value,
  onChange,
  search = "",
  name = "model",
}: Props) {
  const filteredModels = useMemo(() => {
    return AIModels.filter((m) =>
      AIModelToLabel[m].toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const groupedModels = useMemo(() => {
    const active = filteredModels.filter((m) => !isDeprecated(m));
    const deprecated = filteredModels.filter((m) => isDeprecated(m));
    const groups = COMPANY_ORDER.map((company) => ({
      company,
      models: active.filter((m) => getModelCompany(m) === company),
    })).filter((g) => g.models.length > 0);
    return { groups, deprecated };
  }, [filteredModels]);

  return (
    <Select
      name={name}
      value={value}
      onValueChange={(val) => onChange(val as AIModel)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto">
        <TooltipProvider>
          {groupedModels.groups.map(({ company, models }) => (
            <SelectGroup key={company}>
              <SelectLabel>{company}</SelectLabel>
              {models.map((m) => (
                <SelectItem key={m} value={m}>
                  <div className="flex items-center gap-2">
                    <span>{AIModelToLabel[m]}</span>
                    {isVisionCapable(m) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Eye className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supports image input</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {hasLargeContextWindow(m) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Layers className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supports 200k+ context window</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {hasWebSearch(m) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Globe className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supports web search</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {hasStructuredOutput(m) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Braces className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supports structured (JSON schema) output</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {hasReasoning(m) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <BrainCircuit className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supports reasoning effort control</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {groupedModels.deprecated.length > 0 && (
            <SelectGroup>
              <SelectLabel>Deprecated</SelectLabel>
              {groupedModels.deprecated.map((m) => {
                const info = getDeprecationInfo(m);
                return (
                  <SelectItem key={m} value={m}>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {AIModelToLabel[m]}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {info?.note}
                            {info?.replacement &&
                              ` Suggested: ${AIModelToLabel[info.replacement]}.`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          )}
        </TooltipProvider>
      </SelectContent>
    </Select>
  );
}
