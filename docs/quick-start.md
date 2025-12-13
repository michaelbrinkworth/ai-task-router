# Quick Start Guide

Get started with `@aibadgr/router` in 5 minutes.

## Installation

```bash
npm install @aibadgr/router
```

## Minimal Setup

```javascript
import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY,
    },
  },
});

// Make a request
const result = await router.run({
  task: "chat",
  input: "Hello, world!",
});

console.log(result.outputText);
```

## Common Use Cases

### 1. Simple Chat

```javascript
const response = await router.chat({
  input: "What is the capital of France?",
});

console.log(response.outputText);
// Output: "The capital of France is Paris."
```

### 2. Streaming Response

```javascript
const stream = await router.chat({
  stream: true,
  input: "Tell me a story",
});

for await (const chunk of stream) {
  process.stdout.write(chunk.deltaText ?? "");
}
```

### 3. Task-Specific Routing

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  },
  routes: {
    code: "anthropic", // Route code tasks to Claude
  },
});

const codeResponse = await router.run({
  task: "code",
  input: "Write a function to sort an array",
});
```

### 4. Generate Embeddings

```javascript
const embeddings = await router.embed({
  task: "embeddings",
  input: ["Hello", "World"],
});

console.log(embeddings.vectors); // [[0.1, 0.2, ...], [0.3, 0.4, ...]]
```

### 5. JSON Output

```javascript
const response = await router.run({
  task: "extract",
  input: "John Doe is 30 years old and lives in NYC",
  json: true,
});

const data = JSON.parse(response.outputText);
// { name: "John Doe", age: 30, city: "NYC" }
```

### 6. Multiple Providers with Fallback

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
  },
  fallback: {
    chat: ["aibadgr", "openai"], // Try aibadgr first, fallback to OpenAI
  },
});
```

### 7. Monitor Performance

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
  },
  onResult: (event) => {
    console.log(`✓ ${event.task} completed in ${event.latencyMs}ms`);
    console.log(`  Cost: $${event.cost?.estimatedUsd?.toFixed(4)}`);
  },
  onError: (event) => {
    console.error(`✗ ${event.task} failed: ${event.error}`);
  },
});
```

### 8. Customize Timeouts

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
  },
  timeoutMs: 30000, // 30 seconds
  maxRetries: 2,    // Retry up to 2 times
});
```

## Routing Modes

### Cheap Mode (Default)

Everything goes to AI Badgr for maximum cost savings:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
  },
  mode: "cheap",
});
```

### Balanced Mode

Use premium providers for specialized tasks:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  },
  mode: "balanced",
});
// code → anthropic
// reasoning → openai
// everything else → aibadgr
```

### Best Mode

Use premium providers wherever available:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  },
  mode: "best",
});
// chat, code → anthropic
// reasoning → openai
// embeddings → aibadgr
```

## Environment Variables

Instead of passing keys directly, use environment variables:

```bash
# .env file
AIBADGR_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

Then in your code:

```javascript
const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  },
});
```

## All Task Types

```javascript
const tasks = [
  "summarize",  // Text summarization
  "rewrite",    // Rewriting/paraphrasing
  "classify",   // Classification
  "extract",    // Information extraction
  "chat",       // General conversation
  "code",       // Code generation
  "reasoning",  // Complex reasoning
  "embeddings", // Vector embeddings
];
```

## Next Steps

- Read the [full README](../README.md) for detailed API documentation
- Check out [examples](../examples/) for more code samples
- Read the [specification](./spec.md) for implementation details

## Getting Help

- Open an issue: [GitHub Issues](https://github.com/michaelbrinkworth/ai-task-router/issues)
- Read the docs: [aibadgr.com/docs](https://aibadgr.com/docs)
