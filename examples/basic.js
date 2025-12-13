/**
 * Basic example - cheapest default
 */

import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY || "your-api-key-here",
    },
  },
});

// Simple summarization
const result = await router.run({
  task: "summarize",
  input: "The quick brown fox jumps over the lazy dog. This is a simple test sentence.",
});

console.log("Summary:", result.outputText);
console.log("Provider:", result.provider);
console.log("Cost:", result.cost);
console.log("Latency:", result.latencyMs, "ms");
