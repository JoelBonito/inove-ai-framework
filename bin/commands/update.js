/**
 * Update command for the Inove AI Framework.
 * Updates .agents/ to the latest version without overwriting
 * user-customized instruction files (CLAUDE.md, AGENTS.md, GEMINI.md).
 */

const fs = require('fs');
const path = require('path');
const { PACKAGE_ROOT, AGENT_SRC, SQUADS_SRC, VERSION } = require('../lib/constants');
const { sanitizeErrorMessage } = require('../lib/security');
const { copyDir, safeRemoveDir, atomicWrite } = require('../lib/fs-utils');
const { detectInstalledPlatforms, setupPlatform } = require('../lib/platforms');
const ui = require('../lib/ui');

async function run(options = {}) {
  const { interactive = true, force = false } = options;
  const targetDir = process.cwd();
  const agentDest = path.join(targetDir, '.agents');
  const backupDest = path.join(targetDir, '.agents.bak');

  // ── Check existing installation ────────────────────────────────────

  if (!fs.existsSync(agentDest)) {
    const msg = 'Nenhuma instalacao encontrada (.agents/ nao existe).\nUse "Instalacao Completa" primeiro.';
    if (interactive) ui.logError(msg);
    else console.error(msg);
    process.exit(1);
  }

  // ── Check current version ──────────────────────────────────────────

  const versionFile = path.join(agentDest, '.version');
  let currentVersion = 'desconhecida';
  if (fs.existsSync(versionFile)) {
    currentVersion = fs.readFileSync(versionFile, 'utf-8').trim();
  }

  if (currentVersion === VERSION && !force) {
    const msg = `Ja esta na versao mais recente (v${VERSION}).`;
    if (interactive) {
      ui.logInfo(msg);
      const forceUpdate = await ui.confirm({
        message: 'Deseja reinstalar mesmo assim?',
        initialValue: false,
      });
      if (!forceUpdate) return;
    } else {
      console.log(msg);
      console.log('Use --force para reinstalar.');
      return;
    }
  }

  // ── Detect installed platforms ─────────────────────────────────────

  const platforms = detectInstalledPlatforms(targetDir);

  // ── Show plan ──────────────────────────────────────────────────────

  const planLines = [
    `Versao atual: ${currentVersion}`,
    `Nova versao: ${VERSION}`,
    '',
    'Sera atualizado:',
    '  .agents/ (agentes, skills, workflows, scripts, config, rules)',
    '  .agents/ARCHITECTURE.md, .agents/INSTRUCTIONS.md',
    '',
    'NAO sera sobrescrito:',
    '  CLAUDE.md, AGENTS.md, GEMINI.md (ficheiros de instrucao)',
    '',
    'Plataformas a reconfigurar:',
    ...platforms.map((p) => `  ${p}`),
  ];

  if (interactive) {
    ui.note(planLines.join('\n'), 'Plano de Atualizacao');

    const proceed = await ui.confirm({
      message: 'Prosseguir com a atualizacao?',
      initialValue: true,
    });
    if (!proceed) {
      ui.logInfo('Atualizacao cancelada.');
      return;
    }
  } else {
    console.log(`\nAtualizando Inove AI Framework: ${currentVersion} -> ${VERSION}`);
    console.log(`Destino: ${targetDir}\n`);
  }

  // ── Execute ────────────────────────────────────────────────────────

  const s = interactive ? ui.spinner() : null;

  // 1. Backup .agents/ -> .agents.bak/
  if (s) s.start('Criando backup em .agents.bak/...');
  else console.log('Criando backup...');
  try {
    if (fs.existsSync(backupDest)) {
      safeRemoveDir(backupDest);
    }
    fs.renameSync(agentDest, backupDest);
    if (s) s.stop('Backup criado.');
    else console.log('  Backup criado em .agents.bak/');
  } catch (err) {
    if (s) s.stop('Erro ao criar backup');
    console.error('Erro:', sanitizeErrorMessage(err));
    process.exit(1);
  }

  // 2. Copy fresh .agents/
  if (s) s.start('Copiando .agents/ atualizado...');
  else console.log('Copiando .agents/ atualizado...');
  try {
    copyDir(AGENT_SRC, agentDest, PACKAGE_ROOT);
    atomicWrite(path.join(agentDest, '.version'), VERSION + '\n');
    if (s) s.stop('.agents/ atualizado com sucesso.');
    else console.log('  .agents/ atualizado.');
  } catch (err) {
    // Rollback: restore backup
    if (s) s.stop('Erro ao copiar — restaurando backup...');
    else console.error('Erro — restaurando backup...');
    try {
      if (fs.existsSync(agentDest)) safeRemoveDir(agentDest);
      fs.renameSync(backupDest, agentDest);
      console.error('Backup restaurado. Atualizacao falhou.');
    } catch {
      console.error('CRITICO: Falha ao restaurar backup. Restaure manualmente de .agents.bak/');
    }
    process.exit(1);
  }

  // 3. Re-create platform symlinks
  if (s) s.start('Reconfigurando plataformas...');
  else console.log('Reconfigurando plataformas...');
  for (const key of platforms) {
    try {
      setupPlatform(targetDir, key);
    } catch (err) {
      console.warn(`  Aviso: erro ao reconfigurar ${key}:`, sanitizeErrorMessage(err));
    }
  }
  if (s) s.stop('Plataformas reconfiguradas.');
  else console.log('  Plataformas reconfiguradas.');

  // 4. Update squads/ templates (if they exist)
  if (fs.existsSync(SQUADS_SRC)) {
    const squadsDest = path.join(targetDir, 'squads', '.templates');
    if (fs.existsSync(squadsDest)) {
      if (s) s.start('Atualizando templates de squads...');
      else console.log('Atualizando templates de squads...');
      try {
        const templatesSrc = path.join(SQUADS_SRC, '.templates');
        if (fs.existsSync(templatesSrc)) {
          copyDir(templatesSrc, squadsDest, PACKAGE_ROOT);
        }
        if (s) s.stop('Templates de squads atualizados.');
        else console.log('  Templates atualizados.');
      } catch (err) {
        if (s) s.stop('Aviso: erro ao atualizar templates de squads');
        console.warn('Aviso:', sanitizeErrorMessage(err));
      }
    }
  }

  // 5. Cleanup backup
  if (interactive) {
    const removeBackup = await ui.confirm({
      message: 'Remover backup (.agents.bak/)?\n  O backup pode ser util se algo correu mal.',
      initialValue: true,
    });
    if (removeBackup) {
      safeRemoveDir(backupDest);
      ui.logSuccess('Backup removido.');
    } else {
      ui.logInfo('Backup mantido em .agents.bak/ — remova manualmente quando quiser.');
    }
  } else {
    safeRemoveDir(backupDest);
    console.log('  Backup removido.');
  }

  // ── Summary ────────────────────────────────────────────────────────

  if (interactive) {
    const summary = [
      `Atualizado: ${currentVersion} -> ${VERSION}`,
      '',
      'Ficheiros de instrucao preservados:',
      '  CLAUDE.md, AGENTS.md, GEMINI.md',
      '',
      'Proximos passos:',
      '  python3 .agents/scripts/validate_installation.py',
    ].join('\n');

    ui.note(summary, 'Atualizacao Concluida');
  } else {
    console.log(`\nAtualizacao concluida! ${currentVersion} -> ${VERSION}`);
  }
}

module.exports = { run };
