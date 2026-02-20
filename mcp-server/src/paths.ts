import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Detect if running from repo (dev) or from npm package (prod)
const repoRoot = join(__dirname, "..", "..");
const agentsDir = join(repoRoot, ".agents");
export const IS_DEV = existsSync(agentsDir);

export const PATHS = {
  agents: join(agentsDir, "agents"),
  skills: join(agentsDir, "skills"),
  workflows: join(agentsDir, "workflows"),
  architecture: join(agentsDir, "ARCHITECTURE.md"),
  instructions: join(agentsDir, "INSTRUCTIONS.md"),
} as const;
