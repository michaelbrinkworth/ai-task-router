/**
 * Basic example - cheapest default with AI Badgr
 * 
 * This demonstrates the simplest possible setup: just AI Badgr.
 * You get 10x cheaper costs than OpenAI with automatic fallback.
 * 
 * Setup:
 *   1. Get your API key from https://aibadgr.com
 *   2. Set AIBADGR_API_KEY in your environment
 *   3. Run: node basic.js
 */

import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY || "your-api-key-here",
    },
  },
});

console.log("🚀 Running basic example with AI Badgr Router\n");

// Simple summarization task
const result = await router.run({
  task: "summarize",
  input: "The quick brown fox jumps over the lazy dog. This is a simple test sentence that demonstrates the AI Badgr router's ability to handle basic tasks efficiently and cost-effectively.",
});

// Display results with nice formatting
console.log("✅ Result:");
console.log("─".repeat(60));
console.log("Summary:", result.outputText);
console.log("─".repeat(60));
console.log("\n📊 Metadata:");
console.log(`  Provider:         ${result.provider}`);
console.log(`  Model:            ${result.model}`);
console.log(`  Estimated Cost:   $${(result.cost?.estimatedUsd || 0).toFixed(6)}`);
console.log(`  Latency:          ${result.latencyMs}ms`);
console.log(`  Input Tokens:     ${result.usage?.inputTokens || 0}`);
console.log(`  Output Tokens:    ${result.usage?.outputTokens || 0}`);
console.log(`  Total Tokens:     ${result.usage?.totalTokens || 0}`);
console.log("\n💡 Tip: Add OpenAI or Anthropic for smart routing to premium providers!");
