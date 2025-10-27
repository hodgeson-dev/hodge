import fs from 'fs-extra';
import path from 'path';

/**
 * Supported project types for auto-detection
 */
export type ProjectType = 'node' | 'python' | 'unknown';

/**
 * Detects project type in a directory
 */
export class ProjectTypeDetector {
  /**
   * Creates a new ProjectTypeDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Detects the project type by analyzing project files
   * @returns The detected project type
   */
  async detect(): Promise<ProjectType> {
    // Check for Node.js indicators
    const nodeIndicators = [
      'package.json',
      'node_modules',
      'yarn.lock',
      'package-lock.json',
      'pnpm-lock.yaml',
    ];

    for (const indicator of nodeIndicators) {
      if (await fs.pathExists(path.join(this.rootPath, indicator))) {
        return 'node';
      }
    }

    // Check for Python indicators
    const pythonIndicators = [
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'Pipfile',
      'poetry.lock',
      'environment.yml',
    ];

    for (const indicator of pythonIndicators) {
      if (await fs.pathExists(path.join(this.rootPath, indicator))) {
        return 'python';
      }
    }

    return 'unknown';
  }
}
