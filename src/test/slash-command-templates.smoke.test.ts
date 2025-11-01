/**
 * Smoke tests for slash command templates in .claude/commands/
 *
 * These tests verify the structure and content of slash command templates
 * to ensure they follow the correct patterns and include necessary sections.
 */

import { describe, it, expect } from 'vitest';
import { smokeTest } from './helpers';
import fs from 'fs/promises';
import path from 'path';

describe('[smoke] Slash Command Templates', () => {
  describe('build.md: Decision Extraction', () => {
    const buildTemplatePath = path.join(process.cwd(), '.claude', 'commands', 'build.md');

    it('should have Decision Extraction section before PM check', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      const decisionSectionIndex = content.indexOf('## Decision Extraction (Before Build)');
      const pmCheckIndex = content.indexOf('## PM Issue Check (Before Build)');

      expect(decisionSectionIndex).toBeGreaterThan(0);
      expect(pmCheckIndex).toBeGreaterThan(decisionSectionIndex);
    });

    it('should include Step 1: Check for decisions.md', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('### Step 1: Check for decisions.md');
      expect(content).toContain('cat .hodge/features/{{feature}}/decisions.md');
    });

    it('should include Step 2: Check for wrong-location decisions.md', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('### Step 2: Check for wrong-location decisions.md');
      expect(content).toContain('cat .hodge/features/{{feature}}/explore/decisions.md');
      expect(content).toContain('Would you like me to move it for you?');
    });

    it('should include Step 3: Extract from exploration.md', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('### Step 3: Extract from exploration.md');
      expect(content).toContain('cat .hodge/features/{{feature}}/explore/exploration.md');
      expect(content).toContain('## Recommendation');
      expect(content).toContain('## Decisions Needed');
    });

    it('should include Step 4: Handle Extraction Results', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('### Step 4: Handle Extraction Results');
    });

    it('should handle Case A: Single Recommendation with 3 options (HODGE-346.3 format)', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      // Updated in HODGE-326: Case A now handles empty decisions (silent proceed)
      // Case B handles non-empty decisions (show prompt with 3 options)
      expect(content).toContain('**Case A: Recommendation Found + Decisions Needed is EMPTY**');
      expect(content).toContain('**Case B: Recommendation Found + Decisions Needed HAS items**');
      // HODGE-346.3: Changed to a) ⭐ format
      expect(content).toMatch(/a\) ⭐ Use this recommendation and proceed with \/build/);
      expect(content).toMatch(/b\) Go to \/decide to formalize decisions first/);
      expect(content).toMatch(/c\) Skip and build without guidance/);
    });

    it('should handle Case B: Multiple Recommendations with pick-one flow', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('**Case B: Multiple Recommendations Found**');
      expect(content).toContain('Which recommendation would you like to use?');
      expect(content).toContain('a) Use recommendation 1');
      expect(content).toContain('Proceed with /build using this guidance?');
    });

    it('should handle Case C: No Recommendation Found (HODGE-346.3 format)', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('**Case C: No Recommendation Found**');
      expect(content).toContain('No decisions.md found and exploration.md has no recommendation');
      // HODGE-346.3: Changed format - now uses bulleted slash commands, not choice menu
      expect(content).toMatch(/• `\/decide`/);
    });

    it('should handle Case D: exploration.md Missing', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('**Case D: exploration.md Missing**');
      expect(content).toContain('Fall back to current behavior');
    });

    it('should display recommendations verbatim (not summarized)', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('[Full verbatim text of Recommendation section]');
      expect(content).toContain('[Full verbatim text of selected Recommendation]');
    });

    it('should extract Decisions Needed section', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      // Updated in HODGE-326: conditional logic splits cases
      expect(content).toContain('Unresolved decisions still need attention:');
      expect(content).toContain('[Decision 1 title]');
      expect(content).toContain('[Decision 2 title]');
    });

    it('should preserve existing PM check functionality', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('## PM Issue Check (Before Build)');
      expect(content).toContain('cat .hodge/id-mappings.json');
      expect(content).toContain('grep "externalID"');
    });

    it('should preserve existing build command execution', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      expect(content).toContain('## Command Execution');
      expect(content).toContain('hodge build {{feature}}');
      expect(content).toContain('hodge build {{feature}} --skip-checks');
    });

    it('should have clear user prompts with visual separators', async () => {
      const content = await fs.readFile(buildTemplatePath, 'utf-8');
      const separatorCount = (content.match(/━━━━━━━━/g) || []).length;
      expect(separatorCount).toBeGreaterThanOrEqual(4); // At least 4 visual separators
    });
  });

  describe('build.md: Conditional Decision Approval (HODGE-326)', () => {
    const buildTemplatePath = path.join(process.cwd(), '.claude', 'commands', 'build.md');

    smokeTest(
      'build.md template contains conditional logic for empty decisions check',
      async () => {
        const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

        // Should have the new conditional logic
        expect(buildTemplate).toContain(
          'Check if "Decisions Needed" section has content before showing prompts'
        );
        expect(buildTemplate).toContain('Empty Check Logic');
      }
    );

    smokeTest('build.md template defines whitespace-only as empty', async () => {
      const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

      // Should treat whitespace-only as empty
      expect(buildTemplate).toContain('Treat whitespace-only content (spaces, newlines) as empty');
    });

    smokeTest('build.md template has case for empty decisions (silent proceed)', async () => {
      const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

      // Should have Case A for empty decisions
      expect(buildTemplate).toContain('Case A: Recommendation Found + Decisions Needed is EMPTY');
      expect(buildTemplate).toContain('Proceed silently with build (no prompt needed)');
    });

    smokeTest('build.md template has case for non-empty decisions (show prompt)', async () => {
      const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

      // Should have Case B for non-empty decisions
      expect(buildTemplate).toContain('Case B: Recommendation Found + Decisions Needed HAS items');
      expect(buildTemplate).toContain('Unresolved decisions still need attention');
    });

    smokeTest('build.md template handles malformed exploration with warning', async () => {
      const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

      // Should have Case E for malformed exploration
      expect(buildTemplate).toContain('Case E: exploration.md Malformed (Cannot Parse)');
      expect(buildTemplate).toContain('Warning: Could not parse exploration.md');
      expect(buildTemplate).toContain('Proceeding with build without decision guidance');
    });

    smokeTest('build.md template provides regex pattern for empty check', async () => {
      const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

      // Should provide regex pattern for checking empty section
      expect(buildTemplate).toMatch(/regex pattern|Use regex|pattern to check/i);
    });

    smokeTest('template change maintains backward compatibility with existing cases', async () => {
      const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

      // Should still have all original cases
      expect(buildTemplate).toContain('Case C: No Recommendation Found');
      expect(buildTemplate).toContain('Case D: exploration.md Missing');
      expect(buildTemplate).toContain('Step 1: Check for decisions.md');
      expect(buildTemplate).toContain('Step 2: Check for wrong-location decisions.md');
    });

    smokeTest('template preserves PM issue check workflow', async () => {
      const buildTemplate = await fs.readFile(buildTemplatePath, 'utf-8');

      // PM check should still exist
      expect(buildTemplate).toContain('PM Issue Check (Before Build)');
      expect(buildTemplate).toContain('Check for PM Issue Mapping');
    });
  });

  describe('explore.md: Decision Filtering (HODGE-325)', () => {
    const exploreMdPath = path.join(process.cwd(), '.claude/commands/explore.md');

    describe('Phase 3 Template Changes', () => {
      it('should have decision tracking step in Phase 3', async () => {
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('Track decisions made during conversation');
        expect(content).toContain(
          'Review the conversation history for decisions that were resolved'
        );
      });

      it('should define firm decision criteria', async () => {
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('Explicit choices between options');
        expect(content).toContain('Clear directional guidance');
        expect(content).toContain('Definitive answers to specific questions');
      });

      it('should define edge cases that remain in Decisions Needed', async () => {
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('Tentative answers with uncertainty');
        expect(content).toContain('Contradictory feedback');
        expect(content).toContain('Partial decisions on complex multi-part questions');
      });

      it('should require creating two decision lists', async () => {
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('Decided during exploration');
        expect(content).toContain('Still needs decision');
      });
    });

    describe('Preview Format Changes', () => {
      it('should include "Decisions Decided During Exploration" in preview', async () => {
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('**Decisions Decided During Exploration**:');
        expect(content).toContain('✓ [Decision summary 1]');
      });

      it('should show "No Decisions Needed" option in preview', async () => {
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('OR if no unresolved decisions:');
        expect(content).toContain('**No Decisions Needed**');
      });

      it('should have separate sections for decided and needed in preview', async () => {
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
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('Decisions Decided During Exploration (if any)');
        expect(content).toContain(
          'only unresolved items, or "No Decisions Needed" if all resolved'
        );
      });

      it('should specify both sections in final exploration.md output', async () => {
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
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        // Should have concrete examples
        expect(content).toContain('"probably X, but not sure"');
        expect(content).toContain('"maybe"');
        expect(content).toContain('user says A early, then implies B later');
      });

      it('should have examples of firm decision language', async () => {
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        expect(content).toContain('"use approach A"');
        expect(content).toContain('"definitely B"');
        expect(content).toContain('"we should prioritize performance"');
        expect(content).toContain('"yes, include that feature"');
      });
    });

    describe('Template Structure Validation', () => {
      it('should maintain Phase 3 step numbering: 1, 2, 3, 4, 5', async () => {
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
        const content = await fs.readFile(exploreMdPath, 'utf-8');

        const step2Index = content.indexOf('2. **Track decisions made during conversation**');
        const step3Index = content.indexOf('3. **Synthesize conversation into prose**');

        expect(step2Index).toBeGreaterThan(0);
        expect(step3Index).toBeGreaterThan(step2Index);
      });
    });
  });
});
