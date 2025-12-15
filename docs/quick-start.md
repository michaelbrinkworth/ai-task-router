# Quick Start Guide

Get started with `@aibadgr/router` in 2 minutes.

## Installation

```bash
npm install @aibadgr/router
```

## Your First Request

```javascript
import { createRouter } from "@aibadgr/router";

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
// Output: "Hello! How can I help you today?"
```

**That's it!** You're now using an OpenAI-compatible LLM router that's 10x cheaper than OpenAI.

## What Just Happened?

- ✅ Router created with AI Badgr (OpenAI-compatible, much cheaper)
- ✅ Request routed automatically
- ✅ Fallback enabled (if provider has issues, it retries)
- ✅ No configuration needed

## Next Steps

<details>
<summary><b>Before You Go Further</b> (prerequisites)</summary>

Make sure you have:
- **Node.js 18+** installed (`node --version` to check)
- **AI Badgr API key** from [aibadgr.com](https://aibadgr.com) (free tier available)

</details>

## Common Use Cases

### Different Task Types

```javascript
// Summarization
const summary = await router.run({
  task: "summarize",
  input: "Your long text here..."
});

// Code generation
const code = await router.run({
  task: "code",
  input: "Write a function to reverse a string"
});

// Classification
const category = await router.run({
  task: "classify",
  input: "Is this email spam or not spam?"
});
```

**Available tasks**: `chat`, `summarize`, `rewrite`, `classify`, `extract`, `code`, `reasoning`, `embeddings`

<details>
<summary><b>Advanced: Streaming Responses</b></summary>

```javascript
const stream = await router.chat({
  stream: true,
  input: "Tell me a story"
});

for await (const chunk of stream) {
  process.stdout.write(chunk.deltaText ?? "");
}
```

</details>

<details>
<summary><b>Advanced: Multiple Providers with Routing</b></summary>

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic" // Use Claude for code tasks
  }
});
```

</details>

<details>
<summary><b>Advanced: JSON Output & Embeddings</b></summary>

```javascript
// JSON output
const response = await router.run({
  task: "extract",
  input: "John Doe is 30 years old",
  json: true
});

// Embeddings
const embeddings = await router.embed({
  task: "embeddings",
  input: ["Hello", "World"]
});
```

</details>

<details>
<summary><b>Advanced: Fallback & Monitoring</b></summary>

```javascript
// Automatic fallback
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY }
  },
  fallback: {
    chat: ["aibadgr", "openai"] // Retry with OpenAI if aibadgr fails
  }
});

// Monitor performance
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  },
  onResult: (event) => {
    console.log(`✓ Cost: $${event.cost?.estimatedUsd}`);
  }
});
```

</details>

## Want More?

**For detailed examples and advanced features**, see:
- [Full API Documentation](../README.md#api-reference)
- [Tutorial: Routing Basics](./tutorials/02-routing-basics.md)
- [Examples Directory](../examples/)

<details>
<summary><b>Reference: All Configuration Options</b></summary>

## Routing Modes

```javascript
// Modes
mode: "cheap"     // All → aibadgr (default)
mode: "balanced"  // Smart routing (code → anthropic, reasoning → openai)
mode: "best"      // Premium everywhere

// Custom routes
routes: {
  code: "anthropic",
  reasoning: "openai"
}

// Fallback chains
fallback: {
  chat: ["aibadgr", "openai"]
}

// Timeouts & retries
timeoutMs: 30000
maxRetries: 2

// Event hooks
onResult: (event) => { /* track success */ }
onError: (event) => { /* handle errors */ }
```

For complete configuration reference, see [Full README](../README.md#configuration).

</details>

## Direct HTTP API (Optional)

<details>
<summary><b>Using AI Badgr without the router</b></summary>

AI Badgr exposes an **OpenAI-compatible HTTP API**:

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
```

Full code examples available in [examples/](../examples/) directory.

</details>
