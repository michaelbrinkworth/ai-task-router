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
  model: "ai-badgr-embedding",
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

## Common Mistakes

### 1. Passing Environment Variables Incorrectly

❌ **Wrong**: Expecting automatic environment variable reading
```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: "AIBADGR_API_KEY" } // Won't work!
  }
});
```

✅ **Correct**: Explicitly use `process.env`
```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});
```

### 2. Using Invalid Task Types

❌ **Wrong**: Using non-existent task types
```javascript
await router.run({ task: "translate" }); // Invalid task!
```

✅ **Correct**: Use one of the 8 valid task types
```javascript
// Valid tasks: summarize, rewrite, classify, extract, chat, code, reasoning, embeddings
await router.run({ task: "rewrite" });
```

### 3. Expecting Automatic Fallback on All Errors

❌ **Wrong Assumption**: Thinking all errors trigger fallback

The router **does NOT fallback** on 4xx client errors (except 429 rate limits and 408 timeouts), because these indicate problems with your request or credentials, not transient provider issues.

✅ **Fallback triggers on**: 429 rate limits, 408/504 timeouts, 5xx server errors, network errors

✅ **No fallback on**: 400 bad request, 401 unauthorized, 403 forbidden, 404 not found

### 4. Confusing Router API with Direct HTTP API

The **router** is a Node.js package for intelligent routing and fallback. The **HTTP API** is AI Badgr's OpenAI-compatible endpoint you can call directly.

- **Use the router** when: You want automatic routing, fallback, cost tracking in Node.js
- **Use the HTTP API** when: You want a simple OpenAI-compatible endpoint (any language, cURL, etc.)

### 5. Routing to Unconfigured Providers

❌ **Wrong**: Routing to a provider you haven't configured
```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: "..." }
  },
  routes: {
    code: "anthropic" // Anthropic not configured!
  }
});
```

✅ **Correct**: Only route to configured providers, or add the provider
```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: "..." },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic" // Now it works!
  }
});
```

## Troubleshooting

### "Provider not configured" Error

**Problem**: You're trying to use a provider that wasn't set up.

**Solution**: Check which providers are configured and either add the missing provider or change your routing:

```javascript
// Check your config - did you add all needed providers?
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    // Add missing providers:
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  }
});
```

### Request Timeout

**Problem**: Requests are timing out.

**Solution**: Adjust the `timeoutMs` configuration:

```javascript
const router = createRouter({
  providers: { /* ... */ },
  timeoutMs: 120000, // Increase to 120 seconds
});
```

### "All providers failed" Error

**Problem**: Every provider in the fallback chain failed.

**Solution**: Inspect the `attempts` array in the error to see what went wrong:

```javascript
try {
  await router.run({ task: "chat", input: "Hello" });
} catch (error) {
  console.error("All attempts failed:");
  error.attempts?.forEach(attempt => {
    console.log(`- ${attempt.provider}: ${attempt.error}`);
  });
}
```

### Invalid API Key Errors

**Problem**: Getting 401 Unauthorized errors.

**Solution**: 
1. Verify your API key is correct
2. Check that you're using `process.env.YOUR_KEY` not a string literal
3. Make sure your `.env` file is being loaded (use `dotenv` package)
4. Get a new API key from the provider's dashboard

### Streaming Not Working

**Problem**: Streaming requests fail or don't return chunks.

**Solution**:
1. Ensure your `tsconfig.json` includes ES2018+ lib for `AsyncIterable`
2. Check that the provider supports streaming (all providers support chat streaming)
3. Use `for await` loop properly:

```javascript
const stream = await router.chat({ stream: true, input: "Hello" });
for await (const chunk of stream) {
  process.stdout.write(chunk.deltaText ?? "");
}
```

## Migration Guides

### Migrating from OpenAI SDK Directly

**Before** (OpenAI only):
```javascript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: "Hello" }]
});

console.log(completion.choices[0].message.content);
```

**After** (with router for cost savings + fallback):
```javascript
import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }, // 10x cheaper default
    openai: { apiKey: process.env.OPENAI_API_KEY }     // Fallback
  },
  fallback: {
    chat: ["aibadgr", "openai"] // Try cheap first, fallback to OpenAI
  }
});

const result = await router.chat({
  input: "Hello"
});

console.log(result.outputText);
console.log("Cost:", result.cost?.estimatedUsd); // Track savings!
```

### Migrating from Anthropic SDK Directly

**Before** (Anthropic only):
```javascript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }]
});

console.log(message.content[0].text);
```

**After** (with router):
```javascript
import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic" // Use Claude for code
  }
});

const result = await router.run({
  task: "code", // Routes to Claude automatically
  input: "Write a binary search in Python"
});

console.log(result.outputText);
console.log("Provider:", result.provider); // "anthropic"
```

### Using as Drop-in Replacement in Existing Tools

The router works with any tool that accepts OpenAI-compatible APIs:

**Continue.dev, Cline, Aider, Cursor**:
1. Use AI Badgr's HTTP API endpoint: `https://aibadgr.com/api/v1`
2. Set API key: Your AI Badgr API key
3. The tool will work exactly like OpenAI, but 10x cheaper

**n8n Workflows**: See [examples/n8n/](./examples/n8n/)

**Flowise Chatflows**: See [examples/flowise/](./examples/flowise/)

**Continue.dev Proxy**: See [examples/continue/](./examples/continue/)

## Performance Tips

### When to Use Streaming vs Non-Streaming

**Use streaming when:**
- Building interactive chat interfaces where users expect real-time responses
- Processing long responses (> 500 tokens)
- User experience matters more than simplicity

**Use non-streaming when:**
- Batch processing or background tasks
- You need the full response at once for processing
- You want to track exact costs (easier with complete responses)

```javascript
// Streaming - better UX for chat
const stream = await router.chat({ stream: true, input: "Write an essay" });
for await (const chunk of stream) {
  displayInUI(chunk.deltaText);
}

// Non-streaming - better for automation
const result = await router.run({ task: "summarize", input: longText });
await saveToDatabase(result.outputText);
```

### Cost Optimization Strategies

**1. Use task-based routing to send cheap tasks to AI Badgr:**

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic",      // Premium provider for specialized task
    // Everything else goes to aibadgr automatically (10x cheaper)
  }
});
```

**2. Monitor costs with hooks:**

```javascript
let totalCost = 0;

const router = createRouter({
  providers: { /* ... */ },
  onResult: (event) => {
    totalCost += event.cost?.estimatedUsd || 0;
    console.log(`Task: ${event.task}, Cost: $${event.cost?.estimatedUsd?.toFixed(6)}`);
    console.log(`Total spent today: $${totalCost.toFixed(4)}`);
  }
});
```

**3. Use smaller models when appropriate:**

```javascript
// For simple tasks, use smaller models
const result = await router.run({
  task: "chat",
  input: "What is 2+2?",
  model: "gpt-3.5-turbo" // or "gpt-4o-mini" - much cheaper than GPT-4
});
```

**4. Set shorter max tokens for tasks that don't need long responses:**

```javascript
const result = await router.run({
  task: "classify",
  input: "Is this email spam?",
  maxTokens: 10 // Just need "Yes" or "No"
});
```

### Fallback Chain Best Practices

**Order fallback by cost** (cheap to expensive):

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },    // Cheapest
    openai: { apiKey: process.env.OPENAI_API_KEY },      // Mid-tier
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY } // Premium
  },
  fallback: {
    chat: ["aibadgr", "openai", "anthropic"],
    code: ["anthropic", "aibadgr"] // Start with best for specialized tasks
  }
});
```

**Keep fallback chains short** (2-3 providers max):
- Longer chains increase latency when providers fail
- Most failures are resolved by first fallback
- If all providers are down, it's likely a network issue on your end

**Use specific fallbacks per task:**

```javascript
fallback: {
  chat: ["aibadgr", "openai"],        // General tasks
  code: ["anthropic", "openai"],       // Code needs quality providers
  embeddings: ["aibadgr", "openai"]    // Anthropic doesn't support embeddings
}
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

- 📧 Email: support@aibadgr.com
- 🐛 Issues: [GitHub Issues](https://github.com/michaelbrinkworth/ai-task-router/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/michaelbrinkworth/ai-task-router/discussions)
- 📖 Docs: [aibadgr.com/docs](https://aibadgr.com/docs)
