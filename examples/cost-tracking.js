/**
 * Cost Tracking Example
 * 
 * Demonstrates how to track costs, set budgets, and analyze spending
 */

import { createRouter } from "@aibadgr/ai-task-router";

// Cost Tracker Class
class CostTracker {
  constructor(budgetUsd = null) {
    this.costs = [];
    this.totalSpent = 0;
    this.budgetUsd = budgetUsd;
  }

  track(event) {
    const cost = event.cost?.estimatedUsd || 0;
    this.totalSpent += cost;

    this.costs.push({
      timestamp: new Date(),
      task: event.task,
      provider: event.provider,
      model: event.model || "unknown",
      cost,
      inputTokens: event.usage?.inputTokens,
      outputTokens: event.usage?.outputTokens,
      latency: event.latencyMs
    });

    // Log the request
    console.log(
      `[${event.task}] ${event.provider}: $${cost.toFixed(6)} ` +
      `(${event.usage?.totalTokens || 0} tokens, ${event.latencyMs}ms)`
    );

    // Check budget
    if (this.budgetUsd && this.totalSpent >= this.budgetUsd) {
      console.warn(`⚠️  Budget limit reached: $${this.totalSpent.toFixed(4)} / $${this.budgetUsd}`);
    }
  }

  getStats() {
    if (this.costs.length === 0) {
      return { totalSpent: 0, requestCount: 0 };
    }

    return {
      totalSpent: this.totalSpent,
      requestCount: this.costs.length,
      averageCost: this.totalSpent / this.costs.length,
      averageLatency: this.costs.reduce((sum, c) => sum + c.latency, 0) / this.costs.length,
      totalTokens: this.costs.reduce((sum, c) => sum + (c.inputTokens || 0) + (c.outputTokens || 0), 0),
      byProvider: this.groupBy("provider"),
      byTask: this.groupBy("task"),
      byModel: this.groupBy("model")
    };
  }

  groupBy(field) {
    return this.costs.reduce((acc, c) => {
      const key = c[field];
      if (!acc[key]) {
        acc[key] = { count: 0, cost: 0, tokens: 0 };
      }
      acc[key].count++;
      acc[key].cost += c.cost;
      acc[key].tokens += (c.inputTokens || 0) + (c.outputTokens || 0);
      return acc;
    }, {});
  }

  printReport() {
    const stats = this.getStats();

    console.log("\n" + "=".repeat(60));
    console.log("Cost Report");
    console.log("=".repeat(60));
    console.log(`Total Spent: $${stats.totalSpent.toFixed(4)}`);
    console.log(`Total Requests: ${stats.requestCount}`);
    console.log(`Average Cost: $${stats.averageCost.toFixed(6)}`);
    console.log(`Average Latency: ${stats.averageLatency.toFixed(0)}ms`);
    console.log(`Total Tokens: ${stats.totalTokens.toLocaleString()}`);

    if (this.budgetUsd) {
      const remaining = this.budgetUsd - stats.totalSpent;
      const percentUsed = (stats.totalSpent / this.budgetUsd * 100).toFixed(1);
      console.log(`Budget: $${stats.totalSpent.toFixed(4)} / $${this.budgetUsd} (${percentUsed}% used)`);
      console.log(`Remaining: $${Math.max(0, remaining).toFixed(4)}`);
    }

    console.log("\nBy Provider:");
    Object.entries(stats.byProvider).forEach(([provider, data]) => {
      console.log(`  ${provider}: ${data.count} requests, $${data.cost.toFixed(4)}, ${data.tokens.toLocaleString()} tokens`);
    });

    console.log("\nBy Task:");
    Object.entries(stats.byTask).forEach(([task, data]) => {
      console.log(`  ${task}: ${data.count} requests, $${data.cost.toFixed(4)}`);
    });

    console.log("=".repeat(60) + "\n");
  }

  isBudgetExceeded() {
    return this.budgetUsd && this.totalSpent >= this.budgetUsd;
  }

  reset() {
    this.costs = [];
    this.totalSpent = 0;
  }
}

// Example 1: Basic cost tracking
async function example1() {
  console.log("\n=== Example 1: Basic Cost Tracking ===\n");

  const tracker = new CostTracker();

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    },
    onResult: (event) => tracker.track(event)
  });

  // Make some requests
  const requests = [
    { task: "chat", input: "What is 2+2?" },
    { task: "summarize", input: "This is a long text that needs summarization..." },
    { task: "classify", input: "Is this email spam?" }
  ];

  for (const req of requests) {
    try {
      await router.run(req);
    } catch (error) {
      console.error(`Request failed: ${error.message}`);
    }
  }

  tracker.printReport();
}

// Example 2: Budget enforcement
async function example2() {
  console.log("\n=== Example 2: Budget Enforcement ===\n");

  const dailyBudget = 0.10; // $0.10 per day
  const tracker = new CostTracker(dailyBudget);

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    },
    onResult: (event) => tracker.track(event)
  });

  // Helper to check budget before request
  async function makeRequestWithBudgetCheck(request) {
    if (tracker.isBudgetExceeded()) {
      throw new Error("Daily budget exceeded. Please try again tomorrow.");
    }

    return router.run(request);
  }

  // Make requests until budget is exceeded
  for (let i = 0; i < 100; i++) {
    try {
      await makeRequestWithBudgetCheck({
        task: "chat",
        input: `Request ${i + 1}`
      });
    } catch (error) {
      if (error.message.includes("budget")) {
        console.log(`\n${error.message}`);
        break;
      }
    }
  }

  tracker.printReport();
}

// Example 3: Provider cost comparison
async function example3() {
  console.log("\n=== Example 3: Provider Cost Comparison ===\n");

  const tracker = new CostTracker();

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" },
      // openai: { apiKey: process.env.OPENAI_API_KEY }, // Uncomment to compare
    },
    onResult: (event) => tracker.track(event)
  });

  const testInput = "Write a haiku about programming";

  // Test with aibadgr
  try {
    console.log("Testing with aibadgr...");
    await router.run({
      task: "chat",
      input: testInput,
      provider: "aibadgr"
    });
  } catch (error) {
    console.error("aibadgr failed:", error.message);
  }

  // Test with openai (if configured)
  try {
    console.log("\nTesting with openai...");
    await router.run({
      task: "chat",
      input: testInput,
      provider: "openai"
    });
  } catch (error) {
    console.error("openai not configured or failed");
  }

  tracker.printReport();

  // Calculate savings
  const stats = tracker.getStats();
  if (stats.byProvider.aibadgr && stats.byProvider.openai) {
    const savings = stats.byProvider.openai.cost - stats.byProvider.aibadgr.cost;
    const savingsPercent = (savings / stats.byProvider.openai.cost * 100).toFixed(1);
    console.log(`💰 Savings using aibadgr: $${savings.toFixed(6)} (${savingsPercent}%)`);
  }
}

// Example 4: Task-specific cost analysis
async function example4() {
  console.log("\n=== Example 4: Task-Specific Cost Analysis ===\n");

  const tracker = new CostTracker();

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    },
    onResult: (event) => tracker.track(event)
  });

  const tasks = [
    { task: "chat", input: "Hello" },
    { task: "chat", input: "How are you?" },
    { task: "summarize", input: "Long text..." },
    { task: "summarize", input: "Another long text..." },
    { task: "code", input: "Write a function" },
  ];

  for (const req of tasks) {
    try {
      await router.run(req);
    } catch (error) {
      console.error(`Failed: ${error.message}`);
    }
  }

  tracker.printReport();

  // Find most expensive task type
  const byTask = tracker.getStats().byTask;
  const mostExpensive = Object.entries(byTask)
    .sort((a, b) => b[1].cost - a[1].cost)[0];

  if (mostExpensive) {
    console.log(`Most expensive task: ${mostExpensive[0]} ($${mostExpensive[1].cost.toFixed(6)} total)`);
  }
}

// Example 5: Export cost data
async function example5() {
  console.log("\n=== Example 5: Export Cost Data ===\n");

  const tracker = new CostTracker();

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    },
    onResult: (event) => tracker.track(event)
  });

  // Make some requests
  for (let i = 0; i < 3; i++) {
    try {
      await router.run({
        task: "chat",
        input: `Request ${i + 1}`
      });
    } catch (error) {
      // Ignore
    }
  }

  // Export as JSON for logging/analytics
  const exportData = {
    date: new Date().toISOString(),
    summary: tracker.getStats(),
    details: tracker.costs
  };

  console.log("Export data (JSON):");
  console.log(JSON.stringify(exportData, null, 2));

  // Could save to file:
  // await fs.writeFile('cost-report.json', JSON.stringify(exportData, null, 2));
}

// Run all examples
async function main() {
  console.log("=".repeat(60));
  console.log("Cost Tracking Examples");
  console.log("=".repeat(60));

  await example1();
  await example2();
  await example3();
  await example4();
  await example5();

  console.log("\n" + "=".repeat(60));
  console.log("Examples complete!");
  console.log("=".repeat(60) + "\n");
}

main().catch(console.error);
