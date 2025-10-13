/**
 * FrameworkDetector: Detects frameworks and libraries for Semgrep rule selection
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { createCommandLogger } from './logger.js';
import type { SupportedLanguage } from './language-detector.js';

const logger = createCommandLogger('framework-detector');

export type PythonFramework = 'django' | 'flask' | 'fastapi';
export type JavaFramework = 'spring-boot' | 'spring-security';
export type KotlinFramework = 'spring-boot' | 'ktor' | 'jetpack-compose';

export type DetectedFramework = PythonFramework | JavaFramework | KotlinFramework;

/**
 * Detects frameworks and libraries used in a project
 */
export class FrameworkDetector {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Detect frameworks for a specific language
   */
  async detectFrameworks(language: SupportedLanguage): Promise<DetectedFramework[]> {
    switch (language) {
      case 'python':
        return this.detectPythonFrameworks();
      case 'kotlin':
        return this.detectKotlinFrameworks();
      case 'java':
        return this.detectJavaFrameworks();
      default:
        logger.debug('No framework detection available for language', { language });
        return [];
    }
  }

  /**
   * Detect Python frameworks (Django, Flask, FastAPI)
   */
  private async detectPythonFrameworks(): Promise<PythonFramework[]> {
    const frameworks: PythonFramework[] = [];

    // Check each config file
    await this.checkPyprojectToml(frameworks);
    await this.checkRequirementsTxt(frameworks);
    await this.checkPipfile(frameworks);

    // Deduplicate
    const unique = [...new Set(frameworks)];
    logger.debug('Detected Python frameworks', { frameworks: unique });
    return unique;
  }

  private async checkPyprojectToml(frameworks: PythonFramework[]): Promise<void> {
    if (await this.fileExists('pyproject.toml')) {
      try {
        const content = await fs.readFile(join(this.cwd, 'pyproject.toml'), 'utf-8');
        this.extractPythonFrameworks(content, frameworks);
      } catch (error) {
        logger.debug('Could not read pyproject.toml', { error });
      }
    }
  }

  private async checkRequirementsTxt(frameworks: PythonFramework[]): Promise<void> {
    if (await this.fileExists('requirements.txt')) {
      try {
        const content = await fs.readFile(join(this.cwd, 'requirements.txt'), 'utf-8');
        const lines = content.toLowerCase().split('\n');
        for (const line of lines) {
          this.extractPythonFrameworks(line, frameworks);
        }
      } catch (error) {
        logger.debug('Could not read requirements.txt', { error });
      }
    }
  }

  private async checkPipfile(frameworks: PythonFramework[]): Promise<void> {
    if (await this.fileExists('Pipfile')) {
      try {
        const content = await fs.readFile(join(this.cwd, 'Pipfile'), 'utf-8');
        this.extractPythonFrameworks(content, frameworks);
      } catch (error) {
        logger.debug('Could not read Pipfile', { error });
      }
    }
  }

  private extractPythonFrameworks(content: string, frameworks: PythonFramework[]): void {
    if (content.includes('django')) frameworks.push('django');
    if (content.includes('flask')) frameworks.push('flask');
    if (content.includes('fastapi')) frameworks.push('fastapi');
  }

  /**
   * Detect Kotlin frameworks (Spring Boot, Ktor, Jetpack Compose)
   */
  private async detectKotlinFrameworks(): Promise<KotlinFramework[]> {
    const frameworks: KotlinFramework[] = [];

    // Check each config file
    await this.checkBuildGradleKts(frameworks);
    await this.checkPomXmlForKotlin(frameworks);

    // Deduplicate
    const unique = [...new Set(frameworks)];
    logger.debug('Detected Kotlin frameworks', { frameworks: unique });
    return unique;
  }

  private async checkBuildGradleKts(frameworks: KotlinFramework[]): Promise<void> {
    if (await this.fileExists('build.gradle.kts')) {
      try {
        const content = await fs.readFile(join(this.cwd, 'build.gradle.kts'), 'utf-8');
        if (content.includes('spring-boot-starter')) frameworks.push('spring-boot');
        if (content.includes('ktor')) frameworks.push('ktor');
        if (content.includes('compose')) frameworks.push('jetpack-compose');
      } catch (error) {
        logger.debug('Could not read build.gradle.kts', { error });
      }
    }
  }

  private async checkPomXmlForKotlin(frameworks: KotlinFramework[]): Promise<void> {
    if (await this.fileExists('pom.xml')) {
      try {
        const content = await fs.readFile(join(this.cwd, 'pom.xml'), 'utf-8');
        if (content.includes('spring-boot-starter')) frameworks.push('spring-boot');
        if (content.includes('ktor')) frameworks.push('ktor');
      } catch (error) {
        logger.debug('Could not read pom.xml', { error });
      }
    }
  }

  /**
   * Detect Java frameworks (Spring Boot, Spring Security)
   */
  private async detectJavaFrameworks(): Promise<JavaFramework[]> {
    const frameworks: JavaFramework[] = [];

    // Check build.gradle
    if (await this.fileExists('build.gradle')) {
      try {
        const content = await fs.readFile(join(this.cwd, 'build.gradle'), 'utf-8');
        if (content.includes('spring-boot-starter')) frameworks.push('spring-boot');
        if (content.includes('spring-security')) frameworks.push('spring-security');
      } catch (error) {
        logger.debug('Could not read build.gradle', { error });
      }
    }

    // Check pom.xml
    if (await this.fileExists('pom.xml')) {
      try {
        const content = await fs.readFile(join(this.cwd, 'pom.xml'), 'utf-8');
        if (content.includes('spring-boot-starter')) frameworks.push('spring-boot');
        if (content.includes('spring-security')) frameworks.push('spring-security');
      } catch (error) {
        logger.debug('Could not read pom.xml', { error });
      }
    }

    // Deduplicate
    const unique = [...new Set(frameworks)];
    logger.debug('Detected Java frameworks', { frameworks: unique });
    return unique;
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
