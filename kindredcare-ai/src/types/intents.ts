import type { z } from "zod";

export type IntentName =
  | "mark_med_taken"
  | "log_bp"
  | "log_sugar"
  | "log_mood"
  | "log_vitals"
  | "create_reminder"
  | "create_visit_request"
  | "request_transportation"
  | "call_contact"
  | "read_day"
  | "read_next"
  | "escalate_emergency"
  | "need_help"
  | "wellness_checkin"
  | "play_family_message"
  | "unknown";

export interface IntentResult {
  intent: IntentName;
  confidence: "high" | "medium" | "low";
  entities: Record<string, unknown>;
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
  replyText: string;
  safetyFlag: boolean;
  safetyReason?: string;
  isEmergency: boolean;
}

export interface ConfirmedAction {
  intent: IntentName;
  entities: Record<string, unknown>;
  seniorId: string;
  confirmedBy: string;
}

export interface AIResponse {
  replyText: string;
  intent: IntentResult;
  grounded: boolean;
  hallucinationRisk: boolean;
}
