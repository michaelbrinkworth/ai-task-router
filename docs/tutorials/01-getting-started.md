# Getting Started with @aibadgr/router

Welcome! This tutorial will help you get started with `@aibadgr/router` from absolute scratch.

## What You'll Learn

- How to install and set up the router
- How to make your first LLM request
- Understanding task types
- Basic configuration options

## Prerequisites

- **Node.js 18+** installed on your machine
- A text editor (VS Code, Sublime, etc.)
- 5-10 minutes of your time

## Step 1: Get Your API Key

1. Go to [aibadgr.com](https://aibadgr.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key and copy it

## Step 2: Create a New Project

```bash
# Create a new directory
mkdir my-llm-project
cd my-llm-project

# Initialize npm
npm init -y

# Set type to module in package.json
npm pkg set type="module"

# Install the router
npm install @aibadgr/router
```

## Step 3: Create Your First Script

Create a file called `index.js`:

```javascript
import { createRouter } from "@aibadgr/router";

// Create a router with your API key
const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: "your-api-key-here" // Replace with your actual key
    }
  }
});

// Make your first request
async function main() {
  const result = await router.run({
    task: "chat",
    input: "What is the capital of France?"
  });

  console.log("Answer:", result.outputText);
  console.log("Cost:", "$" + result.cost?.estimatedUsd?.toFixed(6));
  console.log("Time:", result.latencyMs + "ms");
}

main().catch(console.error);
```

## Step 4: Run It!

```bash
node index.js
```

You should see output like:

```
Answer: The capital of France is Paris.
Cost: $0.000123
Time: 523ms
```

## Step 5: Use Environment Variables (Recommended)

Instead of hard-coding your API key, use environment variables:

1. Install dotenv:

```bash
npm install dotenv
```

2. Create a `.env` file:

```bash
AIBADGR_API_KEY=your-api-key-here
```

3. Update your `index.js`:

```javascript
import 'dotenv/config';
import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY
    }
  }
});

// ... rest of code
```

4. Add `.env` to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

## Step 6: Try Different Task Types

The router supports 8 task types. Try them:

```javascript
// Summarization
const summary = await router.run({
  task: "summarize",
  input: "Long article text here..."
});

// Code generation
const code = await router.run({
  task: "code",
  input: "Write a function to reverse a string"
});

// Classification
const classification = await router.run({
  task: "classify",
  input: "This movie was terrible! | positive or negative?"
});

// Information extraction
const extraction = await router.run({
  task: "extract",
  input: "John Doe, 30 years old, lives in NYC"
});
```

## Step 7: Add Configuration Options

Customize the router behavior:

```javascript
const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY
    }
  },
  
  // Set timeout (default: 60 seconds)
  timeoutMs: 30000,
  
  // Set max retries (default: 1)
  maxRetries: 2,
  
  // Monitor requests
  onResult: (event) => {
    console.log(`✓ ${event.task} completed in ${event.latencyMs}ms`);
  },
  
  onError: (event) => {
    console.error(`✗ ${event.task} failed:`, event.error);
  }
});
```

## Common Mistakes to Avoid

1. **Don't hard-code API keys** - Always use environment variables
2. **Don't forget to await** - Router methods are async
3. **Don't ignore errors** - Always use try/catch or .catch()
4. **Don't use invalid task types** - Only 8 task types are valid

## What's Next?

Now that you've got the basics, explore:

- [Tutorial 2: Routing Basics](./02-routing-basics.md) - Learn how routing works
- [Tutorial 3: Fallback Strategies](./03-fallback-strategies.md) - Handle errors gracefully
- [Tutorial 4: Cost Optimization](./04-cost-optimization.md) - Save money on API calls
- [Full API Reference](../../README.md#api-reference) - Complete documentation

## Need Help?

- Check the [Troubleshooting Guide](../../README.md#troubleshooting)
- Read the [Common Mistakes](../../README.md#common-mistakes)
- Ask in [GitHub Discussions](https://github.com/michaelbrinkworth/ai-task-router/discussions)
- Open an [Issue](https://github.com/michaelbrinkworth/ai-task-router/issues)

## Quick Reference

```javascript
// Basic usage
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});

const result = await router.run({
  task: "chat",      // Task type
  input: "Hello",    // Your prompt
  maxTokens: 100,    // Optional: limit response length
  temperature: 0.7   // Optional: control randomness
});

console.log(result.outputText);  // The response
console.log(result.cost);        // Cost info
console.log(result.provider);    // Which provider was used
```

Congratulations! You're now ready to build with @aibadgr/router. 🎉
