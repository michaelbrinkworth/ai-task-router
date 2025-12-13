/**
 * Streaming example
 */

import { createRouter } from "@aibadgr/router";

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY || "your-api-key-here",
    },
  },
});

console.log("Streaming response:");

const stream = await router.chat({
  stream: true,
  input: "Tell me a short story about a robot learning to paint.",
});

for await (const chunk of stream) {
  if (chunk.deltaText) {
    process.stdout.write(chunk.deltaText);
  }
}

console.log("\n\nDone!");
