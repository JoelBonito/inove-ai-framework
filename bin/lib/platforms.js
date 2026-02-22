/**
 * Platform-specific setup and detection for the Inove AI Framework CLI.
 * Handles symlink creation, instruction file copying, and platform detection.
 */

const fs = require('fs');
const path = require('path');
const { PLATFORMS, PACKAGE_ROOT, INSTRUCTION_FILES } = require('./constants');
const { ensureSymlink, atomicWrite, isSymlink, removeSafeSymlink, cleanEmptyDir } = require('./fs-utils');

/**
 * Setup a platform in the target directory.
 * Creates the setup dir, symlinks, extra files, and copies the instruction file.
 */
function setupPlatform(targetDir, platformKey) {
  const platform = PLATFORMS[platformKey];
  if (!platform) throw new Error(`Plataforma desconhecida: ${platformKey}`);

  const results = [];

  // 1. Copy instruction file to root
  const srcInstr = path.join(PACKAGE_ROOT, platform.instructionFile);
  const destInstr = path.join(targetDir, platform.instructionFile);
  if (fs.existsSync(srcInstr)) {
    if (!fs.existsSync(destInstr)) {
      fs.copyFileSync(srcInstr, destInstr);
      results.push(`  ${platform.instructionFile} copiado`);
    } else {
      results.push(`  ${platform.instructionFile} ja existe (mantido)`);
    }
  }

  // 2. Create setup directory and symlinks
  if (platform.setupDir) {
    const setupPath = path.join(targetDir, platform.setupDir);
    if (!fs.existsSync(setupPath)) {
      fs.mkdirSync(setupPath, { recursive: true });
    }

    for (const link of platform.symlinks) {
      const linkPath = path.join(setupPath, link.name);
      ensureSymlink(link.target, linkPath);
      results.push(`  ${platform.setupDir}/${link.name} -> ${link.target}`);
    }

    // 3. Write extra files (e.g., project_instructions.md)
    for (const file of platform.extraFiles) {
      const filePath = path.join(setupPath, file.name);
      if (!fs.existsSync(filePath)) {
        atomicWrite(filePath, file.content);
        results.push(`  ${platform.setupDir}/${file.name} criado`);
      } else {
        results.push(`  ${platform.setupDir}/${file.name} ja existe (mantido)`);
      }
    }
  }

  return results;
}

/**
 * Remove a platform from the target directory.
 * Removes symlinks, extra files, and empty dirs.
 * Does NOT remove the instruction file by default.
 */
function removePlatform(targetDir, platformKey, removeInstruction) {
  const platform = PLATFORMS[platformKey];
  if (!platform) return [];

  const results = [];

  // 1. Remove symlinks in setup dir
  if (platform.setupDir) {
    const setupPath = path.join(targetDir, platform.setupDir);

    for (const link of platform.symlinks) {
      const linkPath = path.join(setupPath, link.name);
      if (removeSafeSymlink(linkPath, targetDir)) {
        results.push(`  Symlink removido: ${platform.setupDir}/${link.name}`);
      }
    }

    // Remove extra files
    for (const file of platform.extraFiles) {
      const filePath = path.join(setupPath, file.name);
      if (fs.existsSync(filePath) && !isSymlink(filePath)) {
        fs.unlinkSync(filePath);
        results.push(`  Removido: ${platform.setupDir}/${file.name}`);
      }
    }

    // Clean empty dir
    if (cleanEmptyDir(setupPath)) {
      results.push(`  Diretorio ${platform.setupDir}/ removido (vazio)`);
    }
  }

  // 2. Remove instruction file if requested
  if (removeInstruction) {
    const instrPath = path.join(targetDir, platform.instructionFile);
    if (fs.existsSync(instrPath) && !isSymlink(instrPath)) {
      fs.unlinkSync(instrPath);
      results.push(`  ${platform.instructionFile} removido`);
    }
  }

  return results;
}

/**
 * Check if a platform is installed in the target directory.
 */
function isPlatformInstalled(targetDir, platformKey) {
  const platform = PLATFORMS[platformKey];
  if (!platform) return false;

  // Check instruction file
  const instrExists = fs.existsSync(path.join(targetDir, platform.instructionFile));

  // Check setup dir and symlinks
  if (platform.setupDir) {
    const setupPath = path.join(targetDir, platform.setupDir);
    if (!fs.existsSync(setupPath)) return false;

    const allSymlinks = platform.symlinks.every((link) => {
      const linkPath = path.join(setupPath, link.name);
      return isSymlink(linkPath) || fs.existsSync(linkPath);
    });

    return instrExists && allSymlinks;
  }

  // Gemini / Antigravity: only check instruction file
  return instrExists;
}

/**
 * Detect all installed platforms.
 */
function detectInstalledPlatforms(targetDir) {
  return Object.keys(PLATFORMS).filter((key) => isPlatformInstalled(targetDir, key));
}

/**
 * Setup all platforms.
 */
function setupAllPlatforms(targetDir) {
  const allResults = [];
  for (const key of Object.keys(PLATFORMS)) {
    const results = setupPlatform(targetDir, key);
    allResults.push(...results);
  }
  return allResults;
}

module.exports = {
  setupPlatform,
  removePlatform,
  isPlatformInstalled,
  detectInstalledPlatforms,
  setupAllPlatforms,
};
