/**
 * n8n Code Node Example
 * 
 * This demonstrates using @aibadgr/router in an n8n workflow.
 * 
 * Setup:
 * 1. Add this to a Code node in n8n
 * 2. Set AIBADGR_API_KEY in your n8n environment or credentials
 * 3. Input items should have a "text" field with content to process
 */

// Import the router (assumes @aibadgr/router is installed in n8n)
import { createRouter } from "@aibadgr/router";

// Validate API key
if (!$env.AIBADGR_API_KEY) {
  throw new Error("AIBADGR_API_KEY not found. Please set it in your n8n environment variables.");
}

// Create router with your configuration
const router = createRouter({
  providers: {
    aibadgr: { 
      apiKey: $env.AIBADGR_API_KEY
    },
    // Optional: Add more providers from n8n credentials
    // openai: { apiKey: $credentials.openai.apiKey },
    // anthropic: { apiKey: $credentials.anthropic.apiKey }
  },
  routes: {
    summarize: "aibadgr",
    extract: "aibadgr",
    code: "aibadgr",      // Change to "anthropic" if you have Claude configured
    chat: "aibadgr"
  }
});

// Process each input item
const results = [];
let totalCost = 0;

for (const item of $input.all()) {
  const inputText = item.json.text || "";
  
  try {
    // Example: Summarize the input
    const summary = await router.run({
      task: "summarize",
      input: inputText,
      maxTokens: 150
    });
    
    // Example: Extract key points
    const keyPoints = await router.run({
      task: "extract",
      input: `Extract 3 key points from: ${inputText}`
    });
    
    // Track costs
    totalCost += (summary.cost?.estimatedUsd || 0);
    totalCost += (keyPoints.cost?.estimatedUsd || 0);
    
    // Return results
    results.push({
      json: {
        original: inputText,
        summary: summary.outputText,
        keyPoints: keyPoints.outputText,
        providers: {
          summary: summary.provider,
          keyPoints: keyPoints.provider
        },
        costs: {
          summary: summary.cost?.estimatedUsd,
          keyPoints: keyPoints.cost?.estimatedUsd,
          total: totalCost
        },
        latency: {
          summary: summary.latencyMs,
          keyPoints: keyPoints.latencyMs
        }
      }
    });
    
  } catch (error) {
    // Handle errors gracefully
    results.push({
      json: {
        original: inputText,
        error: error.message,
        success: false
      }
    });
  }
}

// Return all results
return results;
