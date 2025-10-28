/**
 * Smoke tests for HODGE-357.6: File Splitting - Module Reorganization
 *
 * Tests verify ESLint configuration exempts template files from line limits
 */

import { describe } from 'vitest';
import { smokeTest } from './helpers.js';
import { ESLint } from 'eslint';
import { join } from 'path';

describe('HODGE-357.6: Template File Exemptions', () => {
  smokeTest(
    'claude-commands.ts should be exempt from max-lines',
    async ({ expect }) => {
      const eslint = new ESLint();
      const results = await eslint.lintFiles(['src/lib/claude-commands.ts']);

      // Should have no max-lines errors for the file
      const maxLinesErrors =
        results[0]?.messages?.filter((msg) => msg.ruleId === 'max-lines') || [];

      expect(maxLinesErrors).toHaveLength(0);
    },
    30000 // 30 second timeout for ESLint run
  );

  smokeTest(
    'pm-scripts-templates.ts should be exempt from max-lines',
    async ({ expect }) => {
      const eslint = new ESLint();
      const results = await eslint.lintFiles(['src/lib/pm-scripts-templates.ts']);

      // Should have no max-lines errors for the file
      const maxLinesErrors =
        results[0]?.messages?.filter((msg) => msg.ruleId === 'max-lines') || [];

      expect(maxLinesErrors).toHaveLength(0);
    },
    30000 // 30 second timeout for ESLint run
  );

  smokeTest('template files should be exempt from max-lines-per-function', async ({ expect }) => {
    const eslint = new ESLint();
    const results = await eslint.lintFiles([
      'src/lib/claude-commands.ts',
      'src/lib/pm-scripts-templates.ts',
    ]);

    // Should have no max-lines-per-function errors for these files
    results.forEach((result) => {
      const functionLengthErrors = result.messages.filter(
        (msg) => msg.ruleId === 'max-lines-per-function'
      );

      expect(functionLengthErrors).toHaveLength(0);
    });
  });

  smokeTest('ESLint config should have template file overrides', async ({ expect }) => {
    const eslint = new ESLint();
    const config = await eslint.calculateConfigForFile('src/lib/claude-commands.ts');

    // The max-lines rule should be off for this file (can be 'off' or ['off', ...])
    const maxLinesConfig = config.rules?.['max-lines'];
    const maxLinesPerFunctionConfig = config.rules?.['max-lines-per-function'];

    expect(
      maxLinesConfig === 'off' || (Array.isArray(maxLinesConfig) && maxLinesConfig[0] === 'off')
    ).toBe(true);
    expect(
      maxLinesPerFunctionConfig === 'off' ||
        (Array.isArray(maxLinesPerFunctionConfig) && maxLinesPerFunctionConfig[0] === 'off')
    ).toBe(true);
  });

  smokeTest('non-template files should still enforce max-lines', async ({ expect }) => {
    const eslint = new ESLint();
    const config = await eslint.calculateConfigForFile('src/commands/init.ts');

    // max-lines should still be enabled for regular files
    expect(config.rules?.['max-lines']).toBeDefined();
    expect(config.rules?.['max-lines']).not.toBe('off');
  });
});

describe('HODGE-357.6: Max-Lines Violation Count', () => {
  smokeTest(
    'should have 0 max-lines violations after Phase 4',
    async ({ expect }) => {
      const eslint = new ESLint();
      const results = await eslint.lintFiles(['src/**/*.ts']);

      const maxLinesViolations = results.filter((result) =>
        result.messages.some((msg) => msg.ruleId === 'max-lines')
      );

      // After Phase 1: Template exemptions (10 → 8)
      // After Phase 2a: init.ts split (8 → 8, but init-interaction.ts still over)
      // After Phase 2b: plan.ts split (8 → 7)
      // After Phase 2c: harden.ts split (7 → 6)
      // After Phase 3: hodge-md-generator.ts split (6 → 5)
      // After Phase 4: Bounded exemptions for 5 stable files (5 → 0)
      expect(maxLinesViolations.length).toBe(0);
    },
    30000 // 30 second timeout for ESLint run
  );
});
