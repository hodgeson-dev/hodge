/**
 * Smoke tests for HODGE-325: Filter resolved decisions from Decisions Needed
 *
 * These tests verify that:
 * 1. Phase 3 template includes decision tracking instructions
 * 2. Preview format shows both "Decided during exploration" and "Decisions Needed"
 * 3. Template emphasizes filtering based on conversation history
 * 4. Edge cases (tentative/contradictory/partial) are documented
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('[smoke] HODGE-325: Decision Filtering in Exploration', () => {
  describe('Phase 3 Template Changes', () => {
    it('should have decision tracking step in Phase 3', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('Track decisions made during conversation');
      expect(content).toContain('Review the conversation history for decisions that were resolved');
    });

    it('should define firm decision criteria', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('Explicit choices between options');
      expect(content).toContain('Clear directional guidance');
      expect(content).toContain('Definitive answers to specific questions');
    });

    it('should define edge cases that remain in Decisions Needed', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('Tentative answers with uncertainty');
      expect(content).toContain('Contradictory feedback');
      expect(content).toContain('Partial decisions on complex multi-part questions');
    });

    it('should require creating two decision lists', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('Decided during exploration');
      expect(content).toContain('Still needs decision');
    });
  });

  describe('Preview Format Changes', () => {
    it('should include "Decisions Decided During Exploration" in preview', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('**Decisions Decided During Exploration**:');
      expect(content).toContain('✓ [Decision summary 1]');
    });

    it('should show "No Decisions Needed" option in preview', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('OR if no unresolved decisions:');
      expect(content).toContain('**No Decisions Needed**');
    });

    it('should have separate sections for decided and needed in preview', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      // Both sections should appear in preview template
      const previewStart = content.indexOf('## Preview: exploration.md Summary');
      const previewEnd = content.indexOf('Would you like to:');
      const previewSection = content.substring(previewStart, previewEnd);

      expect(previewSection).toContain('**Decisions Decided During Exploration**:');
      expect(previewSection).toContain('**Decisions Needed**:');
    });
  });

  describe('Synthesis Instructions', () => {
    it('should include decided decisions in synthesis coverage', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('Decisions Decided During Exploration (if any)');
      expect(content).toContain('only unresolved items, or "No Decisions Needed" if all resolved');
    });

    it('should specify both sections in final exploration.md output', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      // Check step 5 (final output)
      const step5Start = content.indexOf('5. **Only after approval**');
      const step5Content = content.substring(step5Start, step5Start + 1000);

      expect(step5Content).toContain('Decisions Decided During Exploration section');
      expect(step5Content).toContain('Decisions Needed section');
      expect(step5Content).toContain('**"No Decisions Needed"** in bold if everything resolved');
    });
  });

  describe('Edge Case Handling', () => {
    it('should list specific edge case examples', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      // Should have concrete examples
      expect(content).toContain('"probably X, but not sure"');
      expect(content).toContain('"maybe"');
      expect(content).toContain('user says A early, then implies B later');
    });

    it('should have examples of firm decision language', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      expect(content).toContain('"use approach A"');
      expect(content).toContain('"definitely B"');
      expect(content).toContain('"we should prioritize performance"');
      expect(content).toContain('"yes, include that feature"');
    });
  });

  describe('Template Structure Validation', () => {
    it('should maintain Phase 3 step numbering: 1, 2, 3, 4, 5', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      const phase3Start = content.indexOf('### Phase 3: Conversation Synthesis & Preview');
      const phase4Start = content.indexOf('### Phase 4:');
      const phase3Section = content.substring(phase3Start, phase4Start);

      expect(phase3Section).toContain('1. **Generate a concise title**');
      expect(phase3Section).toContain('2. **Track decisions made during conversation**');
      expect(phase3Section).toContain('3. **Synthesize conversation into prose**');
      expect(phase3Section).toContain('4. **Show preview for approval**');
      expect(phase3Section).toContain('5. **Only after approval**');
    });

    it('should have decision tracking as step 2 (before synthesis)', async () => {
      const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');
      const content = await fs.readFile(exploreMdPath, 'utf-8');

      const step2Index = content.indexOf('2. **Track decisions made during conversation**');
      const step3Index = content.indexOf('3. **Synthesize conversation into prose**');

      expect(step2Index).toBeGreaterThan(0);
      expect(step3Index).toBeGreaterThan(step2Index);
    });
  });
});
