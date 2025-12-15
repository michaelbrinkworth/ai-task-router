# AI Task Router - Language-Neutral Specification

Version: 1.0
Last Updated: December 2024

This specification defines the behavior of the AI Task Router for implementation across different programming languages. The goal is to ensure consistent behavior across JavaScript, Python, Go, Rust, and other language ports.

---

## 1. Core Concepts

### 1.1 Providers

The router supports three LLM providers:

- **aibadgr** - AI Badgr (OpenAI-compatible API)
- **openai** - OpenAI
- **anthropic** - Anthropic (Claude)

**Required**: `aibadgr` provider must always be configured.
**Optional**: `openai` and `anthropic` providers are optional.

### 1.2 Tasks

The router defines 8 task types for routing decisions:

| Task Name    | Description                      |
|--------------|----------------------------------|
| `summarize`  | Text summarization               |
| `rewrite`    | Rewriting/paraphrasing text      |
| `classify`   | Classification tasks             |
| `extract`    | Information extraction           |
| `chat`       | General conversational requests  |
| `code`       | Code generation/analysis         |
| `reasoning`  | Complex reasoning tasks          |
| `embeddings` | Vector embedding generation      |

---

## 2. Routing Rules

### 2.1 Provider Selection Order

When processing a request, the router selects a provider in this order:

1. **Explicit override**: If `request.provider` is set, use it (skip routing logic)
2. **Task-based routing**: If `routes[task]` is configured and provider is available, use it
3. **Mode defaults**: If `mode` is set, use mode-specific defaults
4. **Default provider**: Use configured `defaultProvider` (default: `aibadgr`)

### 2.2 Default Route Table

When no custom routes are specified and no mode is set:

```
summarize   → aibadgr
rewrite     → aibadgr
classify    → aibadgr
extract     → aibadgr
chat        → aibadgr
embeddings  → aibadgr
code        → anthropic (if configured), else aibadgr
reasoning   → openai (if configured), else aibadgr
```

### 2.3 Mode Defaults

**cheap**: All tasks route to `aibadgr`

**balanced**:
- `code` → `anthropic` (if configured), else `aibadgr`
- `reasoning` → `openai` (if configured), else `aibadgr`
- All others → `aibadgr`

**best**:
- `code` → `anthropic` (if configured), else `aibadgr`
- `reasoning` → `openai` (if configured), else `aibadgr`
- `chat` → `anthropic` (if configured), else `aibadgr`
- All others → `aibadgr`

---

## 3. Fallback Behavior

### 3.1 When to Fallback

Fallback to another provider should occur ONLY on:

- **429** (Rate Limit Exceeded)
- **408** (Request Timeout)
- **504** (Gateway Timeout)
- **5xx** (Server errors: 500, 502, 503, etc.)
- **Network errors** (connection reset, timeout, DNS failure)

### 3.2 When NOT to Fallback

Do NOT fallback on:

- **400** (Bad Request)
- **401** (Unauthorized)
- **403** (Forbidden)
- **404** (Not Found)
- Any other **4xx** client errors (except 429, 408)

These errors indicate a problem with the request itself or credentials, not a transient provider issue.

### 3.3 Fallback Order

1. Try primary provider with retries (max: `maxRetries`, default 1)
2. If task has configured `fallback[task]` array, try each provider in order
3. Otherwise, use default fallback order: all configured providers except primary

**Example**: If primary is `anthropic` and all providers are configured:
- Fallback order: `["aibadgr", "openai"]`

**Special case for embeddings**: Skip `anthropic` in fallback chain (doesn't support embeddings)

### 3.4 Fallback Policy

- **enabled** (default): Use fallback behavior as described above
- **none**: Never fallback. Fail immediately on primary provider error.

---

## 4. Retry Logic

For the same provider:

1. First attempt
2. If retriable error (see 3.1), retry up to `maxRetries` times (default: 1)
3. Use exponential backoff: `min(1000 * 2^retry, 10000)` milliseconds
4. After exhausting retries, move to fallback

---

## 5. Request Types

### 5.1 Chat/Completion Request

```
{
  task?: "summarize" | "rewrite" | "classify" | "extract" | "chat" | "code" | "reasoning"
         (default: "chat")
  
  // Input (one of):
  input?: string                    // Simple text input (converted to user message)
  messages?: Message[]              // Full conversation history
  
  // Model options:
  model?: string                    // Model name (default: "gpt-3.5-turbo")
  maxTokens?: number                // Max completion tokens
  temperature?: number              // 0.0 to 2.0
  
  // Output format:
  json?: boolean                    // Force JSON output
  schema?: object                   // JSON schema (optional, MVP can ignore)
  
  // Streaming:
  stream?: boolean                  // Enable streaming (default: false)
  
  // Override:
  provider?: "aibadgr" | "openai" | "anthropic"  // Skip routing
}

Message = {
  role: "system" | "user" | "assistant"
  content: string
}
```

### 5.2 Embeddings Request

```
{
  task: "embeddings"                // Required
  input: string | string[]          // Text(s) to embed
  model?: string                    // Model name (default: "ai-badgr-embedding" for AI Badgr)
  provider?: "aibadgr" | "openai"   // Override (anthropic not supported)
}
```

---

## 6. Response Format

### 6.1 Chat/Completion Response

```
{
  provider: "aibadgr" | "openai" | "anthropic"
  model: string                     // Actual model used
  outputText: string                // Generated text
  raw: any                          // Original provider response
  
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
  
  cost?: {
    estimatedUsd?: number           // Total cost
    inputUsd?: number               // Input cost
    outputUsd?: number              // Output cost
  }
  
  latencyMs: number                 // Total request time
  
  attempts: [                       // Retry/fallback history
    {
      provider: "aibadgr"
      ok: boolean
      status?: number               // HTTP status if failed
      error?: string                // Error message if failed
    },
    ...
  ]
}
```

### 6.2 Streaming Response

Return an async iterator/stream that yields chunks:

```
{
  deltaText?: string                // Incremental text
  raw?: any                         // Provider-specific chunk data
}
```

Final summary can be emitted via `onResult` hook but not returned from stream.

### 6.3 Embeddings Response

```
{
  provider: "aibadgr" | "openai"
  vectors: number[][]               // Array of embedding vectors
  raw: any                          // Original provider response
  
  usage?: {
    totalTokens?: number
  }
  
  cost?: {
    estimatedUsd?: number
  }
  
  latencyMs: number
  attempts: [...]                   // Same as chat
}
```

---

## 7. Provider Adapters

### 7.1 AI Badgr

- **Protocol**: OpenAI-compatible
- **Base URL**: `https://aibadgr.com/api/v1` (default)
- **Authentication**: API key in `Authorization: Bearer` header
- **Endpoints**:
  - `/chat/completions` (streaming supported)
  - `/embeddings`
- **Embeddings model**:
  - Responses use `model: "ai-badgr-embedding"` (1536-dimensional vector)
  - Request `model` field accepts OpenAI-style IDs for compatibility.
- **Special handling**: None (follows OpenAI spec)

### 7.2 OpenAI

- **Protocol**: OpenAI native
- **Base URL**: `https://api.openai.com/v1` (default)
- **Authentication**: API key in `Authorization: Bearer` header
- **Endpoints**:
  - `/chat/completions` (streaming supported)
  - `/embeddings`
- **Special handling**: None

### 7.3 Anthropic

- **Protocol**: Anthropic native (different from OpenAI)
- **Base URL**: `https://api.anthropic.com/v1` (implicit)
- **Authentication**: API key in `x-api-key` header
- **Endpoints**:
  - `/messages` (streaming supported)
  - Embeddings: **NOT SUPPORTED**

**Message format mapping**:
- Separate `system` messages from conversation
- Combine all system messages into single `system` parameter
- Map `user`/`assistant` roles directly
- If `json: true`, append "Return valid JSON only." to system prompt

**Streaming**: Different format than OpenAI. Look for:
- `type: "content_block_delta"`
- `delta.type: "text_delta"`
- `delta.text` contains incremental text

---

## 8. Configuration

### 8.1 Required Configuration

```
providers: {
  aibadgr: {
    apiKey: string                  // Required
    baseUrl?: string                // Optional (default: https://aibadgr.com/api/v1)
  }
}
```

### 8.2 Optional Configuration

```
providers: {
  openai?: {
    apiKey: string
    baseUrl?: string
  }
  anthropic?: {
    apiKey: string
    // No baseUrl - fixed endpoint
  }
}

defaultProvider?: "aibadgr" | "openai" | "anthropic"  // Default: "aibadgr"

routes?: {
  [task: TaskName]?: ProviderName
}

fallback?: {
  [task: TaskName]?: ProviderName[]
}

mode?: "cheap" | "balanced" | "best"

timeoutMs?: number                  // Default: 60000
maxRetries?: number                 // Default: 1

fallbackPolicy?: "enabled" | "none" // Default: "enabled"

onResult?: (event: ResultEvent) => void
onError?: (event: ErrorEvent) => void

priceOverrides?: {
  [model: string]: {
    inputPer1M: number              // USD per 1M input tokens
    outputPer1M: number             // USD per 1M output tokens
  }
}
```

---

## 9. Environment Variables

Implementations SHOULD read from these environment variables when config is not explicitly provided:

```
AIBADGR_API_KEY         # AI Badgr API key
AIBADGR_BASE_URL        # AI Badgr base URL (optional)
OPENAI_API_KEY          # OpenAI API key (optional)
OPENAI_BASE_URL         # OpenAI base URL (optional)
ANTHROPIC_API_KEY       # Anthropic API key (optional)
```

---

## 10. Error Handling

### 10.1 Error Propagation

If all providers fail (primary + all fallbacks):

1. Fire `onError` hook if configured
2. Throw/return error with message: `"[Request type] request failed: [last error]"`
3. Include full `attempts` array in error data

### 10.2 Timeout Behavior

Requests MUST respect `timeoutMs` configuration:

- Wrap provider calls in timeout logic
- If timeout occurs, treat as retriable error (can trigger fallback)
- Default timeout: 60 seconds

### 10.3 Streaming Errors

For streaming requests:

- Do NOT attempt fallback (too complex for MVP)
- If streaming fails, throw error immediately
- Partial results are lost (client must retry full request)

---

## 11. Cost Estimation

### 11.1 Built-in Prices (per 1M tokens, USD)

Implementations SHOULD include these default prices:

**AI Badgr**:
- Default: $0.50 input / $1.50 output

**OpenAI**:
- gpt-3.5-turbo: $0.50 / $1.50
- gpt-4: $30.00 / $60.00
- gpt-4-turbo: $10.00 / $30.00
- gpt-4o: $5.00 / $15.00
- gpt-4o-mini: $0.15 / $0.60
- text-embedding-3-small: $0.02 / $0.00
- text-embedding-3-large: $0.13 / $0.00
- text-embedding-ada-002: $0.10 / $0.00

**Anthropic**:
- claude-3-opus-20240229: $15.00 / $75.00
- claude-3-sonnet-20240229: $3.00 / $15.00
- claude-3-haiku-20240307: $0.25 / $1.25
- claude-3-5-sonnet-20241022: $3.00 / $15.00
- claude-3-5-haiku-20241022: $1.00 / $5.00

### 11.2 Calculation

```
inputCost = (inputTokens / 1,000,000) × inputPer1M
outputCost = (outputTokens / 1,000,000) × outputPer1M
totalCost = inputCost + outputCost
```

If model not recognized and provider is `aibadgr`, use aibadgr default.
Otherwise, return `undefined` for cost.

---

## 12. Event Hooks

### 12.1 onResult Event

Fired on successful completion (after any retries/fallbacks):

```
{
  provider: ProviderName
  task: TaskName
  latencyMs: number
  usage?: UsageInfo
  cost?: CostInfo
  attempts: Attempt[]
}
```

### 12.2 onError Event

Fired when all attempts fail:

```
{
  provider: ProviderName       // Primary provider attempted
  task: TaskName
  error: any                   // Error object/message
  status?: number              // Last HTTP status code
  attempts: Attempt[]
}
```

---

## 13. Implementation Checklist

A compliant implementation MUST:

- [ ] Support all 3 providers (aibadgr, openai, anthropic)
- [ ] Support all 8 task types
- [ ] Implement routing selection (explicit → routes → mode → default)
- [ ] Implement fallback logic (only on retriable errors)
- [ ] Implement retry logic with exponential backoff
- [ ] Support streaming for chat (OpenAI-compatible providers + Anthropic)
- [ ] Support embeddings (exclude Anthropic from fallback)
- [ ] Calculate costs using built-in price table
- [ ] Respect `timeoutMs` configuration
- [ ] Fire `onResult` and `onError` hooks
- [ ] Handle JSON mode (append system message)
- [ ] Never fallback on 4xx errors (except 429, 408)

A compliant implementation SHOULD:

- [ ] Read from environment variables
- [ ] Support price overrides
- [ ] Support `withOverrides()` method for configuration
- [ ] Include TypeScript types (if applicable)

---

## 14. Version History

- **1.0** (December 2024): Initial specification

---

## 15. Future Considerations (Not in MVP)

These features are explicitly OUT OF SCOPE for the initial spec:

- Tool calling / function calling
- Multi-turn conversation management
- Memory / context window management
- Advanced schema validation (Zod, JSON Schema enforcement)
- Batch requests
- Async callback-based APIs
- Persistent logging / tracing
- Provider-specific optimizations
- Custom prompt templates
- Cost budgeting / limits

Language ports should follow this spec exactly for MVP. Extensions can be added in later versions while maintaining backward compatibility.
