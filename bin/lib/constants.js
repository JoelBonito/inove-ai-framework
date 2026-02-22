/**
 * Shared constants for the Inove AI Framework CLI.
 */

const path = require('path');
const os = require('os');

/**
 * Generate the content for .gemini/mcp.json.
 * Uses env var placeholders when keys are not provided.
 */
function generateGeminiMcp(context7Key, stitchKey) {
  const c7 = context7Key || '${CONTEXT7_API_KEY}';
  const sk = stitchKey || '${STITCH_API_KEY}';
  return JSON.stringify(
    {
      mcpServers: {
        context7: {
          command: 'npx',
          args: ['-y', '@upstash/context7-mcp'],
          env: { CONTEXT7_API_KEY: c7 },
        },
        stitch: {
          command: 'npx',
          args: ['-y', '@_davideast/stitch-mcp@latest', 'proxy'],
          env: { STITCH_API_KEY: sk },
        },
      },
    },
    null,
    2
  ) + '\n';
}

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
    setupDir: '.gemini',
    symlinks: [],
    extraFiles: [
      {
        name: 'settings.json',
        content: '{\n  "model": "gemini-2.5-pro",\n  "systemInstruction": "GEMINI.md"\n}\n',
      },
      {
        name: 'mcp.json',
        content: generateGeminiMcp(),
      },
    ],
    description: 'Cria .gemini/ com settings.json e mcp.json, e copia GEMINI.md para a raiz.',
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
  generateGeminiMcp,
};
