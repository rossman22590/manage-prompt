"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Agent } from "@/generated/prisma-client/client";
import { SaveButton } from "../../form/button";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { ModelPicker } from "../model-picker";
import {
  type ModelSettings,
  WorkflowModelSettings,
} from "../workflow/workflow-model-settings";

interface Props {
  agent?: Agent;
  action: (data: FormData) => Promise<any>;
}

export function AgentForm({ agent, action }: Props) {
  const [model, setModel] = useState(agent?.model ?? "gpt-5.6-luna");
  const [modelSearch, setModelSearch] = useState("");
  const [showAdvancedModelParams, setShowAdvancedModelParams] = useState(false);
  const [modelSettings, setModelSettings] = useState(
    (agent?.modelSettings as ModelSettings) ?? {},
  );

  const updateModel = useCallback((val: string) => {
    setModel(val);
  }, []);

  return (
    <form
      className="space-y-12 sm:space-y-16"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const result = await action(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Agent saved successfully");
        }
      }}
    >
      {agent?.id && (
        <input
          type="number"
          name="id"
          className="hidden"
          defaultValue={Number(agent.id)}
        />
      )}

      <div className="space-y-8 border-b pb-12 sm:space-y-0 sm:divide-y sm:border-t sm:pb-0">
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="name" className="sm:pt-1.5">
            Name
          </Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Input
              id="name"
              name="name"
              defaultValue={agent?.name}
              required
              minLength={2}
              maxLength={150}
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="model" className="sm:pt-1.5">
            Model
          </Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Input
              type="text"
              placeholder="Search models..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="mb-2"
            />
            <ModelPicker
              value={model as any}
              onChange={updateModel}
              search={modelSearch}
            />

            <Button
              className="px-0 mt-2"
              variant="link"
              type="button"
              onClick={() => setShowAdvancedModelParams((prev) => !prev)}
            >
              {showAdvancedModelParams ? "Hide" : "Show"} Advanced Model Params
            </Button>

            {showAdvancedModelParams && (
              <WorkflowModelSettings
                defaultValue={modelSettings}
                onChange={setModelSettings}
                model={model as any}
              />
            )}

            <Input
              type="hidden"
              name="modelSettings"
              value={JSON.stringify(modelSettings)}
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="systemPrompt" className="sm:pt-1.5">
            System Prompt
          </Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Textarea
              id="systemPrompt"
              name="systemPrompt"
              rows={8}
              defaultValue={agent?.systemPrompt}
              placeholder="You are a helpful assistant that..."
              required
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="cacheControlTtl" className="sm:pt-1.5">
            Cache TTL (seconds)
          </Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Input
              id="cacheControlTtl"
              name="cacheControlTtl"
              type="number"
              min={0}
              max={86400}
              defaultValue={agent?.cacheControlTtl ?? 0}
            />
          </div>
        </div>
      </div>

      <SaveButton />
    </form>
  );
}
