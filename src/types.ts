/**
 * Core types for @aibadgr/router
 */

export type ProviderName = "aibadgr" | "openai" | "anthropic";

export type TaskName =
  | "summarize"
  | "rewrite"
  | "classify"
  | "extract"
  | "chat"
  | "code"
  | "reasoning"
  | "embeddings";

export type RouterMode = "cheap" | "balanced" | "best";

export type FallbackPolicy = "enabled" | "none";

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface RouterConfig {
  providers: {
    aibadgr: ProviderConfig;
    openai?: ProviderConfig;
    anthropic?: Omit<ProviderConfig, "baseUrl">;
  };

  defaultProvider?: ProviderName;
  routes?: Partial<Record<TaskName, ProviderName>>;
  fallback?: Partial<Record<TaskName, ProviderName[]>>;
  mode?: RouterMode;

  timeoutMs?: number;
  maxRetries?: number;

  onResult?: (event: ResultEvent) => void;
  onError?: (event: ErrorEvent) => void;

  fallbackPolicy?: FallbackPolicy;

  priceOverrides?: Record<string, { inputPer1M: number; outputPer1M: number }>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRunRequest {
  task?: Exclude<TaskName, "embeddings">;
  input?: string;
  messages?: ChatMessage[];

  model?: string;
  maxTokens?: number;
  temperature?: number;

  json?: boolean;
  schema?: object;

  stream?: boolean;
  provider?: ProviderName;
}

export interface EmbeddingsRunRequest {
  task: "embeddings";
  input: string | string[];
  model?: string;
  provider?: ProviderName;
}

export type RunRequest = ChatRunRequest | EmbeddingsRunRequest;

export interface UsageInfo {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface CostInfo {
  estimatedUsd?: number;
  inputUsd?: number;
  outputUsd?: number;
}

export interface Attempt {
  provider: ProviderName;
  ok: boolean;
  status?: number;
  error?: string;
}

export interface ChatRunResponse {
  provider: ProviderName;
  model: string;
  outputText: string;
  raw: any;
  usage?: UsageInfo;
  cost?: CostInfo;
  latencyMs: number;
  attempts: Attempt[];
}

export interface ChatStreamChunk {
  deltaText?: string;
  raw?: any;
}

export type ChatStream = AsyncIterable<ChatStreamChunk>;

export interface EmbeddingsResponse {
  provider: ProviderName;
  vectors: number[][];
  raw: any;
  usage?: UsageInfo;
  cost?: CostInfo;
  latencyMs: number;
  attempts: Attempt[];
}

export interface ResultEvent {
  provider: ProviderName;
  task: TaskName;
  latencyMs: number;
  usage?: UsageInfo;
  cost?: CostInfo;
  attempts: Attempt[];
}

export interface ErrorEvent {
  provider: ProviderName;
  task: TaskName;
  error: any;
  status?: number;
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
