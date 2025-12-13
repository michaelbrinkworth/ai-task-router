# Using @aibadgr/router with n8n

[n8n](https://n8n.io) is a workflow automation tool that connects apps and services.

## Setup

### Option 1: Import Workflow (Recommended)

1. Open n8n
2. Click **Import from File**
3. Select `workflow.json` from this folder
4. Configure your `AIBADGR_API_KEY` in the workflow credentials

### Option 2: Use Code Node

1. In your n8n workflow, add a **Code** node
2. Set the mode to **Run Once for All Items**
3. Paste the code from `code-node.js`
4. Add your API key to n8n credentials or environment variables

## What This Does

The example workflow demonstrates:

- **Multi-step AI tasks** with different providers per task
- **Cost tracking** across the entire workflow
- **Automatic fallback** if a provider fails
- **Parallel processing** of multiple AI requests

## Workflow Description

The included workflow:

1. **Input**: Receives a document or text
2. **Summarize**: Uses AI Badgr (cheap) to create a summary
3. **Extract Key Points**: Uses AI Badgr to extract bullet points
4. **Generate Code**: Uses Claude (if configured) for code generation
5. **Output**: Returns all results with cost breakdown

## Configuration

Edit the Code node to customize routing:

```javascript
const router = createRouter({
  providers: {
    aibadgr: { apiKey: $env.AIBADGR_API_KEY },
    // Optional premium providers
    // anthropic: { apiKey: $env.ANTHROPIC_API_KEY },
    // openai: { apiKey: $env.OPENAI_API_KEY }
  },
  routes: {
    summarize: "aibadgr",    // Cheap tasks → AI Badgr
    extract: "aibadgr",
    code: "anthropic",       // Code → Claude (or aibadgr if not configured)
    reasoning: "openai"      // Hard problems → GPT-4
  }
});
```

## Example Use Cases

- **Document processing**: Summarize → Extract → Classify
- **Content generation**: Research → Outline → Write → Edit
- **Data enrichment**: Parse → Analyze → Generate insights
- **Customer support**: Classify → Route → Generate response
- **Code automation**: Analyze → Generate → Test → Document

## Cost Comparison

Using @aibadgr/router vs. direct OpenAI for a typical 3-step workflow:

| Provider | Cost per Run | Monthly (1000 runs) |
|----------|--------------|---------------------|
| OpenAI only | ~$0.03 | ~$30 |
| AI Badgr only | ~$0.003 | ~$3 |
| **Smart routing** | ~$0.005 | ~$5 |

Smart routing = AI Badgr for simple tasks, Claude/GPT for complex ones.

## Tips

- Use **batch processing** with n8n's split/merge nodes for parallel AI requests
- Set up **error handling** with n8n's error workflow to capture fallback events
- Use **webhook triggers** to expose your AI workflow as an API
- Add **logging** to track costs and performance over time
