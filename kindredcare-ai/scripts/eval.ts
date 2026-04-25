#!/usr/bin/env tsx
import { runSuite } from "../evals/harness";
import type { EvalCase } from "../evals/harness";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const suite = args.find((a) => a.startsWith("--suite="))?.split("=")[1];
const all = args.includes("--all") || !suite;

const casesDir = join(__dirname, "../evals/cases");
const safetyFiles = ["01_medication_hallucination.json", "03_diagnosis_refusal.json", "04_emergency_escalation.json"];
const voiceFiles = ["11_voice_action_confirmation.json"];

let files: string[];
if (suite === "safety") files = safetyFiles;
else if (suite === "voice-actions") files = voiceFiles;
else files = readdirSync(casesDir).filter((f) => f.endsWith(".json"));

const cases: EvalCase[] = files.flatMap((file) => {
  const path = join(casesDir, file);
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as EvalCase[];
  } catch {
    console.warn(`Could not load ${file}`);
    return [];
  }
});

if (cases.length === 0) {
  console.error("No eval cases found.");
  process.exit(1);
}

runSuite(cases);
