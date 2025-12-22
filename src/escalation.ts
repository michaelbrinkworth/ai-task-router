/**
 * Escalation logic for quality gate evaluation
 * 
 * Evaluates response quality and triggers escalation if needed.
 */

import {
  ChatRunResponse,
  EscalationConfig,
  ClassificationResult,
  ProviderName,
} from "./types.js";

/**
 * Escalation evaluation result
 */
export interface EscalationEvaluation {
  /** Whether escalation is needed */
  shouldEscalate: boolean;
  /** Reason for escalation (if applicable) */
  reason?: string;
}

/**
 * Evaluate if a response should be escalated
 * 
 * @param response - The response to evaluate
 * @param requestedJson - Whether JSON output was requested
 * @param classification - Classification result (for expected length)
 * @param escalationConfig - Escalation configuration
 * @returns Escalation evaluation
 */
export function evaluateEscalation(
  response: ChatRunResponse,
  requestedJson: boolean,
  classification: ClassificationResult | undefined,
  escalationConfig: EscalationConfig
): EscalationEvaluation {
  if (!escalationConfig.enabled) {
    return { shouldEscalate: false };
  }

  // Quality gate 1: JSON validation
  if (requestedJson) {
    const jsonValid = validateJson(response.outputText);
    if (!jsonValid) {
      return {
        shouldEscalate: true,
        reason: "JSON validation failed (requested json: true but output is not valid JSON)",
      };
    }
  }

  // Quality gate 2: Length threshold
  if (classification?.expectedLength === "long") {
    const minLength = escalationConfig.minLength || 100;
    const outputTokens = response.usage?.outputTokens || 0;

    if (outputTokens < minLength) {
      return {
        shouldEscalate: true,
        reason: `Response too short (${outputTokens} tokens < ${minLength} tokens for expected long response)`,
      };
    }
  }

  // Quality gate 3: Uncertainty patterns (optional)
  if (escalationConfig.checkUncertainty) {
    const hasUncertainty = detectUncertaintyPatterns(response.outputText);
    if (hasUncertainty) {
      return {
        shouldEscalate: true,
        reason: "Response contains uncertainty patterns (e.g., 'I can't', 'I'm not sure')",
      };
    }
  }

  return { shouldEscalate: false };
}

/**
 * Validate if output is valid JSON
 */
function validateJson(output: string): boolean {
  try {
    JSON.parse(output);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect uncertainty patterns in response
 * 
 * Patterns like "I can't", "I'm not sure", "as an AI"
 */
function detectUncertaintyPatterns(output: string): boolean {
  const uncertaintyPatterns = [
    /i can't/i,
    /i cannot/i,
    /i'm not sure/i,
    /i am not sure/i,
    /as an ai/i,
    /i don't know/i,
    /i do not know/i,
    /unable to/i,
    /not able to/i,
  ];

  return uncertaintyPatterns.some((pattern) => pattern.test(output));
}

/**
 * Get next provider for escalation
 * 
 * Simple strategy: cycle through available providers
 * 
 * @param currentProvider - Provider that was just used
 * @param availableProviders - List of configured providers
 * @returns Next provider to try, or undefined if none available
 */
export function getEscalationProvider(
  currentProvider: ProviderName,
  availableProviders: ProviderName[]
): ProviderName | undefined {
  // Filter out current provider
  const remainingProviders = availableProviders.filter(
    (p) => p !== currentProvider
  );

  if (remainingProviders.length === 0) {
    return undefined;
  }

  // Prefer premium providers for escalation
  const providerPriority: ProviderName[] = ["anthropic", "openai", "aibadgr"];

  for (const provider of providerPriority) {
    if (remainingProviders.includes(provider)) {
      return provider;
    }
  }

  // Fallback to first remaining provider
  return remainingProviders[0];
}
