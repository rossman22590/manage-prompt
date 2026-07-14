"use client";

import {
  AlertTriangle,
  Braces,
  BrainCircuit,
  ChevronRight,
  Eye,
  Globe,
  Layers,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
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
import { CompanyIcon } from "./company-icons";

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

/** The vision/context/web-search/structured-output/reasoning capability icons
 * for a model, each with a tooltip. Shared between the list rows and the
 * closed-trigger summary so both stay in sync. */
function CapabilityIcons({ model }: { model: AIModel }) {
  return (
    <>
      {isVisionCapable(model) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Eye className="h-4 w-4 shrink-0 text-pink-500 dark:text-pink-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Supports image input</p>
          </TooltipContent>
        </Tooltip>
      )}
      {hasLargeContextWindow(model) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Layers className="h-4 w-4 shrink-0 text-pink-500 dark:text-pink-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Supports 200k+ context window</p>
          </TooltipContent>
        </Tooltip>
      )}
      {hasWebSearch(model) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Globe className="h-4 w-4 shrink-0 text-pink-500 dark:text-pink-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Supports web search</p>
          </TooltipContent>
        </Tooltip>
      )}
      {hasStructuredOutput(model) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Braces className="h-4 w-4 shrink-0 text-pink-500 dark:text-pink-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Supports structured (JSON schema) output</p>
          </TooltipContent>
        </Tooltip>
      )}
      {hasReasoning(model) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <BrainCircuit className="h-4 w-4 shrink-0 text-pink-500 dark:text-pink-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Supports reasoning effort control</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

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

  // All company groups start collapsed except the one that owns the
  // currently-selected model, so opening the picker shows the active
  // model's group expanded and everything else tidied away. Re-derived
  // whenever the selected model's company changes (i.e. a new selection
  // is made), but otherwise left alone so manual expand/collapse toggles
  // persist while browsing.
  const [collapsedCompanies, setCollapsedCompanies] = useState<
    Set<ModelCompany>
  >(() => {
    const activeCompany = getModelCompany(value);
    return new Set(COMPANY_ORDER.filter((c) => c !== activeCompany));
  });

  useEffect(() => {
    const activeCompany = getModelCompany(value);
    setCollapsedCompanies(
      new Set(COMPANY_ORDER.filter((c) => c !== activeCompany)),
    );
    // Only re-derive when the selected model changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const toggleCompany = (company: ModelCompany) => (e: React.MouseEvent) => {
    // SelectLabel isn't normally interactive in Radix's Select, so make sure
    // this click only toggles the group and never bubbles into Radix's own
    // pointer handling (which could otherwise close the popover or be
    // mistaken for an item selection).
    e.preventDefault();
    e.stopPropagation();
    setCollapsedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) {
        next.delete(company);
      } else {
        next.add(company);
      }
      return next;
    });
  };

  const SelectedCompanyIcon = CompanyIcon[getModelCompany(value)];

  return (
    <Select
      name={name}
      value={value}
      onValueChange={(val) => onChange(val as AIModel)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a model">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SelectedCompanyIcon className="h-4 w-4 shrink-0 text-foreground/80" />
            <span className="truncate">{AIModelToLabel[value]}</span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
              <TooltipProvider>
                <CapabilityIcons model={value} />
              </TooltipProvider>
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto">
        <TooltipProvider>
          {groupedModels.groups.map(({ company, models }) => {
            const collapsed = collapsedCompanies.has(company);
            const Icon = CompanyIcon[company];
            return (
              <SelectGroup key={company}>
                <SelectLabel
                  onClick={toggleCompany(company)}
                  className="flex cursor-pointer select-none items-center gap-1.5 rounded-sm px-2 py-1.5 text-[13px] font-bold hover:bg-accent/50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                  <span className="flex-1">{company}</span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
                      !collapsed && "rotate-90",
                    )}
                  />
                </SelectLabel>
                {!collapsed &&
                  models.map((m) => (
                    <SelectItem key={m} value={m}>
                      <div className="flex items-center gap-2">
                        <span>{AIModelToLabel[m]}</span>
                        <CapabilityIcons model={m} />
                      </div>
                    </SelectItem>
                  ))}
              </SelectGroup>
            );
          })}
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
