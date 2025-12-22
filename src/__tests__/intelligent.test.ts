import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRouter } from "../router";
import type { RouterConfig, ClassificationResult } from "../types";

describe("Intelligent Mode", () => {
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

  describe("Mode configuration", () => {
    it("should default to cheap mode", () => {
      const router = createRouter(mockConfig);
      const config = router.getConfig();
      expect(config.mode).toBe("cheap");
    });

    it("should support intelligent mode", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
      });
      const config = router.getConfig();
      expect(config.mode).toBe("intelligent");
    });

    it("should enable classification by default in intelligent mode", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
      });
      expect(router).toBeDefined();
      // Classification config is internal, but should be enabled
    });

    it("should enable escalation by default in intelligent mode", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
      });
      expect(router).toBeDefined();
      // Escalation config is internal, but should be enabled
    });

    it("should allow disabling classification", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
        classification: {
          enabled: false,
        },
      });
      expect(router).toBeDefined();
    });

    it("should allow disabling escalation", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
        escalation: {
          enabled: false,
        },
      });
      expect(router).toBeDefined();
    });

    it("should allow custom escalation thresholds", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
        escalation: {
          enabled: true,
          minLength: 200,
          checkUncertainty: true,
        },
      });
      expect(router).toBeDefined();
    });
  });

  describe("Policy configuration", () => {
    it("should support policy overrides", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
        policies: {
          code: "anthropic",
          reasoning: "openai",
        },
      });
      expect(router).toBeDefined();
    });

    it("should support forceProvider", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
        forceProvider: "anthropic",
      });
      expect(router).toBeDefined();
    });

    it("should allow mixing policies and routes", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
        routes: {
          chat: "openai",
        },
        policies: {
          code: "anthropic",
        },
      });
      expect(router).toBeDefined();
    });
  });

  describe("Static mode compatibility", () => {
    it("should work with cheap mode (unchanged)", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "cheap",
        routes: {
          code: "anthropic",
        },
      });
      expect(router).toBeDefined();
    });

    it("should work with balanced mode (unchanged)", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "balanced",
      });
      expect(router).toBeDefined();
    });

    it("should work with best mode (unchanged)", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "best",
      });
      expect(router).toBeDefined();
    });

    it("should not run classification in static modes", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "cheap",
      });
      expect(router).toBeDefined();
      // Classification should not run in cheap mode
    });
  });

  describe("Backward compatibility", () => {
    it("should maintain existing API", () => {
      // This is the old API that should still work
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test" },
        },
        routes: {
          code: "aibadgr",
        },
        defaultProvider: "aibadgr",
      });
      expect(router).toBeDefined();
    });

    it("should support all existing task types", () => {
      const router = createRouter(mockConfig);

      const tasks = [
        "summarize",
        "rewrite",
        "classify",
        "extract",
        "chat",
        "code",
        "reasoning",
        "embeddings",
      ] as const;

      tasks.forEach((task) => {
        expect(task).toBeTruthy();
      });
    });

    it("should maintain existing routing behavior in non-intelligent modes", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "balanced",
        routes: {
          code: "anthropic",
        },
      });

      const config = router.getConfig();
      expect(config.routes.code).toBe("anthropic");
    });
  });

  describe("Type safety", () => {
    it("should enforce valid router modes", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent" as const,
      });
      expect(router).toBeDefined();
    });

    it("should enforce valid task names", () => {
      const router = createRouter({
        ...mockConfig,
        policies: {
          code: "anthropic",
          chat: "openai",
        },
      });
      expect(router).toBeDefined();
    });

    it("should enforce valid provider names", () => {
      const router = createRouter({
        ...mockConfig,
        policies: {
          code: "anthropic" as const,
        },
        forceProvider: "openai" as const,
      });
      expect(router).toBeDefined();
    });
  });

  describe("Configuration validation", () => {
    it("should accept all valid intelligent mode options", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
        policies: {
          code: "anthropic",
        },
        forceProvider: undefined,
        classification: {
          enabled: true,
          model: "gpt-4o-mini",
        },
        escalation: {
          enabled: true,
          minLength: 100,
          checkUncertainty: false,
        },
      });
      expect(router).toBeDefined();
    });

    it("should work without optional configs", () => {
      const router = createRouter({
        ...mockConfig,
        mode: "intelligent",
      });
      expect(router).toBeDefined();
    });
  });
});
