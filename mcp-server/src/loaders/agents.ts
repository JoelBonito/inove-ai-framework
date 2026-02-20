import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../paths.js";
import type { Agent } from "../types.js";
import { parseAgentFrontmatter } from "./frontmatter.js";

export async function loadAllAgents(): Promise<Map<string, Agent>> {
  const agents = new Map<string, Agent>();
  const files = await readdir(PATHS.agents);

  const mdFiles = files.filter((f) => f.endsWith(".md"));
  const results = await Promise.all(
    mdFiles.map(async (file) => {
      const raw = await readFile(join(PATHS.agents, file), "utf-8");
      const { meta, body } = parseAgentFrontmatter(raw);
      const name = meta.name || file.replace(/\.md$/, "");
      return [name, { meta: { ...meta, name }, body, raw }] as const;
    }),
  );

  for (const [name, agent] of results) {
    agents.set(name, agent);
  }
  return agents;
}
