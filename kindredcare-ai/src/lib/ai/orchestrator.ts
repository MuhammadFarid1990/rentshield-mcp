import { getAIProvider } from "./provider";
import { buildSeniorSystemPrompt } from "./prompts/system.senior";
import { buildGroundingContext } from "./grounding";
import { detectHighRisk, filterForbiddenOutput, getEmergencyReply } from "./safety";
import { classifyIntent } from "@/lib/intents/classify";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Senior, SeniorPreferences } from "@/types/domain";
import type { AIResponse } from "@/types/intents";

export interface OrchestratorInput {
  transcript: string;
  senior: Senior;
  prefs: SeniorPreferences | null;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  supabase: SupabaseClient;
  timezone: string;
}

export async function orchestrate(input: OrchestratorInput): Promise<AIResponse> {
  const { transcript, senior, prefs, conversationHistory, supabase, timezone } = input;

  // 1. Pre-filter: high-risk phrase detection (deterministic, never LLM)
  const riskCheck = detectHighRisk(transcript);
  if (riskCheck.isHighRisk) {
    return {
      replyText: getEmergencyReply(),
      intent: {
        intent: "escalate_emergency",
        confidence: "high",
        entities: { matchedPhrase: riskCheck.matchedPhrase },
        requiresConfirmation: false,
        replyText: getEmergencyReply(),
        safetyFlag: true,
        safetyReason: `High-risk phrase detected: "${riskCheck.matchedPhrase}"`,
        isEmergency: true,
      },
      grounded: true,
    };
  }

  // 2. Build grounded context from Supabase
  const groundedContext = await buildGroundingContext(supabase, senior.id, timezone);

  // 3. Build system prompt
  const systemPrompt = buildSeniorSystemPrompt(senior, prefs, groundedContext);

  // 4. Call AI provider
  const provider = getAIProvider();
  const history = conversationHistory.slice(-6); // keep last 3 turns
  const completion = await provider.complete({
    system: systemPrompt,
    messages: [
      ...history,
      { role: "user", content: transcript },
    ],
    maxTokens: 512,
  });

  // 5. Post-filter: check for forbidden content
  const outputCheck = filterForbiddenOutput(completion.text);
  const replyText = outputCheck.safe
    ? completion.text
    : "I am not able to provide that information. Please consult your doctor or caregiver. " +
      "I am here to help with reminders and daily care, not medical advice.";

  // 6. Classify intent
  const intent = classifyIntent(transcript, replyText);

  return {
    replyText,
    intent,
    grounded: true,
  };
}
