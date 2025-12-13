import { describe, it, expect } from "vitest";
import { isRetryableError, shouldFallback, normalizeMessages, getErrorStatus } from "../utils";

describe("utils", () => {
  describe("isRetryableError", () => {
    it("should return true for 429 status", () => {
      expect(isRetryableError({}, 429)).toBe(true);
    });

    it("should return true for 5xx errors", () => {
      expect(isRetryableError({}, 500)).toBe(true);
      expect(isRetryableError({}, 502)).toBe(true);
      expect(isRetryableError({}, 503)).toBe(true);
    });

    it("should return true for timeout errors", () => {
      expect(isRetryableError({}, 408)).toBe(true);
      expect(isRetryableError({}, 504)).toBe(true);
    });

    it("should return true for network errors", () => {
      expect(isRetryableError({ code: "ECONNRESET" })).toBe(true);
      expect(isRetryableError({ code: "ETIMEDOUT" })).toBe(true);
      expect(isRetryableError({ code: "ENOTFOUND" })).toBe(true);
    });

    it("should return false for 4xx errors (except 429, 408)", () => {
      expect(isRetryableError({}, 400)).toBe(false);
      expect(isRetryableError({}, 401)).toBe(false);
      expect(isRetryableError({}, 403)).toBe(false);
      expect(isRetryableError({}, 404)).toBe(false);
    });
  });

  describe("shouldFallback", () => {
    it("should return true for retryable errors", () => {
      expect(shouldFallback({}, 429)).toBe(true);
      expect(shouldFallback({}, 500)).toBe(true);
    });

    it("should return false for 4xx errors (except 429, 408)", () => {
      expect(shouldFallback({}, 400)).toBe(false);
      expect(shouldFallback({}, 401)).toBe(false);
      expect(shouldFallback({}, 403)).toBe(false);
    });
  });

  describe("normalizeMessages", () => {
    it("should convert input to user message", () => {
      const result = normalizeMessages({ input: "Hello" });
      expect(result).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("should return messages as-is if provided", () => {
      const messages = [
        { role: "system" as const, content: "You are helpful" },
        { role: "user" as const, content: "Hello" },
      ];
      const result = normalizeMessages({ messages });
      expect(result).toEqual(messages);
    });

    it("should prioritize messages over input", () => {
      const messages = [{ role: "user" as const, content: "From messages" }];
      const result = normalizeMessages({ input: "From input", messages });
      expect(result).toEqual(messages);
    });

    it("should return empty array if no input or messages", () => {
      const result = normalizeMessages({});
      expect(result).toEqual([]);
    });
  });

  describe("getErrorStatus", () => {
    it("should extract status from error object", () => {
      expect(getErrorStatus({ status: 404 })).toBe(404);
      expect(getErrorStatus({ response: { status: 500 } })).toBe(500);
      expect(getErrorStatus({ statusCode: 429 })).toBe(429);
    });

    it("should return undefined if no status found", () => {
      expect(getErrorStatus({})).toBeUndefined();
      expect(getErrorStatus(null)).toBeUndefined();
    });
  });
});
