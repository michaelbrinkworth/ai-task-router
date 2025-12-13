/**
 * Advanced routing example - route code to Claude, reasoning to OpenAI
 */

import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY || "your-api-key-here",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "your-openai-key-here",
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "your-anthropic-key-here",
    },
  },
  routes: {
    code: "anthropic",
    reasoning: "openai",
  },
  fallback: {
    chat: ["aibadgr", "openai"],
  },
  onResult: (event) => {
    console.log(`✓ ${event.task} completed via ${event.provider} in ${event.latencyMs}ms`);
  },
  onError: (event) => {
    console.error(`✗ ${event.task} failed on ${event.provider}:`, event.error);
  },
});

// Code generation routed to Anthropic
const codeResult = await router.run({
  task: "code",
  input: "Write a function to calculate fibonacci numbers",
});

console.log("Code (via", codeResult.provider + "):");
console.log(codeResult.outputText);
console.log();

// Reasoning routed to OpenAI
const reasoningResult = await router.run({
  task: "reasoning",
  input: "If all roses are flowers and some flowers fade quickly, what can we conclude?",
});

console.log("Reasoning (via", reasoningResult.provider + "):");
console.log(reasoningResult.outputText);
