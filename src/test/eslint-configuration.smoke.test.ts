/**
 * Smoke tests for HODGE-357.6: File Splitting - Module Reorganization
 *
 * Tests verify ESLint configuration exempts template files from line limits
 *
 * NOTE: Following HODGE-357.1 Toolchain Execution Ban - we verify config directly
 * instead of executing real ESLint commands
 */

import { describe } from 'vitest';
import { smokeTest } from './helpers.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Strip comments from JSON string (ESLint config files support comments)
 */
function stripJsonComments(jsonString: string): string {
  // Remove single-line comments (// ...)
  // Split by lines to avoid catastrophic backtracking
  return jsonString
    .split('\n')
    .map((line) => {
      const commentIndex = line.indexOf('//');
      return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
    })
    .join('\n');
}

describe('HODGE-357.6: Template File Exemptions', () => {
  smokeTest(
    'ESLint config should have template file overrides for claude-commands.ts',
    async ({ expect }) => {
      // Read .eslintrc.json directly instead of executing ESLint
      const eslintConfigPath = join(process.cwd(), '.eslintrc.json');
      const configContent = await readFile(eslintConfigPath, 'utf-8');
      const config = JSON.parse(stripJsonComments(configContent));

      // Find the override for template files
      const templateOverride = config.overrides?.find(
        (override: any) =>
          override.files?.includes('src/lib/*-templates.ts') ||
          override.files?.includes('src/lib/claude-commands.ts') ||
          override.files?.includes('src/commands/init-claude-commands.ts')
      );

      expect(templateOverride).toBeDefined();
      expect(templateOverride?.rules?.['max-lines']).toBe('off');
      expect(templateOverride?.rules?.['max-lines-per-function']).toBe('off');
    }
  );

  smokeTest('ESLint config should have overrides structure', async ({ expect }) => {
    // Read .eslintrc.json directly
    const eslintConfigPath = join(process.cwd(), '.eslintrc.json');
    const configContent = await readFile(eslintConfigPath, 'utf-8');
    const config = JSON.parse(stripJsonComments(configContent));

    // Verify overrides array exists
    expect(config.overrides).toBeDefined();
    expect(Array.isArray(config.overrides)).toBe(true);

    // Verify at least one override targets template files
    const hasTemplateOverride = config.overrides.some((override: any) => {
      const files = Array.isArray(override.files) ? override.files : [override.files];
      return files.some(
        (pattern: string) =>
          pattern.includes('*-templates.ts') ||
          pattern.includes('claude-commands.ts') ||
          pattern.includes('init-claude-commands.ts')
      );
    });

    expect(hasTemplateOverride).toBe(true);
  });

  smokeTest('non-template files should still have max-lines enforced', async ({ expect }) => {
    // Read .eslintrc.json directly
    const eslintConfigPath = join(process.cwd(), '.eslintrc.json');
    const configContent = await readFile(eslintConfigPath, 'utf-8');
    const config = JSON.parse(stripJsonComments(configContent));

    // Base rules should have max-lines defined
    expect(config.rules?.['max-lines']).toBeDefined();
    expect(config.rules?.['max-lines']).not.toBe('off');
  });
});

describe('HODGE-357.6: Max-Lines Violation Count', () => {
  smokeTest(
    'ESLint config should have proper max-lines configuration after Phase 4',
    async ({ expect }) => {
      // HODGE-357.1: Don't execute real ESLint - verify config instead
      const eslintConfigPath = join(process.cwd(), '.eslintrc.json');
      const configContent = await readFile(eslintConfigPath, 'utf-8');
      const config = JSON.parse(stripJsonComments(configContent));

      // Verify base max-lines rule is configured
      expect(config.rules?.['max-lines']).toBeDefined();

      // Verify template file overrides exist (Phase 1 accomplishment)
      const templateOverrides = config.overrides?.filter((override: any) => {
        const files = Array.isArray(override.files) ? override.files : [override.files];
        return files.some(
          (pattern: string) =>
            pattern.includes('*-templates.ts') ||
            pattern.includes('claude-commands.ts') ||
            pattern.includes('init-claude-commands.ts')
        );
      });

      expect(templateOverrides).toBeDefined();
      expect(templateOverrides.length).toBeGreaterThan(0);

      // After Phase 1: Template exemptions created
      // After Phase 2a-c: init.ts, plan.ts, harden.ts split
      // After Phase 3: hodge-md-generator.ts split
      // After Phase 4: All refactoring complete
      // Note: Actual violation count verified by CI running `npm run lint`
    }
  );
});
