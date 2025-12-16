/**
 * @aibadgr/ai-task-router - A tiny, task-based LLM router
 *
 * @example
 * ```typescript
 * import { createRouter } from "@aibadgr/ai-task-router";
 * 
 * const router = createRouter({
 *   providers: {
 *     aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
 *   }
 * });
 * 
 * const result = await router.run({
 *   task: "chat",
 *   input: "Hello!"
 * });
 * 
 * console.log(result.outputText);
 * ```
 */

export { createRouter, Router } from "./router.js";
export * from "./types.js";
export { isChatResponse, isEmbeddingsResponse, validateTask, VALID_TASKS } from "./utils.js";
