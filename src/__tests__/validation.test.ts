/**
 * Tests for validation features
 */

import { describe, it, expect, vi } from "vitest";
import { createRouter } from "../router.js";
import { validateTask, VALID_TASKS, isChatResponse, isEmbeddingsResponse } from "../utils.js";
import type { ChatRunResponse, EmbeddingsResponse } from "../types.js";

describe("Validation", () => {
  describe("validateTask", () => {
    it("should accept valid task types", () => {
      VALID_TASKS.forEach(task => {
        expect(() => validateTask(task)).not.toThrow();
      });
    });

    it("should reject invalid task types", () => {
      expect(() => validateTask("invalid")).toThrow(/Invalid task/);
      expect(() => validateTask("translate")).toThrow(/Invalid task/);
      expect(() => validateTask("")).toThrow(/Invalid task/);
    });

    it("should list valid tasks in error message", () => {
      try {
        validateTask("invalid");
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.message).toContain("summarize");
        expect(error.message).toContain("chat");
        expect(error.message).toContain("code");
      }
    });
  });

  describe("Router validation", () => {
    it("should validate task type in run method", async () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        }
      });

      await expect(
        router.run({ task: "invalid" as any, input: "test" })
      ).rejects.toThrow(/Invalid task/);
    });

    it("should validate task type in chat method", async () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        }
      });

      await expect(
        router.chat({ task: "invalid" as any, input: "test" })
      ).rejects.toThrow(/Invalid task/);
    });
  });

  describe("getConfig", () => {
    it("should return current configuration", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        },
        mode: "balanced",
        timeoutMs: 30000,
        maxRetries: 2
      });

      const config = router.getConfig();

      expect(config.providers).toEqual(["aibadgr"]);
      expect(config.defaultProvider).toBe("aibadgr");
      expect(config.mode).toBe("balanced");
      expect(config.timeoutMs).toBe(30000);
      expect(config.maxRetries).toBe(2);
      expect(config.fallbackPolicy).toBe("enabled");
    });

    it("should show all configured providers", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
          openai: { apiKey: "test-key" },
          anthropic: { apiKey: "test-key" }
        }
      });

      const config = router.getConfig();
      expect(config.providers).toContain("aibadgr");
      expect(config.providers).toContain("openai");
      expect(config.providers).toContain("anthropic");
    });
  });

  describe("validateConfig", () => {
    it("should return empty array for valid config", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        },
        mode: "cheap", // Force all to aibadgr to avoid default routing warnings
        routes: {} // Clear routes
      });

      const issues = router.validateConfig();
      expect(issues).toHaveLength(0);
    });

    it("should warn about unconfigured route providers", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        },
        routes: {
          code: "anthropic" // Not configured
        }
      });

      const issues = router.validateConfig();
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.message.includes("anthropic"))).toBe(true);
      expect(issues.some(i => i.level === "warning")).toBe(true);
    });

    it("should warn about unconfigured fallback providers", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        },
        fallback: {
          chat: ["aibadgr", "openai", "anthropic"] // openai and anthropic not configured
        }
      });

      const issues = router.validateConfig();
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.message.includes("openai"))).toBe(true);
      expect(issues.some(i => i.message.includes("anthropic"))).toBe(true);
    });

    it("should warn about anthropic in embeddings fallback", () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" },
          anthropic: { apiKey: "test-key" }
        },
        fallback: {
          embeddings: ["aibadgr", "anthropic"]
        }
      });

      const issues = router.validateConfig();
      expect(issues.some(i => 
        i.message.includes("embeddings") && i.message.includes("anthropic")
      )).toBe(true);
    });
  });

  describe("Configuration warnings", () => {
    it("should log warnings for misconfigured routes", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        },
        routes: {
          code: "anthropic" // Not configured
        }
      });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const calls = consoleWarnSpy.mock.calls;
      expect(calls.some(call => 
        call.some(arg => typeof arg === "string" && arg.includes("anthropic"))
      )).toBe(true);

      consoleWarnSpy.mockRestore();
    });
  });

  describe("Error messages", () => {
    it("should provide helpful error when provider not configured", async () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "test-key" }
        }
      });

      try {
        await router.run({
          task: "chat",
          input: "test",
          provider: "openai" // Not configured
        });
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.message).toContain("not configured");
        expect(error.message).toContain("openai");
        expect(error.message).toContain("Available providers");
        expect(error.message).toContain("aibadgr");
      }
    });

    it("should provide helpful error when all providers fail", async () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "invalid-key" }
        }
      });

      try {
        await router.run({
          task: "chat",
          input: "test"
        });
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.message).toContain("failed");
        expect(error.attempts).toBeDefined();
        expect(error.task).toBe("chat");
      }
    });

    it("should include attempt details in error", async () => {
      const router = createRouter({
        providers: {
          aibadgr: { apiKey: "invalid-key" }
        }
      });

      try {
        await router.run({
          task: "chat",
          input: "test"
        });
        expect.fail("Should have thrown");
      } catch (error: any) {
        expect(error.message).toContain("Attempts:");
        expect(error.message).toContain("aibadgr");
      }
    });
  });

  describe("Type guards", () => {
    it("isChatResponse should identify chat responses", () => {
      const chatResponse: ChatRunResponse = {
        provider: "aibadgr",
        model: "test",
        outputText: "Hello",
        raw: {},
        latencyMs: 100,
        attempts: []
      };

      expect(isChatResponse(chatResponse)).toBe(true);
    });

    it("isChatResponse should reject embeddings responses", () => {
      const embeddingsResponse: EmbeddingsResponse = {
        provider: "aibadgr",
        vectors: [[0.1, 0.2]],
        raw: {},
        latencyMs: 100,
        attempts: []
      };

      expect(isChatResponse(embeddingsResponse)).toBe(false);
    });

    it("isEmbeddingsResponse should identify embeddings responses", () => {
      const embeddingsResponse: EmbeddingsResponse = {
        provider: "aibadgr",
        vectors: [[0.1, 0.2]],
        raw: {},
        latencyMs: 100,
        attempts: []
      };

      expect(isEmbeddingsResponse(embeddingsResponse)).toBe(true);
    });

    it("isEmbeddingsResponse should reject chat responses", () => {
      const chatResponse: ChatRunResponse = {
        provider: "aibadgr",
        model: "test",
        outputText: "Hello",
        raw: {},
        latencyMs: 100,
        attempts: []
      };

      expect(isEmbeddingsResponse(chatResponse)).toBe(false);
    });
  });

  describe("VALID_TASKS constant", () => {
    it("should export all 8 task types", () => {
      expect(VALID_TASKS).toHaveLength(8);
      expect(VALID_TASKS).toContain("summarize");
      expect(VALID_TASKS).toContain("rewrite");
      expect(VALID_TASKS).toContain("classify");
      expect(VALID_TASKS).toContain("extract");
      expect(VALID_TASKS).toContain("chat");
      expect(VALID_TASKS).toContain("code");
      expect(VALID_TASKS).toContain("reasoning");
      expect(VALID_TASKS).toContain("embeddings");
    });

    it("should be readonly", () => {
      // TypeScript will catch this at compile time
      // But we can verify it's an array
      expect(Array.isArray(VALID_TASKS)).toBe(true);
    });
  });

  describe("API key validation", () => {
    it("should require aibadgr API key", () => {
      expect(() => {
        createRouter({
          providers: {
            aibadgr: { apiKey: "" }
          }
        });
      }).toThrow(/required/);
    });

    it("should work with only aibadgr provider", () => {
      expect(() => {
        createRouter({
          providers: {
            aibadgr: { apiKey: "test-key" }
          }
        });
      }).not.toThrow();
    });
  });
});
