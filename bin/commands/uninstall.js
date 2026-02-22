/**
 * Uninstall command for the Inove AI Framework.
 * Safely removes .agents/, symlinks, instruction files, and squads.
 */

const fs = require('fs');
const path = require('path');
const { PLATFORMS, INSTRUCTION_FILES } = require('../lib/constants');
const { safeRemoveDir, isSymlink } = require('../lib/fs-utils');
const { removePlatform, detectInstalledPlatforms } = require('../lib/platforms');
const { sanitizeErrorMessage } = require('../lib/security');
const ui = require('../lib/ui');

async function run(options = {}) {
  const { force = false, interactive = true } = options;
  const targetDir = process.cwd();
  const agentDest = path.join(targetDir, '.agents');
  const squadsDest = path.join(targetDir, 'squads');

  // ── Check what's installed ─────────────────────────────────────────

  const hasAgents = fs.existsSync(agentDest);
  const hasSquads = fs.existsSync(squadsDest);
  const platforms = detectInstalledPlatforms(targetDir);
  const instrFiles = INSTRUCTION_FILES.filter((f) => fs.existsSync(path.join(targetDir, f)));

  if (!hasAgents && platforms.length === 0 && instrFiles.length === 0) {
    const msg = 'Nenhuma instalacao do framework encontrada neste diretorio.';
    if (interactive) ui.logInfo(msg);
    else console.log(msg);
    return;
  }

  // ── Show what will be removed ──────────────────────────────────────

  const removeLines = [];
  if (hasAgents) removeLines.push('.agents/ (agentes, skills, workflows, scripts)');
  for (const key of platforms) {
    const p = PLATFORMS[key];
    if (p.setupDir) {
      removeLines.push(`${p.setupDir}/ (symlinks de ${p.label})`);
    }
  }
  for (const f of instrFiles) {
    removeLines.push(f);
  }
  if (hasSquads) removeLines.push('squads/ (templates)');

  const keepLines = [
    'docs/, codigo-fonte e ficheiros do projeto',
    'Configuracoes de IDE (.vscode/, etc.)',
    'Historico Git',
  ];

  if (interactive) {
    ui.note(
      'Sera removido:\n' +
      removeLines.map((l) => `  ${l}`).join('\n') +
      '\n\nNAO sera removido:\n' +
      keepLines.map((l) => `  ${l}`).join('\n'),
      'Plano de Desinstalacao'
    );

    // Double confirmation
    const confirm1 = await ui.confirm({
      message: 'Tem a certeza que deseja desinstalar o framework?',
      initialValue: false,
    });
    if (!confirm1) {
      ui.logInfo('Desinstalacao cancelada.');
      return;
    }

    const confirmText = await ui.text({
      message: 'Escreva "DESINSTALAR" para confirmar:',
      placeholder: 'DESINSTALAR',
      validate: (v) => {
        if (v !== 'DESINSTALAR') return 'Escreva exatamente: DESINSTALAR';
      },
    });
    if (confirmText !== 'DESINSTALAR') {
      ui.logInfo('Desinstalacao cancelada.');
      return;
    }
  } else if (!force) {
    console.error('Erro: Use --force para desinstalar sem confirmacao interativa.');
    process.exit(1);
  }

  // ── Execute ────────────────────────────────────────────────────────

  const s = interactive ? ui.spinner() : null;

  // 1. Remove platform symlinks and dirs
  if (s) s.start('Removendo configuracoes de plataformas...');
  else console.log('Removendo configuracoes de plataformas...');
  for (const key of platforms) {
    try {
      removePlatform(targetDir, key, true);
    } catch (err) {
      console.warn(`  Aviso: ${sanitizeErrorMessage(err)}`);
    }
  }
  if (s) s.stop('Configuracoes de plataformas removidas.');
  else console.log('  Plataformas removidas.');

  // 2. Remove .agents/
  if (hasAgents) {
    if (s) s.start('Removendo .agents/...');
    else console.log('Removendo .agents/...');
    try {
      safeRemoveDir(agentDest);
      if (s) s.stop('.agents/ removido.');
      else console.log('  .agents/ removido.');
    } catch (err) {
      if (s) s.stop('Erro ao remover .agents/');
      console.error('Erro:', sanitizeErrorMessage(err));
    }
  }

  // 3. Remove squads/
  if (hasSquads) {
    if (s) s.start('Removendo squads/...');
    else console.log('Removendo squads/...');
    try {
      safeRemoveDir(squadsDest);
      if (s) s.stop('squads/ removido.');
      else console.log('  squads/ removido.');
    } catch (err) {
      if (s) s.stop('Erro ao remover squads/');
      console.error('Erro:', sanitizeErrorMessage(err));
    }
  }

  // 4. Remove git hooks (post-commit)
  const postCommitHook = path.join(targetDir, '.git', 'hooks', 'post-commit');
  if (fs.existsSync(postCommitHook)) {
    try {
      const content = fs.readFileSync(postCommitHook, 'utf-8');
      if (content.includes('finish_task') || content.includes('progress_tracker')) {
        fs.unlinkSync(postCommitHook);
        if (interactive) ui.logSuccess('Git hook (post-commit) removido.');
        else console.log('  Git hook (post-commit) removido.');
      }
    } catch {
      // Ignore errors cleaning up hooks
    }
  }

  // ── Summary ────────────────────────────────────────────────────────

  if (interactive) {
    ui.note(
      'O Inove AI Framework foi removido.\n' +
      'Os seus ficheiros de projeto nao foram afetados.\n\n' +
      'Para reinstalar:\n' +
      '  npx @joelbonito/inove-ai-framework',
      'Desinstalacao Concluida'
    );
  } else {
    console.log('\nDesinstalacao concluida.');
  }
}

module.exports = { run };
