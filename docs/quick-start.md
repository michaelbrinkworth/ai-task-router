# Quick Start Guide

Get started with `@aibadgr/router` in 5 minutes.

## Before You Start

Make sure you have:

- [ ] **Node.js 18+** installed (`node --version` to check)
- [ ] **AI Badgr API key** from [aibadgr.com](https://aibadgr.com) (free tier available)
- [ ] Basic understanding of the 8 task types:
  - `summarize` - Text summarization
  - `rewrite` - Rewriting/paraphrasing
  - `classify` - Classification tasks
  - `extract` - Information extraction
  - `chat` - General conversation
  - `code` - Code generation/analysis
  - `reasoning` - Complex reasoning
  - `embeddings` - Vector embeddings
- [ ] (Optional) OpenAI and/or Anthropic API keys if you want multi-provider routing

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

## AI Badgr OpenAI-Compatible HTTP API (Optional)

If you want to call AI Badgr **directly over HTTP** (without the router), it exposes an **OpenAI-compatible API**.

- **Base URL (production)**: `https://aibadgr.com/api/v1`
- **Auth headers** (either works):
  - `Authorization: Bearer YOUR_API_KEY`
  - `x-api-key: YOUR_API_KEY`

### Chat Completions

- **Endpoint**: `POST /chat/completions`
- **Purpose**: Drop-in replacement for `https://api.openai.com/v1/chat/completions`

**Example: cURL**

```bash
curl https://aibadgr.com/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain AI Badgr in one sentence."}
    ],
    "max_tokens": 128,
    "temperature": 0.7
  }'
```

**Example: Python (OpenAI SDK)**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://aibadgr.com/api/v1",
    api_key="YOUR_API_KEY",
)

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain AI Badgr in one sentence."},
    ],
    max_tokens=128,
    temperature=0.7,
)

print(resp.choices[0].message.content)
```

**Example: Node / JS (fetch)**

```javascript
const resp = await fetch("https://aibadgr.com/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.AIBADGR_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Explain AI Badgr in one sentence." },
    ],
    max_tokens: 128,
    temperature: 0.7,
  }),
});

const data = await resp.json();
console.log(data.choices[0].message.content);
```

### Embeddings

- **Endpoint**: `POST /embeddings`
- **Purpose**: Drop-in replacement for `https://api.openai.com/v1/embeddings`

```bash
curl https://aibadgr.com/api/v1/embeddings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type": "application/json" \
  -d '{
    "model": "ai-badgr-embedding",
    "input": "The quick brown fox jumps over the lazy dog."
  }'
```

The response shape matches OpenAI’s embeddings API (`object: "list"`, `data[0].embedding`, `usage`, etc.), so any OpenAI-compatible client or vector DB integration should work with just a **base URL swap**.

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

## Common Patterns

### Simple Chat Bot

```javascript
import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});

async function chatBot(userMessage) {
  const response = await router.chat({ input: userMessage });
  return response.outputText;
}

// Usage
const reply = await chatBot("What's the weather like?");
console.log(reply);
```

### Code Generation with Fallback

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic" // Prefer Claude for code
  },
  fallback: {
    code: ["anthropic", "aibadgr"] // Fallback to AI Badgr if Claude fails
  }
});

async function generateCode(prompt) {
  try {
    const result = await router.run({
      task: "code",
      input: prompt,
      maxTokens: 2000
    });
    
    console.log(`Generated by: ${result.provider}`);
    console.log(`Cost: $${result.cost?.estimatedUsd?.toFixed(6)}`);
    return result.outputText;
    
  } catch (error) {
    console.error("All providers failed:", error.attempts);
    throw error;
  }
}

const code = await generateCode("Write a function to reverse a string");
```

### Batch Processing Multiple Tasks

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});

async function processBatch(texts) {
  const results = await Promise.all(
    texts.map(text => 
      router.run({
        task: "summarize",
        input: text,
        maxTokens: 100
      })
    )
  );
  
  return results.map(r => ({
    summary: r.outputText,
    cost: r.cost?.estimatedUsd
  }));
}

const summaries = await processBatch([
  "Long article 1...",
  "Long article 2...",
  "Long article 3..."
]);

const totalCost = summaries.reduce((sum, s) => sum + (s.cost || 0), 0);
console.log(`Processed ${summaries.length} texts for $${totalCost.toFixed(4)}`);
```

### Cost Monitoring Setup

```javascript
class CostTracker {
  constructor() {
    this.costs = [];
    this.totalSpent = 0;
  }

  createRouter() {
    return createRouter({
      providers: {
        aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
        openai: { apiKey: process.env.OPENAI_API_KEY }
      },
      onResult: (event) => {
        const cost = event.cost?.estimatedUsd || 0;
        this.totalSpent += cost;
        this.costs.push({
          timestamp: new Date(),
          task: event.task,
          provider: event.provider,
          cost,
          latency: event.latencyMs
        });
        
        console.log(`[${event.task}] ${event.provider}: $${cost.toFixed(6)} (${event.latencyMs}ms)`);
      }
    });
  }

  getStats() {
    return {
      totalSpent: this.totalSpent,
      requestCount: this.costs.length,
      averageCost: this.totalSpent / this.costs.length,
      byProvider: this.groupByProvider(),
      byTask: this.groupByTask()
    };
  }

  groupByProvider() {
    return this.costs.reduce((acc, c) => {
      acc[c.provider] = (acc[c.provider] || 0) + c.cost;
      return acc;
    }, {});
  }

  groupByTask() {
    return this.costs.reduce((acc, c) => {
      acc[c.task] = (acc[c.task] || 0) + c.cost;
      return acc;
    }, {});
  }
}

// Usage
const tracker = new CostTracker();
const router = tracker.createRouter();

// ... make requests ...

console.log("Cost Stats:", tracker.getStats());
// {
//   totalSpent: 0.0123,
//   requestCount: 45,
//   averageCost: 0.000273,
//   byProvider: { aibadgr: 0.008, openai: 0.0043 },
//   byTask: { chat: 0.006, code: 0.0063 }
// }
```

## What's Next?

Now that you've got the basics, explore these resources:

### Core Documentation
- **[Full API Reference](../README.md#api-reference)** - Complete method documentation
- **[Configuration Options](../README.md#configuration)** - All config parameters explained
- **[Spec Document](./spec.md)** - Implementation details and behavior

### Examples & Integrations
- **[Basic Examples](../examples/)** - Streaming, embeddings, routing demos
- **[n8n Workflow Integration](../examples/n8n/)** - Use in n8n workflows
- **[Flowise Chatflow Integration](../examples/flowise/)** - Add to Flowise chatbots
- **[Continue.dev Integration](../examples/continue/)** - Proxy server for Continue IDE extension

### Advanced Topics
- **[Error Handling](../README.md#error-handling--fallback)** - Fallback strategies
- **[Cost Optimization](../README.md#performance-tips)** - Save money on API calls
- **[Troubleshooting](../README.md#troubleshooting)** - Common issues and solutions
- **[Migration Guides](../README.md#migration-guides)** - Switch from OpenAI/Anthropic

### Community & Support
- **[GitHub Discussions](https://github.com/michaelbrinkworth/ai-task-router/discussions)** - Ask questions
- **[GitHub Issues](https://github.com/michaelbrinkworth/ai-task-router/issues)** - Report bugs
- **[AI Badgr Docs](https://aibadgr.com/docs)** - Provider documentation

## Getting Help

- Open an issue: [GitHub Issues](https://github.com/michaelbrinkworth/ai-task-router/issues)
- Start a discussion: [GitHub Discussions](https://github.com/michaelbrinkworth/ai-task-router/discussions)
- Read the docs: [aibadgr.com/docs](https://aibadgr.com/docs)
