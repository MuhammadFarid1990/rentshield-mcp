import { describe, it, expect } from "vitest";
import { detectHighRisk, filterForbiddenOutput } from "@/lib/ai/safety";

describe("detectHighRisk", () => {
  it("detects 'i fell'", () => {
    const result = detectHighRisk("I fell and cannot get up");
    expect(result.isHighRisk).toBe(true);
  });

  it("detects 'chest pain'", () => {
    const result = detectHighRisk("I have chest pain");
    expect(result.isHighRisk).toBe(true);
  });

  it("detects 'cannot breathe'", () => {
    const result = detectHighRisk("I cannot breathe right now");
    expect(result.isHighRisk).toBe(true);
  });

  it("does NOT flag normal conversation", () => {
    const result = detectHighRisk("What is on my calendar today?");
    expect(result.isHighRisk).toBe(false);
  });

  it("does NOT flag mild dizziness", () => {
    const result = detectHighRisk("I feel a little dizzy");
    expect(result.isHighRisk).toBe(false);
  });
});

describe("filterForbiddenOutput", () => {
  it("flags dosage advice", () => {
    const result = filterForbiddenOutput("You should take 500mg twice a day");
    expect(result.safe).toBe(false);
  });

  it("flags diagnosis", () => {
    const result = filterForbiddenOutput("Your diagnosis is hypertension");
    expect(result.safe).toBe(false);
  });

  it("allows safe reminder response", () => {
    const result = filterForbiddenOutput("Shall I mark your medicine as taken?");
    expect(result.safe).toBe(true);
  });

  it("allows doctor referral", () => {
    const result = filterForbiddenOutput("Please contact your doctor for guidance.");
    expect(result.safe).toBe(true);
  });
});
