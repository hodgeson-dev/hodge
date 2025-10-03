/**
 * CommonJS Compatibility Integration Tests (HODGE-318)
 *
 * These tests verify that the Hodge CLI is properly configured as an ES module
 * and doesn't trigger CommonJS warnings when executed.
 *
 * IMPORTANT: Following HODGE-317.1, these tests DO NOT spawn subprocesses.
 * Instead, they verify configuration and built artifacts that ensure ESM compatibility.
 */

import { describe, expect, beforeAll } from 'vitest';
import { integrationTest } from './helpers.js';
import * as path from 'path';
import * as fs from 'fs-extra';

describe('CommonJS Compatibility [integration]', () => {
  let distExists: boolean;
  let packageJson: any;

  beforeAll(async () => {
    // Verify dist directory exists (built code)
    distExists = await fs.pathExists(path.join(process.cwd(), 'dist'));

    // Load package.json
    packageJson = await fs.readJson(path.join(process.cwd(), 'package.json'));
  });

  integrationTest('should have ES module configuration in package.json', async () => {
    // Verify package.json is configured for ES modules
    expect(packageJson.type).toBe('module');

    // Verify Node.js version requirement (ES modules fully supported in Node 20+)
    expect(packageJson.engines).toBeDefined();
    expect(packageJson.engines.node).toBeDefined();

    // Should require Node 20+ for full ESM support
    const nodeVersion = packageJson.engines.node;
    expect(nodeVersion).toMatch(/>=\s*20/);
  });

  integrationTest('should have NodeNext module resolution in tsconfig', async () => {
    // Verify TypeScript is configured for ES modules
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    expect(await fs.pathExists(tsconfigPath)).toBe(true);

    const tsconfig = await fs.readJson(tsconfigPath);

    // NodeNext is the correct module system for ES modules
    expect(tsconfig.compilerOptions.module).toBe('NodeNext');
    expect(tsconfig.compilerOptions.moduleResolution).toBe('NodeNext');
  });

  integrationTest('should have compiled CLI entry point with ESM compatibility', async () => {
    if (!distExists) {
      throw new Error('dist/ directory not found. Run `npm run build` first.');
    }

    const hodgePath = path.join(process.cwd(), 'dist', 'src', 'bin', 'hodge.js');
    expect(await fs.pathExists(hodgePath)).toBe(true);

    // Read the compiled entry point
    const hodgeContent = await fs.readFile(hodgePath, 'utf-8');

    // Should NOT contain CommonJS patterns that cause warnings
    expect(hodgeContent).not.toContain('require(');
    expect(hodgeContent).not.toContain('module.exports');

    // Should contain ES module patterns
    expect(hodgeContent).toContain('import');
  });

  integrationTest('should use ESM-compatible __dirname pattern', async () => {
    if (!distExists) {
      throw new Error('dist/ directory not found. Run `npm run build` first.');
    }

    const filesToCheck = ['dist/src/bin/hodge.js', 'dist/src/lib/install-hodge-way.js'];

    for (const file of filesToCheck) {
      const filePath = path.join(process.cwd(), file);

      if (!(await fs.pathExists(filePath))) {
        continue; // Skip if file doesn't exist
      }

      const content = await fs.readFile(filePath, 'utf-8');

      // Should use fileURLToPath pattern for ESM compatibility
      // The pattern looks like:
      //   const __filename = fileURLToPath(import.meta.url);
      //   const __dirname = dirname(__filename) or path.dirname(__filename)
      if (content.includes('__dirname')) {
        expect(content).toContain('fileURLToPath');
        expect(content).toContain('import.meta.url');

        // Should declare __dirname locally using dirname()
        // Can be either dirname(__filename) or path.dirname(__filename)
        expect(content).toMatch(/__dirname\s*=\s*(path\.)?dirname\(__filename\)/);
      }
    }
  });

  integrationTest('should have all relative imports with .js extensions', async () => {
    if (!distExists) {
      throw new Error('dist/ directory not found. Run `npm run build` first.');
    }

    // Sample a few key files to verify .js extensions
    const filesToCheck = [
      'dist/src/commands/build.js',
      'dist/src/commands/explore.js',
      'dist/src/lib/context-manager.js',
    ];

    for (const file of filesToCheck) {
      const filePath = path.join(process.cwd(), file);

      if (!(await fs.pathExists(filePath))) {
        continue;
      }

      const content = await fs.readFile(filePath, 'utf-8');

      // Check for relative imports without .js extension (would cause ESM errors)
      const relativeImportRegex = /from ['"]\.\.?\//g;
      const matches = content.match(relativeImportRegex) || [];

      for (const match of matches) {
        // Get the full import line for better error messages
        const lines = content.split('\n');
        const importLine = lines.find((line) => line.includes(match));

        // Should end with .js extension (required for ESM)
        if (importLine && !importLine.includes('.json')) {
          expect(importLine).toMatch(/\.js['"];?$/);
        }
      }
    }
  });

  integrationTest('should have chalk downgraded to v4 for CommonJS compatibility', async () => {
    // Verify chalk is at v4.x (supports both CommonJS and ESM)
    expect(packageJson.dependencies.chalk).toBeDefined();

    const chalkVersion = packageJson.dependencies.chalk;
    expect(chalkVersion).toMatch(/^[~^]?4\./);

    // Chalk v5+ is pure ESM and would cause issues with some dependencies
    expect(chalkVersion).not.toMatch(/^[~^]?5\./);
  });
});
