/**
 * Price tables for cost estimation
 */

import { PriceEntry, ProviderName } from "./types.js";

// Default price table (per 1M tokens in USD)
export const DEFAULT_PRICES: Record<string, PriceEntry> = {
  // AI Badgr (default tier)
  "aibadgr-default": { inputPer1M: 0.5, outputPer1M: 1.5 },

  // OpenAI models
  "gpt-3.5-turbo": { inputPer1M: 0.5, outputPer1M: 1.5 },
  "gpt-3.5-turbo-1106": { inputPer1M: 1.0, outputPer1M: 2.0 },
  "gpt-4": { inputPer1M: 30.0, outputPer1M: 60.0 },
  "gpt-4-turbo": { inputPer1M: 10.0, outputPer1M: 30.0 },
  "gpt-4-turbo-preview": { inputPer1M: 10.0, outputPer1M: 30.0 },
  "gpt-4o": { inputPer1M: 5.0, outputPer1M: 15.0 },
  "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6 },
  "text-embedding-3-small": { inputPer1M: 0.02, outputPer1M: 0.0 },
  "text-embedding-3-large": { inputPer1M: 0.13, outputPer1M: 0.0 },
  "text-embedding-ada-002": { inputPer1M: 0.1, outputPer1M: 0.0 },

  // Anthropic models
  "claude-3-opus-20240229": { inputPer1M: 15.0, outputPer1M: 75.0 },
  "claude-3-sonnet-20240229": { inputPer1M: 3.0, outputPer1M: 15.0 },
  "claude-3-haiku-20240307": { inputPer1M: 0.25, outputPer1M: 1.25 },
  "claude-3-5-sonnet-20241022": { inputPer1M: 3.0, outputPer1M: 15.0 },
  "claude-3-5-haiku-20241022": { inputPer1M: 1.0, outputPer1M: 5.0 },
};

export function estimateCost(
  provider: ProviderName,
  model: string,
  inputTokens: number,
  outputTokens: number,
  priceOverrides?: Record<string, PriceEntry>
): { estimatedUsd: number; inputUsd: number; outputUsd: number } | undefined {
  // Merge overrides with defaults
  const prices = { ...DEFAULT_PRICES, ...priceOverrides };

  // Try exact model match
  let priceEntry = prices[model];

  // Fallback to provider default
  if (!priceEntry && provider === "aibadgr") {
    priceEntry = prices["aibadgr-default"];
  }

  if (!priceEntry) {
    return undefined; // Unknown model
  }

  const inputUsd = (inputTokens / 1_000_000) * priceEntry.inputPer1M;
  const outputUsd = (outputTokens / 1_000_000) * priceEntry.outputPer1M;
  const estimatedUsd = inputUsd + outputUsd;

  return { estimatedUsd, inputUsd, outputUsd };
}
