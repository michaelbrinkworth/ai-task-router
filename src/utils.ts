/**
 * Utility functions
 */

import { ChatMessage, ChatRunRequest } from "./types.js";

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
