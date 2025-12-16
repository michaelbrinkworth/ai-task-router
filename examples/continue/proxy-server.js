/**
 * OpenAI-compatible proxy server for Continue (or any OpenAI-compatible tool)
 * 
 * This creates an HTTP server that accepts OpenAI API requests and routes them
 * through @aibadgr/ai-task-router with intelligent provider selection and fallback.
 * 
 * Usage:
 *   1. Set AIBADGR_API_KEY in your environment
 *   2. node proxy-server.js
 *   3. Point Continue (or other tools) to http://localhost:3000/v1
 */

import { createRouter } from "@aibadgr/ai-task-router";
import http from "http";

const PORT = process.env.PORT || 3000;

// Create router with your preferred configuration
const router = createRouter({
  providers: {
    aibadgr: { 
      apiKey: process.env.AIBADGR_API_KEY || "your-key-here"
    },
    // Optional: add premium providers
    // openai: { apiKey: process.env.OPENAI_API_KEY },
    // anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    code: "aibadgr",      // You can change this to "anthropic" if configured
    chat: "aibadgr",
    reasoning: "aibadgr"
  },
  fallback: {
    chat: ["aibadgr"]     // Add more providers for fallback
  }
});

const server = http.createServer(async (req, res) => {
  // CORS headers for browser-based tools
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only handle POST to /v1/chat/completions
  if (req.method !== "POST" || !req.url.startsWith("/v1/chat/completions")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", async () => {
    try {
      const request = JSON.parse(body);
      
      // Extract messages from OpenAI format
      const messages = request.messages || [];
      const lastMessage = messages[messages.length - 1];
      const input = lastMessage?.content || "";

      // Determine task type from context (simple heuristic)
      let task = "chat";
      if (input.toLowerCase().includes("code") || 
          input.toLowerCase().includes("function") ||
          input.toLowerCase().includes("implement")) {
        task = "code";
      }

      console.log(`[${new Date().toISOString()}] ${task} request: ${input.slice(0, 50)}...`);

      // Route through @aibadgr/ai-task-router
      const result = await router.run({
        task,
        messages,
        stream: request.stream || false,
        maxTokens: request.max_tokens,
        temperature: request.temperature
      });

      console.log(`  → Provider: ${result.provider}, Cost: $${result.cost?.estimatedUsd?.toFixed(6)}, Latency: ${result.latencyMs}ms`);

      // Convert back to OpenAI format
      const response = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: result.model || request.model || "gpt-3.5-turbo",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: result.outputText
          },
          finish_reason: "stop"
        }],
        usage: result.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error("Error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ 
        error: { 
          message: error.message,
          type: "server_error"
        }
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 AI Badgr Router proxy server running on http://localhost:${PORT}`);
  console.log(`   Configure your tool to use: http://localhost:${PORT}/v1`);
  console.log("");
  console.log("   Routing configuration:");
  console.log("   - Default provider: AI Badgr (cost-optimized)");
  console.log("   - Automatic fallback enabled");
  console.log("");
  console.log("   Set AIBADGR_API_KEY in your environment to get started");
});
