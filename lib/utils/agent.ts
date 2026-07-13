import { z } from "zod";
import { type AIModel, AIModels } from "@/data/workflow";

const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

export const AgentSchema = z.object({
  model: z.enum(zodEnum<AIModel>(AIModels)),
  name: z.string().min(2).max(150),
  systemPrompt: z.string().min(1).max(9999),
  modelSettings: z.string().optional().nullable(),
  cacheControlTtl: z.number().int().optional().default(0),
});
