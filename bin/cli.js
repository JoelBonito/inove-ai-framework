#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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
    // Remove absolute paths from error messages
    return error.message.replace(/\/[^\s:]+/g, '[path]');
}

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
            // Overwrite or skip? Let's overwrite for init
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
        '│  Docs: https://github.com/inove-ai/inove-ai-framework         │\n' +
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
        // Security: Sanitize error message to avoid exposing system paths
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
                // Security: Sanitize error message
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

function showHelp() {
    console.log(`
Inove AI Framework CLI (DEPRECATED)

This CLI is deprecated. Use the MCP server instead:

  Claude Code:    claude mcp add inove-ai -- npx -y @joelbonito/mcp-server
  Cursor/VSCode:  Add to .cursor/mcp.json or .vscode/mcp.json

Legacy usage:
  npx @joelbonito/inove-ai-framework init   Install framework in current directory
  npx @joelbonito/inove-ai-framework help   Show this help
`);
}

switch (command) {
    case 'init':
        init();
        break;
    case 'help':
    case '--help':
    case '-h':
    default:
        showHelp();
        break;
}
