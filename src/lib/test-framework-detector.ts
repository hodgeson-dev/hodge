import fs from 'fs-extra';
import path from 'path';
import { createCommandLogger } from './logger.js';

/**
 * Detects test frameworks in a project
 */
export class TestFrameworkDetector {
  private logger = createCommandLogger('test-framework-detector', { enableConsole: false });

  /**
   * Creates a new TestFrameworkDetector instance
   * @param rootPath - The project root path to analyze
   */
  constructor(private rootPath: string) {}

  /**
   * Detects test frameworks by analyzing package.json dependencies
   * @returns Array of detected test framework names
   */
  async detect(): Promise<string[]> {
    const frameworks: string[] = [];
    const packageJsonPath = path.join(this.rootPath, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      return frameworks;
    }

    try {
      const packageJson = (await fs.readJson(packageJsonPath)) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      // Check for test frameworks with proper type checking
      const testFrameworkChecks = [
        { dep: 'vitest', name: 'vitest' },
        { dep: 'jest', name: 'jest' },
        { dep: 'mocha', name: 'mocha' },
        { dep: 'jasmine', name: 'jasmine' },
        { dep: '@testing-library/react', name: 'testing-library' },
        { dep: 'cypress', name: 'cypress' },
        { dep: '@playwright/test', name: 'playwright' },
      ];

      for (const check of testFrameworkChecks) {
        if (allDeps[check.dep]) {
          frameworks.push(check.name);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Warning: Failed to read package.json for test framework detection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return frameworks;
  }
}
