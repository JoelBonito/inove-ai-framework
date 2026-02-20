# Changelog

All notable changes to the Inove AI Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Deep framework audit with cleanup of legacy artifacts

### Fixed

- CLI paths updated from `.agent` to `.agents`
- Git hooks paths corrected
- `.gitignore` updated with correct paths and modern patterns
- `package.json` `files` field now includes `.agents`, `.codex`, `AGENTS.md`, `GEMINI.md`
- Removed `.claude` and `.codex` from npm `files` field (symlinks not supported by npm pack)
- Created `.npmignore` to exclude development artifacts from npm package
- Fixed `grep -oP` in git hooks for macOS compatibility
- Fixed `execSync` command injection risk in CLI with `execFileSync`
- Added `--force` flag to CLI init to prevent silent overwrites
- Corrected skills count from 41 to 40 across all documentation
- Added automated pytest suite for framework validation
- Updated CI/CD to run automated tests

## [1.0.1] - 2026-02-05

### Added

- **Multi-platform support**: Claude Code, Codex CLI, and Antigravity/Gemini
- **Codex CLI integration**: `AGENTS.md` bridge file, `.codex/` symlinks, `codex.toml` config
- **New agent**: `ux-researcher` for UX research, user flows, and wireframes
- **5 new skills**: `doc-review`, `gap-analysis`, `system-design`, `ux-research`, `web-design-guidelines`
- **7 new workflows**: `context`, `define` (9 phases with GAP Analysis), `finish`, `journeys`, `log`, `readiness`, `track`
- **Platform compatibility layer**: `platform_compat.py` for automatic platform detection
- **Symlinks**: `.claude/agents`, `.claude/skills`, `.codex/agents`, `.codex/skills`, `.codex/prompts`
- CLI tool `npx @inove-ai/inove-ai-framework init`

### Changed

- Migrated directory structure from `.agent/` to `.agents/`
- Rebranded from "Antigravity Kit" to "Inove AI Framework"
- System upgraded from "Dual-Agent" to "Multi-Agent"
- `/define` workflow expanded from 5 to 9 phases with GAP Analysis

## [1.0.0] - 2026-01-23

### Initial Release (Fork)

- Forked from [Antigravity Kit](https://github.com/vudovn/antigravity-kit) by Vudovn
- 20 specialized AI agents
- 36 domain-specific skills
- 11 workflow slash commands
- Intelligent Agent Routing system
- CLI tool for installation

[Unreleased]: https://github.com/JoelBonito/inove-ai-framework/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/JoelBonito/inove-ai-framework/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/JoelBonito/inove-ai-framework/releases/tag/v1.0.0
