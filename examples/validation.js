/**
 * Validation Example
 * 
 * Demonstrates how to validate configuration and test provider availability
 */

import { createRouter, validateTask, VALID_TASKS } from "@aibadgr/router";

// Example 1: Validate router configuration
async function example1() {
  console.log("\n=== Example 1: Validate Configuration ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" },
      // openai: { apiKey: process.env.OPENAI_API_KEY } // Intentionally not configured
    },
    routes: {
      code: "anthropic", // Points to unconfigured provider
      reasoning: "openai" // Points to unconfigured provider
    },
    fallback: {
      chat: ["aibadgr", "openai", "anthropic"] // Includes unconfigured providers
    }
  });

  console.log("Validating configuration...\n");
  const issues = router.validateConfig();

  if (issues.length === 0) {
    console.log("✓ Configuration is valid!");
  } else {
    console.log(`Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, i) => {
      const icon = issue.level === "error" ? "✗" : "⚠";
      console.log(`${i + 1}. ${icon} [${issue.level.toUpperCase()}] ${issue.message}`);
    });
  }
}

// Example 2: Get current configuration
async function example2() {
  console.log("\n=== Example 2: Get Current Configuration ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "demo-key" }
    },
    mode: "balanced",
    timeoutMs: 30000,
    maxRetries: 2
  });

  const config = router.getConfig();

  console.log("Current configuration:");
  console.log("  Providers:", config.providers);
  console.log("  Default provider:", config.defaultProvider);
  console.log("  Mode:", config.mode);
  console.log("  Timeout:", config.timeoutMs, "ms");
  console.log("  Max retries:", config.maxRetries);
  console.log("  Fallback policy:", config.fallbackPolicy);
  console.log("\nRoutes:");
  Object.entries(config.routes).forEach(([task, provider]) => {
    if (provider) {
      console.log(`  ${task} → ${provider}`);
    }
  });
}

// Example 3: Validate task names at runtime
async function example3() {
  console.log("\n=== Example 3: Validate Task Names ===\n");

  console.log("Valid task types:");
  VALID_TASKS.forEach(task => console.log(`  - ${task}`));

  console.log("\nTesting task validation:");

  // Valid task
  try {
    validateTask("chat");
    console.log("✓ 'chat' is valid");
  } catch (error) {
    console.log("✗ 'chat' is invalid:", error.message);
  }

  // Invalid task
  try {
    validateTask("translate");
    console.log("✓ 'translate' is valid");
  } catch (error) {
    console.log("✗ 'translate' is invalid:", error.message);
  }

  // Using in router
  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "demo-key" }
    }
  });

  try {
    await router.run({
      task: "invalid-task",
      input: "Hello"
    });
  } catch (error) {
    console.log("\n✗ Router rejected invalid task:", error.message);
  }
}

// Example 4: Test provider availability
async function example4() {
  console.log("\n=== Example 4: Test Provider Availability ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    }
  });

  const providersToTest = ["aibadgr", "openai", "anthropic"];

  console.log("Testing provider availability:\n");

  for (const provider of providersToTest) {
    try {
      // Try a simple request with explicit provider
      await router.run({
        task: "chat",
        input: "test",
        provider,
        maxTokens: 5
      });
      console.log(`✓ ${provider}: available`);
    } catch (error) {
      if (error.message.includes("not configured")) {
        console.log(`⚠ ${provider}: not configured`);
      } else if (error.message.includes("Unauthorized") || error.message.includes("401")) {
        console.log(`✗ ${provider}: invalid API key`);
      } else {
        console.log(`✗ ${provider}: error (${error.message.split("\n")[0]})`);
      }
    }
  }
}

// Example 5: Handle missing providers gracefully
async function example5() {
  console.log("\n=== Example 5: Handle Missing Providers Gracefully ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    },
    routes: {
      code: "anthropic" // Not configured - will fallback
    }
  });

  const config = router.getConfig();
  const hasAnthropic = config.providers.includes("anthropic");

  console.log(`Anthropic configured: ${hasAnthropic ? "Yes" : "No"}`);

  if (!hasAnthropic) {
    console.log("Anthropic not configured. Code tasks will use:", config.routes.code || config.defaultProvider);
  }

  // Make a code request - will fallback to aibadgr
  try {
    const result = await router.run({
      task: "code",
      input: "Write a hello world function"
    });
    console.log(`\nCode request handled by: ${result.provider}`);

    if (result.attempts.length > 1) {
      console.log("Fallback occurred:");
      result.attempts.forEach(a => {
        console.log(`  - ${a.provider}: ${a.ok ? "✓" : "✗"}`);
      });
    }
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

// Example 6: Pre-flight validation helper
async function example6() {
  console.log("\n=== Example 6: Pre-flight Validation Helper ===\n");

  function validateRouterSetup(router) {
    const issues = [];
    const config = router.getConfig();

    // Check if at least one provider is configured
    if (config.providers.length === 0) {
      issues.push({
        level: "error",
        message: "No providers configured"
      });
    }

    // Validate task types if any
    const allTasks = [
      ...Object.keys(config.routes),
      ...Object.keys(config.fallback || {})
    ];

    allTasks.forEach(task => {
      if (!VALID_TASKS.includes(task)) {
        issues.push({
          level: "error",
          message: `Invalid task type: ${task}`
        });
      }
    });

    // Check provider configuration
    const routedProviders = Object.values(config.routes).filter(Boolean);
    const unconfigured = routedProviders.filter(p => !config.providers.includes(p));

    if (unconfigured.length > 0) {
      issues.push({
        level: "warning",
        message: `Routes reference unconfigured providers: ${unconfigured.join(", ")}`
      });
    }

    return issues;
  }

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "demo-key" }
    },
    routes: {
      code: "anthropic" // Unconfigured
    }
  });

  console.log("Running pre-flight checks...\n");
  const issues = validateRouterSetup(router);

  if (issues.length === 0) {
    console.log("✓ All checks passed!");
  } else {
    console.log(`Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, i) => {
      const icon = issue.level === "error" ? "✗" : "⚠";
      console.log(`${i + 1}. ${icon} ${issue.message}`);
    });
  }
}

// Example 7: Configuration best practices
async function example7() {
  console.log("\n=== Example 7: Configuration Best Practices ===\n");

  console.log("✓ DO:");
  console.log("  - Always configure at least aibadgr provider");
  console.log("  - Use process.env for API keys");
  console.log("  - Validate configuration after creation");
  console.log("  - Set reasonable timeouts (30-120 seconds)");
  console.log("  - Configure fallback chains for critical tasks");
  console.log("  - Use task-based routing for cost optimization");

  console.log("\n✗ DON'T:");
  console.log("  - Hard-code API keys in source code");
  console.log("  - Route to unconfigured providers");
  console.log("  - Set timeouts too low (< 10 seconds)");
  console.log("  - Disable fallback in production");
  console.log("  - Route embeddings to Anthropic (not supported)");

  console.log("\n📝 Example good configuration:\n");
  console.log(`const router = createRouter({
  providers: {
    aibadgr: { apiKey: process.env.AIBADGR_API_KEY },
    openai: { apiKey: process.env.OPENAI_API_KEY }
  },
  mode: "balanced", // Smart routing
  timeoutMs: 60000, // 60 seconds
  maxRetries: 1,    // Retry once
  fallback: {
    chat: ["aibadgr", "openai"],
    code: ["openai", "aibadgr"]
  },
  onError: (event) => {
    logger.error("LLM request failed", event);
  }
});`);
}

// Run all examples
async function main() {
  console.log("=".repeat(60));
  console.log("Validation Examples");
  console.log("=".repeat(60));

  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  await example7();

  console.log("\n" + "=".repeat(60));
  console.log("Examples complete!");
  console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
