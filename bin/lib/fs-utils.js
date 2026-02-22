/**
 * File system utilities for the Inove AI Framework CLI.
 * Symlink-safe operations with security validations.
 */

const fs = require('fs');
const path = require('path');
const { isPathSafe } = require('./security');

/**
 * Check if a path is a symbolic link.
 * Returns false if path does not exist.
 */
function isSymlink(targetPath) {
  try {
    return fs.lstatSync(targetPath).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Recursively remove a directory without following symlinks.
 * Uses lstatSync to detect symlinks and only unlinks the link itself.
 */
function safeRemoveDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const stat = fs.lstatSync(dirPath);
  if (stat.isSymbolicLink()) {
    fs.unlinkSync(dirPath);
    return;
  }
  if (!stat.isDirectory()) {
    fs.unlinkSync(dirPath);
    return;
  }

  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const entryStat = fs.lstatSync(fullPath);

    if (entryStat.isSymbolicLink()) {
      fs.unlinkSync(fullPath);
    } else if (entryStat.isDirectory()) {
      safeRemoveDir(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dirPath);
}

/**
 * Remove a symlink safely. Only removes if the path IS a symlink
 * and is within the allowed base directory.
 */
function removeSafeSymlink(targetPath, baseDir) {
  if (!isSymlink(targetPath)) return false;
  if (baseDir && !isPathSafe(targetPath, baseDir)) return false;
  fs.unlinkSync(targetPath);
  return true;
}

/**
 * Remove a directory only if it is completely empty.
 */
function cleanEmptyDir(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
      fs.rmdirSync(dirPath);
      return true;
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  return false;
}

/**
 * Write a file atomically: write to .tmp then rename.
 * Prevents partial writes from corrupting the target.
 */
function atomicWrite(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, content, 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

/**
 * Append a line to .gitignore if not already present.
 */
function ensureGitignore(targetDir, entry) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  let content = '';

  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content.includes(entry)) return false;
  }

  const newLine = content.endsWith('\n') || content === '' ? '' : '\n';
  fs.appendFileSync(gitignorePath, `${newLine}${entry}\n`, 'utf-8');
  return true;
}

/**
 * Recursively copy a directory with security validations.
 * Skips hidden files except .agents.
 * Handles symlinks by recreating them (preserves relative targets).
 */
function copyDir(src, dest, packageRoot) {
  if (!isPathSafe(src, packageRoot) && !isPathSafe(src, dest)) {
    throw new Error('Validacao de caminho de origem falhou');
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.agents' && entry.name !== '.templates') {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Check if it's a symlink first (before isDirectory/isFile)
    const srcStat = fs.lstatSync(srcPath);

    if (srcStat.isSymbolicLink()) {
      // Recreate symlink with the same relative target
      const linkTarget = fs.readlinkSync(srcPath);
      try {
        if (fs.lstatSync(destPath, { throwIfNoEntry: false })) {
          fs.unlinkSync(destPath);
        }
      } catch { /* dest doesn't exist */ }
      try {
        fs.symlinkSync(linkTarget, destPath);
      } catch {
        // Skip symlinks that can't be created (e.g., cross-device)
      }
    } else if (srcStat.isDirectory()) {
      copyDir(srcPath, destPath, packageRoot);
    } else if (srcStat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
    // Skip sockets, fifos, etc.
  }
}

/**
 * Copy a single component from .agents/<component> to target .agents/<component>.
 */
function copyComponent(agentSrc, targetAgentsDir, componentName) {
  const src = path.join(agentSrc, componentName);
  const dest = path.join(targetAgentsDir, componentName);

  if (!fs.existsSync(src)) {
    return false;
  }

  const packageRoot = path.resolve(agentSrc, '..');
  copyDir(src, dest, packageRoot);
  return true;
}

/**
 * Create a symlink, verifying the existing state first.
 * Uses relative targets for portability.
 */
function ensureSymlink(target, linkPath) {
  const dir = path.dirname(linkPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const current = fs.readlinkSync(linkPath);
      if (current === target) return; // Already correct
      fs.unlinkSync(linkPath);
    } else if (stat.isDirectory() || stat.isFile()) {
      return; // Real file/directory exists, don't replace
    }
  } catch {
    // Path doesn't exist, proceed to create
  }

  fs.symlinkSync(target, linkPath);
}

/**
 * Check if a git repository exists in the given directory.
 */
function isGitRepo(targetDir) {
  return fs.existsSync(path.join(targetDir, '.git'));
}

/**
 * Check if python3 is available.
 */
function hasPython3() {
  try {
    require('child_process').execFileSync('python3', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  isSymlink,
  safeRemoveDir,
  removeSafeSymlink,
  cleanEmptyDir,
  atomicWrite,
  ensureGitignore,
  copyDir,
  copyComponent,
  ensureSymlink,
  isGitRepo,
  hasPython3,
};
