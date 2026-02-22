/**
 * UI helpers for the Inove AI Framework CLI.
 * Thin wrapper around @clack/prompts for PT-BR output.
 */

let clack;
try {
  clack = require('@clack/prompts');
} catch {
  // Fallback if @clack/prompts is not installed
  clack = null;
}

const { VERSION } = require('./constants');

function ensureClack() {
  if (!clack) {
    console.error('Erro: @clack/prompts nao esta instalado.');
    console.error('Execute: npm install @clack/prompts');
    process.exit(1);
  }
}

function showHeader() {
  ensureClack();
  clack.intro(`Inove AI Framework v${VERSION} \u2014 Assistente de Instalacao`);
}

function showFooter(message) {
  ensureClack();
  clack.outro(message || 'Pronto!');
}

function handleCancel() {
  ensureClack();
  clack.cancel('Operacao cancelada.');
  process.exit(0);
}

/**
 * Check if the result of a clack prompt was cancelled.
 * If so, exit gracefully.
 */
function checkCancel(value) {
  ensureClack();
  if (clack.isCancel(value)) {
    handleCancel();
  }
  return value;
}

/**
 * Select a single option from a list.
 */
async function select(options) {
  ensureClack();
  const result = await clack.select(options);
  return checkCancel(result);
}

/**
 * Select multiple options from a list.
 */
async function multiselect(options) {
  ensureClack();
  const result = await clack.multiselect(options);
  return checkCancel(result);
}

/**
 * Confirm yes/no.
 */
async function confirm(options) {
  ensureClack();
  const result = await clack.confirm(options);
  return checkCancel(result);
}

/**
 * Text input.
 */
async function text(options) {
  ensureClack();
  const result = await clack.text(options);
  return checkCancel(result);
}

/**
 * Create a spinner.
 */
function spinner() {
  ensureClack();
  return clack.spinner();
}

/**
 * Log helpers.
 */
function log(type, message) {
  ensureClack();
  if (clack.log && clack.log[type]) {
    clack.log[type](message);
  } else {
    console.log(message);
  }
}

function logSuccess(msg) { log('success', msg); }
function logWarning(msg) { log('warning', msg); }
function logError(msg) { log('error', msg); }
function logInfo(msg) { log('info', msg); }
function logStep(msg) { log('step', msg); }

/**
 * Show a note box.
 */
function note(message, title) {
  ensureClack();
  clack.note(message, title);
}

module.exports = {
  showHeader,
  showFooter,
  handleCancel,
  checkCancel,
  select,
  multiselect,
  confirm,
  text,
  spinner,
  note,
  logSuccess,
  logWarning,
  logError,
  logInfo,
  logStep,
};
