/**
 * Core types for @aibadgr/router
 */

/**
 * Supported LLM providers
 * @example "aibadgr" | "openai" | "anthropic"
 */
export type ProviderName = "aibadgr" | "openai" | "anthropic";

/**
 * Task types for intelligent routing
 * 
 * - `summarize`: Text summarization
 * - `rewrite`: Rewriting/paraphrasing
 * - `classify`: Classification tasks
 * - `extract`: Information extraction
 * - `chat`: General conversation
 * - `code`: Code generation/analysis
 * - `reasoning`: Complex reasoning
 * - `embeddings`: Vector embeddings
 * 
 * @example
 * ```typescript
 * await router.run({ task: "summarize", input: "..." });
 * await router.run({ task: "code", input: "Write a function..." });
 * ```
 */
export type TaskName =
  | "summarize"
  | "rewrite"
  | "classify"
  | "extract"
  | "chat"
  | "code"
  | "reasoning"
  | "embeddings";

/**
 * Routing strategy modes
 * 
 * - `cheap`: All tasks route to aibadgr (maximum cost savings)
 * - `balanced`: Code→anthropic, reasoning→openai, rest→aibadgr
 * - `best`: Premium providers for most tasks
 * 
 * @example
 * ```typescript
 * const router = createRouter({
 *   providers: { ... },
 *   mode: "balanced" // Use premium providers selectively
 * });
 * ```
 */
export type RouterMode = "cheap" | "balanced" | "best";

/**
 * Fallback behavior policy
 * 
 * - `enabled`: Automatically fallback on retriable errors (429, 5xx, network errors)
 * - `none`: Never fallback, fail immediately
 * 
 * @example
 * ```typescript
 * const router = createRouter({
 *   providers: { ... },
 *   fallbackPolicy: "enabled" // Default
 * });
 * ```
 */
export type FallbackPolicy = "enabled" | "none";

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** API key for the provider */
  apiKey: string;
  /** Optional custom base URL (for self-hosted or proxy setups) */
  baseUrl?: string;
}

/**
 * Router configuration
 * 
 * @example
 * ```typescript
 * const router = createRouter({
 *   providers: {
 *     aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
 *     openai: { apiKey: process.env.OPENAI_API_KEY }
 *   },
 *   routes: {
 *     code: "openai" // Route code tasks to OpenAI
 *   },
 *   fallback: {
 *     chat: ["aibadgr", "openai"] // Try aibadgr first, fallback to OpenAI
 *   },
 *   timeoutMs: 60000,
 *   onResult: (event) => console.log(`Success: ${event.task}`)
 * });
 * ```
 */
export interface RouterConfig {
  /**
   * Provider credentials (required: aibadgr, optional: openai, anthropic)
   * 
   * @example
   * ```typescript
   * providers: {
   *   aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
   *   openai: { apiKey: process.env.OPENAI_API_KEY },
   *   anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
   * }
   * ```
   */
  providers: {
    aibadgr: ProviderConfig;
    openai?: ProviderConfig;
    anthropic?: Omit<ProviderConfig, "baseUrl">;
  };

  /**
   * Default provider when no route matches
   * @default "aibadgr"
   */
  defaultProvider?: ProviderName;
  
  /**
   * Task-specific routing table
   * 
   * @example
   * ```typescript
   * routes: {
   *   code: "anthropic",
   *   reasoning: "openai",
   *   // Other tasks use defaultProvider
   * }
   * ```
   */
  routes?: Partial<Record<TaskName, ProviderName>>;
  
  /**
   * Fallback chains per task (on rate limits, timeouts, 5xx errors)
   * 
   * @example
   * ```typescript
   * fallback: {
   *   chat: ["aibadgr", "openai", "anthropic"],
   *   code: ["anthropic", "aibadgr"]
   * }
   * ```
   */
  fallback?: Partial<Record<TaskName, ProviderName[]>>;
  
  /**
   * Quick preset for routing strategy
   * - cheap: All to aibadgr
   * - balanced: Premium for code/reasoning, aibadgr for rest
   * - best: Premium providers where available
   */
  mode?: RouterMode;

  /**
   * Request timeout in milliseconds
   * @default 60000 (60 seconds)
   */
  timeoutMs?: number;
  
  /**
   * Max retry attempts per provider
   * @default 1
   */
  maxRetries?: number;

  /**
   * Hook called on successful requests
   * 
   * @example
   * ```typescript
   * onResult: (event) => {
   *   console.log(`Task ${event.task} cost $${event.cost?.estimatedUsd}`);
   * }
   * ```
   */
  onResult?: (event: ResultEvent) => void;
  
  /**
   * Hook called when all providers fail
   * 
   * @example
   * ```typescript
   * onError: (event) => {
   *   console.error(`Failed after ${event.attempts.length} attempts`);
   * }
   * ```
   */
  onError?: (event: ErrorEvent) => void;

  /**
   * Fallback behavior policy
   * @default "enabled"
   */
  fallbackPolicy?: FallbackPolicy;

  /**
   * Override built-in pricing (per 1M tokens in USD)
   * 
   * @example
   * ```typescript
   * priceOverrides: {
   *   "gpt-4o": { inputPer1M: 5.0, outputPer1M: 15.0 }
   * }
   * ```
   */
  priceOverrides?: Record<string, { inputPer1M: number; outputPer1M: number }>;
}

/**
 * Chat message format
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Chat/completion request
 * 
 * @example
 * ```typescript
 * // Simple text input
 * await router.run({
 *   task: "chat",
 *   input: "Hello, world!"
 * });
 * 
 * // Custom messages
 * await router.run({
 *   task: "chat",
 *   messages: [
 *     { role: "system", content: "You are a helpful assistant" },
 *     { role: "user", content: "What is AI?" }
 *   ]
 * });
 * 
 * // With options
 * await router.run({
 *   task: "code",
 *   input: "Write a binary search",
 *   maxTokens: 1000,
 *   temperature: 0.7,
 *   json: true
 * });
 * ```
 */
export interface ChatRunRequest {
  /** Task type for routing (default: "chat") */
  task?: Exclude<TaskName, "embeddings">;
  
  /** Simple text input (converted to user message) */
  input?: string;
  
  /** Full conversation history (alternative to input) */
  messages?: ChatMessage[];

  /** Model name (provider-specific, e.g., "gpt-4o", "claude-3-5-sonnet") */
  model?: string;
  
  /** Maximum completion tokens */
  maxTokens?: number;
  
  /** Sampling temperature (0.0 to 2.0) */
  temperature?: number;

  /** Force JSON output format */
  json?: boolean;
  
  /** JSON schema (not enforced in MVP) */
  schema?: object;

  /** Enable streaming responses */
  stream?: boolean;
  
  /** Override routing and use specific provider */
  provider?: ProviderName;
}

/**
 * Embeddings request
 * 
 * @example
 * ```typescript
 * // Single text
 * await router.embed({
 *   task: "embeddings",
 *   input: "Hello world"
 * });
 * 
 * // Multiple texts (batched)
 * await router.embed({
 *   task: "embeddings",
 *   input: ["Text 1", "Text 2", "Text 3"]
 * });
 * ```
 */
export interface EmbeddingsRunRequest {
  /** Must be "embeddings" */
  task: "embeddings";
  
  /** Text(s) to embed */
  input: string | string[];
  
  /** Model name (default: "ai-badgr-embedding" for aibadgr) */
  model?: string;
  
  /** Override routing (anthropic doesn't support embeddings) */
  provider?: ProviderName;
}

/**
 * Union of all request types
 */
export type RunRequest = ChatRunRequest | EmbeddingsRunRequest;

/**
 * Token usage information
 */
export interface UsageInfo {
  /** Number of tokens in the input/prompt */
  inputTokens?: number;
  /** Number of tokens in the output/completion */
  outputTokens?: number;
  /** Total tokens (input + output) */
  totalTokens?: number;
}

/**
 * Cost estimation in USD
 */
export interface CostInfo {
  /** Total estimated cost */
  estimatedUsd?: number;
  /** Input cost */
  inputUsd?: number;
  /** Output cost */
  outputUsd?: number;
}

/**
 * Single provider attempt (success or failure)
 */
export interface Attempt {
  /** Provider that was attempted */
  provider: ProviderName;
  /** Whether the attempt succeeded */
  ok: boolean;
  /** HTTP status code (if failed) */
  status?: number;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Chat/completion response
 * 
 * @example
 * ```typescript
 * const result = await router.run({
 *   task: "chat",
 *   input: "Hello"
 * });
 * 
 * console.log(result.outputText);        // "Hi there! How can I help?"
 * console.log(result.provider);          // "aibadgr"
 * console.log(result.cost?.estimatedUsd); // 0.0001
 * console.log(result.latencyMs);         // 523
 * console.log(result.attempts);          // [{ provider: "aibadgr", ok: true }]
 * ```
 */
export interface ChatRunResponse {
  /** Provider that successfully handled the request */
  provider: ProviderName;
  /** Model that was used */
  model: string;
  /** Generated text output */
  outputText: string;
  /** Raw provider response (provider-specific format) */
  raw: any;
  /** Token usage statistics */
  usage?: UsageInfo;
  /** Cost estimation */
  cost?: CostInfo;
  /** Total request latency in milliseconds */
  latencyMs: number;
  /** History of all provider attempts (for debugging fallback) */
  attempts: Attempt[];
}

/**
 * Streaming response chunk
 */
export interface ChatStreamChunk {
  /** Incremental text delta */
  deltaText?: string;
  /** Raw provider chunk data */
  raw?: any;
}

/**
 * Async iterable stream of text chunks
 * 
 * Note: Requires ES2018+ lib in your tsconfig.json
 * 
 * @example
 * ```typescript
 * const stream = await router.chat({
 *   stream: true,
 *   input: "Tell me a story"
 * });
 * 
 * for await (const chunk of stream) {
 *   process.stdout.write(chunk.deltaText ?? "");
 * }
 * ```
 */
export type ChatStream = AsyncIterable<ChatStreamChunk>;

/**
 * Embeddings response
 * 
 * @example
 * ```typescript
 * const result = await router.embed({
 *   task: "embeddings",
 *   input: ["Hello", "World"]
 * });
 * 
 * console.log(result.vectors);           // [[0.1, 0.2, ...], [0.3, 0.4, ...]]
 * console.log(result.provider);          // "aibadgr"
 * console.log(result.cost?.estimatedUsd); // 0.00002
 * ```
 */
export interface EmbeddingsResponse {
  /** Provider that successfully handled the request */
  provider: ProviderName;
  /** Array of embedding vectors (one per input text) */
  vectors: number[][];
  /** Raw provider response */
  raw: any;
  /** Token usage statistics */
  usage?: UsageInfo;
  /** Cost estimation */
  cost?: CostInfo;
  /** Total request latency in milliseconds */
  latencyMs: number;
  /** History of all provider attempts */
  attempts: Attempt[];
}

/**
 * Success event emitted to onResult hook
 */
export interface ResultEvent {
  /** Provider that handled the request */
  provider: ProviderName;
  /** Task type */
  task: TaskName;
  /** Total latency */
  latencyMs: number;
  /** Token usage */
  usage?: UsageInfo;
  /** Cost estimation */
  cost?: CostInfo;
  /** Attempt history */
  attempts: Attempt[];
}

/**
 * Error event emitted to onError hook
 */
export interface ErrorEvent {
  /** Primary provider that was attempted */
  provider: ProviderName;
  /** Task type */
  task: TaskName;
  /** Error object or message */
  error: any;
  /** Last HTTP status code */
  status?: number;
  /** All failed attempts */
  attempts: Attempt[];
}

export interface PriceEntry {
  inputPer1M: number;
  outputPer1M: number;
}

// Internal provider interface
export interface ProviderAdapter {
  name: ProviderName;
  chat(request: ChatRunRequest): Promise<ChatRunResponse>;
  chatStream(request: ChatRunRequest): Promise<ChatStream>;
  embeddings(request: EmbeddingsRunRequest): Promise<EmbeddingsResponse>;
}
