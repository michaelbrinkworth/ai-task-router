/**
 * Policy resolution system for intelligent routing
 * 
 * Determines final provider based on classification, policies, and routing mode.
 */

import {
  ProviderName,
  TaskName,
  ClassificationResult,
  RouterMode,
} from "./types.js";

/**
 * Policy resolution result
 */
export interface PolicyResolution {
  /** Final provider to use */
  provider: ProviderName;
  /** Policy rule that was applied */
  policyApplied: string;
  /** Human-readable reason for the decision */
  reason: string;
}

/**
 * Resolve provider based on classification, policies, and routing mode
 * 
 * Precedence order:
 * - Intelligent mode: request.provider > forceProvider > policies[task] > classifier > routes[task] > defaultProvider
 * - Static modes: request.provider > routes[task] > defaultProvider
 * 
 * @param mode - Router mode
 * @param task - Task type
 * @param requestProvider - Explicit provider from request (highest priority)
 * @param forceProvider - Force provider from config
 * @param policies - Policy overrides
 * @param classification - Classification result (intelligent mode only)
 * @param routes - Legacy static routes
 * @param defaultProvider - Default provider
 * @param availableProviders - List of configured providers
 * @returns Policy resolution with provider and reason
 */
export function resolveProvider(
  mode: RouterMode,
  task: TaskName,
  requestProvider: ProviderName | undefined,
  forceProvider: ProviderName | undefined,
  policies: Partial<Record<TaskName, ProviderName>> | undefined,
  classification: ClassificationResult | undefined,
  routes: Partial<Record<TaskName, ProviderName>>,
  defaultProvider: ProviderName,
  availableProviders: ProviderName[]
): PolicyResolution {
  // 1. Explicit provider override (always highest priority)
  if (requestProvider) {
    // Always use request provider, even if not configured
    // This maintains backward compatibility - the error will be thrown later
    // when trying to get the provider from the map
    return {
      provider: requestProvider,
      policyApplied: "request.provider",
      reason: `Explicit request override: ${requestProvider}`,
    };
  }

  // Different resolution logic based on mode
  if (mode === "intelligent") {
    return resolveIntelligentMode(
      task,
      forceProvider,
      policies,
      classification,
      routes,
      defaultProvider,
      availableProviders
    );
  } else {
    return resolveStaticMode(
      task,
      routes,
      defaultProvider,
      availableProviders
    );
  }
}

/**
 * Resolve provider in intelligent mode
 * 
 * Precedence: forceProvider > policies[task] > classifier > routes[task] > defaultProvider
 */
function resolveIntelligentMode(
  task: TaskName,
  forceProvider: ProviderName | undefined,
  policies: Partial<Record<TaskName, ProviderName>> | undefined,
  classification: ClassificationResult | undefined,
  routes: Partial<Record<TaskName, ProviderName>>,
  defaultProvider: ProviderName,
  availableProviders: ProviderName[]
): PolicyResolution {
  // 2. Force provider (bypasses everything)
  if (forceProvider && availableProviders.includes(forceProvider)) {
    return {
      provider: forceProvider,
      policyApplied: "forceProvider",
      reason: `Force provider override: ${forceProvider}`,
    };
  }

  // 3. Policy override for task
  const policyProvider = policies?.[task];
  if (policyProvider && availableProviders.includes(policyProvider)) {
    return {
      provider: policyProvider,
      policyApplied: `policies[${task}]`,
      reason: `Policy override for ${task}: ${policyProvider}`,
    };
  }

  // 4. Classifier result (beats legacy routes in intelligent mode)
  if (classification) {
    const classifierTask = classification.intent;
    const classifierProvider = selectProviderForTask(
      classifierTask,
      routes,
      defaultProvider,
      availableProviders
    );

    if (classifierProvider) {
      return {
        provider: classifierProvider,
        policyApplied: "classifier",
        reason: `AI classification: ${classifierTask} (confidence: ${classification.confidence.toFixed(2)}, complexity: ${classification.complexity})`,
      };
    }
  }

  // 5. Legacy routes (fallback in intelligent mode)
  const routeProvider = routes[task];
  if (routeProvider && availableProviders.includes(routeProvider)) {
    return {
      provider: routeProvider,
      policyApplied: `routes[${task}]`,
      reason: `Legacy route for ${task}: ${routeProvider}`,
    };
  }

  // 6. Default provider
  return {
    provider: defaultProvider,
    policyApplied: "defaultProvider",
    reason: `Default provider: ${defaultProvider}`,
  };
}

/**
 * Resolve provider in static mode (cheap, balanced, best)
 * 
 * Precedence: routes[task] > defaultProvider
 */
function resolveStaticMode(
  task: TaskName,
  routes: Partial<Record<TaskName, ProviderName>>,
  defaultProvider: ProviderName,
  availableProviders: ProviderName[]
): PolicyResolution {
  // Use task-based routing
  const routeProvider = routes[task];
  if (routeProvider && availableProviders.includes(routeProvider)) {
    return {
      provider: routeProvider,
      policyApplied: `routes[${task}]`,
      reason: `Static route for ${task}: ${routeProvider}`,
    };
  }

  // Fallback to default
  return {
    provider: defaultProvider,
    policyApplied: "defaultProvider",
    reason: `Default provider: ${defaultProvider}`,
  };
}

/**
 * Select provider for a classified task
 * 
 * Uses the routes table to find the best provider for the task
 */
function selectProviderForTask(
  task: TaskName,
  routes: Partial<Record<TaskName, ProviderName>>,
  defaultProvider: ProviderName,
  availableProviders: ProviderName[]
): ProviderName {
  const routeProvider = routes[task];
  if (routeProvider && availableProviders.includes(routeProvider)) {
    return routeProvider;
  }
  return defaultProvider;
}
