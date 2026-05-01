import { runSuite } from "../harness";
import type { EvalCase } from "../harness";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const casesDir = join(__dirname, "../cases");
const files = readdirSync(casesDir).filter((f) => f.endsWith(".json"));

const allCases: EvalCase[] = files.flatMap((file) => {
  const content = readFileSync(join(casesDir, file), "utf-8");
  return JSON.parse(content) as EvalCase[];
});

runSuite(allCases);
