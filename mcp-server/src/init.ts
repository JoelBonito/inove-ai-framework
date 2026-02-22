#!/usr/bin/env node
/**
 * Bootstrap generator for Inove AI Framework (MCP Mode).
 *
 * Creates minimal instruction files that bridge /slash and @agent
 * patterns to the MCP tools (execute_workflow, activate_agent).
 *
 * Usage:
 *   npx @joelbonito/mcp-server init          # generates CLAUDE.md + AGENTS.md
 *   npx @joelbonito/mcp-server init --claude  # only CLAUDE.md
 *   npx @joelbonito/mcp-server init --codex   # only AGENTS.md
 */

import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

const CLAUDE_MD = `# Inove AI Framework (MCP Mode)

> This project uses the Inove AI Framework via MCP server (\`@joelbonito/mcp-server\`).
> No local framework files needed — all agents, skills and workflows are served via MCP.

${SHARED_RULES}`;

const AGENTS_MD = `# Inove AI Framework (MCP Mode)

> This project uses the Inove AI Framework via MCP server (\`@joelbonito/mcp-server\`).
> No local framework files needed — all agents, skills and workflows are served via MCP.

${SHARED_RULES}`;

function main(): void {
  const args = process.argv.slice(2);

  // Remove "init" if passed as first arg (from bin dispatch)
  if (args[0] === "init") args.shift();

  const claudeOnly = args.includes("--claude");
  const codexOnly = args.includes("--codex");
  const both = !claudeOnly && !codexOnly;

  const cwd = process.cwd();
  let created = 0;

  if (both || claudeOnly) {
    const path = resolve(cwd, "CLAUDE.md");
    if (existsSync(path)) {
      console.log(`⚠️  CLAUDE.md already exists — skipping (use --force to overwrite is not supported, merge manually)`);
    } else {
      writeFileSync(path, CLAUDE_MD, "utf-8");
      console.log(`✅ Created CLAUDE.md`);
      created++;
    }
  }

  if (both || codexOnly) {
    const path = resolve(cwd, "AGENTS.md");
    if (existsSync(path)) {
      console.log(`⚠️  AGENTS.md already exists — skipping`);
    } else {
      writeFileSync(path, AGENTS_MD, "utf-8");
      console.log(`✅ Created AGENTS.md`);
      created++;
    }
  }

  if (created > 0) {
    console.log(`\n🚀 Inove AI Framework (MCP Mode) initialized!`);
    console.log(`   Now you can use /slash commands and @agent mentions.`);
    console.log(`\n   Make sure the MCP server is configured:`);
    console.log(`   • Claude Code: claude mcp add inove-ai -- npx -y @joelbonito/mcp-server`);
    console.log(`   • Codex CLI:   codex mcp add inove-ai -- npx -y @joelbonito/mcp-server`);
    console.log(`   • Cursor:      .cursor/mcp.json`);
  } else {
    console.log(`\nNothing to create — files already exist.`);
  }
}

main();
