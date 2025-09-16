/**
 * Install Hodge Way starter templates
 * Copies opinionated standards, patterns, and principles to project
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export interface HodgeWayFiles {
  standards: boolean;
  patterns: boolean;
  decisions: boolean;
  principles: boolean;
}

/**
 * Install Hodge Way starter files to the project
 * @param hodgePath - Path to .hodge directory
 * @param options - Which files to install (defaults to all)
 */
export async function installHodgeWay(
  hodgePath: string,
  options: Partial<HodgeWayFiles> = {}
): Promise<void> {
  const toInstall = {
    standards: options.standards !== false,
    patterns: options.patterns !== false,
    decisions: options.decisions !== false,
    principles: options.principles !== false,
  };

  // Resolve template directory relative to the compiled output
  // In dist/src/lib, templates are in dist/src/templates
  const templateDir = path.join(__dirname, '..', 'templates', 'hodge-way');

  // Install standards.md if requested and doesn't exist
  if (toInstall.standards) {
    const targetPath = path.join(hodgePath, 'standards.md');
    if (!(await fs.pathExists(targetPath))) {
      const sourcePath = path.join(templateDir, 'standards.md');
      await fs.copy(sourcePath, targetPath);
    }
  }

  // Install patterns directory if requested
  if (toInstall.patterns) {
    const targetPath = path.join(hodgePath, 'patterns');
    await fs.ensureDir(targetPath);

    const patternsReadme = path.join(targetPath, 'README.md');
    if (!(await fs.pathExists(patternsReadme))) {
      const sourcePath = path.join(templateDir, 'patterns', 'README.md');
      await fs.copy(sourcePath, patternsReadme);
    }
  }

  // Install decisions.md if requested and doesn't exist
  if (toInstall.decisions) {
    const targetPath = path.join(hodgePath, 'decisions.md');
    if (!(await fs.pathExists(targetPath))) {
      const sourcePath = path.join(templateDir, 'decisions.md');
      await fs.copy(sourcePath, targetPath);
    }
  }

  // Install principles.md if requested and doesn't exist
  if (toInstall.principles) {
    const targetPath = path.join(hodgePath, 'principles.md');
    if (!(await fs.pathExists(targetPath))) {
      const sourcePath = path.join(templateDir, 'principles.md');
      await fs.copy(sourcePath, targetPath);
    }
  }
}

/**
 * Check which Hodge Way files are already installed
 * @param hodgePath - Path to .hodge directory
 */
export async function checkHodgeWayStatus(hodgePath: string): Promise<HodgeWayFiles> {
  return {
    standards: await fs.pathExists(path.join(hodgePath, 'standards.md')),
    patterns: await fs.pathExists(path.join(hodgePath, 'patterns', 'README.md')),
    decisions: await fs.pathExists(path.join(hodgePath, 'decisions.md')),
    principles: await fs.pathExists(path.join(hodgePath, 'principles.md')),
  };
}

/**
 * Get a list of installed Hodge Way files
 * @param hodgePath - Path to .hodge directory
 */
export async function listHodgeWayFiles(hodgePath: string): Promise<string[]> {
  const status = await checkHodgeWayStatus(hodgePath);
  const files: string[] = [];

  if (status.standards) files.push('.hodge/standards.md');
  if (status.patterns) files.push('.hodge/patterns/README.md');
  if (status.decisions) files.push('.hodge/decisions.md');
  if (status.principles) files.push('.hodge/principles.md');

  return files;
}
