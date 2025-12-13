# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-13

### Added

#### Core Features
- Task-based LLM router with AI Badgr as default provider
- Support for OpenAI and Anthropic (Claude) providers
- 8 task types: summarize, rewrite, classify, extract, chat, code, reasoning, embeddings
- Automatic fallback on rate limits, timeouts, and server errors
- Configurable retry logic with exponential backoff
- Streaming support for chat completions
- Cost estimation with built-in price tables
- Event hooks (onResult, onError) for monitoring

#### Routing & Configuration
- Three routing modes: "cheap", "balanced", "best"
- Custom routing table per task
- Custom fallback chains per task
- Configurable timeouts and max retries
- Support for provider-specific configurations
- Environment variable support

#### Provider Adapters
- AI Badgr provider (OpenAI-compatible)
- OpenAI provider with native SDK
- Anthropic provider with native SDK
- Streaming support for all providers
- JSON mode support
- Embeddings support (AI Badgr and OpenAI)

#### Developer Experience
- Full TypeScript support with type definitions
- ESM and CommonJS builds
- Comprehensive API documentation
- 4 usage examples (basic, routing, streaming, embeddings)
- Language-neutral specification for cross-language ports
- 31 unit tests with 100% pass rate

#### Documentation
- Detailed README with API reference
- Examples directory with runnable code
- Language-neutral spec in docs/spec.md
- Inline code documentation

### Technical Details
- Node.js 18+ required
- Dependencies: openai ^4.0.0, @anthropic-ai/sdk ^0.20.0
- Build tool: tsup
- Test framework: Vitest
- License: MIT

[0.1.0]: https://github.com/michaelbrinkworth/ai-task-router/releases/tag/v0.1.0
