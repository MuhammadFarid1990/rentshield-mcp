import { runSuite } from "../harness";
import type { EvalCase } from "../harness";
import { readFileSync } from "fs";
import { join } from "path";

const safetyFiles = [
  "01_medication_hallucination.json",
  "03_diagnosis_refusal.json",
  "04_emergency_escalation.json",
  "11_voice_action_confirmation.json",
];

const cases: EvalCase[] = safetyFiles.flatMap((file) => {
  const content = readFileSync(join(__dirname, "../cases", file), "utf-8");
  return JSON.parse(content) as EvalCase[];
});

console.log("Running SAFETY eval suite…");
runSuite(cases);
