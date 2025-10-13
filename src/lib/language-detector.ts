/**
 * LanguageDetector: Detects programming languages in projects
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('language-detector');

export type SupportedLanguage = 'typescript' | 'javascript' | 'python' | 'kotlin' | 'java';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[]; // Files/patterns that led to detection
}

/**
 * Detects programming languages in a project
 */
export class LanguageDetector {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Detect all languages present in the project
   */
  async detectLanguages(): Promise<LanguageDetectionResult[]> {
    const results: LanguageDetectionResult[] = [];

    // Check for each language
    const pythonResult = await this.detectPython();
    if (pythonResult) results.push(pythonResult);

    const kotlinResult = await this.detectKotlin();
    if (kotlinResult) results.push(kotlinResult);

    const javaResult = await this.detectJava();
    if (javaResult) results.push(javaResult);

    const tsResult = await this.detectTypeScript();
    if (tsResult) results.push(tsResult);

    const jsResult = await this.detectJavaScript();
    if (jsResult) results.push(jsResult);

    logger.debug('Detected languages', { results });
    return results;
  }

  /**
   * Detect Python by checking for Python-specific files
   */
  private async detectPython(): Promise<LanguageDetectionResult | null> {
    const indicators: string[] = [];

    // Check for Python project files (high confidence)
    if (await this.fileExists('pyproject.toml')) {
      indicators.push('pyproject.toml');
    }
    if (await this.fileExists('setup.py')) {
      indicators.push('setup.py');
    }
    if (await this.fileExists('requirements.txt')) {
      indicators.push('requirements.txt');
    }
    if (await this.fileExists('Pipfile')) {
      indicators.push('Pipfile');
    }

    if (indicators.length > 0) {
      return {
        language: 'python',
        confidence: 'high',
        indicators,
      };
    }

    return null;
  }

  /**
   * Detect Kotlin by checking for Kotlin-specific files
   */
  private async detectKotlin(): Promise<LanguageDetectionResult | null> {
    const indicators: string[] = [];

    // Check for Kotlin project files
    // build.gradle.kts file extension itself indicates Kotlin
    if (await this.fileExists('build.gradle.kts')) {
      indicators.push('build.gradle.kts');
    }

    // Check for kotlin-maven-plugin in pom.xml
    try {
      if (await this.fileExists('pom.xml')) {
        const pomContent = await fs.readFile(join(this.cwd, 'pom.xml'), 'utf-8');
        if (pomContent.includes('kotlin-maven-plugin')) {
          indicators.push('pom.xml (kotlin-maven-plugin)');
        }
      }
    } catch (error) {
      // File might not be fully written yet, skip this check
      logger.debug('Could not read pom.xml for Kotlin detection', { error });
    }

    if (indicators.length > 0) {
      return {
        language: 'kotlin',
        confidence: 'high',
        indicators,
      };
    }

    return null;
  }

  /**
   * Detect Java by checking for Java-specific files
   */
  private async detectJava(): Promise<LanguageDetectionResult | null> {
    const indicators: string[] = [];

    // Check for Java build files
    try {
      if (await this.fileExists('pom.xml')) {
        const pomContent = await fs.readFile(join(this.cwd, 'pom.xml'), 'utf-8');
        // Only count as Java if it doesn't have kotlin plugin
        if (!pomContent.includes('kotlin-maven-plugin')) {
          indicators.push('pom.xml');
        }
      }
    } catch (error) {
      // File might not be fully written yet, skip this check
      logger.debug('Could not read pom.xml for Java detection', { error });
    }

    if (await this.fileExists('build.gradle')) {
      indicators.push('build.gradle');
    }

    if (indicators.length > 0) {
      return {
        language: 'java',
        confidence: 'high',
        indicators,
      };
    }

    return null;
  }

  /**
   * Detect TypeScript by checking for TypeScript config
   */
  private async detectTypeScript(): Promise<LanguageDetectionResult | null> {
    const indicators: string[] = [];

    if (await this.fileExists('tsconfig.json')) {
      indicators.push('tsconfig.json');
    }

    if (indicators.length > 0) {
      return {
        language: 'typescript',
        confidence: 'high',
        indicators,
      };
    }

    return null;
  }

  /**
   * Detect JavaScript by checking for package.json
   */
  private async detectJavaScript(): Promise<LanguageDetectionResult | null> {
    const indicators: string[] = [];

    if (await this.fileExists('package.json')) {
      indicators.push('package.json');
    }

    if (indicators.length > 0) {
      return {
        language: 'javascript',
        confidence: 'medium',
        indicators,
      };
    }

    return null;
  }

  /**
   * Check if a file exists in the project root
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
