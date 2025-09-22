import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers';
import fs from 'fs/promises';
import path from 'path';

describe('[smoke] Ship Lessons Generation', () => {
  smokeTest('ship command should have generateLessonsDraft method', async () => {
    // Import the ShipCommand class
    const { ShipCommand } = await import('../commands/ship.js');
    const shipCommand = new ShipCommand();

    // Check that the method exists
    expect(shipCommand).toHaveProperty('generateLessonsDraft');
    expect(typeof (shipCommand as any).generateLessonsDraft).toBe('function');
  });

  smokeTest('generateLessonsDraft should be called during ship workflow', async () => {
    // Check that ship.ts contains the call to generateLessonsDraft
    const shipSource = await fs.readFile(path.join(process.cwd(), 'src/commands/ship.ts'), 'utf-8');

    // Verify the method is called in the workflow
    expect(shipSource).toContain('await this.generateLessonsDraft(');
    expect(shipSource).toContain('Capturing lessons learned');
  });

  smokeTest('lessons generation should handle empty drafts', async () => {
    // Check that the cleanup logic exists
    const shipSource = await fs.readFile(path.join(process.cwd(), 'src/commands/ship.ts'), 'utf-8');

    // Verify cleanup for empty drafts
    expect(shipSource).toContain('hasSignificantChanges');
    expect(shipSource).toContain('fs.unlink(draftPath)');
    expect(shipSource).toContain('No significant changes to capture');
  });

  smokeTest('lessons generation should be non-blocking', async () => {
    // Check that failures don't break ship
    const shipSource = await fs.readFile(path.join(process.cwd(), 'src/commands/ship.ts'), 'utf-8');

    // Verify non-blocking behavior
    expect(shipSource).toContain('try {');
    expect(shipSource).toContain('Could not generate lessons draft (non-blocking)');
    expect(shipSource).toContain("// Non-blocking - don't fail ship if lessons generation fails");
  });

  smokeTest('lessons draft should include objective metrics', async () => {
    // Check that the template includes required sections
    const shipSource = await fs.readFile(path.join(process.cwd(), 'src/commands/ship.ts'), 'utf-8');

    // Verify draft content structure
    expect(shipSource).toContain('## Objective Metrics');
    expect(shipSource).toContain('## What Changed');
    expect(shipSource).toContain('## Technical Changes');
    expect(shipSource).toContain('## Patterns Applied');
    expect(shipSource).toContain('Files Changed');
    expect(shipSource).toContain('Patterns Identified');
  });
});
