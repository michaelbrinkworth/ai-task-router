/**
 * Main router implementation
 */

import {
  RouterConfig,
  RunRequest,
  ChatRunRequest,
  ChatRunResponse,
  EmbeddingsRunRequest,
  EmbeddingsResponse,
  ChatStream,
  ProviderName,
  TaskName,
  ProviderAdapter,
  Attempt,
} from "./types.js";
import { AIBadgrProvider } from "./providers/aibadgr.js";
import { OpenAIProvider } from "./providers/openai.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { shouldFallback, getErrorStatus, sleep, validateTask, VALID_TASKS } from "./utils.js";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 1;

// Default routing table (cost-saver strategy)
const DEFAULT_ROUTES: Record<TaskName, ProviderName> = {
  summarize: "aibadgr",
  rewrite: "aibadgr",
  classify: "aibadgr",
  extract: "aibadgr",
  chat: "aibadgr",
  embeddings: "aibadgr",
  code: "anthropic", // Falls back to aibadgr if no key
  reasoning: "openai", // Falls back to aibadgr if no key
};

export class Router {
  private providers: Map<ProviderName, ProviderAdapter> = new Map();
  private originalConfig: RouterConfig;
  private config: {
    defaultProvider: ProviderName;
    routes: Partial<Record<TaskName, ProviderName>>;
    fallback: Partial<Record<TaskName, ProviderName[]>>;
    mode: "cheap" | "balanced" | "best";
    timeoutMs: number;
    maxRetries: number;
    fallbackPolicy: "enabled" | "none";
    onResult?: (event: any) => void;
    onError?: (event: any) => void;
  };

  constructor(config: RouterConfig) {
    this.originalConfig = config;
    
    // Validate API keys
    if (!config.providers.aibadgr?.apiKey) {
      throw new Error(
        "AI Badgr API key is required. Add `aibadgr: { apiKey: process.env.AIBADGR_API_KEY }` to your providers config."
      );
    }
    
    // Initialize providers
    this.providers.set(
      "aibadgr",
      new AIBadgrProvider(
        config.providers.aibadgr.apiKey,
        config.providers.aibadgr.baseUrl,
        config.priceOverrides
      )
    );

    if (config.providers.openai) {
      this.providers.set(
        "openai",
        new OpenAIProvider(
          config.providers.openai.apiKey,
          config.providers.openai.baseUrl,
          config.priceOverrides
        )
      );
    }

    if (config.providers.anthropic) {
      this.providers.set(
        "anthropic",
        new AnthropicProvider(config.providers.anthropic.apiKey, config.priceOverrides)
      );
    }

    // Apply mode defaults if specified
    let routes: Partial<Record<TaskName, ProviderName>> = { ...DEFAULT_ROUTES, ...config.routes };
    if (config.mode) {
      routes = this.applyModeDefaults(config.mode, routes);
    }

    this.config = {
      defaultProvider: config.defaultProvider || "aibadgr",
      routes,
      fallback: config.fallback || {},
      mode: config.mode || "cheap",
      timeoutMs: config.timeoutMs || DEFAULT_TIMEOUT_MS,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      fallbackPolicy: config.fallbackPolicy || "enabled",
      onResult: config.onResult,
      onError: config.onError,
    };
    
    // Validate routing configuration (warnings, not errors)
    this.validateRoutingConfig();
  }

  private validateRoutingConfig(): void {
    const warnings: string[] = [];
    
    // Check if user-provided routes point to unconfigured providers
    // Only check originalConfig.routes to avoid warnings about mode-generated routes
    const userRoutes = this.originalConfig.routes || {};
    for (const [task, provider] of Object.entries(userRoutes)) {
      if (provider && !this.providers.has(provider)) {
        warnings.push(
          `Route '${task}' points to unconfigured provider '${provider}'. ` +
          `Add \`${provider}: { apiKey: process.env.${provider.toUpperCase()}_API_KEY }\` to providers config, ` +
          `or remove this route to use the default provider.`
        );
      }
    }
    
    // Check if fallback chains include unconfigured providers
    for (const [task, providers] of Object.entries(this.config.fallback)) {
      if (providers) {
        const unconfigured = providers.filter(p => !this.providers.has(p));
        if (unconfigured.length > 0) {
          warnings.push(
            `Fallback for '${task}' includes unconfigured provider(s): ${unconfigured.join(", ")}. ` +
            `They will be skipped in the fallback chain.`
          );
        }
      }
    }
    
    // Warn about embeddings routed to anthropic
    if (this.config.routes.embeddings === "anthropic") {
      warnings.push(
        `Route 'embeddings' is set to 'anthropic', but Anthropic doesn't support embeddings. ` +
        `It will fallback to aibadgr or openai.`
      );
    }
    
    // Print warnings
    if (warnings.length > 0) {
      console.warn("[@aibadgr/router] Configuration warnings:");
      warnings.forEach(w => console.warn(`  - ${w}`));
    }
  }

  private applyModeDefaults(
    mode: "cheap" | "balanced" | "best",
    routes: Partial<Record<TaskName, ProviderName>>
  ): Partial<Record<TaskName, ProviderName>> {
    if (mode === "cheap") {
      // All to aibadgr
      return {
        ...routes,
        summarize: "aibadgr",
        rewrite: "aibadgr",
        classify: "aibadgr",
        extract: "aibadgr",
        chat: "aibadgr",
        embeddings: "aibadgr",
        code: "aibadgr",
        reasoning: "aibadgr",
      };
    } else if (mode === "balanced") {
      // Premium for code/reasoning
      return {
        ...routes,
        code: this.providers.has("anthropic") ? "anthropic" : "aibadgr",
        reasoning: this.providers.has("openai") ? "openai" : "aibadgr",
      };
    } else if (mode === "best") {
      // Use premium providers where available
      return {
        ...routes,
        code: this.providers.has("anthropic") ? "anthropic" : "aibadgr",
        reasoning: this.providers.has("openai") ? "openai" : "aibadgr",
        chat: this.providers.has("anthropic") ? "anthropic" : "aibadgr",
      };
    }
    return routes;
  }
  
  /**
   * Get current router configuration
   * @returns Current configuration (useful for debugging)
   */
  public getConfig() {
    return {
      providers: Array.from(this.providers.keys()),
      defaultProvider: this.config.defaultProvider,
      routes: this.config.routes,
      fallback: this.config.fallback,
      mode: this.config.mode,
      timeoutMs: this.config.timeoutMs,
      maxRetries: this.config.maxRetries,
      fallbackPolicy: this.config.fallbackPolicy,
    };
  }
  
  /**
   * Validate configuration and return warnings/errors
   * @returns Array of validation messages
   */
  public validateConfig(): { level: "error" | "warning"; message: string }[] {
    const issues: { level: "error" | "warning"; message: string }[] = [];
    
    // Check for configured providers
    if (this.providers.size === 0) {
      issues.push({
        level: "error",
        message: "No providers configured. At least aibadgr provider is required."
      });
    }
    
    // Check routes
    for (const [task, provider] of Object.entries(this.config.routes)) {
      if (provider && !this.providers.has(provider)) {
        issues.push({
          level: "warning",
          message: `Route '${task}' → '${provider}' (provider not configured)`
        });
      }
    }
    
    // Check fallback chains
    for (const [task, providers] of Object.entries(this.config.fallback)) {
      if (providers) {
        const unconfigured = providers.filter(p => !this.providers.has(p));
        if (unconfigured.length > 0) {
          issues.push({
            level: "warning",
            message: `Fallback '${task}' includes unconfigured: ${unconfigured.join(", ")}`
          });
        }
        
        // Check for anthropic in embeddings fallback
        if (task === "embeddings" && providers.includes("anthropic")) {
          issues.push({
            level: "warning",
            message: "Fallback 'embeddings' includes 'anthropic' (doesn't support embeddings)"
          });
        }
      }
    }
    
    return issues;
  }

  private selectProvider(task: TaskName, requestProvider?: ProviderName): ProviderName {
    // 1. Explicit provider override
    if (requestProvider) {
      return requestProvider;
    }

    // 2. Task-based routing
    const routedProvider = this.config.routes[task];
    if (routedProvider && this.providers.has(routedProvider)) {
      return routedProvider;
    }

    // 3. Fallback to default provider
    return this.config.defaultProvider;
  }

  private getFallbackProviders(task: TaskName, primaryProvider: ProviderName): ProviderName[] {
    if (this.config.fallbackPolicy === "none") {
      return [];
    }

    // Use task-specific fallback if configured
    const taskFallback = this.config.fallback[task];
    if (taskFallback) {
      return taskFallback.filter((p) => p !== primaryProvider && this.providers.has(p));
    }

    // Default fallback: all providers except primary
    const allProviders: ProviderName[] = ["aibadgr", "openai", "anthropic"];
    return allProviders.filter((p) => p !== primaryProvider && this.providers.has(p));
  }

  async run(request: RunRequest): Promise<ChatRunResponse | EmbeddingsResponse | ChatStream> {
    // Validate task type
    const task = ("task" in request && request.task) ? request.task : "chat";
    validateTask(task);
    
    if ("task" in request && request.task === "embeddings") {
      return this.embed(request as EmbeddingsRunRequest);
    }
    return this.chat(request as ChatRunRequest);
  }

  async chat(request: ChatRunRequest): Promise<ChatRunResponse | ChatStream> {
    if (request.stream) {
      return this.chatStream(request);
    }

    const task = request.task || "chat";
    
    // Validate task
    validateTask(task);
    
    const primaryProvider = this.selectProvider(task, request.provider);
    const fallbackProviders = request.provider ? [] : this.getFallbackProviders(task, primaryProvider);

    const attempts: Attempt[] = [];
    const startTime = Date.now();

    // Try primary provider with retries
    const provider = this.providers.get(primaryProvider);
    if (!provider) {
      const configuredProviders = Array.from(this.providers.keys()).join(", ");
      throw new Error(
        `Provider '${primaryProvider}' not configured. ` +
        `Available providers: ${configuredProviders}. ` +
        `Add \`${primaryProvider}: { apiKey: process.env.${primaryProvider.toUpperCase()}_API_KEY }\` to your providers config.`
      );
    }

    for (let retry = 0; retry <= this.config.maxRetries; retry++) {
      try {
        const response = await this.executeWithTimeout(provider.chat(request), this.config.timeoutMs);
        response.attempts = [...attempts, ...response.attempts];

        // Fire onResult hook
        if (this.config.onResult) {
          this.config.onResult({
            provider: primaryProvider,
            task,
            latencyMs: Date.now() - startTime,
            usage: response.usage,
            cost: response.cost,
            attempts: response.attempts,
          });
        }

        return response;
      } catch (error) {
        const status = getErrorStatus(error);
        attempts.push({ provider: primaryProvider, ok: false, status, error: String(error) });

        const canFallback = shouldFallback(error, status);
        const isLastRetry = retry === this.config.maxRetries;

        if (!canFallback || isLastRetry) {
          break; // Don't retry, go to fallback
        }

        // Exponential backoff before retry
        await sleep(Math.min(1000 * Math.pow(2, retry), 10000));
      }
    }

    // Try fallback providers
    for (const fallbackProvider of fallbackProviders) {
      const fallbackAdapter = this.providers.get(fallbackProvider);
      if (!fallbackAdapter) continue;

      try {
        const response = await this.executeWithTimeout(
          fallbackAdapter.chat(request),
          this.config.timeoutMs
        );
        response.attempts = [...attempts, ...response.attempts];

        // Fire onResult hook
        if (this.config.onResult) {
          this.config.onResult({
            provider: fallbackProvider,
            task,
            latencyMs: Date.now() - startTime,
            usage: response.usage,
            cost: response.cost,
            attempts: response.attempts,
          });
        }

        return response;
      } catch (error) {
        const status = getErrorStatus(error);
        attempts.push({ provider: fallbackProvider, ok: false, status, error: String(error) });
      }
    }

    // All attempts failed
    const lastError = attempts[attempts.length - 1]?.error || "All providers failed";
    if (this.config.onError) {
      this.config.onError({
        provider: primaryProvider,
        task,
        error: lastError,
        status: attempts[attempts.length - 1]?.status,
        attempts,
      });
    }

    // Build detailed error message
    const attemptSummary = attempts
      .map(a => `  - ${a.provider}: ${a.error}${a.status ? ` (HTTP ${a.status})` : ""}`)
      .join("\n");
    
    const error: any = new Error(
      `Chat request failed for task '${task}' after ${attempts.length} attempt(s).\n` +
      `Attempts:\n${attemptSummary}\n` +
      `Tip: Check your API keys and network connection. Inspect the 'attempts' array on this error for details.`
    );
    error.attempts = attempts;
    error.task = task;
    throw error;
  }

  private async chatStream(request: ChatRunRequest): Promise<ChatStream> {
    const task = request.task || "chat";
    
    // Validate task
    validateTask(task);
    
    const primaryProvider = this.selectProvider(task, request.provider);

    const provider = this.providers.get(primaryProvider);
    if (!provider) {
      const configuredProviders = Array.from(this.providers.keys()).join(", ");
      throw new Error(
        `Provider '${primaryProvider}' not configured. ` +
        `Available providers: ${configuredProviders}.`
      );
    }

    // For streaming, we don't do fallback (too complex for MVP)
    return provider.chatStream(request);
  }

  async embed(request: EmbeddingsRunRequest): Promise<EmbeddingsResponse> {
    const task = "embeddings";
    const primaryProvider = this.selectProvider(task, request.provider);
    const fallbackProviders = request.provider ? [] : this.getFallbackProviders(task, primaryProvider);

    const attempts: Attempt[] = [];
    const startTime = Date.now();

    // Try primary provider
    const provider = this.providers.get(primaryProvider);
    if (!provider) {
      const configuredProviders = Array.from(this.providers.keys()).join(", ");
      throw new Error(
        `Provider '${primaryProvider}' not configured. ` +
        `Available providers: ${configuredProviders}. ` +
        `Note: Anthropic doesn't support embeddings. Use aibadgr or openai.`
      );
    }
    
    // Skip anthropic for embeddings (validation already done at config time)
    if (primaryProvider === "anthropic" && fallbackProviders.length > 0) {
      // Skip to fallback immediately without warning (already warned at config time)
      const fallbackAdapter = this.providers.get(fallbackProviders[0]);
      if (fallbackAdapter) {
        const response = await this.executeWithTimeout(
          fallbackAdapter.embeddings(request),
          this.config.timeoutMs
        );
        response.attempts = [{ provider: primaryProvider, ok: false, error: "Anthropic doesn't support embeddings" }];
        return response;
      }
    }

    for (let retry = 0; retry <= this.config.maxRetries; retry++) {
      try {
        const response = await this.executeWithTimeout(
          provider.embeddings(request),
          this.config.timeoutMs
        );
        response.attempts = [...attempts, ...response.attempts];

        // Fire onResult hook
        if (this.config.onResult) {
          this.config.onResult({
            provider: primaryProvider,
            task,
            latencyMs: Date.now() - startTime,
            usage: response.usage,
            cost: response.cost,
            attempts: response.attempts,
          });
        }

        return response;
      } catch (error) {
        const status = getErrorStatus(error);
        attempts.push({ provider: primaryProvider, ok: false, status, error: String(error) });

        const canFallback = shouldFallback(error, status);
        const isLastRetry = retry === this.config.maxRetries;

        if (!canFallback || isLastRetry) {
          break;
        }

        await sleep(Math.min(1000 * Math.pow(2, retry), 10000));
      }
    }

    // Try fallback providers (only aibadgr and openai support embeddings)
    for (const fallbackProvider of fallbackProviders) {
      if (fallbackProvider === "anthropic") continue; // Skip anthropic for embeddings

      const fallbackAdapter = this.providers.get(fallbackProvider);
      if (!fallbackAdapter) continue;

      try {
        const response = await this.executeWithTimeout(
          fallbackAdapter.embeddings(request),
          this.config.timeoutMs
        );
        response.attempts = [...attempts, ...response.attempts];

        if (this.config.onResult) {
          this.config.onResult({
            provider: fallbackProvider,
            task,
            latencyMs: Date.now() - startTime,
            usage: response.usage,
            cost: response.cost,
            attempts: response.attempts,
          });
        }

        return response;
      } catch (error) {
        const status = getErrorStatus(error);
        attempts.push({ provider: fallbackProvider, ok: false, status, error: String(error) });
      }
    }

    // All attempts failed
    const lastError = attempts[attempts.length - 1]?.error || "All providers failed";
    if (this.config.onError) {
      this.config.onError({
        provider: primaryProvider,
        task,
        error: lastError,
        status: attempts[attempts.length - 1]?.status,
        attempts,
      });
    }

    // Build detailed error message
    const attemptSummary = attempts
      .map(a => `  - ${a.provider}: ${a.error}${a.status ? ` (HTTP ${a.status})` : ""}`)
      .join("\n");
    
    const error: any = new Error(
      `Embeddings request failed after ${attempts.length} attempt(s).\n` +
      `Attempts:\n${attemptSummary}\n` +
      `Tip: Only aibadgr and openai support embeddings (anthropic does not).`
    );
    error.attempts = attempts;
    error.task = task;
    throw error;
  }

  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
      ),
    ]);
  }

  withOverrides(overrides: Partial<RouterConfig>): Router {
    return new Router({
      ...this.originalConfig,
      ...overrides,
    });
  }
}

export function createRouter(config: RouterConfig): Router {
  return new Router(config);
}
