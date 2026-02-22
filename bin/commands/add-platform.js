/**
 * Add Platform command for the Inove AI Framework.
 * Adds support for a new AI tool (Claude Code, Codex CLI, Gemini / Antigravity).
 */

const fs = require('fs');
const path = require('path');
const { PLATFORMS } = require('../lib/constants');
const { setupPlatform, detectInstalledPlatforms } = require('../lib/platforms');
const { sanitizeErrorMessage } = require('../lib/security');
const ui = require('../lib/ui');

async function run() {
  const targetDir = process.cwd();
  const agentDest = path.join(targetDir, '.agents');

  // ── Verify .agents/ exists ─────────────────────────────────────────

  if (!fs.existsSync(agentDest)) {
    ui.logError('Nenhuma instalacao encontrada (.agents/ nao existe).\nUse "Instalacao Completa" primeiro.');
    return;
  }

  // ── Detect installed platforms ─────────────────────────────────────

  const installed = detectInstalledPlatforms(targetDir);
  const available = Object.keys(PLATFORMS).filter((k) => !installed.includes(k));

  if (available.length === 0) {
    ui.logInfo('Todas as plataformas ja estao configuradas:');
    for (const key of installed) {
      ui.logSuccess(`  ${PLATFORMS[key].label}`);
    }
    return;
  }

  // Show currently installed
  if (installed.length > 0) {
    ui.logInfo('Plataformas ja configuradas: ' + installed.map((k) => PLATFORMS[k].label).join(', '));
  }

  // ── Select platform to add ─────────────────────────────────────────

  const platform = await ui.select({
    message: 'Qual plataforma deseja adicionar?',
    options: available.map((key) => ({
      value: key,
      label: PLATFORMS[key].label,
      hint: PLATFORMS[key].description,
    })),
  });

  // ── Execute ────────────────────────────────────────────────────────

  const s = ui.spinner();
  s.start(`Configurando ${PLATFORMS[platform].label}...`);

  try {
    const results = setupPlatform(targetDir, platform);
    s.stop(`${PLATFORMS[platform].label} configurado com sucesso.`);

    for (const line of results) {
      ui.logSuccess(line);
    }
  } catch (err) {
    s.stop(`Erro ao configurar ${PLATFORMS[platform].label}`);
    ui.logError(sanitizeErrorMessage(err));
  }
}

module.exports = { run };
