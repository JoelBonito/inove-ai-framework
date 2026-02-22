/**
 * Security helpers for the Inove AI Framework CLI.
 * Prevents path traversal and sanitizes error output.
 */

const path = require('path');

/**
 * Validates that a path is within the allowed base directory.
 * Prevents path traversal attacks.
 */
function isPathSafe(targetPath, baseDir) {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedBase = path.resolve(baseDir);
  return resolvedTarget.startsWith(resolvedBase + path.sep) || resolvedTarget === resolvedBase;
}

/**
 * Sanitizes error messages to avoid exposing system paths.
 */
function sanitizeErrorMessage(error) {
  if (!error || !error.message) return 'Erro desconhecido';
  return error.message
    .replace(/\/[^\s:]+/g, '[path]')
    .replace(/[A-Za-z]:\\[^\s:]+/g, '[path]');
}

module.exports = {
  isPathSafe,
  sanitizeErrorMessage,
};
