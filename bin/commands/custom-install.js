/**
 * Custom Install command for the Inove AI Framework.
 * Interactive wizard to choose platforms, components, and options.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PACKAGE_ROOT, AGENT_SRC, SQUADS_SRC, VERSION, PLATFORMS, COMPONENTS, DANGEROUS_DIRS } = require('../lib/constants');
const { sanitizeErrorMessage } = require('../lib/security');
const { copyDir, copyComponent, isGitRepo, hasPython3, atomicWrite, ensureGitignore } = require('../lib/fs-utils');
const { setupPlatform } = require('../lib/platforms');
const ui = require('../lib/ui');

async function run() {
  const targetDir = process.cwd();
  const agentDest = path.join(targetDir, '.agents');

  // ── Pre-flight checks ──────────────────────────────────────────────

  const realTarget = fs.realpathSync(targetDir);
  if (DANGEROUS_DIRS.includes(realTarget)) {
    ui.logError(`Recusado instalar em ${realTarget} \u2014 diretorio de sistema.`);
    process.exit(1);
  }

  try {
    fs.accessSync(realTarget, fs.constants.W_OK);
  } catch {
    ui.logError(`Sem permissao de escrita em ${realTarget}`);
    process.exit(1);
  }

  if (fs.existsSync(agentDest)) {
    const overwrite = await ui.confirm({
      message: 'Ja existe uma instalacao (.agents/). Deseja sobrescrever?',
      initialValue: false,
    });
    if (!overwrite) {
      ui.logInfo('Instalacao cancelada.');
      return;
    }
  }

  // ── 1. Platform selection ──────────────────────────────────────────

  const selectedPlatforms = await ui.multiselect({
    message: 'Quais plataformas deseja configurar?',
    options: Object.entries(PLATFORMS).map(([key, p]) => ({
      value: key,
      label: p.label,
      hint: p.description,
    })),
    required: true,
    initialValues: Object.keys(PLATFORMS),
  });

  // ── 2. Component selection ─────────────────────────────────────────

  const selectedComponents = await ui.multiselect({
    message: 'Quais componentes instalar dentro de .agents/?',
    options: Object.entries(COMPONENTS).map(([key, c]) => ({
      value: key,
      label: c.label,
      hint: c.description,
    })),
    required: true,
    initialValues: Object.keys(COMPONENTS),
  });

  // ── 3. Squad templates ─────────────────────────────────────────────

  const includeSquads = await ui.confirm({
    message: 'Instalar templates de squads?\n  Templates reutilizaveis para criar pacotes de agentes+skills+workflows por dominio.',
    initialValue: true,
  });

  // ── 4. Git hooks ───────────────────────────────────────────────────

  const gitRepo = isGitRepo(targetDir);
  let installHooks = false;
  if (gitRepo) {
    installHooks = await ui.confirm({
      message: 'Instalar git hooks?\n  Adiciona auto-tracking de progresso nos commits (post-commit hook).',
      initialValue: true,
    });
  }

  // ── 5. Auto-start session ──────────────────────────────────────────

  const python3 = hasPython3();
  let autoStart = false;
  if (python3 && selectedComponents.includes('scripts')) {
    autoStart = await ui.confirm({
      message: 'Iniciar sessao de trabalho automaticamente?\n  Executa auto_session.py para registar a primeira sessao no log diario.',
      initialValue: true,
    });
  }

  // ── Show plan + confirm ────────────────────────────────────────────

  const planLines = [];
  planLines.push('Componentes:');
  for (const key of selectedComponents) {
    planLines.push(`  ${COMPONENTS[key].label}`);
  }
  planLines.push('');
  planLines.push('Plataformas:');
  for (const key of selectedPlatforms) {
    planLines.push(`  ${PLATFORMS[key].label}`);
  }
  if (includeSquads) planLines.push('\nsquads/ (templates basic e specialist)');
  if (installHooks) planLines.push('Git hooks (post-commit)');
  if (autoStart) planLines.push('Sessao de trabalho automatica');

  ui.note(planLines.join('\n'), 'Plano de Instalacao');

  const proceed = await ui.confirm({
    message: 'Prosseguir com a instalacao?',
    initialValue: true,
  });
  if (!proceed) {
    ui.logInfo('Instalacao cancelada.');
    return;
  }

  // ── Execute ────────────────────────────────────────────────────────

  const s = ui.spinner();

  // 1. Create .agents/ base + core docs
  s.start('Criando estrutura .agents/...');
  try {
    if (!fs.existsSync(agentDest)) {
      fs.mkdirSync(agentDest, { recursive: true });
    }
    // Always copy ARCHITECTURE.md and INSTRUCTIONS.md
    const coreDocs = ['ARCHITECTURE.md', 'INSTRUCTIONS.md'];
    for (const doc of coreDocs) {
      const src = path.join(AGENT_SRC, doc);
      const dest = path.join(agentDest, doc);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }
    // Write version marker
    atomicWrite(path.join(agentDest, '.version'), VERSION + '\n');
    s.stop('Estrutura base criada.');
  } catch (err) {
    s.stop('Erro ao criar estrutura base');
    ui.logError(sanitizeErrorMessage(err));
    process.exit(1);
  }

  // 2. Copy selected components
  for (const key of selectedComponents) {
    const comp = COMPONENTS[key];
    s.start(`Copiando ${comp.label}...`);
    try {
      const success = copyComponent(AGENT_SRC, agentDest, comp.srcDir);
      if (success) {
        s.stop(`${comp.label} copiados.`);
      } else {
        s.stop(`${comp.label} nao encontrados (ignorado).`);
      }
    } catch (err) {
      s.stop(`Aviso: erro ao copiar ${comp.label}`);
      ui.logWarning(sanitizeErrorMessage(err));
    }
  }

  // 3. Setup selected platforms
  for (const key of selectedPlatforms) {
    s.start(`Configurando ${PLATFORMS[key].label}...`);
    try {
      setupPlatform(targetDir, key);
      s.stop(`${PLATFORMS[key].label} configurado.`);
    } catch (err) {
      s.stop(`Aviso: erro ao configurar ${PLATFORMS[key].label}`);
      ui.logWarning(sanitizeErrorMessage(err));
    }
  }

  // 4. Squad templates
  if (includeSquads && fs.existsSync(SQUADS_SRC)) {
    s.start('Copiando templates de squads...');
    try {
      const squadsDest = path.join(targetDir, 'squads');
      if (!fs.existsSync(squadsDest)) {
        copyDir(SQUADS_SRC, squadsDest, PACKAGE_ROOT);
      }
      s.stop('Templates de squads copiados.');
    } catch (err) {
      s.stop('Aviso: erro ao copiar squads');
      ui.logWarning(sanitizeErrorMessage(err));
    }
  }

  // 5. Git hooks
  if (installHooks) {
    const hooksScript = path.join(agentDest, 'scripts', 'install_git_hooks.sh');
    if (fs.existsSync(hooksScript)) {
      s.start('Instalando git hooks...');
      try {
        fs.chmodSync(hooksScript, '755');
        execFileSync('bash', [hooksScript], { stdio: 'pipe' });
        s.stop('Git hooks instalados.');
      } catch {
        s.stop('Aviso: nao foi possivel instalar git hooks.');
      }
    }
  }

  // 6. Auto-start session
  if (autoStart) {
    const sessionScript = path.join(agentDest, 'scripts', 'auto_session.py');
    if (fs.existsSync(sessionScript)) {
      s.start('Iniciando primeira sessao...');
      try {
        execFileSync('python3', [sessionScript, 'start'], { stdio: 'pipe' });
        s.stop('Sessao iniciada.');
      } catch {
        s.stop('Aviso: nao foi possivel iniciar sessao.');
      }
    }
  }

  // 7. Update .gitignore
  ensureGitignore(targetDir, '.agents/locks/');
  ensureGitignore(targetDir, '.agents/.session_state.json');
  ensureGitignore(targetDir, '.agents.bak/');

  // ── Summary ────────────────────────────────────────────────────────

  const summary = [
    `Versao: ${VERSION}`,
    '',
    'Componentes instalados:',
    ...selectedComponents.map((k) => `  ${COMPONENTS[k].label}`),
    '',
    'Plataformas configuradas:',
    ...selectedPlatforms.map((k) => `  ${PLATFORMS[k].label}`),
    '',
    'Proximos passos:',
    python3 ? '  python3 .agents/scripts/dashboard.py' : '  Instale Python 3 para usar os scripts de automacao',
    '  /define <descricao do projeto>',
  ].join('\n');

  ui.note(summary, 'Instalacao Personalizada Concluida');
}

module.exports = { run };
