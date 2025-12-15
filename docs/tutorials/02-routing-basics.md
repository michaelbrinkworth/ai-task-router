# Tutorial 2: Routing Basics

Learn how the router intelligently routes requests to different LLM providers based on task type.

## What You'll Learn

- How routing works
- Task-based routing configuration
- Routing modes (cheap, balanced, best)
- Explicit provider override

## How Routing Works

The router selects a provider in this order:

1. **Explicit override** - If you specify `provider` in the request
2. **Task-based routing** - If you configured `routes` for the task
3. **Mode defaults** - If you set a `mode`
4. **Default provider** - Falls back to `aibadgr`

## Default Routing Behavior

Without any configuration, here's how tasks route:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});

// All tasks → aibadgr
await router.run({ task: "chat", input: "..." });      // → aibadgr
await router.run({ task: "code", input: "..." });      // → aibadgr
await router.run({ task: "summarize", input: "..." }); // → aibadgr
```

## Custom Task-Based Routing

Route specific tasks to specific providers:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic",      // Claude for code → $0.003/request
    reasoning: "openai",    // GPT-4 for reasoning → $0.01/request
    // Everything else → aibadgr → $0.0001/request
  }
});

// Routing in action
await router.run({ task: "code", input: "..." });      // → anthropic
await router.run({ task: "reasoning", input: "..." }); // → openai
await router.run({ task: "chat", input: "..." });      // → aibadgr (default)
```

## Routing Modes

Use quick presets for common routing strategies:

### Cheap Mode (Default)

Everything goes to aibadgr for maximum cost savings:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  },
  mode: "cheap"
});

// All tasks → aibadgr
```

### Balanced Mode

Premium providers for specialized tasks, aibadgr for the rest:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  mode: "balanced"
});

// code → anthropic (if configured, else aibadgr)
// reasoning → openai (if configured, else aibadgr)
// everything else → aibadgr
```

### Best Mode

Use premium providers wherever available:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  mode: "best"
});

// code → anthropic
// reasoning → openai
// chat → anthropic
// everything else → aibadgr
```

## Explicit Provider Override

Override routing for a specific request:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY }
  },
  routes: {
    chat: "aibadgr" // Default routing
  }
});

// Use default routing (aibadgr)
await router.run({
  task: "chat",
  input: "Hello"
});

// Override to use OpenAI for this specific request
await router.run({
  task: "chat",
  input: "Hello",
  provider: "openai" // Explicit override
});
```

## Viewing Current Routes

Check how your router is configured:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic"
  }
});

const config = router.getConfig();
console.log("Providers:", config.providers); // ["aibadgr", "anthropic"]
console.log("Routes:", config.routes);        // { code: "anthropic" }
console.log("Default:", config.defaultProvider); // "aibadgr"
```

## Cost-Optimized Routing Strategy

Here's a recommended strategy for cost optimization:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },    // 10x cheaper
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY } // Premium for code
  },
  routes: {
    code: "anthropic",      // Use best for code generation
    // All other tasks use cheap aibadgr
  }
});

// Cost breakdown:
// - Code generation: ~$0.003 per request (anthropic)
// - Everything else: ~$0.0001 per request (aibadgr)
// - 10x savings on 90% of requests!
```

## Quality-Focused Routing Strategy

When quality matters more than cost:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  mode: "best",
  // Or explicitly:
  routes: {
    chat: "anthropic",
    code: "anthropic",
    reasoning: "openai",
    summarize: "aibadgr", // Simple tasks still use cheap provider
    classify: "aibadgr"
  }
});
```

## Dynamic Routing

Change routing at runtime using `withOverrides()`:

```javascript
const baseRouter = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY }
  },
  mode: "cheap"
});

// Create a variant for important requests
const premiumRouter = baseRouter.withOverrides({
  routes: {
    chat: "openai",
    code: "openai"
  }
});

// Use cheap router for normal requests
await baseRouter.run({ task: "chat", input: "..." }); // → aibadgr

// Use premium router for important requests
await premiumRouter.run({ task: "chat", input: "..." }); // → openai
```

## Common Routing Patterns

### 1. Development vs Production

```javascript
const mode = process.env.NODE_ENV === "production" ? "balanced" : "cheap";

const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY }
  },
  mode
});
```

### 2. User Tier-Based Routing

```javascript
function getRouter(userTier) {
  const config = {
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
      openai: { apiKey: process.env.OPENAI_API_KEY }
    }
  };

  if (userTier === "premium") {
    config.mode = "best";
  } else {
    config.mode = "cheap";
  }

  return createRouter(config);
}
```

### 3. Load Balancing

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY }
  },
  fallback: {
    chat: ["aibadgr", "openai"] // Try aibadgr first, fallback to openai
  }
});
```

## Best Practices

1. **Start cheap** - Use `mode: "cheap"` and optimize later
2. **Route strategically** - Only use premium providers where needed
3. **Monitor costs** - Use `onResult` hook to track spending
4. **Test routing** - Use `getConfig()` to verify your setup
5. **Don't over-route** - Fewer routes = simpler = better

## What's Next?

- [Tutorial 3: Fallback Strategies](./03-fallback-strategies.md) - Handle errors gracefully
- [Tutorial 4: Cost Optimization](./04-cost-optimization.md) - Advanced cost-saving techniques
- [API Reference](../../README.md#configuration) - Full configuration options

## Quick Reference

```javascript
// Task-based routing
routes: {
  code: "anthropic",
  reasoning: "openai",
  // rest → defaultProvider
}

// Routing modes
mode: "cheap"    // All → aibadgr
mode: "balanced" // Smart routing
mode: "best"     // Premium where available

// Explicit override
provider: "openai" // Force specific provider

// View configuration
router.getConfig()

// Create variant
router.withOverrides({ routes: {...} })
```
