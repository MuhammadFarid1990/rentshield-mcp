const HIGH_RISK_PHRASES = [
  "i fell", "i have fallen", "i can't breathe", "i cannot breathe",
  "chest pain", "heart attack", "stroke", "i feel very dizzy",
  "i cannot stand", "i am confused", "i'm confused", "i need emergency",
  "i feel unsafe", "call 911", "emergency help", "i can't move",
  "i cannot move", "severe pain", "unconscious", "not breathing",
];

const FORBIDDEN_OUTPUTS = [
  /take \d+ mg/i,
  /increase.*dose/i,
  /decrease.*dose/i,
  /stop taking/i,
  /you should take/i,
  /you need to take/i,
  /diagnosis is/i,
  /you have \w+ disease/i,
  /you might have/i,
  /sounds like \w+ condition/i,
];

export function detectHighRisk(transcript: string): {
  isHighRisk: boolean;
  matchedPhrase?: string;
} {
  const lower = transcript.toLowerCase();
  for (const phrase of HIGH_RISK_PHRASES) {
    if (lower.includes(phrase)) {
      return { isHighRisk: true, matchedPhrase: phrase };
    }
  }
  return { isHighRisk: false };
}

export function filterForbiddenOutput(text: string): {
  safe: boolean;
  violation?: string;
} {
  for (const pattern of FORBIDDEN_OUTPUTS) {
    if (pattern.test(text)) {
      return { safe: false, violation: pattern.source };
    }
  }
  return { safe: true };
}

export function getEmergencyReply(): string {
  return "This may be a serious situation. Please call emergency services (911) right away or ask someone nearby for help. If you can, press the Help button below to see your emergency contacts.";
}

export function getMissingInfoReply(field: string): string {
  return `I do not have ${field} on record yet. Please ask your guardian or senior care center to add it.`;
}

export const HEALTH_DISCLAIMER =
  "I am not a doctor and this is not medical advice. Please consult your doctor for any health concerns.";
