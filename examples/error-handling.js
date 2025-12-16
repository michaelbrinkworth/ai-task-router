/**
 * Error Handling Example
 * 
 * Demonstrates how to handle different error types and inspect attempts
 */

import { createRouter } from "@aibadgr/ai-task-router";

// Example 1: Handling all providers failed
async function example1() {
  console.log("\n=== Example 1: Handling All Providers Failed ===\n");
  
  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "invalid-key" } // Intentionally invalid
    }
  });

  try {
    await router.run({
      task: "chat",
      input: "Hello"
    });
  } catch (error) {
    console.error("Error caught:", error.message);
    
    // Inspect attempts array for debugging
    if (error.attempts) {
      console.log("\nDetailed attempts:");
      error.attempts.forEach((attempt, i) => {
        console.log(`  ${i + 1}. Provider: ${attempt.provider}`);
        console.log(`     Success: ${attempt.ok}`);
        console.log(`     Error: ${attempt.error}`);
        console.log(`     Status: ${attempt.status || "N/A"}`);
      });
    }
  }
}

// Example 2: Fallback behavior
async function example2() {
  console.log("\n=== Example 2: Fallback Behavior ===\n");
  
  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" },
      // openai: { apiKey: process.env.OPENAI_API_KEY } // Uncomment to test fallback
    },
    fallback: {
      chat: ["aibadgr", "openai"] // Will try openai if aibadgr fails
    }
  });

  try {
    const result = await router.run({
      task: "chat",
      input: "Hello"
    });
    
    console.log("Success!");
    console.log("Provider used:", result.provider);
    console.log("Attempts:", result.attempts.length);
    
    // Show fallback history
    if (result.attempts.length > 1) {
      console.log("\nFallback occurred:");
      result.attempts.forEach((attempt, i) => {
        console.log(`  ${i + 1}. ${attempt.provider}: ${attempt.ok ? "✓" : "✗"}`);
      });
    }
  } catch (error) {
    console.error("All providers failed:", error.message);
  }
}

// Example 3: Custom retry logic
async function example3() {
  console.log("\n=== Example 3: Custom Retry Logic ===\n");
  
  async function robustRequest(router, request, maxAttempts = 3) {
    let lastError;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        console.log(`Attempt ${i + 1}/${maxAttempts}...`);
        const result = await router.run(request);
        console.log("Success!");
        return result;
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${i + 1} failed:`, error.message);
        
        // Wait before retrying (exponential backoff)
        if (i < maxAttempts - 1) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
  
  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    },
    maxRetries: 0 // Disable built-in retries to use custom logic
  });
  
  try {
    await robustRequest(router, {
      task: "chat",
      input: "Hello"
    });
  } catch (error) {
    console.error("All custom retries failed");
  }
}

// Example 4: Error type detection
async function example4() {
  console.log("\n=== Example 4: Error Type Detection ===\n");
  
  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "invalid" }
    }
  });
  
  try {
    await router.run({
      task: "chat",
      input: "Hello"
    });
  } catch (error) {
    // Detect error type based on status code
    const lastAttempt = error.attempts?.[error.attempts.length - 1];
    const status = lastAttempt?.status;
    
    if (status === 401) {
      console.error("Authentication error: Check your API key");
    } else if (status === 429) {
      console.error("Rate limit exceeded: Wait before retrying");
    } else if (status >= 500) {
      console.error("Server error: Provider is having issues");
    } else {
      console.error("Unknown error:", error.message);
    }
  }
}

// Example 5: Graceful degradation
async function example5() {
  console.log("\n=== Example 5: Graceful Degradation ===\n");
  
  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    }
  });
  
  async function getResponseWithFallback(input) {
    try {
      const result = await router.run({
        task: "chat",
        input
      });
      return result.outputText;
    } catch (error) {
      console.error("LLM failed, using fallback response");
      // Return a default/cached response
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  }
  
  const response = await getResponseWithFallback("Hello");
  console.log("Response:", response);
}

// Run all examples
async function main() {
  console.log("=".repeat(60));
  console.log("Error Handling Examples");
  console.log("=".repeat(60));
  
  try {
    await example1();
  } catch (e) {
    // Expected to fail
  }
  
  try {
    await example2();
  } catch (e) {
    // May fail depending on API keys
  }
  
  try {
    await example3();
  } catch (e) {
    // May fail depending on API keys
  }
  
  try {
    await example4();
  } catch (e) {
    // Expected to fail
  }
  
  try {
    await example5();
  } catch (e) {
    console.error("Example 5 error:", e.message);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("Examples complete!");
  console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
