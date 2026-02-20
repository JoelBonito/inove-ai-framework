#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const command = args[0];

// Paths
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const TARGET_DIR = process.cwd();
const AGENT_SRC = path.join(PACKAGE_ROOT, '.agents');
const AGENT_DEST = path.join(TARGET_DIR, '.agents');

// Instruction files to copy to project root
const INSTRUCTION_FILES = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];

// =====================================================================
// Thin Client Templates (MCP-aware)
// =====================================================================

const CLAUDE_THIN_TEMPLATE = `# CLAUDE.md - Inove AI Framework (MCP)

> Este projeto usa o Inove AI Framework via servidor MCP.
> Agentes, skills e workflows sao carregados dinamicamente — sem ficheiros locais.

## MCP Tools Disponiveis

| Tool | Descricao |
|------|-----------|
| \`list_agents\` | Listar todos os agentes disponiveis |
| \`list_skills\` | Listar todas as skills disponiveis |
| \`list_workflows\` | Listar todos os workflows disponiveis |
| \`get_agent\` | Obter conteudo completo de um agente |
| \`get_skill\` | Obter conteudo completo de uma skill |
| \`get_workflow\` | Obter conteudo completo de um workflow |
| \`route_task\` | Recomendar agentes/skills para uma tarefa |
| \`search_content\` | Pesquisa full-text em todo o framework |

## MCP Resources

- \`inove://instructions\` — Instrucoes completas do framework
- \`inove://architecture\` — Documentacao de arquitetura
- \`inove://agents\` — Lista de todos os agentes
- \`inove://agents/{name}\` — Conteudo de um agente especifico
- \`inove://skills/{name}\` — Conteudo de uma skill especifica
- \`inove://workflows/{name}\` — Conteudo de um workflow especifico

## Como Usar

1. **Iniciar tarefa** — o framework roteia automaticamente via \`route_task\`
2. **Slash commands** — chamar \`get_workflow\` com o nome (ex: "create", "debug", "define")
3. **Carregar agentes** — chamar \`get_agent\` com o nome (ex: "frontend-specialist")

## Dados do Projeto

Docs do projeto em \`docs/\` e \`squads/\` na raiz (nao afetados pelo MCP).

---
*Migrado de instalacao legada. Framework servido por @joelbonito/mcp-server.*
`;

const AGENTS_THIN_TEMPLATE = `# AGENTS.md - Inove AI Framework (MCP)

> Este projeto usa o Inove AI Framework via servidor MCP.

## MCP Tools

| Tool | Descricao |
|------|-----------|
| \`list_agents\` | Listar agentes disponiveis |
| \`list_skills\` | Listar skills disponiveis |
| \`list_workflows\` | Listar workflows disponiveis |
| \`get_agent\` | Obter conteudo de um agente |
| \`get_skill\` | Obter conteudo de uma skill |
| \`get_workflow\` | Obter conteudo de um workflow |
| \`route_task\` | Rotear tarefa para agentes/skills |
| \`search_content\` | Pesquisar no framework |

## Resources

- \`inove://instructions\` — Instrucoes completas
- \`inove://agents/{name}\` — Agente especifico
- \`inove://skills/{name}\` — Skill especifica
- \`inove://workflows/{name}\` — Workflow especifico

## Quick Start

1. Use \`route_task\` para encontrar o agente certo
2. Use \`get_agent\` / \`get_skill\` para carregar conteudo
3. Use \`get_workflow\` para processos estruturados

---
*Migrado de instalacao legada. Servido por @joelbonito/mcp-server.*
`;

const GEMINI_THIN_TEMPLATE = `---
trigger: always_on
---

# GEMINI.md - Inove AI Framework (MCP)

> Este projeto usa o Inove AI Framework via servidor MCP.

## MCP Tools

| Tool | Descricao |
|------|-----------|
| \`list_agents\` | Listar agentes disponiveis |
| \`list_skills\` | Listar skills disponiveis |
| \`list_workflows\` | Listar workflows disponiveis |
| \`get_agent\` | Obter conteudo de um agente |
| \`get_skill\` | Obter conteudo de uma skill |
| \`get_workflow\` | Obter conteudo de um workflow |
| \`route_task\` | Rotear tarefa para agentes/skills |
| \`search_content\` | Pesquisar no framework |

## Resources

- \`inove://instructions\` — Instrucoes completas
- \`inove://agents/{name}\` — Agente especifico
- \`inove://skills/{name}\` — Skill especifica
- \`inove://workflows/{name}\` — Workflow especifico

## Quick Start

1. Use \`route_task\` para encontrar o agente certo
2. Use \`get_agent\` / \`get_skill\` para carregar conteudo
3. Use \`get_workflow\` para processos estruturados

---
*Migrado de instalacao legada. Servido por @joelbonito/mcp-server.*
`;

const THIN_TEMPLATES = {
    'CLAUDE.md': CLAUDE_THIN_TEMPLATE,
    'AGENTS.md': AGENTS_THIN_TEMPLATE,
    'GEMINI.md': GEMINI_THIN_TEMPLATE,
};

// =====================================================================
// MCP Configuration
// =====================================================================

const MCP_SERVER_ENTRY = {
    command: 'npx',
    args: ['-y', '@joelbonito/mcp-server'],
};

const MCP_CONFIG_TARGETS = [
    { path: '.mcp.json', label: 'Claude Code' },
    { path: '.cursor/mcp.json', label: 'Cursor' },
    { path: '.vscode/mcp.json', label: 'VS Code' },
    { path: '.gemini/mcp.json', label: 'Gemini CLI' },
];

// Symlinks created by the legacy init that will become broken
const SYMLINK_CLEANUP_TARGETS = [
    '.claude/agents',
    '.claude/skills',
    '.codex/agents',
    '.codex/skills',
    '.codex/prompts',
];

// =====================================================================
// Shared Security Helpers
// =====================================================================

/**
 * Security: Validates that a path is within the allowed base directory.
 * Prevents path traversal attacks.
 *
 * @param {string} targetPath - Path to validate
 * @param {string} baseDir - Allowed base directory
 * @returns {boolean} - True if path is safe
 */
function isPathSafe(targetPath, baseDir) {
    const resolvedTarget = path.resolve(targetPath);
    const resolvedBase = path.resolve(baseDir);
    return resolvedTarget.startsWith(resolvedBase + path.sep) || resolvedTarget === resolvedBase;
}

/**
 * Security: Sanitizes error messages to avoid exposing system paths.
 *
 * @param {Error} error - Error object
 * @returns {string} - Sanitized error message
 */
function sanitizeErrorMessage(error) {
    if (!error || !error.message) return 'Unknown error';
    return error.message
        .replace(/\/[^\s:]+/g, '[path]')           // Unix paths
        .replace(/[A-Za-z]:\\[^\s:]+/g, '[path]'); // Windows paths
}

// =====================================================================
// Migration Helpers
// =====================================================================

/**
 * Check if a path is a symbolic link.
 * Returns false if path does not exist.
 */
function isSymlink(targetPath) {
    try {
        return fs.lstatSync(targetPath).isSymbolicLink();
    } catch {
        return false;
    }
}

/**
 * Security: Recursively remove a directory without following symlinks.
 * Uses lstatSync to detect symlinks and only unlinks the link itself.
 * NEVER uses fs.rmSync({ recursive: true }) which follows symlinks.
 */
function safeRemoveDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const stat = fs.lstatSync(dirPath);
    if (stat.isSymbolicLink()) {
        fs.unlinkSync(dirPath);
        return;
    }
    if (!stat.isDirectory()) {
        fs.unlinkSync(dirPath);
        return;
    }

    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const entryStat = fs.lstatSync(fullPath);

        if (entryStat.isSymbolicLink()) {
            fs.unlinkSync(fullPath);
        } else if (entryStat.isDirectory()) {
            safeRemoveDir(fullPath);
        } else {
            fs.unlinkSync(fullPath);
        }
    }
    fs.rmdirSync(dirPath);
}

/**
 * Remove a symlink safely. Only removes if the path IS a symlink.
 * Never removes regular files or directories.
 */
function removeSafeSymlink(targetPath) {
    if (!isSymlink(targetPath)) return false;
    if (!isPathSafe(targetPath, TARGET_DIR)) return false;
    fs.unlinkSync(targetPath);
    return true;
}

/**
 * Remove a directory only if it is completely empty.
 */
function cleanEmptyDir(dirPath) {
    try {
        const entries = fs.readdirSync(dirPath);
        if (entries.length === 0) {
            fs.rmdirSync(dirPath);
            return true;
        }
    } catch {
        // Directory doesn't exist or can't be read
    }
    return false;
}

/**
 * Write a file atomically: write to .tmp then rename.
 * Prevents partial writes from corrupting the target.
 */
function atomicWrite(filePath, content) {
    const tmpPath = filePath + '.tmp';
    fs.writeFileSync(tmpPath, content, 'utf-8');
    fs.renameSync(tmpPath, filePath);
}

/**
 * Configure MCP for a given config file path.
 * Merges inove-ai server into existing config, or creates new file.
 * Verifies parent directory is not a symlink before writing.
 */
function configureMcp(configPath, label, dryRun) {
    const parentDir = path.dirname(configPath);

    // Security: verify parent is not a symlink
    if (fs.existsSync(parentDir) && isSymlink(parentDir)) {
        console.warn(`  ${label}: Skipped — ${path.relative(TARGET_DIR, parentDir)} is a symlink`);
        return;
    }

    if (fs.existsSync(configPath)) {
        // Security: verify config file itself is not a symlink
        if (isSymlink(configPath)) {
            console.warn(`  ${label}: Skipped — ${path.relative(TARGET_DIR, configPath)} is a symlink`);
            return;
        }

        try {
            const existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (existing.mcpServers && existing.mcpServers['inove-ai']) {
                console.log(`  ${label}: inove-ai already configured (skipped)`);
                return;
            }
            if (dryRun) {
                console.log(`  [DRY RUN] ${label}: Would add inove-ai to ${path.relative(TARGET_DIR, configPath)}`);
                return;
            }
            if (!existing.mcpServers) existing.mcpServers = {};
            existing.mcpServers['inove-ai'] = MCP_SERVER_ENTRY;
            atomicWrite(configPath, JSON.stringify(existing, null, 2) + '\n');
            console.log(`  ${label}: Added inove-ai to ${path.relative(TARGET_DIR, configPath)}`);
        } catch {
            if (dryRun) {
                console.log(`  [DRY RUN] ${label}: Would create ${path.relative(TARGET_DIR, configPath)}`);
                return;
            }
            // Could not parse existing file — create fresh
            const config = { mcpServers: { 'inove-ai': MCP_SERVER_ENTRY } };
            atomicWrite(configPath, JSON.stringify(config, null, 2) + '\n');
            console.log(`  ${label}: Created ${path.relative(TARGET_DIR, configPath)} (replaced unparsable file)`);
        }
    } else {
        if (dryRun) {
            console.log(`  [DRY RUN] ${label}: Would create ${path.relative(TARGET_DIR, configPath)}`);
            return;
        }
        fs.mkdirSync(parentDir, { recursive: true });
        const config = { mcpServers: { 'inove-ai': MCP_SERVER_ENTRY } };
        atomicWrite(configPath, JSON.stringify(config, null, 2) + '\n');
        console.log(`  ${label}: Created ${path.relative(TARGET_DIR, configPath)}`);
    }
}

/**
 * Append a line to .gitignore if not already present.
 */
function ensureGitignore(entry, dryRun) {
    const gitignorePath = path.join(TARGET_DIR, '.gitignore');
    let content = '';

    if (fs.existsSync(gitignorePath)) {
        content = fs.readFileSync(gitignorePath, 'utf-8');
        if (content.includes(entry)) return false;
    }

    if (dryRun) return true;

    const newLine = content.endsWith('\n') || content === '' ? '' : '\n';
    fs.appendFileSync(gitignorePath, `${newLine}${entry}\n`, 'utf-8');
    return true;
}

/**
 * Prompt user for confirmation. Returns a promise that resolves to the answer.
 */
function askConfirmation(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stderr,
    });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

// =====================================================================
// Init Command (Legacy — Deprecated)
// =====================================================================

function copyDir(src, dest) {
    // Security: Validate paths before operations
    if (!isPathSafe(src, PACKAGE_ROOT) && !isPathSafe(src, TARGET_DIR)) {
        throw new Error('Source path validation failed');
    }
    if (!isPathSafe(dest, TARGET_DIR)) {
        throw new Error('Destination path validation failed');
    }

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        // Security: Skip hidden files that could be malicious
        if (entry.name.startsWith('.') && entry.name !== '.agents') {
            continue;
        }

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Security: Re-validate computed paths
        if (!isPathSafe(srcPath, PACKAGE_ROOT) && !isPathSafe(srcPath, src)) {
            console.warn(`   Skipping potentially unsafe path: ${entry.name}`);
            continue;
        }

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function init() {
    const forceMode = args.includes('--force');

    const isTTY = process.stderr.isTTY;
    const yellow = isTTY ? '\x1b[33m' : '';
    const reset = isTTY ? '\x1b[0m' : '';
    console.warn('\n' + yellow +
        '┌─────────────────────────────────────────────────────────────────┐\n' +
        '│  DEPRECATED: This installation method is deprecated.           │\n' +
        '│                                                                │\n' +
        '│  Use the MCP server instead (zero disk usage, auto-updates):   │\n' +
        '│                                                                │\n' +
        '│  Claude Code:                                                  │\n' +
        '│    claude mcp add inove-ai -- npx -y @joelbonito/mcp-server     │\n' +
        '│                                                                │\n' +
        '│  Cursor / VS Code:                                             │\n' +
        '│    Add to .cursor/mcp.json or .vscode/mcp.json:               │\n' +
        '│    { "mcpServers": { "inove-ai": {                            │\n' +
        '│        "command": "npx",                                       │\n' +
        '│        "args": ["-y", "@joelbonito/mcp-server"]                 │\n' +
        '│    }}}                                                         │\n' +
        '│                                                                │\n' +
        '│  Or migrate: npx @joelbonito/inove-ai-framework migrate        │\n' +
        '└─────────────────────────────────────────────────────────────────┘\n' +
        reset);

    console.log('Initializing Inove AI Framework...');

    // 1. Check source exists
    if (!fs.existsSync(AGENT_SRC)) {
        console.error('Error: Could not find source .agents folder.');
        process.exit(1);
    }

    // 2. Check for existing files (overwrite guard)
    if (!forceMode) {
        const existingPaths = [];

        if (fs.existsSync(AGENT_DEST)) {
            existingPaths.push('.agents/');
        }

        for (const file of INSTRUCTION_FILES) {
            if (fs.existsSync(path.join(TARGET_DIR, file))) {
                existingPaths.push(file);
            }
        }

        if (existingPaths.length > 0) {
            console.log('The following already exist in this directory:');
            for (const p of existingPaths) {
                console.log(`  - ${p}`);
            }
            console.log('Use --force to overwrite: npx @joelbonito/inove-ai-framework init --force');
            process.exit(1);
        }
    }

    // 3. Copy .agents folder
    console.log('Copying .agents folder...');
    try {
        copyDir(AGENT_SRC, AGENT_DEST);
        console.log('.agents folder copied successfully.');
    } catch (error) {
        console.error('Error copying files:', sanitizeErrorMessage(error));
        process.exit(1);
    }

    // 4. Copy instruction files
    console.log('Copying AI instruction files...');
    for (const file of INSTRUCTION_FILES) {
        const srcFile = path.join(PACKAGE_ROOT, file);
        const destFile = path.join(TARGET_DIR, file);

        if (fs.existsSync(srcFile)) {
            try {
                fs.copyFileSync(srcFile, destFile);
                console.log(`   ${file} copied.`);
            } catch (error) {
                console.warn(`   Warning: Could not copy ${file}: ${sanitizeErrorMessage(error)}`);
            }
        } else {
            console.warn(`   Warning: ${file} not found in package.`);
        }
    }

    // 5. Install Git Hooks
    const hooksScript = path.join(AGENT_DEST, 'scripts', 'install_git_hooks.sh');
    if (fs.existsSync(hooksScript)) {
        console.log('Installing Git Hooks...');
        try {
            fs.chmodSync(hooksScript, '755');
            execFileSync('bash', [hooksScript], { stdio: 'inherit' });
        } catch (error) {
            console.warn('Warning: Failed to install git hooks automatically.');
            console.warn('   You can run manually: bash .agents/scripts/install_git_hooks.sh');
        }
    }

    // 6. First Session Start
    const autoSessionScript = path.join(AGENT_DEST, 'scripts', 'auto_session.py');
    if (fs.existsSync(autoSessionScript)) {
        console.log('Starting first session...');
        try {
            execFileSync('python3', ['--version'], { stdio: 'ignore' });
            execFileSync('python3', [autoSessionScript, 'start'], { stdio: 'inherit' });
        } catch (error) {
            console.log('Could not auto-start session (python3 missing or error).');
            console.log('   Run manually: python3 .agents/scripts/auto_session.py start');
        }
    }

    console.log('\nSetup Complete! Inove AI Framework is ready.');
    console.log('   Run "python3 .agents/scripts/dashboard.py" to check status.');
}

// =====================================================================
// Migrate Command (Legacy -> MCP)
// =====================================================================

async function migrate() {
    const dryRun = args.includes('--dry-run');
    const noBackup = args.includes('--no-backup');
    const force = args.includes('--force');

    const isTTY = process.stderr.isTTY;
    const green = isTTY ? '\x1b[32m' : '';
    const yellow = isTTY ? '\x1b[33m' : '';
    const red = isTTY ? '\x1b[31m' : '';
    const dim = isTTY ? '\x1b[2m' : '';
    const reset = isTTY ? '\x1b[0m' : '';

    // -----------------------------------------------------------------
    // STEP 0: Preflight Checks
    // -----------------------------------------------------------------

    // Resolve to physical path (not symlink target)
    let realTargetDir;
    try {
        realTargetDir = fs.realpathSync(TARGET_DIR);
    } catch {
        console.error(`${red}Error: Could not resolve current directory.${reset}`);
        process.exit(1);
    }

    // Refuse dangerous directories
    const dangerous = [os.homedir(), '/', os.tmpdir(), '/etc', '/var', '/usr'];
    if (dangerous.includes(realTargetDir)) {
        console.error(`${red}Error: Refusing to migrate in ${realTargetDir} — this is a system directory.${reset}`);
        process.exit(1);
    }

    // Block CI environments
    if (process.env.CI && !force) {
        console.error(`${red}Error: Migration should not run in CI environments.${reset}`);
        console.error('This is a developer tool for converting local projects to MCP.');
        console.error('Use --force to override this check.');
        process.exit(1);
    }

    // Check if legacy installation exists
    const hasAgents = fs.existsSync(AGENT_DEST);
    const hasClaudeMd = fs.existsSync(path.join(TARGET_DIR, 'CLAUDE.md'));

    if (!hasAgents && !hasClaudeMd) {
        console.log('No legacy installation detected in this directory.');
        console.log('');
        console.log('To set up MCP for a new project:');
        console.log('  claude mcp add inove-ai -- npx -y @joelbonito/mcp-server');
        process.exit(0);
    }

    // Detect if already migrated
    if (!hasAgents && hasClaudeMd && !force) {
        const content = fs.readFileSync(path.join(TARGET_DIR, 'CLAUDE.md'), 'utf-8');
        if (content.includes('MCP') && content.length < 3000) {
            console.log('This project appears already migrated to MCP.');
            console.log('Use --force to re-run migration anyway.');
            process.exit(0);
        }
    }

    // Check write permissions
    try {
        fs.accessSync(realTargetDir, fs.constants.W_OK);
    } catch {
        console.error(`${red}Error: No write permission in ${realTargetDir}${reset}`);
        process.exit(1);
    }

    // -----------------------------------------------------------------
    // STEP 1: Show Migration Plan
    // -----------------------------------------------------------------

    console.log('');
    console.log(`${green}--- Inove AI Framework: Legacy -> MCP Migration ---${reset}`);
    console.log('');

    const plan = [];
    if (hasAgents) {
        if (!noBackup) plan.push({ action: 'Backup .agents/ -> .agents.bak/', type: 'backup' });
        plan.push({ action: 'Delete .agents/ (symlink-safe)', type: 'delete' });
    }
    for (const file of Object.keys(THIN_TEMPLATES)) {
        if (fs.existsSync(path.join(TARGET_DIR, file))) {
            plan.push({ action: `Replace ${file} with thin MCP version`, type: 'write' });
        } else {
            plan.push({ action: `Create ${file} (thin MCP version)`, type: 'write' });
        }
    }
    for (const sym of SYMLINK_CLEANUP_TARGETS) {
        if (isSymlink(path.join(TARGET_DIR, sym))) {
            plan.push({ action: `Remove orphan symlink: ${sym}`, type: 'cleanup' });
        }
    }
    for (const target of MCP_CONFIG_TARGETS) {
        const configPath = path.join(TARGET_DIR, target.path);
        if (fs.existsSync(configPath)) {
            try {
                const existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                if (existing.mcpServers && existing.mcpServers['inove-ai']) {
                    plan.push({ action: `${target.label}: inove-ai already configured (skip)`, type: 'skip' });
                } else {
                    plan.push({ action: `${target.label}: Add inove-ai to ${target.path}`, type: 'config' });
                }
            } catch {
                plan.push({ action: `${target.label}: Create ${target.path}`, type: 'config' });
            }
        } else {
            plan.push({ action: `${target.label}: Create ${target.path}`, type: 'config' });
        }
    }
    plan.push({ action: 'Update .gitignore', type: 'write' });

    for (const step of plan) {
        const prefix = dryRun ? `${dim}[DRY RUN]${reset} ` : '';
        const icon = step.type === 'skip' ? dim : '';
        const iconReset = step.type === 'skip' ? reset : '';
        console.log(`  ${prefix}${icon}${step.action}${iconReset}`);
    }
    console.log('');

    if (dryRun) {
        console.log(`${dim}Dry run complete. No changes were made.${reset}`);
        process.exit(0);
    }

    // -----------------------------------------------------------------
    // STEP 2: Confirmation
    // -----------------------------------------------------------------

    if (!force) {
        if (!isTTY) {
            console.error(`${red}Non-interactive terminal detected. Use --force to proceed.${reset}`);
            process.exit(1);
        }
        const answer = await askConfirmation(`Proceed with migration? ${dim}(y/N)${reset} `);
        if (answer !== 'y' && answer !== 'yes') {
            console.log('Migration cancelled.');
            process.exit(0);
        }
    }

    // -----------------------------------------------------------------
    // STEP 3: Backup .agents/ -> .agents.bak/
    // -----------------------------------------------------------------

    if (hasAgents && !noBackup) {
        const backupDir = path.join(TARGET_DIR, '.agents.bak');

        // Security: verify backup target is not a symlink
        if (isSymlink(backupDir)) {
            console.error(`${red}Error: .agents.bak is a symlink — refusing to proceed for safety.${reset}`);
            console.error('Remove it manually and re-run migrate.');
            process.exit(1);
        }

        if (fs.existsSync(backupDir)) {
            console.log('  Removing existing .agents.bak/ ...');
            safeRemoveDir(backupDir);
        }

        console.log('  Creating backup: .agents/ -> .agents.bak/');
        try {
            fs.renameSync(AGENT_DEST, backupDir);
        } catch (err) {
            console.error(`${red}Error creating backup: ${sanitizeErrorMessage(err)}${reset}`);
            console.error('Try with --no-backup if you don\'t need a backup.');
            process.exit(1);
        }
    }

    // -----------------------------------------------------------------
    // STEP 4: Delete .agents/ (symlink-safe)
    // -----------------------------------------------------------------

    if (fs.existsSync(AGENT_DEST)) {
        console.log('  Removing .agents/ (symlink-safe) ...');
        try {
            safeRemoveDir(AGENT_DEST);
            console.log('  .agents/ removed.');
        } catch (err) {
            console.error(`${red}Error removing .agents/: ${sanitizeErrorMessage(err)}${reset}`);
            process.exit(1);
        }
    }

    // -----------------------------------------------------------------
    // STEP 5: Cleanup Orphan Symlinks
    // -----------------------------------------------------------------

    let cleanedSymlinks = 0;
    for (const sym of SYMLINK_CLEANUP_TARGETS) {
        const symPath = path.join(TARGET_DIR, sym);
        if (removeSafeSymlink(symPath)) {
            console.log(`  Removed symlink: ${sym}`);
            cleanedSymlinks++;
        }
    }

    // Clean up empty parent dirs (.codex/) but NOT .claude/ (may have user files)
    const codexDir = path.join(TARGET_DIR, '.codex');
    if (cleanEmptyDir(codexDir)) {
        console.log('  Removed empty .codex/ directory');
    }

    // -----------------------------------------------------------------
    // STEP 6: Replace Instruction Files with Thin Templates
    // -----------------------------------------------------------------

    for (const [filename, template] of Object.entries(THIN_TEMPLATES)) {
        const filePath = path.join(TARGET_DIR, filename);
        console.log(`  Writing thin ${filename} ...`);
        try {
            atomicWrite(filePath, template);
        } catch (err) {
            console.warn(`  ${yellow}Warning: Could not write ${filename}: ${sanitizeErrorMessage(err)}${reset}`);
        }
    }

    // -----------------------------------------------------------------
    // STEP 7: Auto-Configure MCP
    // -----------------------------------------------------------------

    console.log('  Configuring MCP servers...');
    for (const target of MCP_CONFIG_TARGETS) {
        const configPath = path.join(TARGET_DIR, target.path);
        configureMcp(configPath, target.label, false);
    }

    // -----------------------------------------------------------------
    // STEP 7b: Update .gitignore
    // -----------------------------------------------------------------

    const gitignoreEntries = ['.agents.bak/'];
    for (const entry of gitignoreEntries) {
        if (ensureGitignore(entry, false)) {
            console.log(`  Added ${entry} to .gitignore`);
        }
    }

    // -----------------------------------------------------------------
    // STEP 8: Summary
    // -----------------------------------------------------------------

    console.log('');
    console.log(`${green}--- Migration Complete! ---${reset}`);
    console.log('');
    console.log('What changed:');
    console.log('  - .agents/ removed (framework now served via MCP)');
    console.log('  - CLAUDE.md, AGENTS.md, GEMINI.md replaced with thin MCP versions');
    console.log('  - MCP configured for Claude Code, Cursor, VS Code, Gemini CLI');
    if (!noBackup && hasAgents) {
        console.log(`  - Backup saved to .agents.bak/ ${dim}(delete when satisfied)${reset}`);
    }
    if (cleanedSymlinks > 0) {
        console.log(`  - ${cleanedSymlinks} orphan symlink(s) cleaned up`);
    }
    console.log('');
    console.log(`${dim}Your project data (docs/, squads/) is unchanged.${reset}`);
    console.log(`${dim}Framework updates are now automatic via @joelbonito/mcp-server.${reset}`);
    console.log('');
    console.log('Next step:');
    console.log('  git add -A && git commit -m "chore: migrate to MCP server"');
    console.log('');
}

// =====================================================================
// Help
// =====================================================================

function showHelp() {
    console.log(`
Inove AI Framework CLI

Commands:
  migrate   Migrate legacy installation to MCP (recommended)
  init      Install framework locally (deprecated — use MCP instead)
  help      Show this help

Migration (legacy -> MCP):
  npx @joelbonito/inove-ai-framework migrate              Run migration
  npx @joelbonito/inove-ai-framework migrate --dry-run     Preview changes without applying
  npx @joelbonito/inove-ai-framework migrate --no-backup   Skip .agents.bak/ backup
  npx @joelbonito/inove-ai-framework migrate --force       Skip confirmation prompt

MCP setup (new projects — no migration needed):
  Claude Code:    claude mcp add inove-ai -- npx -y @joelbonito/mcp-server
  Cursor/VSCode:  Add to .cursor/mcp.json or .vscode/mcp.json

Docs: https://github.com/JoelBonito/inove-ai-framework
`);
}

// =====================================================================
// CLI Entry Point
// =====================================================================

switch (command) {
    case 'migrate':
        migrate().catch((err) => {
            console.error('Migration failed:', sanitizeErrorMessage(err));
            process.exit(1);
        });
        break;
    case 'init':
        init();
        break;
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
    default:
        showHelp();
        break;
}
