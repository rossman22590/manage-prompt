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
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Input } from "../ui/input";
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

type CapabilityKey =
  | "vision"
  | "largeContextWindow"
  | "webSearch"
  | "structuredOutput"
  | "reasoning";

// One entry per capability toggle pill. `label` is reused verbatim as both
// the toggle's tooltip copy and the CapabilityIcons tooltip copy so the two
// stay in sync.
const CAPABILITY_FILTERS: Array<{
  key: CapabilityKey;
  label: string;
  icon: typeof Eye;
  check: (model: AIModel) => boolean;
}> = [
  {
    key: "vision",
    label: "Supports image input",
    icon: Eye,
    check: isVisionCapable,
  },
  {
    key: "largeContextWindow",
    label: "Supports 200k+ context window",
    icon: Layers,
    check: hasLargeContextWindow,
  },
  {
    key: "webSearch",
    label: "Supports web search",
    icon: Globe,
    check: hasWebSearch,
  },
  {
    key: "structuredOutput",
    label: "Supports structured (JSON schema) output",
    icon: Braces,
    check: hasStructuredOutput,
  },
  {
    key: "reasoning",
    label: "Supports reasoning effort control",
    icon: BrainCircuit,
    check: hasReasoning,
  },
];

type Props = {
  value: AIModel;
  onChange: (model: AIModel) => void;
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

/** Muted-text + warning-icon + tooltip treatment for a deprecated model row.
 * Shared so every company group renders its deprecated models identically. */
function DeprecatedModelRow({ model }: { model: AIModel }) {
  const info = getDeprecationInfo(model);
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{AIModelToLabel[model]}</span>
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
  );
}

export function ModelPicker({ value, onChange, name = "model" }: Props) {
  const [search, setSearch] = useState("");
  const [activeCapabilities, setActiveCapabilities] = useState<
    Set<CapabilityKey>
  >(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search text and/or capability toggles narrowing the list should always
  // reveal the matches they find, even in a company group the user hasn't
  // manually expanded -- otherwise a match could sit inside a collapsed
  // group with nothing rendered under its header. Manual collapse/expand
  // only governs the picker when nothing is actively filtering it.
  const isFiltering = search.trim().length > 0 || activeCapabilities.size > 0;

  const groupedModels = useMemo(() => {
    const query = search.trim().toLowerCase();
    const activeFilters = CAPABILITY_FILTERS.filter((f) =>
      activeCapabilities.has(f.key),
    );
    const filtered = AIModels.filter((m) => {
      if (query && !AIModelToLabel[m].toLowerCase().includes(query)) {
        return false;
      }
      return activeFilters.every((f) => f.check(m));
    });

    // Each company keeps its active models AND its deprecated models in one
    // group (deprecated ones rendered after, with the muted/warning
    // treatment) instead of siphoning deprecated models off into a separate
    // flat section. A company only drops out entirely if it has neither
    // active nor deprecated matches left after filtering.
    return COMPANY_ORDER.map((company) => {
      const companyModels = filtered.filter(
        (m) => getModelCompany(m) === company,
      );
      return {
        company,
        active: companyModels.filter((m) => !isDeprecated(m)),
        deprecated: companyModels.filter((m) => isDeprecated(m)),
      };
    }).filter((g) => g.active.length > 0 || g.deprecated.length > 0);
  }, [search, activeCapabilities]);

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

  const toggleCapability = (key: CapabilityKey) => (e: React.MouseEvent) => {
    // Same defensive reasoning as toggleCompany above: this button lives
    // inside SelectContent but isn't a SelectItem, so keep its clicks from
    // being reinterpreted by Radix as a selection or dismiss.
    e.preventDefault();
    e.stopPropagation();
    setActiveCapabilities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Radix Select's content div has its own onKeyDown (letter-key typeahead,
  // arrow-key navigation, Tab suppression) that would otherwise fight with
  // normal typing into this input. That handler is attached via React's
  // regular bubbling event system, so stopping propagation here keeps every
  // keystroke local to the input.
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  // Escape-to-close is wired up differently: Radix's DismissableLayer
  // listens for Escape on `document` in the CAPTURE phase, which fires
  // before the event ever reaches this input, so stopPropagation() in
  // handleSearchKeyDown above cannot stop it (verified empirically -- the
  // popover still closed even with stopPropagation in place). The
  // `onEscapeKeyDown` prop on SelectContent is the actual supported
  // interception point: Radix calls it before deciding whether to dismiss,
  // and honors `event.preventDefault()` to cancel the dismiss. While the
  // search box is focused and has text, treat Escape as "clear the query"
  // instead of "close the popover"; an empty box still closes as normal.
  const handleContentEscapeKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement === searchInputRef.current && search) {
      e.preventDefault();
      setSearch("");
    }
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
      <SelectContent
        className="max-h-[28rem] overflow-y-auto"
        onEscapeKeyDown={handleContentEscapeKeyDown}
      >
        <TooltipProvider>
          <div className="sticky -top-1 z-10 -mx-1 -mt-1 mb-1 space-y-2 border-b bg-popover px-2 pb-2 pt-2">
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search models..."
              className="h-8 text-sm"
            />
            <div className="flex flex-wrap items-center gap-1">
              {CAPABILITY_FILTERS.map(({ key, label, icon: Icon }) => {
                const active = activeCapabilities.has(key);
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-label={label}
                        onClick={toggleCapability(key)}
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                          active
                            ? "border-transparent bg-pink-500 text-white dark:bg-pink-400 dark:text-black"
                            : "border-input bg-transparent text-muted-foreground hover:bg-accent/50",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
          {groupedModels.map(({ company, active, deprecated }) => {
            const collapsed = !isFiltering && collapsedCompanies.has(company);
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
                {!collapsed && (
                  <>
                    {active.map((m) => (
                      <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                          <span>{AIModelToLabel[m]}</span>
                          <CapabilityIcons model={m} />
                        </div>
                      </SelectItem>
                    ))}
                    {deprecated.map((m) => (
                      <SelectItem key={m} value={m}>
                        <DeprecatedModelRow model={m} />
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectGroup>
            );
          })}
        </TooltipProvider>
      </SelectContent>
    </Select>
  );
}
