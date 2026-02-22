<p align="center">
  <img src="assets/logo.jpg" alt="Inove AI Framework" width="200">
</p>

<h1 align="center">Inove AI Framework</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/@joelbonito/inove-ai-framework"><img src="https://img.shields.io/npm/v/@joelbonito/inove-ai-framework" alt="npm version"></a>
  <a href=".agents/agents/"><img src="https://img.shields.io/badge/Agents-21_core-green" alt="Agents"></a>
  <a href=".agents/skills/"><img src="https://img.shields.io/badge/Skills-41_core-orange" alt="Skills"></a>
  <a href=".agents/workflows/"><img src="https://img.shields.io/badge/Workflows-22_core-purple" alt="Workflows"></a>
</p>

<p align="center">
  <strong>Multi-Agent AI Development Kit with Skills, Agents, and Workflows for Claude Code, Codex CLI, and Antigravity/Gemini.</strong>
</p>

## Quick Install

> **Requires:** Node.js ≥ 22, Python 3, Git.

### Interactive Menu (recommended)

```bash
npx @joelbonito/inove-ai-framework
```

Opens a PT-BR installation wizard with 6 options:

```
● Instalação Completa       — Full install: .agents/, instruction files, symlinks, git hooks
○ Instalação Personalizada  — Choose platforms, components and squads individually
○ Atualizar                 — Update without overwriting CLAUDE.md, AGENTS.md, GEMINI.md
○ Adicionar Plataforma      — Enable Claude Code, Codex CLI or Gemini / Antigravity
○ Verificar Instalação      — Check missing files, broken symlinks and dependencies
○ Desinstalar               — Remove .agents/ and symlinks (project code untouched)
```

**During "Instalação Completa"**, the wizard also asks for Gemini MCP API keys (optional — you can configure later in `.gemini/mcp.json`):

```
? Configurar chaves de API para MCPs do Gemini?
  Context7 (real-time lib docs) e Stitch (UI prototyping). Optional.
  ○ Não  ● Sim

? CONTEXT7_API_KEY (Context7): ________________
? STITCH_API_KEY (Stitch):     ________________
```

If you skip, placeholder env vars (`${CONTEXT7_API_KEY}`, `${STITCH_API_KEY}`) are written to `.gemini/mcp.json` automatically.

### Non-Interactive (CI / scripts)

```bash
npx @joelbonito/inove-ai-framework install
```

No prompts — installs everything with defaults. Use `--force` to overwrite an existing installation:

```bash
npx @joelbonito/inove-ai-framework install --force
```

### Keep it up-to-date

```bash
npx @joelbonito/inove-ai-framework update
```

Updates `.agents/`, scripts and skills without overwriting your instruction files (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`).

### Validate your installation

```bash
npx @joelbonito/inove-ai-framework validate
```

Checks all 21 core agents, 41 core skills, 22 core workflows, 22 scripts, symlinks and platform configs. Squad components (e.g. n8n-automation) are tracked separately and only checked when the squad is active.

### Migrating from the MCP/Thin setup

If you previously relied on the `@joelbonito/mcp-server` thin client:

1. Remove any `claude mcp add ...` / `.cursor/mcp.json` entries that pointed to the remote server.
2. In the project root, run `npx @joelbonito/inove-ai-framework`.
3. Commit the fresh `.agents/`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`.

From now on every repository is self-contained; all instructions and skills live alongside your code.

## What's Included

- **21 Core Agents** for different domains (frontend, backend, security, database, mobile, UX, game dev, etc.) + extra agents via Squads (e.g. n8n-specialist)
- **41 Core Skills** loaded on demand (clean-code, testing-patterns, api-patterns, tailwind, etc.) + extra skills via Squads
- **22 Core Workflows** (slash commands) for structured processes + extra workflows via Squads
- **Squad System** — reusable agent+skill+workflow packages for custom domains
- **Recovery System** — automatic retry and git checkpoint/rollback for resilient execution
- **Stitch MCP Integration** — visual mockups for UI projects via `/define`, `/ui-ux-pro-max`, and `/readiness`
- **Multi-Agent System** with lock synchronization and ownership
- **Documentation Website** — Next.js site with full reference docs (`web/`)

## Usage

### Using Agents

**No need to mention agents explicitly!** The system automatically detects and applies the right specialist(s):

```
You: "Add JWT authentication"
AI: Applying @security-auditor + @backend-specialist...

You: "Fix the dark mode button"
AI: Using @frontend-specialist...

You: "Login returns 500 error"
AI: Using @debugger for systematic analysis...

You: "Design the onboarding flow"
AI: Using @ux-researcher for user journey mapping...
```

### Available Agents

| Agent | Domain |
|-------|--------|
| `orchestrator` | Multi-agent coordination |
| `project-planner` | Planning & discovery |
| `product-manager` | Requirements & user stories |
| `product-owner` | Backlog & MVP management |
| `frontend-specialist` | React, UI/UX, Tailwind |
| `backend-specialist` | APIs, Node.js, server logic |
| `database-architect` | Schemas, queries, migrations |
| `mobile-developer` | iOS, Android, React Native, Flutter |
| `security-auditor` | Auth, OWASP, compliance |
| `penetration-tester` | Security testing & red team |
| `debugger` | Root cause analysis |
| `devops-engineer` | CI/CD, Docker, infrastructure |
| `test-engineer` | Test strategies |
| `qa-automation-engineer` | E2E & automation |
| `performance-optimizer` | Speed & optimization |
| `seo-specialist` | SEO & visibility |
| `ux-researcher` | User flows, wireframes, usability |
| `documentation-writer` | Manuals & docs |
| `code-archaeologist` | Legacy refactoring |
| `game-developer` | Game logic & engines |
| `explorer-agent` | Codebase analysis |

### Using Workflows

Invoke workflows with slash commands:

| Command | Description |
|---------|-------------|
| `/define` | Full project planning in 9 phases with GAP Analysis |
| `/journeys` | Document user journeys |
| `/context` | Create Project Context |
| `/readiness` | Validate readiness for implementation |
| `/brainstorm` | Explore options before implementation |
| `/create` | Create new features or apps |
| `/plan` | Quick task planning |
| `/debug` | Systematic debugging |
| `/enhance` | Improve existing code |
| `/test` | Generate and run tests |
| `/test-book` | Generate/update Test Book |
| `/deploy` | Deploy application |
| `/preview` | Manage dev server (start/stop/restart) |
| `/orchestrate` | Multi-agent coordination |
| `/review` | Post-sprint code review |
| `/ui-ux-pro-max` | Advanced design system with data-driven palettes |
| `/track` | Update task progress |
| `/status` | Check project status |
| `/log` | Record work sessions |
| `/finish` | Mark tasks as complete |
| `/release` | Finalize project and generate release |
| `/squad` | Create and manage agent squads |

Example:

```
/define Task management app
/brainstorm authentication system
/create landing page with hero section
/debug why login fails
/squad create mobile-team
```

## Multi-Platform Support

| Tool | Instruction File | How it works |
|------|-----------------|--------------|
| Claude Code | `CLAUDE.md` | Loaded automatically per session |
| Codex CLI | `AGENTS.md` | Bridge to `.agents/INSTRUCTIONS.md` |
| Antigravity/Gemini | `GEMINI.md` | Platform-specific rules |

All platforms share the same canonical source in `.agents/`.

### Usage Flows

| Flow | Tools | Best For |
|------|-------|----------|
| **Flow A** | Claude Code alone | Full autonomy — planning + implementation in one tool |
| **Flow B** | Gemini (planning) + Codex (implementation) | Team separation of concerns |
| **Standalone** | Any single tool | Each tool works independently with graceful fallbacks |

### Stitch MCP (UI Projects)

For projects with visual interfaces, Stitch MCP provides high-fidelity mockup generation:

- `/define` Phase 3.5 — Visual mockups are **mandatory**
- `/ui-ux-pro-max` Step 2c — Visual preview is **mandatory**
- `/readiness` — Validates mockup existence

> Backend-only, API, or CLI projects: Stitch is skipped automatically.

## Squad System

Squads are reusable packages of agents + skills + workflows for specific domains.

```bash
/squad create mobile-team      # Create a new squad
/squad list                    # List available squads
/squad activate mobile-team    # Activate squad in framework
/squad validate mobile-team    # Validate integrity
```

Squads live in `squads/<name>/` with a `squad.yaml` manifest. See [squads/README.md](squads/README.md) for details.

## Project Structure

```
.agents/
├── agents/           # 21 core specialized agents
├── skills/           # 41 core knowledge modules
├── workflows/        # 22 core workflows (slash commands)
├── scripts/          # Python automation (22 scripts)
├── config/           # Per-platform configuration
├── .shared/          # Shared data (UI/UX databases)
└── ARCHITECTURE.md   # Technical documentation

squads/               # Reusable agent+skill+workflow packages
│ └── n8n-automation/ # n8n specialist (+1 agent, +1 skill, +3 workflows)
.gemini/              # Gemini CLI config (created automatically on install)
│ ├── settings.json   # Model and system instruction
│ └── mcp.json        # MCP servers (Context7, Stitch) — gitignored
tests/                # Framework tests
web/                  # Documentation website (Next.js)
docs/                 # Project docs, backlog, logs
```

## Documentation

- **Architecture:** [.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md)
- **Full Instructions:** [.agents/INSTRUCTIONS.md](.agents/INSTRUCTIONS.md)
- **Skills:** `.agents/skills/*/SKILL.md`
- **Agents:** `.agents/agents/*.md`
- **Workflows:** `.agents/workflows/*.md`
- **Website:** `web/` (run with `cd web && npm run dev`)

## Based on

This project is a fork of [Antigravity Kit](https://github.com/vudovn/antigravity-kit) by Vudovn, extended with multi-platform support (Claude Code + Codex CLI), additional agents, skills, and workflows.

## License

MIT - See [LICENSE](LICENSE) for details.
