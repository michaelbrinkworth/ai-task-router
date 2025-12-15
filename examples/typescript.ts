/**
 * TypeScript Example
 * 
 * Demonstrates full TypeScript usage with type inference and type guards
 */

// Note: When running this example, use the built package:
// npm run build && node --loader ts-node/esm examples/typescript.ts
// Or reference the local build: import from "../dist/index.js"

import {
  createRouter,
  Router,
  RouterConfig,
  ChatRunRequest,
  EmbeddingsRunRequest,
  ChatRunResponse,
  EmbeddingsResponse,
  TaskName,
  ProviderName,
  isChatResponse,
  isEmbeddingsResponse,
  validateTask,
  VALID_TASKS
} from "@aibadgr/router";

// Example 1: Basic typed router
async function example1(): Promise<void> {
  console.log("\n=== Example 1: Basic Typed Router ===\n");

  const config: RouterConfig = {
    providers: {
      aibadgr: {
        apiKey: process.env.AIBADGR_API_KEY || "demo-key"
      }
    },
    routes: {
      code: "aibadgr",
      chat: "aibadgr"
    },
    timeoutMs: 30000,
    maxRetries: 1
  };

  const router: Router = createRouter(config);

  // Type inference for request
  const request: ChatRunRequest = {
    task: "chat",
    input: "Hello, TypeScript!",
    maxTokens: 100,
    temperature: 0.7
  };

  try {
    const response = await router.chat(request);
    console.log("Response:", response.outputText);
    console.log("Provider:", response.provider);
    console.log("Type:", response.model);
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
}

// Example 2: Type guards
async function example2(): Promise<void> {
  console.log("\n=== Example 2: Type Guards ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: process.env.AIBADGR_API_KEY || "demo-key" }
    }
  });

  // Generic run method returns union type
  const response1 = await router.run({
    task: "chat",
    input: "Hello"
  });

  const response2 = await router.run({
    task: "embeddings",
    input: "Hello"
  });

  // Use type guards to narrow types
  if (isChatResponse(response1)) {
    console.log("Chat response:", response1.outputText);
    // TypeScript knows response1.outputText exists
  }

  if (isEmbeddingsResponse(response2)) {
    console.log("Embeddings:", response2.vectors.length, "vectors");
    // TypeScript knows response2.vectors exists
  }
}

// Example 3: Strongly typed task handler
async function example3(): Promise<void> {
  console.log("\n=== Example 3: Strongly Typed Task Handler ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "demo-key" }
    }
  });

  class TaskHandler {
    constructor(private router: Router) {}

    async handleChat(input: string): Promise<string> {
      const request: ChatRunRequest = {
        task: "chat",
        input
      };

      const response = await this.router.chat(request);
      return response.outputText;
    }

    async handleCode(prompt: string): Promise<{ code: string; language: string }> {
      const request: ChatRunRequest = {
        task: "code",
        input: prompt,
        maxTokens: 1000
      };

      const response = await this.router.chat(request);

      return {
        code: response.outputText,
        language: "typescript" // Could parse from response
      };
    }

    async handleEmbeddings(texts: string[]): Promise<number[][]> {
      const request: EmbeddingsRunRequest = {
        task: "embeddings",
        input: texts
      };

      const response = await this.router.embed(request);
      return response.vectors;
    }
  }

  const handler = new TaskHandler(router);

  try {
    const greeting = await handler.handleChat("Hello!");
    console.log("Chat:", greeting);

    const codeResult = await handler.handleCode("Write hello world");
    console.log("Code generated:", codeResult.language);

    const embeddings = await handler.handleEmbeddings(["test1", "test2"]);
    console.log("Embeddings:", embeddings.length, "vectors");
  } catch (error) {
    console.error("Handler error:", (error as Error).message);
  }
}

// Example 4: Generic wrapper with constraints
async function example4(): Promise<void> {
  console.log("\n=== Example 4: Generic Wrapper ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "demo-key" }
    }
  });

  async function makeRequest<T extends "chat" | "embeddings">(
    task: T,
    input: string | string[]
  ): Promise<T extends "embeddings" ? EmbeddingsResponse : ChatRunResponse> {
    if (task === "embeddings") {
      return router.embed({
        task: "embeddings",
        input: input as string | string[]
      }) as any;
    } else {
      return router.chat({
        task: task as Exclude<TaskName, "embeddings">,
        input: input as string
      }) as any;
    }
  }

  try {
    const chatResp = await makeRequest("chat", "Hello");
    console.log("Chat:", chatResp.outputText);

    const embedResp = await makeRequest("embeddings", ["text"]);
    console.log("Embeddings:", embedResp.vectors.length);
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
}

// Example 5: Type-safe configuration builder
async function example5(): Promise<void> {
  console.log("\n=== Example 5: Type-Safe Configuration Builder ===\n");

  class RouterBuilder {
    private config: Partial<RouterConfig> = {
      providers: {
        aibadgr: { apiKey: "" }
      }
    };

    withAIBadgr(apiKey: string): this {
      this.config.providers = {
        ...this.config.providers,
        aibadgr: { apiKey }
      };
      return this;
    }

    withOpenAI(apiKey: string, baseUrl?: string): this {
      this.config.providers = {
        ...this.config.providers,
        openai: { apiKey, baseUrl }
      };
      return this;
    }

    withAnthropic(apiKey: string): this {
      this.config.providers = {
        ...this.config.providers,
        anthropic: { apiKey }
      };
      return this;
    }

    withRoute(task: TaskName, provider: ProviderName): this {
      this.config.routes = {
        ...this.config.routes,
        [task]: provider
      };
      return this;
    }

    withTimeout(ms: number): this {
      this.config.timeoutMs = ms;
      return this;
    }

    withRetries(count: number): this {
      this.config.maxRetries = count;
      return this;
    }

    build(): Router {
      if (!this.config.providers?.aibadgr?.apiKey) {
        throw new Error("AI Badgr API key is required");
      }
      return createRouter(this.config as RouterConfig);
    }
  }

  const router = new RouterBuilder()
    .withAIBadgr("demo-key")
    .withRoute("code", "aibadgr")
    .withTimeout(30000)
    .withRetries(2)
    .build();

  console.log("Router built with type-safe builder!");
  console.log("Config:", router.getConfig());
}

// Example 6: Custom types and interfaces
async function example6(): Promise<void> {
  console.log("\n=== Example 6: Custom Types ===\n");

  interface LLMRequest {
    prompt: string;
    task: TaskName;
    options?: {
      maxTokens?: number;
      temperature?: number;
    };
  }

  interface LLMResponse {
    text: string;
    provider: ProviderName;
    metadata: {
      tokens: number;
      cost: number;
      latency: number;
    };
  }

  class LLMService {
    constructor(private router: Router) {}

    async process(request: LLMRequest): Promise<LLMResponse> {
      const routerRequest: ChatRunRequest = {
        task: request.task === "embeddings" ? "chat" : request.task,
        input: request.prompt,
        maxTokens: request.options?.maxTokens,
        temperature: request.options?.temperature
      };

      const response = await this.router.chat(routerRequest);

      return {
        text: response.outputText,
        provider: response.provider,
        metadata: {
          tokens: response.usage?.totalTokens || 0,
          cost: response.cost?.estimatedUsd || 0,
          latency: response.latencyMs
        }
      };
    }
  }

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "demo-key" }
    }
  });

  const service = new LLMService(router);

  try {
    const result = await service.process({
      prompt: "Hello!",
      task: "chat",
      options: {
        maxTokens: 50,
        temperature: 0.7
      }
    });

    console.log("Result:", result.text);
    console.log("Metadata:", result.metadata);
  } catch (error) {
    console.error("Service error:", (error as Error).message);
  }
}

// Example 7: Async iterator typing (streaming)
async function example7(): Promise<void> {
  console.log("\n=== Example 7: Streaming with Types ===\n");

  const router = createRouter({
    providers: {
      aibadgr: { apiKey: "demo-key" }
    }
  });

  try {
    const stream = await router.chat({
      stream: true,
      input: "Count to 5",
      maxTokens: 100
    });

    console.log("Streaming response:");

    // AsyncIterable is properly typed
    for await (const chunk of stream) {
      if (chunk.deltaText) {
        process.stdout.write(chunk.deltaText);
      }
    }

    console.log("\n");
  } catch (error) {
    console.error("Streaming error:", (error as Error).message);
  }
}

// Main function
async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("TypeScript Examples");
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
