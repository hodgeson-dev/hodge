import fs from 'fs-extra';
import path from 'path';

/**
 * Detects linting tools in a project
 */
export class LintingDetector {
  /**
   * Creates a new LintingDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Detects linting tools by checking dependencies and config files
   * @returns Array of detected linting tool names
   */
  async detect(): Promise<string[]> {
    const linters: string[] = [];

    await this.detectFromPackageJson(linters);
    await this.detectFromConfigFiles(linters);

    return linters;
  }

  /**
   * Detect linting tools from package.json dependencies
   */
  private async detectFromPackageJson(linters: string[]): Promise<void> {
    const packageJsonPath = path.join(this.rootPath, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      return;
    }

    try {
      const packageJson = (await fs.readJson(packageJsonPath)) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (allDeps && allDeps.eslint) linters.push('eslint');
      if (allDeps && allDeps.prettier) linters.push('prettier');
      if (allDeps && allDeps.tslint) linters.push('tslint');
    } catch {
      // Continue without package.json info
    }
  }

  /**
   * Detect linting tools from config files
   */
  private async detectFromConfigFiles(linters: string[]): Promise<void> {
    const configFiles = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.json',
      '.prettierrc',
      '.prettierrc.js',
      '.prettierrc.json',
      'tslint.json',
    ];

    for (const file of configFiles) {
      if (await fs.pathExists(path.join(this.rootPath, file))) {
        this.addLinterFromConfig(file, linters);
      }
    }
  }

  /**
   * Add linter to list based on config file name
   */
  private addLinterFromConfig(file: string, linters: string[]): void {
    if (file.includes('eslint') && !linters.includes('eslint')) {
      linters.push('eslint');
    }
    if (file.includes('prettier') && !linters.includes('prettier')) {
      linters.push('prettier');
    }
    if (file.includes('tslint') && !linters.includes('tslint')) {
      linters.push('tslint');
    }
  }
}
