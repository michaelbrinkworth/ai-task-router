/**
 * Classification layer for intelligent routing
 * 
 * Uses AI Badgr's cheapest model to classify requests and determine optimal routing.
 */

import OpenAI from "openai";
import {
  ClassificationResult,
  TaskName,
  ChatRunRequest,
  EmbeddingsRunRequest,
} from "./types.js";
import { estimateCost } from "./pricing.js";

/**
 * Classification prompt template (minimal for cost optimization)
 */
const CLASSIFICATION_PROMPT = `Analyze this AI request and classify it. Return JSON with these fields:
- intent: one of [summarize, rewrite, classify, extract, chat, code, reasoning, embeddings]
- complexity: low/medium/high
- risk: none/elevated (safety/quality concerns)
- expectedLength: short/long
- confidence: 0-1 (how sure are you?)
- reasoning: brief explanation

Request: {INPUT}

Return only JSON, no other text.`;

/**
 * Default classification model (cheapest AI Badgr model)
 */
const DEFAULT_CLASSIFICATION_MODEL = "gpt-4o-mini";

/**
 * Maximum input length for classification (cost optimization)
 * Longer inputs are truncated to this length
 */
const MAX_CLASSIFICATION_INPUT_LENGTH = 500;

/**
 * Classify a request using AI to determine optimal routing
 * 
 * @param request - The chat or embeddings request to classify
 * @param apiKey - AI Badgr API key
 * @param baseUrl - Optional AI Badgr base URL
 * @param model - Optional classification model override
 * @returns Classification result with tokens and cost
 */
export async function classifyRequest(
  request: ChatRunRequest | EmbeddingsRunRequest,
  apiKey: string,
  baseUrl?: string,
  model?: string
): Promise<{
  classification: ClassificationResult;
  tokens: number;
  cost: number;
}> {
  try {
    // Extract input text from request
    const inputText = extractInputText(request);

    // Truncate input for classification (save costs)
    const truncatedInput = inputText.substring(0, MAX_CLASSIFICATION_INPUT_LENGTH);

    // Create classification prompt
    const classificationPrompt = CLASSIFICATION_PROMPT.replace(
      "{INPUT}",
      truncatedInput
    );

    // Initialize OpenAI client for AI Badgr
    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || "https://aibadgr.com/api/v1",
    });

    // Make classification request
    const completion = await client.chat.completions.create({
      model: model || DEFAULT_CLASSIFICATION_MODEL,
      messages: [
        {
          role: "user",
          content: classificationPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.0, // Deterministic
      max_tokens: 200, // Keep it short
    });

    const outputText = completion.choices[0]?.message?.content || "{}";
    const tokens = completion.usage?.total_tokens || 0;

    // Parse classification result
    const parsed = JSON.parse(outputText);

    // Validate and normalize classification
    const classification: ClassificationResult = {
      intent: validateIntent(parsed.intent),
      complexity: validateComplexity(parsed.complexity),
      risk: validateRisk(parsed.risk),
      expectedLength: validateExpectedLength(parsed.expectedLength),
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      reasoning: String(parsed.reasoning || "Classification completed"),
    };

    // Calculate cost
    const cost = estimateCost(
      "aibadgr",
      model || DEFAULT_CLASSIFICATION_MODEL,
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0
    );

    return {
      classification,
      tokens,
      cost: cost?.estimatedUsd || 0,
    };
  } catch (error) {
    // Classification failed - return safe defaults
    console.warn(
      "[@aibadgr/ai-task-router] Classification failed, using defaults:",
      error
    );

    // Fallback to simple heuristics
    const fallbackClassification = getFallbackClassification(request);

    return {
      classification: fallbackClassification,
      tokens: 0,
      cost: 0,
    };
  }
}

/**
 * Extract input text from request for classification
 */
function extractInputText(
  request: ChatRunRequest | EmbeddingsRunRequest
): string {
  if ("task" in request && request.task === "embeddings") {
    const embeddingsReq = request as EmbeddingsRunRequest;
    return Array.isArray(embeddingsReq.input)
      ? embeddingsReq.input.join(" ")
      : embeddingsReq.input;
  }

  const chatReq = request as ChatRunRequest;

  // Try input first
  if (chatReq.input) {
    return chatReq.input;
  }

  // Try messages
  if (chatReq.messages && chatReq.messages.length > 0) {
    // Get last user message
    const userMessage = chatReq.messages
      .filter((m) => m.role === "user")
      .slice(-1)[0];
    return userMessage?.content || "";
  }

  return "";
}

/**
 * Get fallback classification using simple heuristics
 */
function getFallbackClassification(
  request: ChatRunRequest | EmbeddingsRunRequest
): ClassificationResult {
  // Check explicit task first
  let intent: TaskName = "chat";
  if ("task" in request && request.task) {
    intent = request.task as TaskName;
  } else {
    // Simple heuristics based on input
    const inputText = extractInputText(request).toLowerCase();

    if (inputText.includes("code") || inputText.includes("function")) {
      intent = "code";
    } else if (
      inputText.includes("summarize") ||
      inputText.includes("summary")
    ) {
      intent = "summarize";
    } else if (
      inputText.includes("extract") ||
      inputText.includes("parse")
    ) {
      intent = "extract";
    } else if (
      inputText.includes("classify") ||
      inputText.includes("categorize")
    ) {
      intent = "classify";
    } else if (
      inputText.includes("rewrite") ||
      inputText.includes("rephrase")
    ) {
      intent = "rewrite";
    } else if (
      inputText.includes("think") ||
      inputText.includes("reason") ||
      inputText.includes("analyze")
    ) {
      intent = "reasoning";
    }
  }

  return {
    intent,
    complexity: "medium",
    risk: "none",
    expectedLength: "short",
    confidence: 0.3, // Low confidence for fallback
    reasoning: "Fallback classification (classifier unavailable)",
  };
}

/**
 * Validate and normalize intent
 */
function validateIntent(intent: any): TaskName {
  const validIntents: TaskName[] = [
    "summarize",
    "rewrite",
    "classify",
    "extract",
    "chat",
    "code",
    "reasoning",
    "embeddings",
  ];

  if (typeof intent === "string" && validIntents.includes(intent as TaskName)) {
    return intent as TaskName;
  }

  return "chat"; // Default
}

/**
 * Validate and normalize complexity
 */
function validateComplexity(
  complexity: any
): "low" | "medium" | "high" {
  if (
    complexity === "low" ||
    complexity === "medium" ||
    complexity === "high"
  ) {
    return complexity;
  }
  return "medium"; // Default
}

/**
 * Validate and normalize risk
 */
function validateRisk(risk: any): "none" | "elevated" {
  if (risk === "elevated") {
    return "elevated";
  }
  return "none"; // Default
}

/**
 * Validate and normalize expected length
 */
function validateExpectedLength(
  expectedLength: any
): "short" | "long" {
  if (expectedLength === "long") {
    return "long";
  }
  return "short"; // Default
}
