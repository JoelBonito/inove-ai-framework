#!/usr/bin/env node --loader ./ts-esm-loader.mjs
/**
 * Prebuild script: reads .agents/ content and generates src/registry.ts
 * This makes the npm package self-contained (no filesystem access needed).
 * Also bundles scripts, config, root files and squad templates for install command.
 */
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const AGENTS_ROOT = join(PROJECT_ROOT, ".agents");
const OUTPUT = join(__dirname, "..", "src", "registry.ts");

async function readMdFiles(dir: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const files = await readdir(dir);
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    result[f.replace(/\.md$/, "")] = await readFile(join(dir, f), "utf-8");
  }
  return result;
}

async function readSkillDirs(dir: string): Promise<Record<string, { skill: string; subFiles: Record<string, string>; hasScripts: boolean; scripts: Record<string, string> }>> {
  const result: Record<string, { skill: string; subFiles: Record<string, string>; hasScripts: boolean; scripts: Record<string, string> }> = {};
  const entries = await readdir(dir);

  for (const entry of entries) {
    const skillDir = join(dir, entry);
    const info = await stat(skillDir);
    if (!info.isDirectory()) continue;

    const skillFile = join(skillDir, "SKILL.md");
    let skillContent: string;
    try {
      skillContent = await readFile(skillFile, "utf-8");
    } catch {
      continue;
    }

    const subFiles: Record<string, string> = {};
    const dirFiles = await readdir(skillDir);
    for (const f of dirFiles) {
      if (f === "SKILL.md" || !f.endsWith(".md")) continue;
      subFiles[f] = await readFile(join(skillDir, f), "utf-8");
    }

    let hasScripts = false;
    const scripts: Record<string, string> = {};
    try {
      const scriptsDir = join(skillDir, "scripts");
      const scriptsInfo = await stat(scriptsDir);
      hasScripts = scriptsInfo.isDirectory();
      if (hasScripts) {
        const scriptFiles = await readdir(scriptsDir);
        for (const f of scriptFiles) {
          if (!f.endsWith(".py")) continue;
          scripts[f] = await readFile(join(scriptsDir, f), "utf-8");
        }
      }
    } catch { /* no scripts */ }

    result[entry] = { skill: skillContent, subFiles, hasScripts, scripts };
  }
  return result;
}

async function readPyFiles(dir: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const files = await readdir(dir);
  for (const f of files) {
    if (!f.endsWith(".py")) continue;
    result[f] = await readFile(join(dir, f), "utf-8");
  }
  return result;
}

async function readConfigFiles(dir: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  try {
    const files = await readdir(dir);
    for (const f of files) {
      result[f] = await readFile(join(dir, f), "utf-8");
    }
  } catch { /* no config dir */ }
  return result;
}

async function readRootFiles(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const targets = ["CLAUDE.md", "AGENTS.md", "GEMINI.md"];
  for (const f of targets) {
    try {
      result[f] = await readFile(join(root, f), "utf-8");
    } catch { /* file may not exist */ }
  }
  return result;
}

async function readSquadTemplates(root: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const templatesDir = join(root, "squads", ".templates");
  try {
    await stat(templatesDir);
  } catch {
    return result;
  }

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const relPath = relative(templatesDir, fullPath);
        result[relPath] = await readFile(fullPath, "utf-8");
      }
    }
  }

  await walk(templatesDir);
  return result;
}

async function main() {
  console.log("[bundle-content] Reading .agents/ ...");

  const [agents, skills, workflows, architecture, instructions, scripts, config, rootFiles, squadTemplates] = await Promise.all([
    readMdFiles(join(AGENTS_ROOT, "agents")),
    readSkillDirs(join(AGENTS_ROOT, "skills")),
    readMdFiles(join(AGENTS_ROOT, "workflows")),
    readFile(join(AGENTS_ROOT, "ARCHITECTURE.md"), "utf-8"),
    readFile(join(AGENTS_ROOT, "INSTRUCTIONS.md"), "utf-8"),
    readPyFiles(join(AGENTS_ROOT, "scripts")),
    readConfigFiles(join(AGENTS_ROOT, "config")),
    readRootFiles(PROJECT_ROOT),
    readSquadTemplates(PROJECT_ROOT),
  ]);

  const agentCount = Object.keys(agents).length;
  const skillCount = Object.keys(skills).length;
  const workflowCount = Object.keys(workflows).length;
  const scriptCount = Object.keys(scripts).length;

  const code = `// AUTO-GENERATED by scripts/bundle-content.ts — DO NOT EDIT
// ${agentCount} agents, ${skillCount} skills, ${workflowCount} workflows, ${scriptCount} scripts

export const EMBEDDED_AGENTS: Record<string, string> = ${JSON.stringify(agents, null, 2)};

export const EMBEDDED_SKILLS: Record<string, { skill: string; subFiles: Record<string, string>; hasScripts: boolean; scripts: Record<string, string> }> = ${JSON.stringify(skills, null, 2)};

export const EMBEDDED_WORKFLOWS: Record<string, string> = ${JSON.stringify(workflows, null, 2)};

export const EMBEDDED_ARCHITECTURE: string = ${JSON.stringify(architecture)};

export const EMBEDDED_INSTRUCTIONS: string = ${JSON.stringify(instructions)};

export const EMBEDDED_SCRIPTS: Record<string, string> = ${JSON.stringify(scripts, null, 2)};

export const EMBEDDED_CONFIG: Record<string, string> = ${JSON.stringify(config, null, 2)};

export const EMBEDDED_ROOT_FILES: Record<string, string> = ${JSON.stringify(rootFiles, null, 2)};

export const EMBEDDED_SQUAD_TEMPLATES: Record<string, string> = ${JSON.stringify(squadTemplates, null, 2)};
`;

  await writeFile(OUTPUT, code, "utf-8");
  console.log(`[bundle-content] Generated src/registry.ts (${agentCount} agents, ${skillCount} skills, ${workflowCount} workflows, ${scriptCount} scripts)`);
}

main().catch((err) => {
  console.error("[bundle-content] FATAL:", err);
  process.exit(1);
});
