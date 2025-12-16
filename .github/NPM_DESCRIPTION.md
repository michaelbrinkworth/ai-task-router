# AI Task Router - NPM Package Description

## Short Description (for NPM)
Intelligent LLM routing library for OpenAI, Anthropic Claude, and AI Badgr. Cost-optimized AI agent router with automatic fallback, streaming support, and built-in cost tracking.

## Full Description

AI Task Router is a powerful, production-ready routing library that intelligently distributes your AI requests across multiple providers (OpenAI GPT-4, Anthropic Claude, AI Badgr) to optimize costs while maintaining quality. Save up to 80% on AI API costs through intelligent task-based routing.

### Key Features

**Cost Optimization**
Automatically route simple tasks to cost-effective providers and complex tasks to premium models. Real-world savings of $27,000/month for high-volume applications.

**Automatic Fallback**
Never worry about rate limits, timeouts, or API outages. Built-in fallback chains ensure your application stays online even when providers fail.

**OpenAI Compatible**
Drop-in replacement for OpenAI API. Works seamlessly with Continue, Cursor, Cline, Aider, n8n, Flowise, and any OpenAI-compatible tool.

**Full TypeScript Support**
Type-safe API with complete TypeScript definitions. Includes streaming support for real-time responses.

**Zero Configuration**
Get started with just one API key. Expand to multi-provider setup when needed.

**Built-in Cost Tracking**
Monitor exactly how much each request costs across all providers. Perfect for budgeting and optimization.

### Perfect For

- **AI Agents & Assistants** - Multi-step workflows with cost optimization
- **Chatbots & Customer Support** - High-volume conversations at affordable prices
- **Workflow Automation** - n8n, Flowise, Zapier integrations
- **Developer Tools** - Continue, Cline, Cursor, Aider extensions
- **Data Processing** - Batch operations, summarization, classification
- **Educational Apps** - Cost-effective AI tutoring and learning

### Quick Start

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

### Supported Providers

- **AI Badgr** - Cost-effective OpenAI-compatible provider (10x cheaper)
- **OpenAI** - GPT-4, GPT-3.5, GPT-4 Turbo, and more
- **Anthropic** - Claude 3 Opus, Sonnet, and Haiku

### Why Choose AI Task Router?

Unlike LangChain (which is great but heavy with 100+ dependencies), AI Task Router focuses on one thing: intelligent, cost-effective routing. If you need simple multi-provider support with automatic fallback and cost optimization, AI Task Router is lighter, faster, and easier to use.

Unlike using OpenAI directly, you get:
- No vendor lock-in (multi-provider support)
- Automatic cost optimization
- Built-in fallback handling for rate limits
- Cost tracking across different models
- Production-ready error handling

### Use Cases

**Customer Support Chatbot**
Route simple questions to cheap providers, escalate complex issues to premium models. Save 80%+ on API costs.

**Code Review Assistant**
Use Claude for code analysis (best quality), cheap providers for documentation. Optimize for both quality and cost.

**Content Generation Pipeline**
Batch process thousands of requests with automatic cost tracking and provider fallback.

### Integration Examples

**Continue/Cursor/Cline**
```json
{
  "models": [{
    "title": "AI Task Router",
    "provider": "openai",
    "apiBase": "http://localhost:3000"
  }]
}
```

**n8n Workflow**
Use HTTP Request node with OpenAI-compatible format. Point to your AI Task Router endpoint.

**Flowise**
Add as custom LLM provider in Flowise configuration.

### Technical Details

- **Bundle Size**: < 100KB
- **Dependencies**: 2 (openai, @anthropic-ai/sdk)
- **Node Version**: >= 18.0.0
- **TypeScript**: Full support with type definitions
- **License**: MIT
- **Testing**: Comprehensive test coverage with Vitest

### Documentation

- Full API documentation
- Quick start guide
- Integration tutorials
- Example code for all use cases
- Migration guides

### Support

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Community support
- Email: support@aibadgr.com
- Documentation: Complete API reference and guides

### Keywords for Search

ai, llm, router, openai, anthropic, claude, gpt-4, gpt-3.5, chatgpt, cost-optimization, cost-tracking, ai-agents, workflow-automation, chatbot, nodejs, typescript, javascript, streaming, embeddings, fallback, error-handling, rate-limiting, multi-provider, api-gateway, llm-proxy, ai-middleware, developer-tools, n8n, flowise, langchain, continue, cline, cursor, aider, machine-learning, nlp, natural-language-processing, text-generation, code-generation

---

**Save 80%+ on AI costs. Install now:**
```bash
npm install @aibadgr/ai-task-router
```

**GitHub**: https://github.com/michaelbrinkworth/ai-task-router
**Documentation**: https://github.com/michaelbrinkworth/ai-task-router/tree/main/docs
**License**: MIT
