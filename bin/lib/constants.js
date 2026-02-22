/**
 * Shared constants for the Inove AI Framework CLI.
 */

const path = require('path');
const os = require('os');

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const VERSION = require(path.join(PACKAGE_ROOT, 'package.json')).version;
const AGENT_SRC = path.join(PACKAGE_ROOT, '.agents');
const SQUADS_SRC = path.join(PACKAGE_ROOT, 'squads');

const INSTRUCTION_FILES = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];

const DANGEROUS_DIRS = [
  os.homedir(),
  '/',
  os.tmpdir(),
  '/etc',
  '/var',
  '/usr',
];

// Pointer file content for .claude/project_instructions.md
const POINTER_CONTENT = `# Inove AI Framework - Project Instructions

> **Este ficheiro e um pointer.** As instrucoes completas estao em \`CLAUDE.md\` (raiz do projeto), que e carregado automaticamente pelo Claude Code.
>
> **Nao duplique conteudo aqui.** \`CLAUDE.md\` e o master para Claude Code.
> \`.agents/INSTRUCTIONS.md\` e a base compartilhada entre plataformas (sem regras Claude-specific).

## Quick Reference

- **Agentes:** 21 | **Skills:** 41 core | **Workflows:** 22 | **Scripts:** 22
- **Roteamento:** Automatico via STEP 0 + STEP 1 no \`CLAUDE.md\`
- **Regra Zero:** NUNCA editar sem aprovacao (ver \`CLAUDE.md\`)
- **Fonte canonica dos componentes:** \`.agents/\`
`;

// Platform definitions
const PLATFORMS = {
  'claude-code': {
    label: 'Claude Code',
    instructionFile: 'CLAUDE.md',
    setupDir: '.claude',
    symlinks: [
      { name: 'agents', target: path.join('..', '.agents', 'agents') },
      { name: 'skills', target: path.join('..', '.agents', 'skills') },
    ],
    extraFiles: [
      { name: 'project_instructions.md', content: POINTER_CONTENT },
    ],
    description: 'Cria .claude/ com symlinks (agents, skills) e copia CLAUDE.md para a raiz.',
  },
  'codex-cli': {
    label: 'Codex CLI',
    instructionFile: 'AGENTS.md',
    setupDir: '.codex',
    symlinks: [
      { name: 'agents', target: path.join('..', '.agents', 'agents') },
      { name: 'skills', target: path.join('..', '.agents', 'skills') },
      { name: 'prompts', target: path.join('..', '.agents', 'workflows') },
    ],
    extraFiles: [],
    description: 'Cria .codex/ com symlinks (agents, skills, prompts) e copia AGENTS.md para a raiz.',
  },
  'gemini-antigravity': {
    label: 'Gemini / Antigravity',
    instructionFile: 'GEMINI.md',
    setupDir: null,
    symlinks: [],
    extraFiles: [],
    description: 'Copia GEMINI.md para a raiz. Acessa .agents/ diretamente sem symlinks.',
  },
};

// Selectable components for custom install
const COMPONENTS = {
  agents:    { label: 'Agentes (21 core)',    srcDir: 'agents',    description: 'Agentes especializados por dominio (frontend, backend, security, etc.)' },
  skills:    { label: 'Skills (41 core)',     srcDir: 'skills',    description: 'Modulos de conhecimento carregados sob demanda pelos agentes.' },
  workflows: { label: 'Workflows (22 core)',  srcDir: 'workflows', description: 'Slash commands (/define, /debug, /create, etc.) para processos estruturados.' },
  scripts:   { label: 'Scripts Python (22)',  srcDir: 'scripts',   description: 'Automacao: dashboard, sessoes, checklist, progresso, validacao, etc.' },
  config:    { label: 'Configuracoes',        srcDir: 'config',    description: 'Ficheiros de configuracao por plataforma (.toml, .json).' },
  rules:     { label: 'Rules',               srcDir: 'rules',     description: 'Regras compartilhadas entre plataformas.' },
};

module.exports = {
  PACKAGE_ROOT,
  VERSION,
  AGENT_SRC,
  SQUADS_SRC,
  INSTRUCTION_FILES,
  DANGEROUS_DIRS,
  POINTER_CONTENT,
  PLATFORMS,
  COMPONENTS,
};
