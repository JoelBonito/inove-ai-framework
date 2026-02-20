import { readFile } from "node:fs/promises";
import { IS_DEV, PATHS } from "../constants.js";
import type { ContentCache } from "../types.js";
import { loadAllAgents } from "./agents.js";
import { loadAllSkills } from "./skills.js";
import { loadAllWorkflows } from "./workflows.js";
import { EmbeddedLoader } from "./embedded.js";

// Store the Promise (not the result) to prevent concurrent load race conditions
let cachePromise: Promise<ContentCache> | null = null;

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

export function getCache(): Promise<ContentCache> {
  if (!cachePromise) {
    cachePromise = IS_DEV ? loadFromFilesystem() : loadFromEmbedded();
  }
  return cachePromise;
}

export function resetCache(): void {
  cachePromise = null;
}
