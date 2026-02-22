#!/usr/bin/env node

/**
 * Inove AI Framework — CLI Entry Point
 *
 * Interactive installer with PT-BR menu.
 * Usage:
 *   npx @joelbonito/inove-ai-framework           # Menu interativo
 *   npx @joelbonito/inove-ai-framework install    # Instalacao completa (non-interactive)
 *   npx @joelbonito/inove-ai-framework update     # Atualizar framework
 *   npx @joelbonito/inove-ai-framework validate   # Verificar instalacao
 *   npx @joelbonito/inove-ai-framework uninstall  # Desinstalar
 *   npx @joelbonito/inove-ai-framework help       # Ajuda
 */

const { VERSION } = require('./lib/constants');

const args = process.argv.slice(2);
const command = args[0];
const hasForce = args.includes('--force');
const hasFull = args.includes('--full');

// =====================================================================
// Help
// =====================================================================

function showHelp() {
  console.log(`
Inove AI Framework v${VERSION} — Assistente de Instalacao

Uso:
  npx @joelbonito/inove-ai-framework              Menu interativo (recomendado)
  npx @joelbonito/inove-ai-framework install       Instalacao completa
  npx @joelbonito/inove-ai-framework update        Atualizar framework existente
  npx @joelbonito/inove-ai-framework validate      Verificar integridade da instalacao
  npx @joelbonito/inove-ai-framework uninstall     Remover framework do projeto
  npx @joelbonito/inove-ai-framework help          Mostrar esta ajuda

Opcoes:
  --force    Ignorar confirmacoes e sobrescrever ficheiros existentes
  --full     Verificacao completa (com validate_installation.py)
  -v         Mostrar versao

Plataformas suportadas:
  Claude Code          .claude/ com symlinks + CLAUDE.md
  Codex CLI            .codex/ com symlinks + AGENTS.md
  Gemini / Antigravity GEMINI.md (acessa .agents/ diretamente)

Docs: https://github.com/JoelBonito/inove-ai-framework
`);
}

// =====================================================================
// Interactive Menu
// =====================================================================

async function showInteractiveMenu() {
  const ui = require('./lib/ui');

  ui.showHeader();

  const action = await ui.select({
    message: 'O que deseja fazer?',
    options: [
      {
        value: 'install',
        label: 'Instalacao Completa',
        hint: 'Instala o framework inteiro: agentes, skills, workflows, scripts, symlinks e git hooks.',
      },
      {
        value: 'custom',
        label: 'Instalacao Personalizada',
        hint: 'Permite escolher quais plataformas, componentes e squads instalar.',
      },
      {
        value: 'update',
        label: 'Atualizar',
        hint: 'Atualiza o framework sem sobrescrever CLAUDE.md, AGENTS.md ou GEMINI.md.',
      },
      {
        value: 'add-platform',
        label: 'Adicionar Plataforma',
        hint: 'Adiciona suporte a Claude Code, Codex CLI ou Gemini / Antigravity.',
      },
      {
        value: 'validate',
        label: 'Verificar Instalacao',
        hint: 'Analisa ficheiros em falta, symlinks quebrados e dependencias do sistema.',
      },
      {
        value: 'uninstall',
        label: 'Desinstalar',
        hint: 'Remove .agents/, symlinks e ficheiros de instrucao. Codigo do projeto nao e afetado.',
      },
    ],
  });

  switch (action) {
    case 'install':
      await require('./commands/install').run({ interactive: true });
      break;
    case 'custom':
      await require('./commands/custom-install').run();
      break;
    case 'update':
      await require('./commands/update').run({ interactive: true });
      break;
    case 'add-platform':
      await require('./commands/add-platform').run();
      break;
    case 'validate':
      await require('./commands/validate').run({ interactive: true });
      break;
    case 'uninstall':
      await require('./commands/uninstall').run({ interactive: true });
      break;
  }

  ui.showFooter('Pronto!');
}

// =====================================================================
// CLI Entry Point
// =====================================================================

async function main() {
  switch (command) {
    // Direct commands (non-interactive)
    case 'install':
      await require('./commands/install').run({ interactive: false, force: hasForce });
      break;

    case 'update':
      await require('./commands/update').run({ interactive: false, force: hasForce });
      break;

    case 'validate':
      await require('./commands/validate').run({ interactive: false, full: hasFull });
      break;

    case 'uninstall':
      await require('./commands/uninstall').run({ interactive: false, force: hasForce });
      break;

    // Backward compatibility
    case 'init': {
      const isTTY = process.stderr.isTTY;
      const yellow = isTTY ? '\x1b[33m' : '';
      const reset = isTTY ? '\x1b[0m' : '';
      console.warn(`\n${yellow}Aviso: "init" esta obsoleto. Use "install" ou execute sem argumentos para o menu interativo.${reset}\n`);
      await require('./commands/install').run({ interactive: false, force: hasForce });
      break;
    }

    case 'migrate':
      console.error('O comando "migrate" foi removido na v5.2.');
      console.error('');
      console.error('Para atualizar o framework:');
      console.error('  npx @joelbonito/inove-ai-framework update');
      console.error('');
      console.error('Para instalar do zero:');
      console.error('  npx @joelbonito/inove-ai-framework');
      process.exitCode = 1;
      return;

    // Help / Version
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    case '--version':
    case '-v':
      console.log(VERSION);
      break;

    // No command: interactive menu
    default:
      if (command && command !== '') {
        console.error(`Comando desconhecido: "${command}"\n`);
        showHelp();
        process.exitCode = 1;
        return;
      }

      // Check if TTY is available for interactive mode
      if (!process.stdin.isTTY) {
        console.error('Terminal nao-interativo detectado. Use um comando direto:');
        console.error('  npx @joelbonito/inove-ai-framework install');
        console.error('  npx @joelbonito/inove-ai-framework help');
        process.exitCode = 1;
        return;
      }

      await showInteractiveMenu();
      break;
  }
}

main().catch((err) => {
  console.error('Erro:', err.message || err);
  process.exitCode = 1;
});
