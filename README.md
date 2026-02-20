# Inove AI Framework

> Multi-Agent AI Development Kit with Skills, Agents, and Workflows for Claude Code, Codex CLI, and Antigravity/Gemini.

## Quick Install

```bash
npx @inove-ai/inove-ai-framework init
```

This installs the `.agents` folder containing all templates into your project, along with `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md`.

## What's Included

- **21 Specialized Agents** for different domains (frontend, backend, security, database, etc.)
- **41 Modular Skills** loaded on demand
- **22 Workflows** (slash commands) for structured processes
- **Squad System** — reusable agent+skill+workflow packages for custom domains
- **Recovery System** — automatic retry and git checkpoint/rollback for resilient execution
- **Multi-Agent System** with lock synchronization and ownership

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
```

### Using Workflows

Invoke workflows with slash commands:

| Command          | Description                                    |
| ---------------- | ---------------------------------------------- |
| `/define`        | Full project planning in 9 phases with GAP Analysis |
| `/brainstorm`    | Explore options before implementation          |
| `/create`        | Create new features or apps                    |
| `/debug`         | Systematic debugging                           |
| `/deploy`        | Deploy application                             |
| `/enhance`       | Improve existing code                          |
| `/test`          | Generate and run tests                         |
| `/orchestrate`   | Multi-agent coordination                       |
| `/squad`         | Create and manage agent squads                 |
| `/status`        | Check project status                           |
| `/track`         | Update task progress                           |

Example:

```
/brainstorm authentication system
/create landing page with hero section
/debug why login fails
```

## Multi-Platform Support

| Tool             | Instruction File | How it works                     |
| ---------------- | ---------------- | -------------------------------- |
| Claude Code      | `CLAUDE.md`      | Loaded automatically per session |
| Codex CLI        | `AGENTS.md`      | Bridge to `.agents/INSTRUCTIONS.md` |
| Antigravity/Gemini | `GEMINI.md`    | Platform-specific rules          |

All platforms share the same canonical source in `.agents/`.

### Usage Flows

| Flow | Tools | Best For |
|------|-------|----------|
| **Flow A** | Claude Code alone | Full autonomy — planning + implementation in one tool |
| **Flow B** | Gemini (planning) + Codex (implementation) | Team separation of concerns |
| **Standalone** | Any single tool | Each tool works independently with graceful fallbacks |

## Documentation

- **Architecture:** [.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md)
- **Skills:** `.agents/skills/*/SKILL.md`
- **Agents:** `.agents/agents/*.md`

## Based on

This project is a fork of [Antigravity Kit](https://github.com/vudovn/antigravity-kit) by Vudovn, extended with multi-platform support (Claude Code + Codex CLI), additional agents, skills, and workflows.

## License

MIT - See [LICENSE](LICENSE) for details.
