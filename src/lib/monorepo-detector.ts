/**
 * MonorepoDetector: Detects monorepo structure and project locations
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { join, dirname } from 'path';
import { glob } from 'glob';
import { createCommandLogger } from './logger.js';
import { LanguageDetector, type SupportedLanguage } from './language-detector.js';

const logger = createCommandLogger('monorepo-detector');

export interface ProjectInfo {
  path: string; // Relative path from repo root
  language: SupportedLanguage;
  buildFiles: string[]; // Build files found in this project
}

/**
 * Detects monorepo structure by finding build files across the repository
 */
export class MonorepoDetector {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Detect all projects in the repository
   * Returns projects grouped by their root directories
   */
  async detectProjects(): Promise<ProjectInfo[]> {
    logger.debug('Scanning for projects in repository', { cwd: this.cwd });

    // Find all build files in the repository
    const buildFiles = await this.findBuildFiles();
    logger.debug('Found build files', { count: buildFiles.length });

    if (buildFiles.length === 0) {
      logger.debug('No build files found');
      return [];
    }

    // Group build files by project root (directory containing the build file)
    const projectRoots = new Map<string, string[]>();

    for (const buildFile of buildFiles) {
      const projectPath = dirname(buildFile);
      const existing = projectRoots.get(projectPath) ?? [];
      existing.push(buildFile);
      projectRoots.set(projectPath, existing);
    }

    // Detect language for each project
    const projects: ProjectInfo[] = [];

    for (const [projectPath, files] of projectRoots.entries()) {
      const fullPath = join(this.cwd, projectPath);
      const languageDetector = new LanguageDetector(fullPath);
      const languages = await languageDetector.detectLanguages();

      if (languages.length > 0) {
        // Use the highest confidence language
        const sortedLanguages = [...languages].sort((a, b) => {
          const confidenceOrder = { high: 3, medium: 2, low: 1 };
          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
        });
        const primaryLanguage = sortedLanguages[0];

        projects.push({
          path: projectPath,
          language: primaryLanguage.language,
          buildFiles: files,
        });

        logger.debug('Detected project', {
          path: projectPath,
          language: primaryLanguage.language,
          buildFiles: files,
        });
      }
    }

    logger.info('Detected projects', { count: projects.length });
    return projects;
  }

  /**
   * Determine if this is a monorepo
   * A monorepo has either:
   * - Multiple projects (multiple project roots)
   * - Multiple languages in a single project
   */
  async isMonorepo(): Promise<boolean> {
    const projects = await this.detectProjects();

    if (projects.length > 1) {
      logger.debug('Monorepo detected: multiple projects');
      return true;
    }

    if (projects.length === 1) {
      // Check if single project has multiple languages
      const projectPath = join(this.cwd, projects[0].path);
      const detector = new LanguageDetector(projectPath);
      const languages = await detector.detectLanguages();

      if (languages.length > 1) {
        logger.debug('Monorepo detected: multiple languages in single project');
        return true;
      }
    }

    logger.debug('Single-language project detected');
    return false;
  }

  /**
   * Find all build files in the repository
   * Returns relative paths from repository root
   */
  private async findBuildFiles(): Promise<string[]> {
    const patterns = [
      '**/pyproject.toml',
      '**/requirements.txt',
      '**/Pipfile',
      '**/build.gradle.kts',
      '**/build.gradle',
      '**/pom.xml',
      '**/package.json',
      '**/tsconfig.json',
    ];

    // Directories to exclude from search
    const ignorePatterns = [
      '**/node_modules/**',
      '**/venv/**',
      '**/.venv/**',
      '**/build/**',
      '**/dist/**',
      '**/.git/**',
      '**/target/**',
      '**/.gradle/**',
      '**/out/**',
    ];

    const allFiles: string[] = [];

    for (const pattern of patterns) {
      try {
        const matches = await glob(pattern, {
          cwd: this.cwd,
          ignore: ignorePatterns,
          nodir: true,
        });
        allFiles.push(...matches);
      } catch (error) {
        logger.debug('Error searching for pattern', { pattern, error });
      }
    }

    // Deduplicate and sort using locale comparison
    return [...new Set(allFiles)].sort((a, b) => a.localeCompare(b));
  }
}
