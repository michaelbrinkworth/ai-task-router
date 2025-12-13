/**
 * AI Badgr provider (OpenAI-compatible)
 */

import OpenAI from "openai";
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

export class AIBadgrProvider implements ProviderAdapter {
  name = "aibadgr" as const;
  private client: OpenAI;
  private priceOverrides?: Record<string, { inputPer1M: number; outputPer1M: number }>;

  constructor(apiKey: string, baseUrl?: string, priceOverrides?: Record<string, { inputPer1M: number; outputPer1M: number }>) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl || "https://aibadgr.com/api/v1",
    });
    this.priceOverrides = priceOverrides;
  }

  async chat(request: ChatRunRequest): Promise<ChatRunResponse> {
    const startTime = Date.now();
    const messages = normalizeMessages(request);

    // Add JSON instruction if requested
    if (request.json && messages.length > 0) {
      const systemMessage = messages.find((m) => m.role === "system");
      if (systemMessage) {
        systemMessage.content += "\n\nReturn valid JSON only.";
      } else {
        messages.unshift({ role: "system", content: "Return valid JSON only." });
      }
    }

    const completion = await this.client.chat.completions.create({
      model: request.model || "gpt-3.5-turbo",
      messages: messages as any,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      response_format: request.json ? { type: "json_object" } : undefined,
    });

    const latencyMs = Date.now() - startTime;
    const outputText = completion.choices[0]?.message?.content || "";
    const usage: UsageInfo | undefined = completion.usage
      ? {
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        }
      : undefined;

    const cost = usage
      ? estimateCost(
          this.name,
          completion.model,
          usage.inputTokens || 0,
          usage.outputTokens || 0,
          this.priceOverrides
        )
      : undefined;

    return {
      provider: this.name,
      model: completion.model,
      outputText,
      raw: completion,
      usage,
      cost,
      latencyMs,
      attempts: [{ provider: this.name, ok: true }],
    };
  }

  async chatStream(request: ChatRunRequest): Promise<ChatStream> {
    const messages = normalizeMessages(request);

    // Add JSON instruction if requested
    if (request.json && messages.length > 0) {
      const systemMessage = messages.find((m) => m.role === "system");
      if (systemMessage) {
        systemMessage.content += "\n\nReturn valid JSON only.";
      } else {
        messages.unshift({ role: "system", content: "Return valid JSON only." });
      }
    }

    const stream = await this.client.chat.completions.create({
      model: request.model || "gpt-3.5-turbo",
      messages: messages as any,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: true,
    });

    return (async function* () {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          yield { deltaText: delta, raw: chunk } as ChatStreamChunk;
        }
      }
    })();
  }

  async embeddings(request: EmbeddingsRunRequest): Promise<EmbeddingsResponse> {
    const startTime = Date.now();
    const inputs = Array.isArray(request.input) ? request.input : [request.input];

    const response = await this.client.embeddings.create({
      model: request.model || "text-embedding-3-small",
      input: inputs,
    });

    const latencyMs = Date.now() - startTime;
    const vectors = response.data.map((d) => d.embedding);
    const usage: UsageInfo | undefined = response.usage
      ? { totalTokens: response.usage.total_tokens }
      : undefined;

    const cost = usage
      ? estimateCost(this.name, response.model, usage.totalTokens || 0, 0, this.priceOverrides)
      : undefined;

    return {
      provider: this.name,
      vectors,
      raw: response,
      usage,
      cost,
      latencyMs,
      attempts: [{ provider: this.name, ok: true }],
    };
  }
}
