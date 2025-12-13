import { describe, it, expect } from "vitest";
import { estimateCost, DEFAULT_PRICES } from "../pricing";

describe("pricing", () => {
  describe("estimateCost", () => {
    it("should calculate cost for known models", () => {
      const result = estimateCost("openai", "gpt-3.5-turbo", 1000, 500);
      expect(result).toBeDefined();
      expect(result?.inputUsd).toBeCloseTo(0.0005, 4);
      expect(result?.outputUsd).toBeCloseTo(0.00075, 4);
      expect(result?.estimatedUsd).toBeCloseTo(0.00125, 4);
    });

    it("should use aibadgr default for unknown aibadgr models", () => {
      const result = estimateCost("aibadgr", "unknown-model", 1000, 500);
      expect(result).toBeDefined();
      expect(result?.estimatedUsd).toBeGreaterThan(0);
    });

    it("should return undefined for unknown non-aibadgr models", () => {
      const result = estimateCost("openai", "unknown-gpt-model", 1000, 500);
      expect(result).toBeUndefined();
    });

    it("should apply price overrides", () => {
      const overrides = {
        "custom-model": { inputPer1M: 10, outputPer1M: 20 },
      };
      const result = estimateCost("openai", "custom-model", 1000, 500, overrides);
      expect(result).toBeDefined();
      expect(result?.inputUsd).toBeCloseTo(0.01, 4);
      expect(result?.outputUsd).toBeCloseTo(0.01, 4);
    });

    it("should handle zero tokens", () => {
      const result = estimateCost("openai", "gpt-3.5-turbo", 0, 0);
      expect(result).toBeDefined();
      expect(result?.estimatedUsd).toBe(0);
    });

    it("should have prices for all major models", () => {
      expect(DEFAULT_PRICES["gpt-4"]).toBeDefined();
      expect(DEFAULT_PRICES["gpt-3.5-turbo"]).toBeDefined();
      expect(DEFAULT_PRICES["claude-3-5-sonnet-20241022"]).toBeDefined();
      expect(DEFAULT_PRICES["text-embedding-3-small"]).toBeDefined();
    });
  });
});
