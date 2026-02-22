#!/usr/bin/env node
/**
 * Full framework installer for Inove AI Framework.
 *
 * Extracts the embedded content from registry.ts and writes it to disk,
 * creating the full .agents/ structure, instruction files, and symlinks.
 *
 * Usage:
 *   npx @joelbonito/mcp-server install   # Full install
 *   npx @joelbonito/mcp-server update    # Update (preserves CLAUDE.md, AGENTS.md, GEMINI.md)
 */

import { writeFileSync, mkdirSync, existsSync, symlinkSync, readlinkSync, unlinkSync, lstatSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import {
  EMBEDDED_AGENTS,
  EMBEDDED_SKILLS,
  EMBEDDED_WORKFLOWS,
  EMBEDDED_ARCHITECTURE,
  EMBEDDED_INSTRUCTIONS,
  EMBEDDED_SCRIPTS,
  EMBEDDED_CONFIG,
  EMBEDDED_ROOT_FILES,
  EMBEDDED_SQUAD_TEMPLATES,
} from "./registry.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

function writeFile(path: string, content: string): void {
  ensureDir(dirname(path));
  writeFileSync(path, content, "utf-8");
}

function ensureSymlink(target: string, linkPath: string): void {
  ensureDir(dirname(linkPath));

  if (lstatSync(linkPath, { throwIfNoEntry: false })?.isSymbolicLink()) {
    const current = readlinkSync(linkPath);
    if (current === target) return; // already correct
    unlinkSync(linkPath);
  } else if (existsSync(linkPath)) {
    return; // real directory exists, don't replace
  }

  symlinkSync(target, linkPath);
}

// ---------------------------------------------------------------------------
// Install logic
// ---------------------------------------------------------------------------

export function installFramework(cwd: string, isUpdate: boolean): void {
  const agentsDir = resolve(cwd, ".agents");
  let created = 0;
  let updated = 0;
  let skipped = 0;

  function writeIfNeeded(path: string, content: string, preserve: boolean): void {
    if (preserve && existsSync(path)) {
      skipped++;
      return;
    }
    const existed = existsSync(path);
    writeFile(path, content);
    if (existed) updated++;
    else created++;
  }

  console.log(`\n${isUpdate ? "Updating" : "Installing"} Inove AI Framework...`);
  console.log(`Target: ${cwd}\n`);

  // --- 1. Agents ---
  console.log("[1/8] Agents");
  for (const [name, content] of Object.entries(EMBEDDED_AGENTS)) {
    writeIfNeeded(join(agentsDir, "agents", `${name}.md`), content, false);
  }
  console.log(`  ${Object.keys(EMBEDDED_AGENTS).length} agents`);

  // --- 2. Skills (SKILL.md + sub-files + scripts) ---
  console.log("[2/8] Skills");
  for (const [name, data] of Object.entries(EMBEDDED_SKILLS)) {
    const skillDir = join(agentsDir, "skills", name);
    writeIfNeeded(join(skillDir, "SKILL.md"), data.skill, false);

    for (const [subName, subContent] of Object.entries(data.subFiles)) {
      writeIfNeeded(join(skillDir, subName), subContent, false);
    }

    if (data.scripts && Object.keys(data.scripts).length > 0) {
      for (const [scriptName, scriptContent] of Object.entries(data.scripts)) {
        writeIfNeeded(join(skillDir, "scripts", scriptName), scriptContent, false);
      }
    }
  }
  console.log(`  ${Object.keys(EMBEDDED_SKILLS).length} skills`);

  // --- 3. Workflows ---
  console.log("[3/8] Workflows");
  for (const [name, content] of Object.entries(EMBEDDED_WORKFLOWS)) {
    writeIfNeeded(join(agentsDir, "workflows", `${name}.md`), content, false);
  }
  console.log(`  ${Object.keys(EMBEDDED_WORKFLOWS).length} workflows`);

  // --- 4. Scripts ---
  console.log("[4/8] Scripts");
  for (const [name, content] of Object.entries(EMBEDDED_SCRIPTS)) {
    writeIfNeeded(join(agentsDir, "scripts", name), content, false);
  }
  console.log(`  ${Object.keys(EMBEDDED_SCRIPTS).length} scripts`);

  // --- 5. Core docs ---
  console.log("[5/8] Core docs");
  writeIfNeeded(join(agentsDir, "ARCHITECTURE.md"), EMBEDDED_ARCHITECTURE, false);
  writeIfNeeded(join(agentsDir, "INSTRUCTIONS.md"), EMBEDDED_INSTRUCTIONS, false);
  console.log("  ARCHITECTURE.md, INSTRUCTIONS.md");

  // --- 6. Config ---
  console.log("[6/8] Config");
  for (const [name, content] of Object.entries(EMBEDDED_CONFIG)) {
    writeIfNeeded(join(agentsDir, "config", name), content, false);
  }
  console.log(`  ${Object.keys(EMBEDDED_CONFIG).length} config files`);

  // --- 7. Root instruction files (preserve on update) ---
  console.log("[7/8] Instruction files");
  for (const [name, content] of Object.entries(EMBEDDED_ROOT_FILES)) {
    const preserve = isUpdate; // on update, don't overwrite user's custom files
    writeIfNeeded(resolve(cwd, name), content, preserve);
    if (preserve && existsSync(resolve(cwd, name))) {
      console.log(`  ${name} — preserved (user custom)`);
    } else {
      console.log(`  ${name}`);
    }
  }

  // --- 8. Symlinks + Squad templates ---
  console.log("[8/8] Symlinks & squad templates");

  // .claude/ symlinks
  ensureSymlink(join("..", ".agents", "agents"), resolve(cwd, ".claude", "agents"));
  ensureSymlink(join("..", ".agents", "skills"), resolve(cwd, ".claude", "skills"));
  console.log("  .claude/agents -> .agents/agents");
  console.log("  .claude/skills -> .agents/skills");

  // .claude/project_instructions.md (pointer file)
  const pointerContent = `# Claude Code Project Instructions\n\n> This file points Claude Code to the master instructions.\n> Do NOT duplicate content here.\n\nSee [CLAUDE.md](../CLAUDE.md) for all project instructions.\n`;
  writeIfNeeded(resolve(cwd, ".claude", "project_instructions.md"), pointerContent, isUpdate);

  // .codex/ symlinks (optional)
  ensureSymlink(join("..", ".agents", "agents"), resolve(cwd, ".codex", "agents"));
  ensureSymlink(join("..", ".agents", "skills"), resolve(cwd, ".codex", "skills"));
  ensureSymlink(join("..", ".agents", "workflows"), resolve(cwd, ".codex", "prompts"));
  console.log("  .codex/agents -> .agents/agents");
  console.log("  .codex/skills -> .agents/skills");
  console.log("  .codex/prompts -> .agents/workflows");

  // Squad templates
  ensureDir(resolve(cwd, "squads", ".templates"));
  for (const [relPath, content] of Object.entries(EMBEDDED_SQUAD_TEMPLATES)) {
    writeIfNeeded(resolve(cwd, "squads", ".templates", relPath), content, false);
  }

  // squads/README.md
  const squadsReadme = `# Squads\n\nSquads are reusable packages of agents + skills + workflows for specific domains.\n\nUse \`/squad create <name>\` to create a new squad from templates in \`.templates/\`.\n`;
  writeIfNeeded(resolve(cwd, "squads", "README.md"), squadsReadme, isUpdate);
  console.log(`  ${Object.keys(EMBEDDED_SQUAD_TEMPLATES).length} squad template files`);

  // --- Summary ---
  console.log("\n" + "=".repeat(50));
  console.log(`Inove AI Framework ${isUpdate ? "updated" : "installed"}!`);
  console.log(`  Created:   ${created}`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Preserved: ${skipped}`);
  console.log("=".repeat(50));

  console.log(`
Next steps:
  1. Configure MCP server (for enhanced AI integration):
     claude mcp add inove-ai -- npx -y @joelbonito/mcp-server
     codex mcp add inove-ai -- npx -y @joelbonito/mcp-server

  2. Validate installation:
     python3 .agents/scripts/validate_installation.py

  3. Start working:
     /define <your project description>
`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "install") {
    installFramework(process.cwd(), false);
  } else if (command === "update") {
    if (!existsSync(resolve(process.cwd(), ".agents"))) {
      console.error("No .agents/ directory found. Use 'install' first.");
      process.exit(1);
    }
    installFramework(process.cwd(), true);
  } else {
    console.log("Usage:");
    console.log("  npx @joelbonito/mcp-server install   # Full install");
    console.log("  npx @joelbonito/mcp-server update    # Update (preserves instruction files)");
    process.exit(1);
  }
}

main();
