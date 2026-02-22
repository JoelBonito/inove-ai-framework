/**
 * Validate command for the Inove AI Framework.
 * Checks installation integrity, symlinks, and system dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PLATFORMS, COMPONENTS } = require('../lib/constants');
const { isSymlink, hasPython3, isGitRepo } = require('../lib/fs-utils');
const { detectInstalledPlatforms } = require('../lib/platforms');
const { sanitizeErrorMessage } = require('../lib/security');
const ui = require('../lib/ui');

/**
 * Basic validation (pure JS, no Python dependency).
 */
function runBasicValidation(targetDir) {
  const agentDest = path.join(targetDir, '.agents');
  const results = { pass: 0, warn: 0, fail: 0, details: [] };

  function pass(msg) { results.pass++; results.details.push({ status: 'pass', msg }); }
  function warn(msg) { results.warn++; results.details.push({ status: 'warn', msg }); }
  function fail(msg) { results.fail++; results.details.push({ status: 'fail', msg }); }

  // 1. .agents/ exists
  if (fs.existsSync(agentDest)) {
    pass('.agents/ existe');
  } else {
    fail('.agents/ NAO encontrado');
    return results; // No point checking further
  }

  // 2. Core directories
  for (const [key, comp] of Object.entries(COMPONENTS)) {
    const dir = path.join(agentDest, comp.srcDir);
    if (fs.existsSync(dir)) {
      try {
        const count = fs.readdirSync(dir).length;
        pass(`${comp.srcDir}/ (${count} itens)`);
      } catch {
        warn(`${comp.srcDir}/ existe mas nao pode ser lido`);
      }
    } else {
      warn(`${comp.srcDir}/ nao encontrado`);
    }
  }

  // 3. Core docs
  for (const doc of ['ARCHITECTURE.md', 'INSTRUCTIONS.md']) {
    const docPath = path.join(agentDest, doc);
    if (fs.existsSync(docPath)) {
      pass(`.agents/${doc}`);
    } else {
      fail(`.agents/${doc} NAO encontrado`);
    }
  }

  // 4. Instruction files
  for (const file of ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md']) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      pass(file);
    } else {
      warn(`${file} nao encontrado na raiz`);
    }
  }

  // 5. Platform symlinks
  const installed = detectInstalledPlatforms(targetDir);
  for (const key of installed) {
    const platform = PLATFORMS[key];
    if (!platform.setupDir) {
      pass(`${platform.label} (sem symlinks necessarios)`);
      continue;
    }

    const setupPath = path.join(targetDir, platform.setupDir);
    for (const link of platform.symlinks) {
      const linkPath = path.join(setupPath, link.name);
      if (isSymlink(linkPath)) {
        // Check if target exists
        const target = fs.readlinkSync(linkPath);
        const resolvedTarget = path.resolve(path.dirname(linkPath), target);
        if (fs.existsSync(resolvedTarget)) {
          pass(`${platform.setupDir}/${link.name} -> ${target}`);
        } else {
          fail(`${platform.setupDir}/${link.name} -> ${target} (QUEBRADO — destino nao existe)`);
        }
      } else if (fs.existsSync(linkPath)) {
        warn(`${platform.setupDir}/${link.name} existe mas nao e symlink`);
      } else {
        fail(`${platform.setupDir}/${link.name} nao encontrado`);
      }
    }
  }

  // 6. Version marker
  const versionFile = path.join(agentDest, '.version');
  if (fs.existsSync(versionFile)) {
    const version = fs.readFileSync(versionFile, 'utf-8').trim();
    pass(`Versao instalada: ${version}`);
  } else {
    warn('.agents/.version nao encontrado (instalacao legada?)');
  }

  // 7. System dependencies
  if (hasPython3()) {
    pass('Python 3 disponivel');
  } else {
    warn('Python 3 NAO encontrado — scripts de automacao nao funcionarao');
  }

  if (isGitRepo(targetDir)) {
    pass('Repositorio Git detectado');
  } else {
    warn('Nao e um repositorio Git');
  }

  return results;
}

async function run(options = {}) {
  const { full = false, interactive = true } = options;
  const targetDir = process.cwd();

  // ── Mode selection ─────────────────────────────────────────────────

  let mode = full ? 'full' : 'basic';

  if (interactive && !full) {
    mode = await ui.select({
      message: 'Tipo de verificacao:',
      options: [
        {
          value: 'basic',
          label: 'Basica',
          hint: 'Verifica .agents/, symlinks, ficheiros de instrucao e dependencias do sistema.',
        },
        {
          value: 'full',
          label: 'Completa',
          hint: 'Executa validate_installation.py para analise profunda de todos os componentes.',
        },
      ],
    });
  }

  // ── Basic validation ───────────────────────────────────────────────

  if (interactive) {
    const s = ui.spinner();
    s.start('Verificando instalacao...');

    const results = runBasicValidation(targetDir);
    s.stop('Verificacao basica concluida.');

    // Display results
    for (const detail of results.details) {
      if (detail.status === 'pass') ui.logSuccess(detail.msg);
      else if (detail.status === 'warn') ui.logWarning(detail.msg);
      else ui.logError(detail.msg);
    }

    ui.note(
      `Passou: ${results.pass}  |  Avisos: ${results.warn}  |  Falhou: ${results.fail}`,
      'Resultado'
    );

    // ── Full validation ────────────────────────────────────────────

    if (mode === 'full') {
      const validateScript = path.join(targetDir, '.agents', 'scripts', 'validate_installation.py');
      if (!fs.existsSync(validateScript)) {
        ui.logError('validate_installation.py nao encontrado. Instale o framework primeiro.');
        return;
      }

      if (!hasPython3()) {
        ui.logError('Python 3 necessario para verificacao completa.');
        return;
      }

      ui.logInfo('Executando verificacao completa com validate_installation.py...\n');
      try {
        execFileSync('python3', [validateScript, '--verbose'], {
          cwd: targetDir,
          stdio: 'inherit',
        });
      } catch (err) {
        ui.logWarning('Verificacao completa reportou problemas (ver output acima).');
      }
    }
  } else {
    // Non-interactive mode
    console.log('Verificando instalacao...\n');
    const results = runBasicValidation(targetDir);

    for (const detail of results.details) {
      const icon = detail.status === 'pass' ? '[OK]' : detail.status === 'warn' ? '[AVISO]' : '[FALHA]';
      console.log(`  ${icon} ${detail.msg}`);
    }

    console.log(`\nPassed: ${results.pass} | Warnings: ${results.warn} | Failed: ${results.fail}`);

    if (results.fail > 0) process.exit(1);
  }
}

module.exports = { run };
