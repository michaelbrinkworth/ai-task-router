# Using @aibadgr/router with Continue

[Continue](https://continue.dev) is an open-source AI code assistant for VS Code and JetBrains.

## Setup

### 1. Install the package

```bash
npm install @aibadgr/router
```

### 2. Configure Continue

Add to your `~/.continue/config.json`:

```json
{
  "models": [
    {
      "title": "AI Badgr Router",
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "apiBase": "http://localhost:3000/v1",
      "apiKey": "not-needed"
    }
  ]
}
```

### 3. Run the proxy server

```bash
node proxy-server.js
```

This starts an OpenAI-compatible server on `localhost:3000` that routes through @aibadgr/router.

### 4. Use in Continue

Now Continue will route all requests through your router, using:
- **AI Badgr** for most tasks (10x cheaper)
- **Claude** for code generation (if configured)
- **GPT-4** for complex reasoning (if configured)

All with automatic fallback and cost tracking!

## Configuration

Edit `proxy-server.js` to customize routing:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "anthropic",  // Use Claude for code
    chat: "aibadgr"     // Use AI Badgr for chat
  }
});
```

## Alternative: Direct Integration

If you're building a custom Continue extension, you can use @aibadgr/router directly:

```typescript
import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY }
  }
});

// In your Continue extension
async function getCompletion(prompt: string) {
  const result = await router.run({
    task: "code",
    input: prompt
  });
  return result.outputText;
}
```
