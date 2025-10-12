import { globSync } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('import-analyzer');

/**
 * Analyzes import fan-in across a project to identify architectural impact.
 * Files with high fan-in (many importers) are considered critical infrastructure.
 */
export class ImportAnalyzer {
  /**
   * Analyze import fan-in across entire project
   * @param projectRoot - Root directory of the project
   * @returns Map of file path to import count (how many files import this file)
   */
  analyzeFanIn(projectRoot: string): Map<string, number> {
    const fanInMap = new Map<string, number>();

    logger.debug('Analyzing import fan-in', { projectRoot });

    // Read all source files
    const files = globSync('**/*.{ts,js,tsx,jsx}', {
      cwd: projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
    });

    logger.debug(`Found ${files.length} source files to analyze`);

    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract import statements
      const imports = this.extractImports(content);

      for (const importPath of imports) {
        // Resolve to absolute project path
        const resolved = this.resolveImportPath(importPath, file, projectRoot);

        if (resolved && this.isLocalImport(resolved, projectRoot)) {
          fanInMap.set(resolved, (fanInMap.get(resolved) || 0) + 1);
        }
      }
    }

    const criticalFiles = Array.from(fanInMap.entries()).filter(([, count]) => count > 20).length;

    logger.debug('Import fan-in analysis complete', {
      totalFiles: files.length,
      filesWithImports: fanInMap.size,
      criticalFiles,
    });

    return fanInMap;
  }

  /**
   * Extract import paths from file content
   * Matches: import ... from 'path' and require('path')
   */
  private extractImports(content: string): string[] {
    const imports: string[] = [];

    // Match: import ... from 'path'
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Match: require('path')
    const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Resolve import path to absolute project path
   * Handles relative imports (./foo, ../bar) and absolute imports
   */
  private resolveImportPath(
    importPath: string,
    fromFile: string,
    projectRoot: string
  ): string | null {
    // Handle relative imports: ./foo, ../bar
    if (importPath.startsWith('.')) {
      const fromDir = path.dirname(path.join(projectRoot, fromFile));
      let resolved = path.resolve(fromDir, importPath);

      // Add .ts/.js extension if not present
      if (!path.extname(resolved)) {
        // Try .ts first (TypeScript project)
        if (fs.existsSync(`${resolved}.ts`)) {
          resolved = `${resolved}.ts`;
        } else if (fs.existsSync(`${resolved}.js`)) {
          resolved = `${resolved}.js`;
        } else if (fs.existsSync(`${resolved}/index.ts`)) {
          resolved = `${resolved}/index.ts`;
        } else if (fs.existsSync(`${resolved}/index.js`)) {
          resolved = `${resolved}/index.js`;
        }
      }

      return path.relative(projectRoot, resolved);
    }

    // Handle absolute imports: @/lib/foo, src/lib/foo
    // For now, skip these (would need tsconfig.json parsing)
    // This is acceptable for initial version - most critical imports are relative
    return null;
  }

  /**
   * Check if resolved path is a local project import
   * Excludes node_modules, dist, and paths outside project
   */
  private isLocalImport(resolvedPath: string, projectRoot: string): boolean {
    // Exclude node_modules, dist, etc.
    if (
      resolvedPath.includes('node_modules') ||
      resolvedPath.includes('dist') ||
      resolvedPath.startsWith('..')
    ) {
      return false;
    }

    // Verify file exists in project
    const fullPath = path.join(projectRoot, resolvedPath);
    return fs.existsSync(fullPath);
  }
}
