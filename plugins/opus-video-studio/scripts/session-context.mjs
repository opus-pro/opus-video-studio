import { readFileSync } from "node:fs";
const rules = readFileSync(new URL("../docs/shared-rules.md", import.meta.url), "utf8");
process.stdout.write(JSON.stringify({ hookSpecificOutput: {
  hookEventName: "SessionStart", additionalContext: rules,
} }) + "\n");
