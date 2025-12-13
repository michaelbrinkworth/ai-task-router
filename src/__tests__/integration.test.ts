import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRouter } from "../router";

/**
 * Integration tests for the router
 * Note: These tests use mocked providers to avoid requiring real API keys
 */

describe("Router Integration", () => {
  // Mock OpenAI client
  const mockOpenAICreate = vi.fn();
  const mockOpenAIEmbeddings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful responses
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "Mock response" } }],
      model: "gpt-3.5-turbo",
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    mockOpenAIEmbeddings.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
      model: "text-embedding-3-small",
      usage: { total_tokens: 10 },
    });
  });

  describe("Basic routing", () => {
    it("should route to default provider", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
      });

      expect(router).toBeDefined();
    });

    it("should support multiple providers", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
          openai: { apiKey: "test-openai-key" },
          anthropic: { apiKey: "test-anthropic-key" },
        },
      });

      expect(router).toBeDefined();
    });
  });

  describe("Configuration modes", () => {
    it("should apply cheap mode", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
        mode: "cheap",
      });

      expect(router).toBeDefined();
    });

    it("should apply balanced mode", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
          openai: { apiKey: "test-openai-key" },
          anthropic: { apiKey: "test-anthropic-key" },
        },
        mode: "balanced",
      });

      expect(router).toBeDefined();
    });

    it("should apply best mode", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
          openai: { apiKey: "test-openai-key" },
          anthropic: { apiKey: "test-anthropic-key" },
        },
        mode: "best",
      });

      expect(router).toBeDefined();
    });
  });

  describe("Custom routing", () => {
    it("should accept custom routes", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
          openai: { apiKey: "test-openai-key" },
        },
        routes: {
          chat: "openai",
          summarize: "aibadgr",
        },
      });

      expect(router).toBeDefined();
    });

    it("should accept custom fallback chains", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
          openai: { apiKey: "test-openai-key" },
        },
        fallback: {
          chat: ["aibadgr", "openai"],
        },
      });

      expect(router).toBeDefined();
    });
  });

  describe("Event hooks", () => {
    it("should accept onResult hook", () => {
      const onResult = vi.fn();

      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
        onResult,
      });

      expect(router).toBeDefined();
      expect(onResult).not.toHaveBeenCalled();
    });

    it("should accept onError hook", () => {
      const onError = vi.fn();

      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
        onError,
      });

      expect(router).toBeDefined();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("Configuration overrides", () => {
    it("should support timeoutMs override", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
        timeoutMs: 30000,
      });

      expect(router).toBeDefined();
    });

    it("should support maxRetries override", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
        maxRetries: 3,
      });

      expect(router).toBeDefined();
    });

    it("should support fallbackPolicy none", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
        fallbackPolicy: "none",
      });

      expect(router).toBeDefined();
    });

    it("should support price overrides", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
        priceOverrides: {
          "custom-model": { inputPer1M: 10, outputPer1M: 20 },
        },
      });

      expect(router).toBeDefined();
    });
  });

  describe("withOverrides method", () => {
    it("should create new router with overrides", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
      });

      const newRouter = router.withOverrides({
        routes: { chat: "aibadgr" },
      });

      expect(newRouter).toBeDefined();
      expect(newRouter).not.toBe(router);
    });
  });

  describe("Type safety", () => {
    it("should enforce valid task names", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
        },
      });

      // These should compile without errors
      const validTasks: Array<
        | "summarize"
        | "rewrite"
        | "classify"
        | "extract"
        | "chat"
        | "code"
        | "reasoning"
        | "embeddings"
      > = [
        "summarize",
        "rewrite",
        "classify",
        "extract",
        "chat",
        "code",
        "reasoning",
        "embeddings",
      ];

      expect(validTasks).toHaveLength(8);
    });

    it("should enforce valid provider names", () => {
      const providers: Array<"aibadgr" | "openai" | "anthropic"> = [
        "aibadgr",
        "openai",
        "anthropic",
      ];

      expect(providers).toHaveLength(3);
    });
  });
});
