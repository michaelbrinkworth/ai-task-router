/**
 * Anthropic (Claude) provider
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  ChatRunRequest,
  ChatRunResponse,
  ChatStream,
  ChatStreamChunk,
  EmbeddingsRunRequest,
  EmbeddingsResponse,
  ProviderAdapter,
  UsageInfo,
} from "../types.js";
import { normalizeMessages } from "../utils.js";
import { estimateCost } from "../pricing.js";

export class AnthropicProvider implements ProviderAdapter {
  name = "anthropic" as const;
  private client: Anthropic;
  private priceOverrides?: Record<string, { inputPer1M: number; outputPer1M: number }>;

  constructor(apiKey: string, priceOverrides?: Record<string, { inputPer1M: number; outputPer1M: number }>) {
    this.client = new Anthropic({ apiKey });
    this.priceOverrides = priceOverrides;
  }

  async chat(request: ChatRunRequest): Promise<ChatRunResponse> {
    const startTime = Date.now();
    const messages = normalizeMessages(request);

    // Separate system messages from user/assistant messages
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    let systemContent = systemMessages.map((m) => m.content).join("\n");
    if (request.json) {
      systemContent += "\n\nReturn valid JSON only.";
    }

    const response = await this.client.messages.create({
      model: request.model || "claude-3-5-haiku-20241022",
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature,
      system: systemContent || undefined,
      messages: conversationMessages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    });

    const latencyMs = Date.now() - startTime;
    const outputText = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as any).text)
      .join("");

    const usage: UsageInfo | undefined = response.usage
      ? {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        }
      : undefined;

    const cost = usage
      ? estimateCost(
          this.name,
          response.model,
          usage.inputTokens || 0,
          usage.outputTokens || 0,
          this.priceOverrides
        )
      : undefined;

    return {
      provider: this.name,
      model: response.model,
      outputText,
      raw: response,
      usage,
      cost,
      latencyMs,
      attempts: [{ provider: this.name, ok: true }],
    };
  }

  async chatStream(request: ChatRunRequest): Promise<ChatStream> {
    const messages = normalizeMessages(request);

    // Separate system messages from user/assistant messages
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    let systemContent = systemMessages.map((m) => m.content).join("\n");
    if (request.json) {
      systemContent += "\n\nReturn valid JSON only.";
    }

    const stream = await this.client.messages.create({
      model: request.model || "claude-3-5-haiku-20241022",
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature,
      system: systemContent || undefined,
      messages: conversationMessages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      stream: true,
    });

    return (async function* () {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          yield { deltaText: chunk.delta.text, raw: chunk } as ChatStreamChunk;
        }
      }
    })();
  }

  async embeddings(request: EmbeddingsRunRequest): Promise<EmbeddingsResponse> {
    // Anthropic doesn't provide embeddings endpoint
    throw new Error("Anthropic provider does not support embeddings");
  }
}
