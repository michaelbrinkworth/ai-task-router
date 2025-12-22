# @aibadgr/ai-task-router

[![npm version](https://img.shields.io/npm/v/@aibadgr/ai-task-router.svg)](https://www.npmjs.com/package/@aibadgr/ai-task-router)
[![npm downloads](https://img.shields.io/npm/dm/@aibadgr/ai-task-router.svg)](https://www.npmjs.com/package/@aibadgr/ai-task-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/node/v/@aibadgr/ai-task-router.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/michaelbrinkworth/ai-task-router.svg)](https://github.com/michaelbrinkworth/ai-task-router)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/michaelbrinkworth/ai-task-router/pulls)

> **Intelligent LLM Router for OpenAI, Claude & More** — Cost-optimized AI routing with automatic fallback, streaming support, and built-in cost tracking. The smart way to use multiple AI providers.

## 🎯 What is AI Task Router?

**AI Task Router** is an intelligent routing library that automatically directs your AI requests to the most cost-effective provider while maintaining quality. Think of it as a smart proxy that saves you 80%+ on AI costs by routing simple tasks to cheaper providers and complex tasks to premium models like GPT-4 or Claude.

### Key Benefits

- 💰 **Save 80%+ on AI costs** - Default to AI Badgr (10x cheaper than OpenAI), use premium providers only when needed
- 🎯 **Intelligent task-based routing** - Send code to Claude, reasoning to GPT-4, simple tasks to budget providers
- 🔄 **Automatic failover** - Handle rate limits, timeouts, and API errors without manual retry logic
- 🚀 **Drop-in OpenAI replacement** - Compatible with Continue, Cline, Cursor, n8n, Flowise, and any OpenAI client
- ⚡ **Zero configuration** - Works with just an API key, expand to multi-provider when ready
- 📊 **Built-in cost tracking** - Know exactly how much each request costs across all providers
- 🔒 **Type-safe & tested** - Full TypeScript support with comprehensive test coverage
- 📡 **Real-time streaming** - Support for streaming responses from all providers

## Why AI Task Router?

Most AI applications waste money by routing everything to expensive providers like OpenAI GPT-4. **AI Task Router** intelligently distributes your requests:

## Why AI Task Router?

Most AI applications waste money by routing everything to expensive providers like OpenAI GPT-4. **AI Task Router** intelligently distributes your requests:

| Task Type | Without Router | With Router | Savings |
|-----------|---------------|-------------|---------|
| Simple chat | GPT-4 ($0.03/1K) | AI Badgr ($0.003/1K) | 90% |
| Code review | GPT-4 ($0.03/1K) | Claude Sonnet ($0.015/1K) | 50% |
| Summarization | GPT-4 ($0.03/1K) | AI Badgr ($0.003/1K) | 90% |
| Complex reasoning | GPT-4 ($0.03/1K) | GPT-4 (when needed) | 0% |

**Real-world example:** An AI chatbot making 1M requests/month could save $27,000/month by routing appropriately.

### Perfect For

- 🤖 **AI Agents & Assistants** - Reduce costs for multi-step workflows
- 💬 **Chatbots & Customer Support** - Handle high-volume conversations affordably  
- 🔄 **Workflow Automation** - n8n, Flowise, Zapier integrations
- 👨‍💻 **Developer Tools** - Continue, Cline, Cursor, Aider extensions
- 📊 **Data Processing** - Batch processing, summarization, classification
- 🎓 **Educational Apps** - Cost-effective AI tutoring and learning tools

## 🚀 Quick Start (30 seconds)


```bash
npm install @aibadgr/ai-task-router
```

```javascript
import { createRouter } from "@aibadgr/ai-task-router";

const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});

const result = await router.run({
  task: "chat",
  input: "Hello, world!"
});

console.log(result.outputText);
```

**That's it!** The router handles everything else automatically.

<details>
<summary><b>Want to add OpenAI or Claude?</b> (optional)</summary>

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },      // optional
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY } // optional
  },
  routes: {
    code: "anthropic",   // Use Claude for code
    reasoning: "openai"  // Use GPT-4 for reasoning
    // Everything else uses aibadgr (10x cheaper)
  }
});
```

</details>

## Features

- 🧠 **AI-Powered Classification** - NEW: Intelligent mode automatically detects task types
- 🎯 **Task-based routing** - Route requests by task type (summarize, code, reasoning, etc.)
- 🚀 **Automatic Escalation** - NEW: Re-routes to better providers if quality thresholds aren't met
- 🛡️ **Policy Control** - NEW: Override AI decisions with explicit policies
- 💰 **Cost optimization** - Default to AI Badgr for cost savings, premium providers for specialized tasks
- 🔄 **Automatic fallback** - Handles rate limits, timeouts, and errors gracefully
- 📡 **Streaming support** - Real-time responses for chat completions
- 📊 **Cost estimation** - Built-in pricing for all providers with classification cost tracking
- 🪝 **Event hooks** - Monitor success, failures, and performance
- 🔍 **Full Transparency** - NEW: Every decision is explainable with routing metadata
- 🚀 **Zero config** - Works with just an AI Badgr API key
- 📦 **Tiny** - Minimal dependencies, tree-shakeable ESM

## Installation

```bash
npm install @aibadgr/ai-task-router
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

## 🧠 Intelligent Mode (AI-Powered Routing)

**NEW:** The router now supports AI-powered classification to automatically detect task types and route requests optimally. This eliminates the need to manually specify task types while maintaining full control via policies.

### What is Intelligent Mode?

Intelligent mode uses AI classification to analyze each request and determine:
- **Task intent** (summarize, code, chat, etc.)
- **Complexity** (low, medium, high)
- **Risk level** (safety/quality concerns)
- **Expected length** (short, long)
- **Confidence** (how sure the classifier is)

The router then uses this information to make smart routing decisions and automatically escalate if quality thresholds aren't met.

### Quick Start with Intelligent Mode

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  mode: "intelligent" // Enable AI classification
});

// No need to specify task type - AI figures it out!
const result = await router.run({
  input: "Write a function to calculate fibonacci numbers"
});

// View routing decision
console.log(result.routing);
// {
//   classifier: { intent: "code", complexity: "medium", confidence: 0.95, ... },
//   classifierTokens: 150,
//   classifierCost: 0.0001,
//   selectedProvider: "anthropic",
//   reason: "AI classification: code (confidence: 0.95, complexity: medium)",
//   mode: "intelligent"
// }
```

### Policy Control

Policies always override AI classification, giving you full control:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  mode: "intelligent",
  policies: {
    code: "anthropic",      // Always use Claude for code
    reasoning: "openai"     // Always use OpenAI for reasoning
    // Other tasks use AI classification
  }
});
```

### Precedence Order

In intelligent mode, the router uses this priority order:

1. `request.provider` - Explicit per-request override (highest)
2. `forceProvider` - Force all requests to one provider
3. `policies[task]` - Policy rules for specific tasks
4. **AI Classifier** - AI-powered task detection ⭐ NEW
5. `routes[task]` - Legacy static routes (fallback)
6. `defaultProvider` - Default fallback (lowest)

**Key insight:** In intelligent mode, the classifier **beats legacy routes**. In static modes (`cheap`, `balanced`, `best`), routes are used directly.

### Automatic Escalation

The router automatically detects quality issues and re-routes to a better provider:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  mode: "intelligent",
  escalation: {
    enabled: true,
    minLength: 100,          // Escalate if response < 100 tokens for "long" responses
    checkUncertainty: false  // Check for "I can't" patterns
  }
});

const result = await router.run({
  input: "Write a detailed explanation of quantum computing",
  json: true  // Request JSON output
});

// If JSON validation fails, automatically escalates to better provider
if (result.routing?.escalated) {
  console.log(`Escalated: ${result.routing.escalationReason}`);
  // "JSON validation failed (requested json: true but output is not valid JSON)"
}
```

### Classification Configuration

Control classification behavior:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  },
  mode: "intelligent",
  classification: {
    enabled: true,              // Enable/disable (default: true in intelligent mode)
    model: "gpt-4o-mini"       // Override classification model (default: gpt-4o-mini)
  }
});
```

### Transparency & Cost Tracking

Every response includes full routing metadata:

```javascript
const result = await router.run({
  input: "Summarize this article..."
});

console.log(result.routing);
// {
//   classifier: {
//     intent: "summarize",
//     complexity: "low",
//     risk: "none",
//     expectedLength: "short",
//     confidence: 0.92,
//     reasoning: "User requested summarization of content"
//   },
//   classifierTokens: 145,
//   classifierCost: 0.00008,
//   policyApplied: "classifier",
//   selectedProvider: "aibadgr",
//   reason: "AI classification: summarize (confidence: 0.92, complexity: low)",
//   escalated: false,
//   mode: "intelligent"
// }

// Total cost includes classification
console.log(`Classification: $${result.routing.classifierCost}`);
console.log(`Request: $${result.cost.estimatedUsd}`);
console.log(`Total: $${result.routing.classifierCost + result.cost.estimatedUsd}`);
```

### Force Provider

Override everything and route all requests to a specific provider:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  mode: "intelligent",
  forceProvider: "anthropic"  // All requests go to Claude (bypasses classification)
});
```

### Disable Classification/Escalation

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  },
  mode: "intelligent",
  classification: { enabled: false },  // Disable AI classification
  escalation: { enabled: false }       // Disable automatic escalation
});
```

### Migration from Static to Intelligent Mode

Existing code works unchanged. To migrate:

```javascript
// Before (static routing)
const router = createRouter({
  providers: { aibadgr: { apiKey: "..." } },
  mode: "balanced",
  routes: {
    code: "anthropic",
    reasoning: "openai"
  }
});

// After (intelligent routing)
const router = createRouter({
  providers: { aibadgr: { apiKey: "..." } },
  mode: "intelligent",       // Enable AI classification
  policies: {                // Rename "routes" to "policies"
    code: "anthropic",       // Policies override AI decisions
    reasoning: "openai"
  }
  // routes still work as fallback if classification is disabled
});
```

**Key differences:**
- Static modes: `routes` determine routing
- Intelligent mode: AI classifier determines routing, `policies` override it

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
  mode?: "cheap" | "balanced" | "best" | "intelligent",
  // cheap: all tasks → aibadgr
  // balanced: code → anthropic, reasoning → openai, rest → aibadgr
  // best: premium providers where available
  // intelligent: AI-powered classification (NEW)

  // Policy overrides (for intelligent mode)
  policies?: {
    summarize?: "aibadgr" | "openai" | "anthropic",
    rewrite?: "aibadgr" | "openai" | "anthropic",
    classify?: "aibadgr" | "openai" | "anthropic",
    extract?: "aibadgr" | "openai" | "anthropic",
    chat?: "aibadgr" | "openai" | "anthropic",
    code?: "aibadgr" | "openai" | "anthropic",
    reasoning?: "aibadgr" | "openai" | "anthropic",
    embeddings?: "aibadgr" | "openai",
  },

  // Force all requests to specific provider (bypasses everything)
  forceProvider?: "aibadgr" | "openai" | "anthropic",

  // Classification configuration (intelligent mode)
  classification?: {
    enabled?: boolean,        // default: true in intelligent mode
    model?: string,          // default: "gpt-4o-mini"
  },

  // Escalation configuration (intelligent mode)
  escalation?: {
    enabled?: boolean,        // default: true in intelligent mode
    minLength?: number,       // default: 100 (tokens)
    checkUncertainty?: boolean, // default: false
  },

  // Custom routing table (legacy, fallback for intelligent mode)
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
import { createRouter, ChatRunRequest, EmbeddingsRunRequest } from "@aibadgr/ai-task-router";
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
import { createRouter } from "@aibadgr/ai-task-router";

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
import { createRouter } from "@aibadgr/ai-task-router";

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

## 🆚 Comparison with Alternatives

| Feature | AI Task Router | LangChain | Direct OpenAI | Direct Anthropic |
|---------|---------------|-----------|---------------|------------------|
| Cost Optimization | ✅ Built-in | ❌ Manual | ❌ No | ❌ No |
| Multi-Provider | ✅ Yes | ✅ Yes | ❌ Single | ❌ Single |
| Automatic Fallback | ✅ Yes | ❌ Manual | ❌ No | ❌ No |
| Cost Tracking | ✅ Built-in | ❌ No | ❌ No | ❌ No |
| Bundle Size | 🟢 Small | 🔴 Large | 🟢 Small | 🟢 Small |
| Learning Curve | 🟢 Easy | 🟡 Medium | 🟢 Easy | 🟢 Easy |
| TypeScript | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Streaming | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| OpenAI Compatible | ✅ Yes | ❌ No | ✅ Yes | ❌ No |

**Why not just use LangChain?**
- LangChain is great for complex chains and agents, but it's heavy (100+ dependencies)
- AI Task Router focuses on one thing: intelligent, cost-effective routing
- If you need simple multi-provider support with automatic fallback, AI Task Router is lighter and faster

**Why not just use OpenAI directly?**
- You're locked into one provider (single point of failure)
- No automatic cost optimization
- No fallback handling for rate limits
- No cost tracking across different models

## 🏗️ How It Works

```
Your App → AI Task Router → [Intelligent Decision] → Best Provider
                                      ↓
                    ┌─────────────────┼─────────────────┐
                    ↓                 ↓                 ↓
              AI Badgr (cheap)   OpenAI GPT-4    Claude Sonnet
                $0.003/1K          $0.03/1K        $0.015/1K
                    ↓                 ↓                 ↓
                [Response] ← [Automatic Fallback if Error]
```

### Routing Logic

1. **Task Analysis**: Router examines the task type (chat, code, embeddings, etc.)
2. **Provider Selection**: Based on your routes config, selects optimal provider
3. **Cost Tracking**: Estimates cost based on token usage and provider pricing
4. **Execution**: Sends request to selected provider
5. **Fallback Handling**: If error, automatically tries next provider in chain
6. **Response**: Returns unified response format regardless of provider

## 🤝 Integrations & Use Cases

### Developer Tools
- ✅ **Continue** - Replace OpenAI endpoint in config
- ✅ **Cursor** - Use as custom AI provider
- ✅ **Cline** - Set as OpenAI-compatible endpoint
- ✅ **Aider** - Use as model provider

### Workflow Automation
- ✅ **n8n** - HTTP Request node with OpenAI-compatible format
- ✅ **Flowise** - Custom LLM provider
- ✅ **Zapier** - API integration
- ✅ **Make** - HTTP module integration

### Frameworks
- ✅ **LangChain** - Use as custom LLM
- ✅ **Vercel AI SDK** - Compatible provider
- ✅ **LlamaIndex** - Custom LLM integration
- ✅ **AutoGPT** - OpenAI-compatible endpoint

### Common Use Cases

**1. Customer Support Chatbot**
```javascript
// Route simple questions to cheap provider, complex to premium
const router = createRouter({
  providers: { aibadgr: {...}, openai: {...} },
  routes: {
    chat: "aibadgr",      // 90% of questions
    complex: "openai"      // 10% escalations
  }
});
```

**2. Code Review Assistant**
```javascript
// Use Claude for code, cheap provider for documentation
const router = createRouter({
  providers: { aibadgr: {...}, anthropic: {...} },
  routes: {
    code: "anthropic",           // Best for code
    documentation: "aibadgr"     // Good enough for docs
  }
});
```

**3. Content Generation Pipeline**
```javascript
// Batch process with cost tracking
const router = createRouter({
  providers: { aibadgr: {...} },
  hooks: {
    onSuccess: (result) => {
      analytics.track('content_generated', {
        cost: result.cost,
        tokens: result.usage.totalTokens
      });
    }
  }
});
```

## 📚 Additional Resources

- 📖 [Full Documentation](https://github.com/michaelbrinkworth/ai-task-router/tree/main/docs)
- 🎓 [Tutorials](https://github.com/michaelbrinkworth/ai-task-router/tree/main/docs/tutorials)
- 💡 [Examples](https://github.com/michaelbrinkworth/ai-task-router/tree/main/examples)
- 🔧 [API Reference](https://github.com/michaelbrinkworth/ai-task-router/blob/main/docs/spec.md)
- 🚀 [Quick Start Guide](https://github.com/michaelbrinkworth/ai-task-router/blob/main/docs/quick-start.md)

## 🌟 Community & Support

- ⭐ **Star us on GitHub** - Help others discover this project
- 🐛 **Report Issues** - [GitHub Issues](https://github.com/michaelbrinkworth/ai-task-router/issues)
- 💬 **Discussions** - [GitHub Discussions](https://github.com/michaelbrinkworth/ai-task-router/discussions)
- 📧 **Email** - support@aibadgr.com
- 🐦 **Twitter** - [@aibadgr](https://twitter.com/aibadgr)
- 💼 **LinkedIn** - [AI Badgr](https://linkedin.com/company/aibadgr)

## 🎯 Roadmap

- [ ] More provider integrations (Cohere, Hugging Face, Together AI)
- [ ] Smart caching to reduce duplicate requests
- [ ] Request queuing and rate limiting
- [ ] Advanced cost analytics dashboard
- [ ] Load balancing across multiple API keys
- [ ] Prompt optimization suggestions
- [ ] A/B testing for different providers
- [ ] WebSocket support for real-time streaming

## ⭐ Show Your Support

If AI Task Router saves you money or makes your life easier, please consider:

- ⭐ Starring the repo on GitHub
- 🐛 Reporting bugs or requesting features
- 📝 Writing about your experience
- 💬 Sharing with your network
- 🤝 Contributing code or documentation

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Support

- 📧 Email: support@aibadgr.com
- 🐛 Issues: [GitHub Issues](https://github.com/michaelbrinkworth/ai-task-router/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/michaelbrinkworth/ai-task-router/discussions)
- 📖 Docs: [aibadgr.com/docs](https://aibadgr.com/docs)
