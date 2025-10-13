/**
 * PackageManagerDetector: Detects package managers for different languages
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('package-manager-detector');

export type PythonPackageManager = 'poetry' | 'pip' | 'pipenv';
export type JavaBuildTool = 'gradle' | 'maven';

/**
 * Detects which package manager/build tool to use for each language
 */
export class PackageManagerDetector {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Detect Python package manager
   * Priority: poetry > pipenv > pip
   */
  async detectPython(): Promise<PythonPackageManager> {
    // Check for poetry
    if (await this.fileExists('pyproject.toml')) {
      const content = await fs.readFile(join(this.cwd, 'pyproject.toml'), 'utf-8');
      if (content.includes('[tool.poetry]')) {
        logger.debug('Detected poetry');
        return 'poetry';
      }
    }

    // Check for pipenv
    if (await this.fileExists('Pipfile')) {
      logger.debug('Detected pipenv');
      return 'pipenv';
    }

    // Default to pip
    logger.debug('Defaulting to pip');
    return 'pip';
  }

  /**
   * Detect Java/Kotlin build tool
   * Priority: gradle > maven
   */
  async detectJava(): Promise<JavaBuildTool> {
    // Prefer Gradle
    if (
      (await this.fileExists('build.gradle.kts')) ||
      (await this.fileExists('build.gradle')) ||
      (await this.fileExists('gradlew'))
    ) {
      logger.debug('Detected gradle');
      return 'gradle';
    }

    // Fall back to Maven
    if (await this.fileExists('pom.xml')) {
      logger.debug('Detected maven');
      return 'maven';
    }

    // Default to Gradle
    logger.debug('Defaulting to gradle');
    return 'gradle';
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filename: string): Promise<boolean> {
    try {
      await fs.access(join(this.cwd, filename));
      return true;
    } catch {
      return false;
    }
  }
}
