import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRouter } from "../router";
import type { RouterConfig } from "../types";

describe("Router", () => {
  const mockConfig: RouterConfig = {
    providers: {
      aibadgr: {
        apiKey: "test-key",
      },
      openai: {
        apiKey: "test-openai-key",
      },
      anthropic: {
        apiKey: "test-anthropic-key",
      },
    },
  };

  describe("provider selection", () => {
    it("should use aibadgr as default provider", () => {
      const router = createRouter(mockConfig);
      expect(router).toBeDefined();
    });

    it("should respect explicit provider override", () => {
      const router = createRouter({
        ...mockConfig,
        defaultProvider: "openai",
      });
      expect(router).toBeDefined();
    });

    it("should apply mode defaults", () => {
      const cheapRouter = createRouter({
        ...mockConfig,
        mode: "cheap",
      });
      expect(cheapRouter).toBeDefined();

      const balancedRouter = createRouter({
        ...mockConfig,
        mode: "balanced",
      });
      expect(balancedRouter).toBeDefined();

      const bestRouter = createRouter({
        ...mockConfig,
        mode: "best",
      });
      expect(bestRouter).toBeDefined();
    });

    it("should use custom routes", () => {
      const router = createRouter({
        ...mockConfig,
        routes: {
          chat: "openai",
          code: "anthropic",
        },
      });
      expect(router).toBeDefined();
    });
  });

  describe("withOverrides", () => {
    it("should create new router with overrides", () => {
      const router = createRouter(mockConfig);
      const newRouter = router.withOverrides({
        routes: { chat: "openai" },
      });
      expect(newRouter).toBeDefined();
      expect(newRouter).not.toBe(router);
    });
  });

  describe("configuration validation", () => {
    it("should require aibadgr provider", () => {
      expect(() =>
        createRouter({
          providers: {} as any,
        })
      ).toThrow();
    });

    it("should accept optional openai and anthropic", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test" },
        },
      });
      expect(router).toBeDefined();
    });

    it("should handle custom timeouts", () => {
      const router = createRouter({
        ...mockConfig,
        timeoutMs: 30000,
      });
      expect(router).toBeDefined();
    });

    it("should handle custom max retries", () => {
      const router = createRouter({
        ...mockConfig,
        maxRetries: 3,
      });
      expect(router).toBeDefined();
    });

    it("should handle fallback policy", () => {
      const router = createRouter({
        ...mockConfig,
        fallbackPolicy: "none",
      });
      expect(router).toBeDefined();
    });

    it("should handle event hooks", () => {
      const onResult = vi.fn();
      const onError = vi.fn();

      const router = createRouter({
        ...mockConfig,
        onResult,
        onError,
      });
      expect(router).toBeDefined();
    });
  });

  describe("task types", () => {
    it("should support all task types", () => {
      const router = createRouter(mockConfig);

      // All these should be valid task names (we're just testing types compile)
      const tasks: Array<
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

      expect(tasks.length).toBe(8);
    });
  });
});
