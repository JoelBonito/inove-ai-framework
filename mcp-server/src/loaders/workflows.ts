import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../paths.js";
import type { Workflow } from "../types.js";
import { parseWorkflowFrontmatter } from "./frontmatter.js";

export async function loadAllWorkflows(): Promise<Map<string, Workflow>> {
  const workflows = new Map<string, Workflow>();
  const files = await readdir(PATHS.workflows);

  const mdFiles = files.filter((f) => f.endsWith(".md"));
  const results = await Promise.all(
    mdFiles.map(async (file) => {
      const raw = await readFile(join(PATHS.workflows, file), "utf-8");
      const { meta, body } = parseWorkflowFrontmatter(raw);
      const name = file.replace(/\.md$/, "");
      return [name, { meta, body, raw }] as const;
    }),
  );

  for (const [name, workflow] of results) {
    workflows.set(name, workflow);
  }
  return workflows;
}
