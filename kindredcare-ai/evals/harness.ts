import { classifyIntent } from "../src/lib/intents/classify";
import { detectHighRisk, filterForbiddenOutput, getSafeFallbackReply } from "../src/lib/ai/safety";

export interface EvalCase {
  id: string;
  description: string;
  input: string;
  mockAIReply?: string;
  assertions: {
    intent?: string;
    safetyFlag?: boolean;
    isEmergency?: boolean;
    requiresConfirmation?: boolean;
    replyMustNotContain?: string[];
    replyMustContain?: string[];
    highRiskDetected?: boolean;
    forbiddenOutput?: boolean;
  };
}

export interface EvalResult {
  id: string;
  description: string;
  passed: boolean;
  failures: string[];
}

export function runCase(c: EvalCase): EvalResult {
  const failures: string[] = [];
  const mockReply = c.mockAIReply ?? "";

  // Safety pre-filter check
  const riskCheck = detectHighRisk(c.input);
  if (c.assertions.highRiskDetected !== undefined) {
    if (c.assertions.highRiskDetected && !riskCheck.isHighRisk) {
      failures.push(`Expected high-risk detection for: "${c.input}"`);
    }
    if (!c.assertions.highRiskDetected && riskCheck.isHighRisk) {
      failures.push(`Unexpected high-risk detection for: "${c.input}"`);
    }
  }

  // Forbidden output check
  const outputCheck = filterForbiddenOutput(mockReply);
  if (c.assertions.forbiddenOutput !== undefined) {
    if (c.assertions.forbiddenOutput && outputCheck.safe) {
      failures.push(`Expected forbidden output to be detected in: "${mockReply}"`);
    }
    if (!c.assertions.forbiddenOutput && !outputCheck.safe) {
      failures.push(`Unexpected forbidden output detected: "${outputCheck.violation}" in "${mockReply}"`);
    }
  }

  // Intent classification
  if (c.assertions.intent !== undefined && !riskCheck.isHighRisk) {
    const result = classifyIntent(c.input, mockReply);
    if (result.intent !== c.assertions.intent) {
      failures.push(`Intent: expected "${c.assertions.intent}", got "${result.intent}"`);
    }
    if (c.assertions.requiresConfirmation !== undefined && result.requiresConfirmation !== c.assertions.requiresConfirmation) {
      failures.push(`requiresConfirmation: expected ${c.assertions.requiresConfirmation}, got ${result.requiresConfirmation}`);
    }
  }

  // Simulate the orchestrator's post-filter: if the AI's raw reply trips a
  // forbidden pattern, the user-visible reply is replaced with a safe fallback.
  const userVisibleReply = outputCheck.safe ? mockReply : getSafeFallbackReply();

  if (c.assertions.replyMustNotContain) {
    for (const forbidden of c.assertions.replyMustNotContain) {
      if (userVisibleReply.toLowerCase().includes(forbidden.toLowerCase())) {
        failures.push(`Reply must NOT contain: "${forbidden}"`);
      }
    }
  }
  if (c.assertions.replyMustContain) {
    for (const required of c.assertions.replyMustContain) {
      if (!userVisibleReply.toLowerCase().includes(required.toLowerCase())) {
        failures.push(`Reply must contain: "${required}"`);
      }
    }
  }

  return { id: c.id, description: c.description, passed: failures.length === 0, failures };
}

export function runSuite(cases: EvalCase[]): void {
  console.log(`\nRunning ${cases.length} eval cases…\n`);
  let passed = 0;
  let failed = 0;

  for (const c of cases) {
    const result = runCase(c);
    if (result.passed) {
      console.log(`  ✅ ${result.id}: ${result.description}`);
      passed++;
    } else {
      console.log(`  ❌ ${result.id}: ${result.description}`);
      result.failures.forEach((f) => console.log(`       → ${f}`));
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed out of ${cases.length} total.\n`);

  if (failed > 0) {
    console.error("EVAL FAILED — safety or hallucination checks did not pass.");
    process.exit(1);
  }
}
