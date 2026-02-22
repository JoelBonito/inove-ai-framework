#!/usr/bin/env node
/**
 * CLI entry point for Inove AI Framework.
 *
 * Dispatches commands:
 *   npx @joelbonito/mcp-server install   # Full framework install
 *   npx @joelbonito/mcp-server update    # Update framework (preserves instruction files)
 *   npx @joelbonito/mcp-server init      # MCP-only mode (lightweight bootstrap)
 *
 * The MCP server itself runs via `inove-mcp` (dist/index.js).
 */

import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// MCP-only init (lightweight bootstrap)
// ---------------------------------------------------------------------------

const WORKFLOWS = [
  "define", "debug", "create", "brainstorm", "enhance", "deploy",
  "test", "track", "status", "log", "finish", "orchestrate", "plan",
  "preview", "ui-ux-pro-max", "review", "test-book", "release",
  "squad", "context", "readiness", "journeys",
];

const AGENTS = [
  "orchestrator", "project-planner", "product-manager",
  "frontend-specialist", "backend-specialist", "database-architect",
  "mobile-developer", "security-auditor", "debugger", "devops-engineer",
  "test-engineer", "qa-automation-engineer", "documentation-writer",
  "code-archaeologist", "performance-optimizer", "seo-specialist",
  "penetration-tester", "game-developer", "product-owner",
  "ux-researcher", "explorer-agent", "n8n-specialist",
];

const SHARED_RULES = `
## Slash Commands — Workflow Invocation

When the user types \`/<command>\` (e.g. \`/define\`, \`/debug\`), use the MCP tool \`execute_workflow\` with the command name (without the slash) and any arguments.

Example: \`/define App de gestao de tarefas\` → call \`execute_workflow(name="define", arguments="App de gestao de tarefas")\`

Available workflows: ${WORKFLOWS.map((w) => `\`/${w}\``).join(", ")}

## Agent Activation — @ Mentions

When the user mentions \`@agent-name\` (e.g. \`@frontend-specialist\`), use the MCP tool \`activate_agent\` with the agent name. This loads the agent's full persona, rules and all referenced skills.

Example: \`@security-auditor\` → call \`activate_agent(name="security-auditor")\`

Available agents: ${AGENTS.map((a) => `\`@${a}\``).join(", ")}

## Intelligent Routing

When unsure which agent to use, call \`route_task\` with the user's request. It returns the best-matching agents based on keyword analysis.

## Operational Rules

For full framework behavior (Socratic Gate, Clean Code, Routing Protocol), read the MCP resource \`inove://system-prompt\`.

## Socratic Gate (MANDATORY)

For ALL requests involving code, STOP and ASK first:

| Request Type | Strategy | Action |
|---|---|---|
| New Feature / Build | Deep Discovery | ASK minimum 3 strategic questions |
| Edit / Bug Fix | Diagnosis | Present DIAGNOSIS + PROPOSAL → wait for approval |
| Vague / Simple | Clarification | Ask Purpose, Users and Scope |

## Clean Code (Global)

- Concise, self-documenting code — no over-engineering
- Tests mandatory (Unit > Integration > E2E)
- Code comments and variables in English
- Respond in the user's language
`;

function mcpInit(args: string[]): void {
  const claudeOnly = args.includes("--claude");
  const codexOnly = args.includes("--codex");
  const both = !claudeOnly && !codexOnly;

  const cwd = process.cwd();
  let created = 0;

  const header = `# Inove AI Framework (MCP Mode)

> This project uses the Inove AI Framework via MCP server (\`@joelbonito/mcp-server\`).
> No local framework files needed — all agents, skills and workflows are served via MCP.
`;

  const files: { name: string; condition: boolean }[] = [
    { name: "CLAUDE.md", condition: both || claudeOnly },
    { name: "AGENTS.md", condition: both || codexOnly },
    { name: "GEMINI.md", condition: both },
  ];

  for (const { name, condition } of files) {
    if (!condition) continue;
    const path = resolve(cwd, name);
    if (existsSync(path)) {
      console.log(`  ${name} already exists — skipping`);
    } else {
      writeFileSync(path, header + SHARED_RULES, "utf-8");
      console.log(`  Created ${name}`);
      created++;
    }
  }

  if (created > 0) {
    console.log(`\nInove AI Framework (MCP Mode) initialized!`);
    console.log(`Now you can use /slash commands and @agent mentions.\n`);
    console.log(`Make sure the MCP server is configured:`);
    console.log(`  claude mcp add inove-ai -- npx -y @joelbonito/mcp-server`);
    console.log(`  codex mcp add inove-ai -- npx -y @joelbonito/mcp-server`);
  } else {
    console.log(`\nNothing to create — files already exist.`);
  }
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "install":
    case "update": {
      // Dynamic import to avoid loading registry.ts for non-install commands
      const { installFramework } = await import("./install.js");
      installFramework(process.cwd(), command === "update");
      break;
    }
    case "init":
      mcpInit(args.slice(1));
      break;
    default:
      console.log(`Inove AI Framework CLI\n`);
      console.log(`Usage:`);
      console.log(`  npx @joelbonito/mcp-server install   Full framework install (agents, skills, workflows, scripts)`);
      console.log(`  npx @joelbonito/mcp-server update    Update framework (preserves CLAUDE.md, AGENTS.md, GEMINI.md)`);
      console.log(`  npx @joelbonito/mcp-server init      MCP-only mode (lightweight bootstrap files)`);
      console.log(``);
      console.log(`The MCP server runs automatically when configured in your AI tool.`);
      process.exit(command ? 1 : 0);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
