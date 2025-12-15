/**
 * Utility functions
 */

import { ChatMessage, ChatRunRequest, ChatRunResponse, EmbeddingsResponse, TaskName } from "./types.js";

/**
 * Valid task types for runtime validation
 */
export const VALID_TASKS: readonly TaskName[] = [
  "summarize",
  "rewrite",
  "classify",
  "extract",
  "chat",
  "code",
  "reasoning",
  "embeddings"
] as const;

/**
 * Validate task type at runtime
 * @throws Error if task is invalid
 */
export function validateTask(task: string): asserts task is TaskName {
  if (!VALID_TASKS.includes(task as TaskName)) {
    throw new Error(
      `Invalid task '${task}'. Valid tasks are: ${VALID_TASKS.join(", ")}`
    );
  }
}

/**
 * Check if an error is retryable (network errors, timeouts, rate limits)
 */
export function isRetryableError(error: any, status?: number): boolean {
  if (status === 429 || status === 408 || status === 504) {
    return true;
  }
  if (status && status >= 500) {
    return true;
  }
  // Network errors
  if (error?.code === "ECONNRESET" || error?.code === "ETIMEDOUT" || error?.code === "ENOTFOUND") {
    return true;
  }
  return false;
}

/**
 * Check if an error should trigger fallback
 */
export function shouldFallback(error: any, status?: number): boolean {
  // Don't fallback on 4xx errors (except 429)
  if (status && status >= 400 && status < 500 && status !== 429 && status !== 408) {
    return false;
  }
  return isRetryableError(error, status);
}

/**
 * Convert input/messages to standard messages format
 */
export function normalizeMessages(request: ChatRunRequest): ChatMessage[] {
  if (request.messages && request.messages.length > 0) {
    return request.messages;
  }
  if (request.input) {
    return [{ role: "user", content: request.input }];
  }
  return [];
}

/**
 * Extract status code from error
 */
export function getErrorStatus(error: any): number | undefined {
  return error?.status || error?.response?.status || error?.statusCode;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type guard for chat responses
 * 
 * @example
 * ```typescript
 * if (isChatResponse(response)) {
 *   console.log(response.outputText); // TypeScript knows this exists
 * }
 * ```
 */
export function isChatResponse(response: ChatRunResponse | EmbeddingsResponse): response is ChatRunResponse {
  return "outputText" in response;
}

/**
 * Type guard for embeddings responses
 * 
 * @example
 * ```typescript
 * if (isEmbeddingsResponse(response)) {
 *   console.log(response.vectors); // TypeScript knows this exists
 * }
 * ```
 */
export function isEmbeddingsResponse(response: ChatRunResponse | EmbeddingsResponse): response is EmbeddingsResponse {
  return "vectors" in response;
}
