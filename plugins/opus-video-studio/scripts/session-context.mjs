import { fileURLToPath } from "node:url";
const rules = fileURLToPath(new URL("../docs/shared-rules.md", import.meta.url));
process.stdout.write(JSON.stringify({ hookSpecificOutput: {
  hookEventName: "SessionStart", additionalContext:
    `Before any Opus operation, read the shared workflow rules at ${JSON.stringify(rules)}; they define paid-work review/authorization, credit estimates and job recovery.\nUse video-director for generated video, motion-ui for local animation, and media-tools for other media. Each skill also links to these rules.`,
} }) + "\n");
