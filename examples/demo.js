#!/usr/bin/env node
/**
 * Quick Demo - Shows provider, cost, and latency for different tasks
 * 
 * This script demonstrates the value of @aibadgr/router:
 *   - Cost comparison between providers
 *   - Automatic routing by task type
 *   - Fallback behavior
 *   - Real-time metrics
 * 
 * Usage:
 *   npm run demo
 *   or
 *   node examples/demo.js
 */

import { createRouter } from "@aibadgr/router";

// Check if API key is set
if (!process.env.AIBADGR_API_KEY) {
  console.error("❌ Error: AIBADGR_API_KEY environment variable not set");
  console.log("\n💡 Get your API key from https://aibadgr.com");
  console.log("   Then run: export AIBADGR_API_KEY=your-key-here");
  process.exit(1);
}

console.log("🚀 AI Badgr Router Demo\n");
console.log("This demo shows provider selection, cost estimation, and latency\n");

// Create router with AI Badgr only (cheapest setup)
const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY,
    },
    // Uncomment to test multi-provider routing:
    // openai: { apiKey: process.env.OPENAI_API_KEY },
    // anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    // If you have OpenAI/Anthropic configured, uncomment:
    // code: "anthropic",
    // reasoning: "openai"
  }
});

// Test different task types
const tasks = [
  {
    name: "Summarization",
    task: "summarize",
    input: "The Industrial Revolution marked a major turning point in history. It began in Britain in the late 18th century and spread throughout Europe and North America. New manufacturing processes transformed economies from agricultural to industrial. Steam power, iron production, and textile manufacturing drove unprecedented economic growth."
  },
  {
    name: "Classification",
    task: "classify",
    input: "I absolutely loved this product! Best purchase I've made all year. Highly recommend!"
  },
  {
    name: "Code Generation",
    task: "code",
    input: "Write a simple function to calculate fibonacci numbers"
  }
];

console.log("Running", tasks.length, "tasks...\n");
console.log("═".repeat(80));

let totalCost = 0;
let totalLatency = 0;

for (const test of tasks) {
  console.log(`\n📝 Task: ${test.name} (${test.task})`);
  console.log("─".repeat(80));
  
  const startTime = Date.now();
  
  try {
    const result = await router.run({
      task: test.task,
      input: test.input,
      maxTokens: 100
    });
    
    const cost = result.cost?.estimatedUsd || 0;
    totalCost += cost;
    totalLatency += result.latencyMs;
    
    console.log(`✅ Provider: ${result.provider}`);
    console.log(`   Model: ${result.model}`);
    console.log(`   Cost: $${cost.toFixed(6)} (${cost < 0.0001 ? '< $0.0001' : '~$' + cost.toFixed(4)})`);
    console.log(`   Latency: ${result.latencyMs}ms`);
    console.log(`   Tokens: ${result.usage?.inputTokens || 0} in / ${result.usage?.outputTokens || 0} out`);
    console.log(`\n   Output (truncated):`);
    console.log(`   "${result.outputText.slice(0, 100)}${result.outputText.length > 100 ? '...' : ''}"`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

console.log("\n" + "═".repeat(80));
console.log("\n📊 Summary:");
console.log(`   Total tasks: ${tasks.length}`);
console.log(`   Total cost: $${totalCost.toFixed(6)} (average: $${(totalCost / tasks.length).toFixed(6)}/task)`);
console.log(`   Total latency: ${totalLatency}ms (average: ${Math.round(totalLatency / tasks.length)}ms/task)`);
console.log(`\n💰 Cost comparison (for 1000 tasks/day):`);
console.log(`   AI Badgr only:  ~$${(totalCost / tasks.length * 1000).toFixed(2)}/day  (~$${(totalCost / tasks.length * 30000).toFixed(2)}/month)`);
console.log(`   OpenAI only:    ~$3.00/day            (~$90/month)`);
console.log(`   Smart routing:  ~$0.50/day            (~$15/month)`);
console.log("\n💡 Tip: Add OpenAI/Anthropic API keys to test smart routing!");
console.log("   Uncomment the routes config in this script to see it in action.\n");
