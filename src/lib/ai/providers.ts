import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export const models = {
  "anthropic:fast": anthropic("claude-haiku-4-5-20251001"),
  "anthropic:quality": anthropic("claude-sonnet-4-5-20250929"),
  "openai:fast": openai("gpt-4o-mini"),
  "openai:quality": openai("gpt-4o"),
} as const;

export type ModelKey = keyof typeof models;

export function getModel(key: ModelKey = "anthropic:fast") {
  return models[key];
}
