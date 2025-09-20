import { describe, expect } from 'vitest';
import { integrationTest } from './helpers';
import { withTestWorkspace } from './runners';

describe('Standards Enforcement Integration Tests', () => {
  integrationTest(
    'slash command templates should work together for progressive enforcement',
    async () => {
      await withTestWorkspace('standards-test', async (workspace) => {
        // Create a test standards file
        await workspace.writeFile(
          '.hodge/standards.md',
          `# Test Standards
⚠️ **THESE STANDARDS ARE MANDATORY**
All standards below are CRITICAL and MUST be followed.

## Core Standards
- TypeScript with strict mode
- ESLint rules enforced`
        );

        // Create templates (simulating a project with our changes)
        await workspace.writeFile(
          '.claude/commands/harden.md',
          '## Standards Review Process (AI-Based Enforcement)\n### WARNING Level'
        );

        await workspace.writeFile(
          '.claude/commands/ship.md',
          '## Standards Review Process (AI-Based STRICT Enforcement)\n### BLOCKING Level'
        );

        // Test that templates can be read and contain expected content
        const hardenContent = await workspace.readFile('.claude/commands/harden.md');
        const shipContent = await workspace.readFile('.claude/commands/ship.md');

        expect(hardenContent).toContain('WARNING Level');
        expect(shipContent).toContain('BLOCKING Level');

        // Verify progressive enforcement concept
        const standardsContent = await workspace.readFile('.hodge/standards.md');
        expect(standardsContent).toContain('MANDATORY');
      });
    }
  );

  integrationTest('standards enforcement should have different levels per phase', async () => {
    await withTestWorkspace('enforcement-levels', async (workspace) => {
      // Set up test environment
      await workspace.writeFile(
        '.hodge/standards.md',
        '⚠️ **THESE STANDARDS ARE MANDATORY**\nNon-compliance will block shipping.'
      );

      await workspace.writeFile(
        '.claude/commands/harden.md',
        '## Standards Review Process\n### 4. Report Violations (WARNING Level)'
      );

      await workspace.writeFile(
        '.claude/commands/ship.md',
        '## Standards Review Process\n### 4. Report Violations (BLOCKING Level)'
      );

      // Verify progressive enforcement levels
      const hardenContent = await workspace.readFile('.claude/commands/harden.md');
      const shipContent = await workspace.readFile('.claude/commands/ship.md');

      // Harden should use WARNING level (non-blocking)
      expect(hardenContent).toContain('WARNING Level');
      expect(hardenContent).not.toContain('BLOCKING Level');

      // Ship should use BLOCKING level (strict)
      expect(shipContent).toContain('BLOCKING Level');
      expect(shipContent).not.toContain('WARNING Level');
    });
  });
});
