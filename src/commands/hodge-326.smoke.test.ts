import { describe, it, expect } from 'vitest';
import { smokeTest } from '../test/helpers';
import fs from 'fs/promises';
import path from 'path';

/**
 * HODGE-326 Smoke Tests: Conditional decision approval in /build command
 *
 * These tests validate the template logic for:
 * 1. Checking if "Decisions Needed" section is empty (including whitespace-only)
 * 2. Only showing prompts when there are actual unresolved decisions
 * 3. Handling malformed exploration.md gracefully
 */

describe('HODGE-326: Conditional decision approval in /build', () => {
  smokeTest('build.md template contains conditional logic for empty decisions check', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // Should have the new conditional logic
    expect(buildTemplate).toContain(
      'Check if "Decisions Needed" section has content before showing prompts'
    );
    expect(buildTemplate).toContain('Empty Check Logic');
  });

  smokeTest('build.md template defines whitespace-only as empty', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // Should treat whitespace-only as empty
    expect(buildTemplate).toContain('Treat whitespace-only content (spaces, newlines) as empty');
  });

  smokeTest('build.md template has case for empty decisions (silent proceed)', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // Should have Case A for empty decisions
    expect(buildTemplate).toContain('Case A: Recommendation Found + Decisions Needed is EMPTY');
    expect(buildTemplate).toContain('Proceed silently with build (no prompt needed)');
  });

  smokeTest('build.md template has case for non-empty decisions (show prompt)', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // Should have Case B for non-empty decisions
    expect(buildTemplate).toContain('Case B: Recommendation Found + Decisions Needed HAS items');
    expect(buildTemplate).toContain('Unresolved decisions still need attention');
  });

  smokeTest('build.md template handles malformed exploration with warning', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // Should have Case E for malformed exploration
    expect(buildTemplate).toContain('Case E: exploration.md Malformed (Cannot Parse)');
    expect(buildTemplate).toContain('Warning: Could not parse exploration.md');
    expect(buildTemplate).toContain('Proceeding with build without decision guidance');
  });

  smokeTest('build.md template provides regex pattern for empty check', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // Should provide regex pattern for checking empty section
    expect(buildTemplate).toMatch(/regex pattern|Use regex|pattern to check/i);
  });

  smokeTest('exploration.md for HODGE-326 documents the feature correctly', async () => {
    const exploration = await fs.readFile(
      path.join(process.cwd(), '.hodge/features/HODGE-326/explore/exploration.md'),
      'utf-8'
    );

    // Should have proper documentation
    expect(exploration).toContain('Title');
    expect(exploration).toContain('Conditional decision approval in /build command');
    expect(exploration).toContain('Problem Statement');
    expect(exploration).toContain('Recommendation');
  });

  smokeTest('decisions.md for HODGE-326 contains both decisions', async () => {
    const decisions = await fs.readFile(
      path.join(process.cwd(), '.hodge/features/HODGE-326/decisions.md'),
      'utf-8'
    );

    // Should have decision about whitespace handling
    expect(decisions).toContain('whitespace-only as empty');

    // Should have decision about malformed exploration handling
    expect(decisions).toContain('Show warning but proceed anyway');
  });

  smokeTest('template change maintains backward compatibility with existing cases', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // Should still have all original cases
    expect(buildTemplate).toContain('Case C: No Recommendation Found');
    expect(buildTemplate).toContain('Case D: exploration.md Missing');
    expect(buildTemplate).toContain('Step 1: Check for decisions.md');
    expect(buildTemplate).toContain('Step 2: Check for wrong-location decisions.md');
  });

  smokeTest('template preserves PM issue check workflow', async () => {
    const buildTemplate = await fs.readFile(
      path.join(process.cwd(), '.claude/commands/build.md'),
      'utf-8'
    );

    // PM check should still exist
    expect(buildTemplate).toContain('PM Issue Check (Before Build)');
    expect(buildTemplate).toContain('Check for PM Issue Mapping');
  });
});
