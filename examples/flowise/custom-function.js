/**
 * Flowise Custom Function Node
 * 
 * This demonstrates using @aibadgr/router in a Flowise chatflow.
 * 
 * Setup:
 * 1. Add a Custom Function node in Flowise
 * 2. Paste this code
 * 3. Set AIBADGR_API_KEY in Flowise environment
 * 4. Connect input/output nodes
 */

import { createRouter } from "@aibadgr/router";

// Initialize router (this runs once per flow execution)
const router = createRouter({
  providers: {
    aibadgr: { 
      apiKey: process.env.AIBADGR_API_KEY || $credentials?.aibadgr?.apiKey || "your-key-here"
    },
    // Optional: Add more providers from Flowise credentials
    // openai: { apiKey: process.env.OPENAI_API_KEY || $credentials?.openai?.apiKey },
    // anthropic: { apiKey: process.env.ANTHROPIC_API_KEY || $credentials?.anthropic?.apiKey }
  },
  routes: {
    chat: "aibadgr",
    code: "aibadgr",      // Change to "anthropic" if Claude is configured
    reasoning: "aibadgr"  // Change to "openai" if GPT-4 is configured
  },
  fallback: {
    chat: ["aibadgr"]     // Add more providers for automatic fallback
  }
});

// Main function (called for each message)
async function main() {
  // Get input from Flowise
  const userMessage = $input || "Hello";
  const chatHistory = $flow.chatHistory || [];
  
  // Determine task type from message content (simple heuristic)
  let task = "chat";
  if (userMessage.toLowerCase().includes("code") || 
      userMessage.toLowerCase().includes("function") ||
      userMessage.toLowerCase().includes("implement")) {
    task = "code";
  } else if (userMessage.toLowerCase().includes("explain") ||
             userMessage.toLowerCase().includes("analyze") ||
             userMessage.toLowerCase().includes("reason")) {
    task = "reasoning";
  }
  
  console.log(`[AI Badgr Router] Task: ${task}, Input: ${userMessage.slice(0, 50)}...`);
  
  // Route through @aibadgr/router
  const result = await router.run({
    task,
    input: userMessage,
    messages: chatHistory.map(msg => ({
      role: msg.role || "user",
      content: msg.content || msg.message
    })),
    maxTokens: 500,
    temperature: 0.7
  });
  
  // Log performance metrics
  console.log(`[AI Badgr Router] Provider: ${result.provider}`);
  console.log(`[AI Badgr Router] Cost: $${result.cost?.estimatedUsd?.toFixed(6)}`);
  console.log(`[AI Badgr Router] Latency: ${result.latencyMs}ms`);
  
  // Return response in Flowise format
  return {
    output: result.outputText,
    metadata: {
      provider: result.provider,
      model: result.model,
      cost: result.cost?.estimatedUsd,
      latency: result.latencyMs,
      tokens: result.usage
    }
  };
}

// Execute main function
return await main();
