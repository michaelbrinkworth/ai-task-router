# Using @aibadgr/router with Flowise

[Flowise](https://flowiseai.com) is an open-source UI for building LLM flows with a drag-and-drop interface.

## Setup

### Option 1: Import Chatflow (Recommended)

1. Open Flowise
2. Click **Import Chatflow**
3. Select `chatflow.json` from this folder
4. Configure your API keys in the imported nodes

### Option 2: Custom Function Node

1. In your Flowise chatflow, add a **Custom Function** node
2. Paste the code from `custom-function.js`
3. Connect it to your input/output nodes
4. Add your `AIBADGR_API_KEY` to Flowise credentials

## What This Does

The example chatflow demonstrates:

- **Cost-optimized routing** - defaults to AI Badgr, upgrades to premium providers as needed
- **Multi-provider support** - seamlessly switch between AI Badgr, OpenAI, and Claude
- **Automatic fallback** - handle rate limits and errors without user intervention
- **Real-time cost tracking** - see exactly how much each conversation costs

## Chatflow Description

The included chatflow is a conversational agent that:

1. **Receives user input** via the chat interface
2. **Routes to appropriate provider** based on task complexity
3. **Falls back automatically** if primary provider fails
4. **Tracks and displays cost** for each interaction

## Configuration

### Basic Setup (AI Badgr only)

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: "your-aibadgr-api-key" }
  }
});
```

### Advanced Setup (Multi-provider)

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    chat: "aibadgr",        // Default conversations → AI Badgr
    code: "anthropic",      // Code tasks → Claude
    reasoning: "openai"     // Complex reasoning → GPT-4
  },
  fallback: {
    chat: ["aibadgr", "openai", "anthropic"]
  }
});
```

## Example Use Cases

### Customer Support Bot
- Use AI Badgr for 90% of queries (cheap, fast)
- Escalate complex issues to GPT-4 (smart routing)
- Automatic fallback ensures 99.9% uptime

### Document Q&A
- Embedding generation with AI Badgr (cost-effective)
- Answer generation with smart routing
- Track costs per query

### Multi-Agent System
- Different agents use different providers
- Coordinator routes tasks intelligently
- Fallback prevents single provider lock-in

## Integration Tips

### With Flowise Memory
```javascript
// In custom function node
const router = createRouter({ /* config */ });

const result = await router.run({
  task: "chat",
  messages: $flow.chatHistory, // Use Flowise chat history
  input: $input
});

return result.outputText;
```

### With Flowise Tools
```javascript
// Use router for tool selection
const toolResult = await router.run({
  task: "reasoning",
  input: `Given these tools: ${tools}, which one should I use for: ${userQuery}`
});
```

### With Flowise Document Loaders
```javascript
// Process loaded documents
const summary = await router.run({
  task: "summarize",
  input: $flow.documents.join("\n"),
  maxTokens: 500
});
```

## Cost Comparison

For a typical chatbot with 1000 messages/day:

| Setup | Daily Cost | Monthly Cost |
|-------|------------|--------------|
| OpenAI only | ~$3.00 | ~$90 |
| AI Badgr only | ~$0.30 | ~$9 |
| **Smart routing** | ~$0.50 | ~$15 |

Smart routing = AI Badgr for simple questions, OpenAI for complex ones.

## Environment Variables

Add these to your Flowise `.env` file:

```bash
AIBADGR_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here      # Optional
ANTHROPIC_API_KEY=your-key-here    # Optional
```

## Troubleshooting

**Issue**: "Cannot find module '@aibadgr/router'"
**Solution**: Install in Flowise's node_modules:
```bash
cd /path/to/flowise
npm install @aibadgr/router
```

**Issue**: "API key not found"
**Solution**: Set environment variables in Flowise settings or `.env` file

**Issue**: "Provider not configured"
**Solution**: Check that API keys are correctly set for all providers you're trying to use
