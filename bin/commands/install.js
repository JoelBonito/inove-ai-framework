/**
 * Full Install command for the Inove AI Framework.
 * Copies .agents/, instruction files, sets up platforms, squads, git hooks.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { PACKAGE_ROOT, AGENT_SRC, SQUADS_SRC, VERSION, DANGEROUS_DIRS } = require('../lib/constants');
const { sanitizeErrorMessage } = require('../lib/security');
const { copyDir, isGitRepo, hasPython3, atomicWrite, ensureGitignore } = require('../lib/fs-utils');
const { setupAllPlatforms } = require('../lib/platforms');
const ui = require('../lib/ui');

/**
 * Run the full install.
 * @param {object} options
 * @param {boolean} options.interactive - Show interactive prompts
 * @param {boolean} options.force - Overwrite existing installation
 */
async function run(options = {}) {
  const { interactive = false, force = false } = options;
  const targetDir = process.cwd();
  const agentDest = path.join(targetDir, '.agents');

  // ── Pre-flight checks ──────────────────────────────────────────────

  const realTarget = fs.realpathSync(targetDir);
  if (DANGEROUS_DIRS.includes(realTarget)) {
    const msg = `Erro: Recusado instalar em ${realTarget} \u2014 diretorio de sistema.`;
    if (interactive) ui.logError(msg);
    else console.error(msg);
    process.exit(1);
  }

  if (process.env.CI && !force) {
    const msg = 'Erro: Instalacao nao deve correr em ambientes CI. Use --force para ignorar.';
    if (interactive) ui.logError(msg);
    else console.error(msg);
    process.exit(1);
  }

  try {
    fs.accessSync(realTarget, fs.constants.W_OK);
  } catch {
    const msg = `Erro: Sem permissao de escrita em ${realTarget}`;
    if (interactive) ui.logError(msg);
    else console.error(msg);
    process.exit(1);
  }

  // ── Check existing installation ────────────────────────────────────

  if (fs.existsSync(agentDest) && !force) {
    if (interactive) {
      const overwrite = await ui.confirm({
        message: 'Ja existe uma instalacao (.agents/). Deseja sobrescrever?',
        initialValue: false,
      });
      if (!overwrite) {
        ui.logInfo('Instalacao cancelada. Use "Atualizar" para atualizar sem perder customizacoes.');
        return;
      }
    } else {
      console.error('Erro: .agents/ ja existe. Use --force para sobrescrever.');
      console.error('  npx @joelbonito/inove-ai-framework install --force');
      process.exit(1);
    }
  }

  // ── Source check ───────────────────────────────────────────────────

  if (!fs.existsSync(AGENT_SRC)) {
    const msg = 'Erro: Pasta .agents/ de origem nao encontrada no pacote.';
    if (interactive) ui.logError(msg);
    else console.error(msg);
    process.exit(1);
  }

  // ── Show plan ──────────────────────────────────────────────────────

  const gitRepo = isGitRepo(targetDir);
  const python3 = hasPython3();

  if (interactive) {
    const planLines = [
      '.agents/ (21 agentes, 41 skills, 22 workflows, 22 scripts)',
      'CLAUDE.md, AGENTS.md, GEMINI.md',
      'Symlinks: .claude/ (Claude Code), .codex/ (Codex CLI)',
      'squads/ (templates basic e specialist)',
    ];
    if (gitRepo) planLines.push('Git hooks (post-commit para tracking)');
    if (python3) planLines.push('Sessao de trabalho iniciada automaticamente');

    ui.note(planLines.join('\n'), 'Sera instalado');

    const proceed = await ui.confirm({
      message: 'Prosseguir com a instalacao?',
      initialValue: true,
    });
    if (!proceed) {
      ui.logInfo('Instalacao cancelada.');
      return;
    }
  } else {
    console.log(`\nInstalando Inove AI Framework v${VERSION}...`);
    console.log(`Destino: ${targetDir}\n`);
  }

  // ── Execute install ────────────────────────────────────────────────

  const s = interactive ? ui.spinner() : null;

  // 1. Copy .agents/
  if (s) s.start('Copiando .agents/...');
  else console.log('Copiando .agents/...');
  try {
    copyDir(AGENT_SRC, agentDest, PACKAGE_ROOT);
    if (s) s.stop('.agents/ copiado com sucesso.');
    else console.log('  .agents/ copiado.');
  } catch (err) {
    if (s) s.stop('Erro ao copiar .agents/');
    console.error('Erro:', sanitizeErrorMessage(err));
    process.exit(1);
  }

  // 2. Write version marker
  atomicWrite(path.join(agentDest, '.version'), VERSION + '\n');

  // 3. Setup platforms (symlinks + instruction files)
  if (s) s.start('Configurando plataformas...');
  else console.log('Configurando plataformas...');
  try {
    const platformResults = setupAllPlatforms(targetDir);
    if (s) s.stop('Plataformas configuradas.');
    else {
      for (const r of platformResults) console.log(r);
    }
  } catch (err) {
    if (s) s.stop('Erro ao configurar plataformas');
    console.error('Aviso:', sanitizeErrorMessage(err));
  }

  // 4. Copy squads/ templates
  if (s) s.start('Copiando templates de squads...');
  else console.log('Copiando templates de squads...');
  try {
    if (fs.existsSync(SQUADS_SRC)) {
      const squadsDest = path.join(targetDir, 'squads');
      if (!fs.existsSync(squadsDest)) {
        copyDir(SQUADS_SRC, squadsDest, PACKAGE_ROOT);
      }
      if (s) s.stop('Templates de squads copiados.');
      else console.log('  squads/ copiados.');
    } else {
      if (s) s.stop('Templates de squads nao encontrados (ignorado).');
      else console.log('  squads/ nao encontrados (ignorado).');
    }
  } catch (err) {
    if (s) s.stop('Aviso: erro ao copiar squads');
    console.warn('Aviso:', sanitizeErrorMessage(err));
  }

  // 5. Git hooks
  if (gitRepo) {
    const hooksScript = path.join(agentDest, 'scripts', 'install_git_hooks.sh');
    if (fs.existsSync(hooksScript)) {
      if (s) s.start('Instalando git hooks...');
      else console.log('Instalando git hooks...');
      try {
        fs.chmodSync(hooksScript, '755');
        execFileSync('bash', [hooksScript], { stdio: 'pipe' });
        if (s) s.stop('Git hooks instalados.');
        else console.log('  Git hooks instalados.');
      } catch {
        if (s) s.stop('Aviso: nao foi possivel instalar git hooks.');
        else console.warn('  Aviso: nao foi possivel instalar git hooks.');
      }
    }
  }

  // 6. Auto-start session
  if (python3) {
    const sessionScript = path.join(agentDest, 'scripts', 'auto_session.py');
    if (fs.existsSync(sessionScript)) {
      if (s) s.start('Iniciando primeira sessao...');
      else console.log('Iniciando primeira sessao...');
      try {
        execFileSync('python3', [sessionScript, 'start'], { stdio: 'pipe' });
        if (s) s.stop('Sessao iniciada.');
        else console.log('  Sessao iniciada.');
      } catch {
        if (s) s.stop('Aviso: nao foi possivel iniciar sessao.');
        else console.warn('  Aviso: nao foi possivel iniciar sessao.');
      }
    }
  }

  // 7. Update .gitignore
  ensureGitignore(targetDir, '.agents/locks/');
  ensureGitignore(targetDir, '.agents/.session_state.json');
  ensureGitignore(targetDir, '.agents.bak/');

  // ── Summary ────────────────────────────────────────────────────────

  if (interactive) {
    const summary = [
      `Versao: ${VERSION}`,
      '',
      'Instalado:',
      '  .agents/ (21 agentes, 41 skills, 22 workflows, 22 scripts)',
      '  CLAUDE.md, AGENTS.md, GEMINI.md',
      '  .claude/ e .codex/ (symlinks)',
      '  squads/ (templates)',
      gitRepo ? '  Git hooks' : '',
      python3 ? '  Sessao de trabalho iniciada' : '',
      '',
      'Proximos passos:',
      '  python3 .agents/scripts/dashboard.py',
      '  /define <descricao do projeto>',
    ].filter(Boolean).join('\n');

    ui.note(summary, 'Instalacao Concluida');
  } else {
    console.log('\nInstalacao concluida!');
    console.log(`  Versao: ${VERSION}`);
    console.log('  Execute "python3 .agents/scripts/dashboard.py" para ver o status.');
  }
}

module.exports = { run };
