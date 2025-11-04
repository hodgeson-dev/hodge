import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Slash Command Template Compliance (HODGE-373)', () => {
  const commandsDir = join(process.cwd(), '.claude', 'commands');

  const commandFiles = [
    'explore.md',
    'build.md',
    'checkpoint.md',
    'codify.md',
    'refine.md',
    'harden.md',
    'hodge.md',
    'plan.md',
    'review.md',
    'ship.md',
    'status.md',
  ];

  smokeTest('all command files should have compliance patterns', () => {
    for (const file of commandFiles) {
      const content = readFileSync(join(commandsDir, file), 'utf-8');

      // Check for compliance pattern marker
      expect(content).toContain('⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️');
      expect(content).toContain('Copy it CHARACTER-FOR-CHARACTER');
      expect(content).toContain('Do NOT use markdown headers as substitutes');
    }
  });

  smokeTest('all command files should have Unicode boxes', () => {
    for (const file of commandFiles) {
      const content = readFileSync(join(commandsDir, file), 'utf-8');

      // Check for Unicode box-drawing characters
      expect(content).toContain('┌─────');
      expect(content).toContain('│');
      expect(content).toContain('└─────');
    }
  });

  smokeTest('all command files should have template compliance checklists', () => {
    for (const file of commandFiles) {
      const content = readFileSync(join(commandsDir, file), 'utf-8');

      // Check for checklist items
      expect(content).toContain('**Template compliance checklist:**');
      expect(content).toContain('✅ Box uses Unicode box-drawing characters');
      expect(content).toContain('✅ Includes');
      expect(content).toContain('prefix for context awareness');
    }
  });

  smokeTest('compliance patterns should appear before boxes', () => {
    for (const file of commandFiles) {
      const content = readFileSync(join(commandsDir, file), 'utf-8');

      // Find first box
      const boxIndex = content.indexOf('┌─────');
      // Find first compliance pattern
      const patternIndex = content.indexOf('⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️');

      // Pattern should appear before the first box
      expect(patternIndex).toBeGreaterThan(-1);
      expect(boxIndex).toBeGreaterThan(patternIndex);
    }
  });

  smokeTest('all boxes should have command prefixes', () => {
    const expectedPrefixes = {
      'explore.md': 'Explore:',
      'build.md': 'Build:',
      'checkpoint.md': 'Checkpoint:',
      'codify.md': 'Codify:',
      'refine.md': 'Refine:',
      'harden.md': 'Harden:',
      'hodge.md': 'Hodge:',
      'plan.md': 'Plan:',
      'review.md': 'Review:',
      'ship.md': 'Ship:',
      'status.md': 'Status:',
    };

    for (const [file, prefix] of Object.entries(expectedPrefixes)) {
      const content = readFileSync(join(commandsDir, file), 'utf-8');

      // Check that box contains command prefix
      expect(content).toContain(`│ `);
      expect(content).toContain(prefix);
    }
  });
});
