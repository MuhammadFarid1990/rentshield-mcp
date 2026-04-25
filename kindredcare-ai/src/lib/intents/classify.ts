import type { IntentResult, IntentName } from "@/types/intents";

interface IntentPattern {
  intent: IntentName;
  patterns: RegExp[];
  requiresConfirmation: boolean;
  extractEntities?: (text: string) => Record<string, unknown>;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: "mark_med_taken",
    patterns: [
      /i (took|have taken|already took|just took) my (medicine|medication|meds|pill)/i,
      /medicine (is |was )?taken/i,
      /took (my )?(medicine|meds|pills|medication)/i,
    ],
    requiresConfirmation: true,
    extractEntities: (text) => ({ rawText: text }),
  },
  {
    intent: "log_bp",
    patterns: [
      /blood pressure (is|was|reading)? ?(\d{2,3}) (over|\/|and) (\d{2,3})/i,
      /(\d{2,3}) (over|\/|and) (\d{2,3}) blood pressure/i,
      /bp (is|was)? ?(\d{2,3})[\/\s](\d{2,3})/i,
    ],
    requiresConfirmation: true,
    extractEntities: (text) => {
      const match = text.match(/(\d{2,3})[^\d]+(\d{2,3})/);
      if (match) return { systolic: parseInt(match[1]), diastolic: parseInt(match[2]) };
      return {};
    },
  },
  {
    intent: "log_sugar",
    patterns: [
      /blood sugar (is|was|reading)? ?(\d{2,3})/i,
      /glucose (is|was)? ?(\d{2,3})/i,
      /sugar (level|reading)? ?(is|was)? ?(\d{2,3})/i,
    ],
    requiresConfirmation: true,
    extractEntities: (text) => {
      const match = text.match(/(\d{2,3})/);
      return match ? { value: parseInt(match[1]) } : {};
    },
  },
  {
    intent: "log_mood",
    patterns: [
      /i (feel|am feeling|am) (lonely|sad|happy|great|okay|anxious|unwell|dizzy|tired|good)/i,
      /feeling (lonely|sad|happy|great|okay|anxious|unwell|dizzy|tired|good)/i,
    ],
    requiresConfirmation: false,
    extractEntities: (text) => {
      const match = text.match(/(lonely|sad|happy|great|okay|anxious|unwell|dizzy|tired|good)/i);
      return match ? { mood: match[1].toLowerCase() } : {};
    },
  },
  {
    intent: "create_reminder",
    patterns: [
      /remind me to/i,
      /set a reminder/i,
      /add a reminder/i,
      /can you remind me/i,
    ],
    requiresConfirmation: true,
    extractEntities: (text) => ({ rawText: text }),
  },
  {
    intent: "create_visit_request",
    patterns: [
      /i want to visit (the )?(senior )?(care )?center/i,
      /visit the center/i,
      /go to the senior center/i,
      /i would like to visit/i,
    ],
    requiresConfirmation: true,
    extractEntities: (text) => {
      const tomorrowMatch = /tomorrow/i.test(text);
      return { requestedDate: tomorrowMatch ? "tomorrow" : "tbd" };
    },
  },
  {
    intent: "request_transportation",
    patterns: [
      /i need (a )?ride/i,
      /can (someone|i get) (a )?ride/i,
      /need transportation/i,
      /pickup/i,
    ],
    requiresConfirmation: true,
    extractEntities: (text) => ({ rawText: text }),
  },
  {
    intent: "call_contact",
    patterns: [
      /call (my )?(daughter|son|wife|husband|family|doctor|guardian|care center|senior center)/i,
      /i need to call/i,
      /please call/i,
    ],
    requiresConfirmation: true,
    extractEntities: (text) => {
      const match = text.match(/(daughter|son|wife|husband|family|doctor|guardian|care center|senior center)/i);
      return match ? { contact: match[1].toLowerCase() } : {};
    },
  },
  {
    intent: "read_day",
    patterns: [
      /what (is|do i have) (on )?(my )?(calendar|schedule|today)/i,
      /read (my )?(day|schedule|calendar)/i,
      /what('s| is) (happening|scheduled|planned) today/i,
    ],
    requiresConfirmation: false,
  },
  {
    intent: "read_next",
    patterns: [
      /what (is|comes)? next/i,
      /what('s| is) (my )?next (reminder|appointment|event)/i,
      /did i miss anything/i,
    ],
    requiresConfirmation: false,
  },
  {
    intent: "wellness_checkin",
    patterns: [
      /i (slept|sleep|had) (well|poorly|great|bad|okay)/i,
      /drank (\d+) (glasses|cups|oz)/i,
      /had (breakfast|lunch|dinner|meals?)/i,
      /wellness check/i,
    ],
    requiresConfirmation: false,
    extractEntities: (text) => ({ rawText: text }),
  },
  {
    intent: "play_family_message",
    patterns: [
      /do i have (any )?(messages?|message from)/i,
      /family (message|messages)/i,
      /play (my )?(messages?|voicemail)/i,
    ],
    requiresConfirmation: false,
  },
];

export function classifyIntent(transcript: string, _aiReply: string): IntentResult {
  for (const pattern of INTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(transcript)) {
        const entities = pattern.extractEntities ? pattern.extractEntities(transcript) : {};
        return {
          intent: pattern.intent,
          confidence: "high",
          entities,
          requiresConfirmation: pattern.requiresConfirmation,
          confirmationPrompt: pattern.requiresConfirmation
            ? buildConfirmationPrompt(pattern.intent, entities)
            : undefined,
          replyText: _aiReply,
          safetyFlag: false,
          isEmergency: false,
        };
      }
    }
  }

  return {
    intent: "unknown",
    confidence: "low",
    entities: {},
    requiresConfirmation: false,
    replyText: _aiReply,
    safetyFlag: false,
    isEmergency: false,
  };
}

function buildConfirmationPrompt(intent: IntentName, entities: Record<string, unknown>): string {
  switch (intent) {
    case "mark_med_taken":
      return "Shall I mark your medicine as taken for today?";
    case "log_bp":
      return `Shall I save your blood pressure reading of ${entities.systolic}/${entities.diastolic}?`;
    case "log_sugar":
      return `Shall I save your blood sugar reading of ${entities.value} mg/dL?`;
    case "create_visit_request":
      return "Shall I send a visit request to your senior care center?";
    case "create_reminder":
      return "Shall I add this reminder to your calendar?";
    case "request_transportation":
      return "Shall I submit a transportation request for you?";
    case "call_contact":
      return `Shall I show you the contact information so you can call?`;
    default:
      return "Would you like me to do that?";
  }
}
