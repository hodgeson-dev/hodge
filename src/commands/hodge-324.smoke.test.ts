/**
 * Smoke tests for HODGE-324: Fix lessons learned generation timing
 *
 * These tests verify that:
 * 1. CLI no longer generates lessons-draft.md
 * 2. Slash command template has lessons before ship execution
 * 3. The new workflow allows lessons to be committed with features
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('[smoke] HODGE-324: Lessons Timing Fix', () => {
  describe('CLI Code Changes', () => {
    it('should not have generateLessonsDraft method in ship.ts', async () => {
      const shipTsPath = path.join(process.cwd(), 'src/commands/ship.ts');
      const content = await fs.readFile(shipTsPath, 'utf-8');

      expect(content).not.toContain('generateLessonsDraft');
      expect(content).not.toContain('lessons-draft.md');
    });

    it('should have comment explaining lessons are handled in slash command', async () => {
      const shipTsPath = path.join(process.cwd(), 'src/commands/ship.ts');
      const content = await fs.readFile(shipTsPath, 'utf-8');

      expect(content).toContain(
        'Lessons learned are now captured in the /ship slash command BEFORE this CLI command runs'
      );
    });

    it('should still have PatternLearner for pattern detection', async () => {
      // HODGE-357.1: Pattern learning moved to ShipService
      const shipServicePath = path.join(process.cwd(), 'src/lib/ship-service.ts');
      const content = await fs.readFile(shipServicePath, 'utf-8');

      // Pattern learning is separate from lessons-draft generation
      expect(content).toContain('PatternLearner');
      expect(content).toContain('analyzeShippedCode');
    });
  });

  describe('Slash Command Template Changes', () => {
    it('should have lessons in Step 3.5 (before Step 4)', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      // Check for Step 3.5 heading
      expect(content).toContain('## Step 3.5: Capture Lessons Learned (Optional - Before Commit)');

      // Verify it comes before Step 4
      const step35Index = content.indexOf('Step 3.5');
      const step4Index = content.indexOf('## Step 4:');
      expect(step35Index).toBeLessThan(step4Index);
      expect(step35Index).toBeGreaterThan(0);
    });

    it('should emphasize that lessons happen BEFORE commit', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      expect(content).toContain('BEFORE the ship command executes');
      expect(content).toContain('lessons are included in the feature commit');
      expect(content).toContain('This will be committed with your feature');
    });

    it('should ask user upfront about documenting lessons', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      expect(content).toContain('Would you like to document lessons learned from this feature?');
      expect(content).toContain('(y/n)');
    });

    it('should skip lessons-draft.md references', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      // Step 3.5 should NOT reference lessons-draft.md (that was the old flow)
      const step35Start = content.indexOf('Step 3.5');
      const step4Start = content.indexOf('## Step 4:');
      const step35Content = content.substring(step35Start, step4Start);

      expect(step35Content).not.toContain('lessons-draft.md');
      expect(step35Content).not.toContain('Check for Lessons Draft');
    });

    it('should create finalized lesson directly at .hodge/lessons/', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      expect(content).toContain('.hodge/lessons/{{feature}}-{{slug}}.md');
      expect(content).toContain('Write to:');
    });

    it('should mention git add -A will stage lessons files', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      // Step 4 should mention staging lessons
      expect(content).toContain('git add -A');
      expect(content).toContain('including lessons if created');
    });

    it('should skip creating any files if user says no', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      expect(content).toContain('If user says **no** or **n**:');
      expect(content).toContain('No lesson files will be created');
    });
  });

  describe('Template Structure Validation', () => {
    it("should have correct step order: 3 → 3.5 → 4 → What's Next", async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      const step3Index = content.indexOf('## Step 3:');
      const step35Index = content.indexOf('## Step 3.5:');
      const step4Index = content.indexOf('## Step 4:');
      const whatsNextIndex = content.indexOf("## What's Next?");

      expect(step3Index).toBeGreaterThan(0);
      expect(step35Index).toBeGreaterThan(step3Index);
      expect(step4Index).toBeGreaterThan(step35Index);
      expect(whatsNextIndex).toBeGreaterThan(step4Index);
    });

    it('should have Step 4 execute ship command after lessons', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      expect(content).toContain('## Step 4: Ship Quality Checks & Commit');
    });
  });

  describe('Workflow Integrity', () => {
    it('should maintain same enhancement questions (What Worked, etc.)', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      expect(content).toContain('Question 1: What Worked Well');
      expect(content).toContain('Question 2: What to Improve');
      expect(content).toContain('Question 3: Gotchas and Surprises');
      expect(content).toContain('Question 4: Pattern Potential');
    });

    it('should reference example lesson format from HODGE-003', async () => {
      const shipMdPath = path.join(process.cwd(), '.claude/commands/ship.md');
      const content = await fs.readFile(shipMdPath, 'utf-8');

      expect(content).toContain('HODGE-003-feature-extraction.md');
    });
  });
});
