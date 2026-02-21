<p align="center">
  <img src="../assets/logo.jpg" alt="Inove AI Framework" width="160">
</p>

<h1 align="center">@joelbonito/mcp-server</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@joelbonito/mcp-server"><img src="https://img.shields.io/npm/v/@joelbonito/mcp-server" alt="npm version"></a>
  <a href="https://github.com/JoelBonito/inove-ai-framework/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>

<p align="center">
  MCP server for <strong>Inove AI Framework</strong> — 21 agents, 41 skills, and 22 workflows served via the Model Context Protocol.
</p>

Zero disk usage per project. Auto-updates on every run. Setup in 30 seconds.

## Quick Start

### Claude Code

```bash
claude mcp add inove-ai -- npx -y @joelbonito/mcp-server
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "inove-ai": {
      "command": "npx",
      "args": ["-y", "@joelbonito/mcp-server"]
    }
  }
}
```

### Windsurf / Cline

Any MCP-compatible tool works — point it to `npx -y @joelbonito/mcp-server` as a stdio server.

## What You Get

### 8 Tools

| Tool | Description |
|------|-------------|
| `list_agents` | List all 21 specialized agents |
| `list_skills` | List all 41 modular skills |
| `list_workflows` | List all 22 workflows |
| `get_agent` | Get full agent content by name |
| `get_skill` | Get skill content (SKILL.md + sub-files) |
| `get_workflow` | Get workflow content by name |
| `route_task` | Recommend agents + skills for a task description |
| `search_content` | Full-text search across all content |

### 6 Resources

| URI | Description |
|-----|-------------|
| `inove://agents` | JSON list of all agents |
| `inove://agents/{name}` | Full agent markdown |
| `inove://skills/{name}` | Full skill markdown |
| `inove://workflows/{name}` | Full workflow markdown |
| `inove://architecture` | Architecture documentation |
| `inove://instructions` | Framework instructions |

### 22 Prompts

One prompt per workflow: `define`, `debug`, `create`, `brainstorm`, `enhance`, `deploy`, `test`, `track`, `status`, `log`, `finish`, `orchestrate`, `plan`, `preview`, `ui-ux-pro-max`, `review`, `test-book`, `release`, `squad`, `context`, `readiness`, `journeys`.

## Agents

| Agent | Domain |
|-------|--------|
| `orchestrator` | Multi-agent coordination |
| `project-planner` | Architecture, system design |
| `product-manager` | Requirements, discovery |
| `product-owner` | User stories, backlog, MVP |
| `frontend-specialist` | React, UI/UX, Tailwind |
| `backend-specialist` | APIs, Node.js, server |
| `database-architect` | Schemas, queries, migrations |
| `mobile-developer` | iOS, Android, React Native |
| `security-auditor` | Auth, OWASP, compliance |
| `penetration-tester` | Offensive security testing |
| `debugger` | Root cause analysis |
| `devops-engineer` | CI/CD, Docker, infra |
| `test-engineer` | Test strategies, TDD |
| `qa-automation-engineer` | E2E, Playwright, automation |
| `performance-optimizer` | Speed, Core Web Vitals |
| `seo-specialist` | SEO, visibility, ranking |
| `documentation-writer` | Technical documentation |
| `code-archaeologist` | Legacy code, refactoring |
| `game-developer` | Game logic, engines |
| `ux-researcher` | User flows, wireframes, usability |
| `explorer-agent` | Codebase analysis |

## Usage Examples

```
User: "Help me debug this React authentication bug"
AI:   [calls route_task] → recommends debugger + security-auditor
      [calls get_agent("debugger")] → loads persona + protocols
      → Starts systematic debugging with root cause analysis
```

```
User: "List available workflows"
AI:   [calls list_workflows] → 22 workflows with descriptions
      → Shows /define, /debug, /create, /deploy, etc.
```

## Requirements

- Node.js >= 22
- Any MCP-compatible AI tool

## Development

```bash
git clone https://github.com/JoelBonito/inove-ai-framework.git
cd inove-ai-framework/mcp-server
npm install
npm run dev      # Reads from .agents/ filesystem (hot reload)
npm test         # 91 tests
npm run build    # Bundles content + compiles TypeScript
```

## Architecture

- **stdio transport** for local use via `npx`
- **Cloudflare Workers** for remote SSE access
- Content from `.agents/` is embedded at build-time into `registry.ts`
- In dev mode, reads directly from the filesystem for instant feedback
- Only 3 runtime dependencies: `@modelcontextprotocol/sdk`, `yaml`, `zod`

## License

MIT