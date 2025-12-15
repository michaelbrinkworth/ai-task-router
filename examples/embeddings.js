/**
 * Embeddings example
 */

import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY || "your-api-key-here",
    },
  },
});

// Generate embeddings for multiple texts
const result = await router.embed({
  task: "embeddings",
  input: [
    "The quick brown fox jumps over the lazy dog",
    "Machine learning is a subset of artificial intelligence",
    "TypeScript is a superset of JavaScript",
  ],
  model: "ai-badgr-embedding",
});

console.log("Provider:", result.provider);
console.log("Generated", result.vectors.length, "embeddings");
console.log("Vector dimension:", result.vectors[0].length);
console.log("Cost:", result.cost);
console.log("Latency:", result.latencyMs, "ms");
