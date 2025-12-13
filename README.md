# @aibadgr/router

[![npm version](https://img.shields.io/npm/v/@aibadgr/router.svg)](https://www.npmjs.com/package/@aibadgr/router)
[![npm downloads](https://img.shields.io/npm/dm/@aibadgr/router.svg)](https://www.npmjs.com/package/@aibadgr/router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/node/v/@aibadgr/router.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> **Task-based LLM router (OpenAI-compatible)** — cheap default (AI Badgr) + optional OpenAI/Claude with automatic fallback and cost tracking.

## Why?

Most LLM apps waste money by routing everything to expensive providers. **@aibadgr/router** solves this:

- **Save 80%+ on costs** by defaulting to AI Badgr (OpenAI-compatible, 10x cheaper)
- **Route by task** — send code to Claude, reasoning to GPT-4, simple tasks to the cheap default
- **Automatic fallback** — handle rate limits, timeouts, and errors without manual retry logic
- **Drop-in replacement** — OpenAI-compatible API, works with existing tools (Continue, Cline, n8n, Flowise)
- **Zero config** — works with just `AIBADGR_API_KEY`, add premium providers only when needed
- **Track every dollar** — built-in cost estimation per request
- **Type-safe** — full TypeScript support with streaming

Perfect for: AI agents, chatbots, workflows, developer tools, any app making multiple LLM calls.

## 30-Second Quickstart

**Option 1: Quick Start (using init)**

```bash
npx @aibadgr/router init my-project
cd my-project
npm install
# Add your AIBADGR_API_KEY to .env
npm start
```

**Option 2: Manual Install**

```bash
npm install @aibadgr/router
```

```javascript
import { createRouter } from "@aibadgr/router";

// Cost-first: AI Badgr only (10x cheaper than OpenAI)
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});

const result = await router.run({
  task: "summarize",
  input: "Long article text..."
});

console.log(result.outputText);
console.log("Cost:", result.cost?.estimatedUsd); // ~$0.0001
console.log("Provider:", result.provider);       // "aibadgr"
```

**Multi-provider per task:**

```javascript
// Premium providers for specialized tasks
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic",     // Claude for code → $0.003/request
    reasoning: "openai",   // GPT-4 for hard problems → $0.01/request
    // Everything else → aibadgr (default) → $0.0001/request
  },
  fallback: {
    chat: ["aibadgr", "openai"] // Auto-retry on errors/rate-limits
  }
});

// Goes to Claude, falls back to AI Badgr if Claude is down
const code = await router.run({ 
  task: "code", 
  input: "Write a binary search in TypeScript" 
});
```

## Features

- 🎯 **Task-based routing** - Route requests by task type (summarize, code, reasoning, etc.)
- 💰 **Cost optimization** - Default to AI Badgr for cost savings, premium providers for specialized tasks
- 🔄 **Automatic fallback** - Handles rate limits, timeouts, and errors gracefully
- 📡 **Streaming support** - Real-time responses for chat completions
- 📊 **Cost estimation** - Built-in pricing for all providers
- 🪝 **Event hooks** - Monitor success, failures, and performance
- 🚀 **Zero config** - Works with just an AI Badgr API key
- 📦 **Tiny** - Minimal dependencies, tree-shakeable ESM

## Installation

```bash
npm install @aibadgr/router
```

## More Examples

### Streaming

```javascript
const stream = await router.chat({
  stream: true,
  input: "Tell me a story",
});

for await (const chunk of stream) {
  process.stdout.write(chunk.deltaText ?? "");
}
```

### Embeddings

```javascript
const embeddings = await router.embed({
  task: "embeddings",
  input: ["Hello world", "Goodbye world"],
  model: "text-embedding-3-small",
});

console.log(embeddings.vectors); // [[0.1, 0.2, ...], [0.3, 0.4, ...]]
```

## Configuration

### Environment Variables

The router automatically reads from these environment variables:

```bash
AIBADGR_API_KEY=your-key
AIBADGR_BASE_URL=https://aibadgr.com/api/v1  # optional
OPENAI_API_KEY=your-key                       # optional
ANTHROPIC_API_KEY=your-key                    # optional
```

### Full Config Options

```typescript
const router = createRouter({
  // Provider credentials (required: aibadgr, optional: openai, anthropic)
  providers: {
    aibadgr: {
      apiKey: string,
      baseUrl?: string, // default: https://aibadgr.com/api/v1
    },
    openai?: {
      apiKey: string,
      baseUrl?: string,
    },
    anthropic?: {
      apiKey: string,
    },
  },

  // Routing mode (quick presets)
  mode?: "cheap" | "balanced" | "best",
  // cheap: all tasks → aibadgr
  // balanced: code → anthropic, reasoning → openai, rest → aibadgr
  // best: premium providers where available

  // Custom routing table
  routes?: {
    summarize?: "aibadgr" | "openai" | "anthropic",
    rewrite?: "aibadgr" | "openai" | "anthropic",
    classify?: "aibadgr" | "openai" | "anthropic",
    extract?: "aibadgr" | "openai" | "anthropic",
    chat?: "aibadgr" | "openai" | "anthropic",
    code?: "aibadgr" | "openai" | "anthropic",
    reasoning?: "aibadgr" | "openai" | "anthropic",
    embeddings?: "aibadgr" | "openai",
  },

  // Fallback order per task (on errors, rate limits)
  fallback?: {
    chat?: ["aibadgr", "openai", "anthropic"],
    // ... other tasks
  },

  // Default provider (if no route matches)
  defaultProvider?: "aibadgr" | "openai" | "anthropic", // default: "aibadgr"

  // Timeouts and retries
  timeoutMs?: number,   // default: 60000
  maxRetries?: number,  // default: 1

  // Disable fallback (strict mode)
  fallbackPolicy?: "enabled" | "none", // default: "enabled"

  // Event hooks
  onResult?: (event) => void,
  onError?: (event) => void,

  // Custom pricing (override defaults)
  priceOverrides?: {
    "gpt-4": { inputPer1M: 30, outputPer1M: 60 },
    // ...
  },
});
```

## Task Types

The router supports 8 task types:

| Task         | Description                  | Default Provider |
|--------------|------------------------------|------------------|
| `summarize`  | Text summarization           | aibadgr          |
| `rewrite`    | Rewriting/paraphrasing       | aibadgr          |
| `classify`   | Classification tasks         | aibadgr          |
| `extract`    | Information extraction       | aibadgr          |
| `chat`       | General conversation         | aibadgr          |
| `code`       | Code generation/analysis     | anthropic*       |
| `reasoning`  | Complex reasoning            | openai*          |
| `embeddings` | Vector embeddings            | aibadgr          |

\* Falls back to aibadgr if provider not configured

## API Reference

### `createRouter(config)`

Creates a new router instance.

### `router.run(request)`

Unified interface for all requests.

```typescript
// Chat/completion request
await router.run({
  task: "summarize",
  input: "text to summarize",
  model?: string,
  maxTokens?: number,
  temperature?: number,
  json?: boolean,        // Force JSON output
  stream?: boolean,
  provider?: "aibadgr" | "openai" | "anthropic", // Override routing
});

// Embeddings request
await router.run({
  task: "embeddings",
  input: string | string[],
  model?: string,
});
```

### `router.chat(request)`

Chat-specific method (alternative to `run`).

### `router.embed(request)`

Embeddings-specific method (alternative to `run`).

### `router.withOverrides(overrides)`

Create a new router with modified config (immutable).

```javascript
const customRouter = router.withOverrides({
  routes: { chat: "openai" },
});
```

## Response Format

### Chat Response

```typescript
{
  provider: "aibadgr" | "openai" | "anthropic",
  model: string,
  outputText: string,
  raw: any,              // Original provider response
  usage?: {
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
  },
  cost?: {
    estimatedUsd: number,
    inputUsd: number,
    outputUsd: number,
  },
  latencyMs: number,
  attempts: [            // Retry/fallback history
    { provider: "aibadgr", ok: true },
  ],
}
```

### Embeddings Response

```typescript
{
  provider: "aibadgr" | "openai",
  vectors: number[][],   // Array of embedding vectors
  raw: any,
  usage?: { totalTokens: number },
  cost?: { estimatedUsd: number },
  latencyMs: number,
  attempts: [...],
}
```

## Error Handling & Fallback

The router automatically retries and falls back on:

- ✅ **429** Rate limits
- ✅ **408/504** Timeouts
- ✅ **5xx** Server errors
- ✅ Network errors (ECONNRESET, ETIMEDOUT, etc.)

It does **not** fallback on:

- ❌ **4xx** Client errors (bad request, invalid auth)
- ❌ Validation errors

### Fallback Behavior

1. Try primary provider (with retries)
2. If retriable error → try next provider in fallback chain
3. If no fallback configured → use default fallback order: `[aibadgr, openai, anthropic]` (minus primary)

## Monitoring

Use hooks to monitor performance and failures:

```javascript
const router = createRouter({
  providers: { /* ... */ },
  onResult: (event) => {
    console.log(`✓ ${event.task} via ${event.provider}: ${event.latencyMs}ms`);
    console.log(`  Cost: $${event.cost?.estimatedUsd}`);
  },
  onError: (event) => {
    console.error(`✗ ${event.task} failed on ${event.provider}`);
    console.error(`  Error: ${event.error}`);
  },
});
```

## Cost Estimation

The router includes built-in pricing for common models:

- **AI Badgr**: $0.50/$1.50 per 1M tokens (input/output)
- **OpenAI**: GPT-3.5, GPT-4, GPT-4o, embeddings
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku), Claude 3.5

Override prices:

```javascript
const router = createRouter({
  providers: { /* ... */ },
  priceOverrides: {
    "gpt-4o": { inputPer1M: 5.0, outputPer1M: 15.0 },
  },
});
```

## Advanced Examples

### JSON Mode

```javascript
const result = await router.run({
  task: "extract",
  input: "John Doe, age 30, lives in NYC",
  json: true, // Forces JSON output
});

const data = JSON.parse(result.outputText);
```

### Custom Messages

```javascript
const result = await router.chat({
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Hello!" },
    { role: "assistant", content: "Hi there!" },
    { role: "user", content: "How are you?" },
  ],
});
```

### Direct Provider Override

```javascript
// Force OpenAI regardless of routing
const result = await router.run({
  task: "chat",
  input: "Hello",
  provider: "openai",
});
```

## TypeScript

Full TypeScript support included:

```typescript
import { createRouter, ChatRunRequest, EmbeddingsRunRequest } from "@aibadgr/router";
```

**Note**: For streaming support, your `tsconfig.json` needs ES2018+ lib:

```json
{
  "compilerOptions": {
    "lib": ["ES2018"]
  }
}
```

## Requirements

- Node.js 18+
- ESM (CommonJS build also available)

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

- 📧 Email: support@aibadgr.com
- 🐛 Issues: [GitHub Issues](https://github.com/michaelbrinkworth/ai-task-router/issues)
- 📖 Docs: [aibadgr.com/docs](https://aibadgr.com/docs)
