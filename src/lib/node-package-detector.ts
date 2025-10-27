import fs from 'fs-extra';
import path from 'path';

/**
 * Detects Node.js package manager in a project
 */
export class NodePackageDetector {
  /**
   * Creates a new NodePackageDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Detects the package manager by checking for lock files
   * Priority: pnpm > yarn > npm
   * @returns The detected package manager or null
   */
  async detect(): Promise<'npm' | 'yarn' | 'pnpm' | null> {
    const pnpmLockPath = path.join(this.rootPath, 'pnpm-lock.yaml');
    if (await fs.pathExists(pnpmLockPath)) return 'pnpm';

    const yarnLockPath = path.join(this.rootPath, 'yarn.lock');
    if (await fs.pathExists(yarnLockPath)) return 'yarn';

    const npmLockPath = path.join(this.rootPath, 'package-lock.json');
    if (await fs.pathExists(npmLockPath)) return 'npm';

    return null;
  }
}
