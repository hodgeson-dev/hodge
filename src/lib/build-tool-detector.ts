import fs from 'fs-extra';
import path from 'path';

/**
 * Detects build tools in a project
 */
export class BuildToolDetector {
  /**
   * Creates a new BuildToolDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Detects build tools by checking dependencies and config files
   * @returns Array of detected build tool names
   */
  async detect(): Promise<string[]> {
    const buildTools: string[] = [];

    await this.detectFromPackageJson(buildTools);
    await this.detectFromConfigFiles(buildTools);

    return buildTools;
  }

  /**
   * Detect build tools from package.json dependencies
   */
  private async detectFromPackageJson(buildTools: string[]): Promise<void> {
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

      if (allDeps && allDeps.typescript) buildTools.push('typescript');
      if (allDeps && allDeps.webpack) buildTools.push('webpack');
      if (allDeps && allDeps.vite) buildTools.push('vite');
      if (allDeps && allDeps.rollup) buildTools.push('rollup');
      if (allDeps && allDeps.parcel) buildTools.push('parcel');
    } catch {
      // Continue without package.json info
    }
  }

  /**
   * Detect build tools from config files
   */
  private async detectFromConfigFiles(buildTools: string[]): Promise<void> {
    const configFiles = [
      'tsconfig.json',
      'webpack.config.js',
      'vite.config.js',
      'rollup.config.js',
    ];

    for (const file of configFiles) {
      if (await fs.pathExists(path.join(this.rootPath, file))) {
        this.addBuildToolFromConfig(file, buildTools);
      }
    }
  }

  /**
   * Add build tool to list based on config file name
   */
  private addBuildToolFromConfig(file: string, buildTools: string[]): void {
    const tool = file.split('.')[0];
    if (tool === 'tsconfig' && !buildTools.includes('typescript')) {
      buildTools.push('typescript');
    } else if (!buildTools.includes(tool)) {
      buildTools.push(tool);
    }
  }
}
