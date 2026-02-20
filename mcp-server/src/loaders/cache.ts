import { readFile } from "node:fs/promises";
import { IS_DEV, PATHS } from "../constants.js";
import type { ContentCache } from "../types.js";
import { loadAllAgents } from "./agents.js";
import { loadAllSkills } from "./skills.js";
import { loadAllWorkflows } from "./workflows.js";
import { EmbeddedLoader } from "./embedded.js";

let cached: ContentCache | null = null;

async function loadFromFilesystem(): Promise<ContentCache> {
  const [agents, skills, workflows, architecture, instructions] = await Promise.all([
    loadAllAgents(),
    loadAllSkills(),
    loadAllWorkflows(),
    readFile(PATHS.architecture, "utf-8"),
    readFile(PATHS.instructions, "utf-8"),
  ]);
  return { agents, skills, workflows, architecture, instructions };
}

async function loadFromEmbedded(): Promise<ContentCache> {
  const loader = new EmbeddedLoader();
  const [agents, skills, workflows, architecture, instructions] = await Promise.all([
    loader.loadAgents(),
    loader.loadSkills(),
    loader.loadWorkflows(),
    loader.loadFile("ARCHITECTURE"),
    loader.loadFile("INSTRUCTIONS"),
  ]);
  return { agents, skills, workflows, architecture, instructions };
}

export async function getCache(): Promise<ContentCache> {
  if (cached) return cached;
  cached = IS_DEV ? await loadFromFilesystem() : await loadFromEmbedded();
  return cached;
}

export function resetCache(): void {
  cached = null;
}
