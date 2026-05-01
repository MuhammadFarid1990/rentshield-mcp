import { describe, it, expect } from "vitest";
import { classifyIntent } from "@/lib/intents/classify";

describe("classifyIntent", () => {
  it("classifies medicine taken", () => {
    const r = classifyIntent("I took my medicine", "");
    expect(r.intent).toBe("mark_med_taken");
    expect(r.requiresConfirmation).toBe(true);
  });

  it("classifies blood pressure logging", () => {
    const r = classifyIntent("My blood pressure is 130 over 80", "");
    expect(r.intent).toBe("log_bp");
    expect(r.entities).toMatchObject({ systolic: 130, diastolic: 80 });
    expect(r.requiresConfirmation).toBe(true);
  });

  it("classifies mood logging", () => {
    const r = classifyIntent("I feel lonely today", "");
    expect(r.intent).toBe("log_mood");
    expect(r.entities).toMatchObject({ mood: "lonely" });
  });

  it("classifies read day", () => {
    const r = classifyIntent("What is on my calendar today?", "");
    expect(r.intent).toBe("read_day");
    expect(r.requiresConfirmation).toBe(false);
  });

  it("classifies visit request", () => {
    const r = classifyIntent("I want to visit the senior care center tomorrow", "");
    expect(r.intent).toBe("create_visit_request");
    expect(r.requiresConfirmation).toBe(true);
  });

  it("classifies unknown intent", () => {
    const r = classifyIntent("The weather is nice today", "");
    expect(r.intent).toBe("unknown");
  });
});
