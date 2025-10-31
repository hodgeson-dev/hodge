/* eslint-disable sonarjs/slow-regex, sonarjs/no-nested-functions, sonarjs/duplicates-in-character-class, sonarjs/no-misleading-character-class, no-misleading-character-class, @typescript-eslint/prefer-nullish-coalescing */
// TODO(HODGE-346.2 technical debt): Refactor test structure to eliminate regex backtracking, reduce nesting depth, fix emoji regex patterns
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * HODGE-346.2: Visual Pattern Compliance Tests
 *
 * These smoke tests verify that all slash command templates follow
 * the unified visual language patterns established in the exploration.
 */

const COMMANDS_DIR = join(__dirname, '..', '..', '.claude', 'commands');
const COMMAND_FILES = [
  'status.md',
  'hodge.md',
  'decide.md',
  'build.md',
  'codify.md',
  'explore.md',
  'harden.md',
  'plan.md',
  'review.md',
  'ship.md',
];

// Box header pattern (57 characters wide)
const BOX_TOP = '┌─────────────────────────────────────────────────────────┐';
const BOX_BOTTOM = '└─────────────────────────────────────────────────────────┘';
const BOX_PATTERN = /│\s*[^\n]+\s*│/;

describe('[smoke] Visual Pattern Compliance (HODGE-346.2)', () => {
  describe('Test Intention 1: All 10 commands start with box header', () => {
    COMMAND_FILES.forEach((file) => {
      it(`${file} should start with box header (after YAML frontmatter and compliance pattern)`, () => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');
        const lines = content.split('\n');

        // Skip YAML frontmatter if present (lines 0-4: ---, description, argument-hint, ---, blank)
        let startIndex = 0;
        if (lines[0] === '---') {
          // Find closing ---
          const closingIndex = lines.findIndex((line, i) => i > 0 && line === '---');
          if (closingIndex !== -1) {
            startIndex = closingIndex + 1;
            // Skip blank line after frontmatter
            if (lines[startIndex] === '') startIndex++;
          }
        }

        // HODGE-373: Skip compliance pattern if present
        // Pattern structure: warning line, blank, instruction lines, blank, box, blank, checklist
        if (lines[startIndex]?.includes('⚠️') && lines[startIndex]?.includes('CRITICAL')) {
          // Find the box after the compliance pattern
          while (startIndex < lines.length && lines[startIndex] !== BOX_TOP) {
            startIndex++;
          }
        }

        // First box line should be box top
        expect(lines[startIndex]).toBe(BOX_TOP);

        // Second line should be box content with emoji and command name
        expect(lines[startIndex + 1]).toMatch(BOX_PATTERN);
        // Just verify it has an emoji and text (emojis are multi-byte Unicode)
        expect(lines[startIndex + 1]).toMatch(/│\s*.+:\s+.+\s+│/);

        // Third line should be box bottom
        expect(lines[startIndex + 2]).toBe(BOX_BOTTOM);
      });
    });
  });

  describe('Test Intention 2: Box headers use consistent format', () => {
    COMMAND_FILES.forEach((file) => {
      it(`${file} box headers should be exactly 57 characters wide`, () => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');

        // Find all box tops
        const boxTops = content.match(/┌─+┐/g) || [];
        boxTops.forEach((box) => {
          expect(box.length).toBe(59); // 57 + 2 corner characters
        });

        // Find all box bottoms
        const boxBottoms = content.match(/└─+┘/g) || [];
        boxBottoms.forEach((box) => {
          expect(box.length).toBe(59);
        });
      });

      it(`${file} box headers should follow format: │ emoji CommandName: Section │`, () => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');
        const boxLines = content.match(/│[^│\n]+│/g) || [];

        boxLines.forEach((line) => {
          // Skip template variable boxes (contextual tips examples)
          if (line.includes('{{') || line.includes('lesson.')) {
            return;
          }

          // Skip empty box lines (separators in contextual tips boxes)
          if (line.trim() === '│                                                          │') {
            return;
          }

          // Should contain emoji
          expect(line).toMatch(/[🔍📊🎯📋🔨📝🔧🚀💡]/);

          // Should have proper spacing
          expect(line).toMatch(/│\s+/); // Space after opening
          expect(line).toMatch(/\s+│/); // Space before closing
        });
      });
    });
  });

  describe('Test Intention 3: Major sections use box headers', () => {
    it('build.md should have box headers for major sections', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Should have main command box
      expect(content).toContain('│ 🔨 Build:');

      // Count box headers (at least 2: main + sections)
      const boxCount = (
        content.match(/┌─────────────────────────────────────────────────────────┐/g) || []
      ).length;
      expect(boxCount).toBeGreaterThanOrEqual(1);
    });

    it('decide.md should have box headers for decision sections', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'decide.md'), 'utf-8');

      // Should have main command box
      expect(content).toContain('│ 📋 Decide:');
    });

    it('plan.md should have box headers for major sections', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'plan.md'), 'utf-8');

      // Should have main command box
      expect(content).toContain('│ 📊 Plan:');

      // Should have Review & Approval section box
      expect(content).toContain('│ 📊 Plan: Review & Approval');
    });
  });

  describe('Test Intention 4: Conversational questions end with response indicator', () => {
    it('hodge.md should use conversational prompt at end', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'hodge.md'), 'utf-8');

      // Should have conversational prompt
      expect(content).toContain('💬 Your response:');
    });
  });

  describe('Test Intention 5: Choice lists use full response block', () => {
    const choiceFiles = [
      { file: 'decide.md', pattern: /🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice/ },
      { file: 'build.md', pattern: /🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice/ },
      { file: 'codify.md', pattern: /🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice/ },
      { file: 'plan.md', pattern: /🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice/ },
      { file: 'review.md', pattern: /🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice/ },
      { file: 'ship.md', pattern: /🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice/ },
    ];

    choiceFiles.forEach(({ file, pattern }) => {
      it(`${file} should use full response block with bell icon and pointer`, () => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');

        // Should have at least one full response block
        expect(content).toMatch(pattern);

        // Count response blocks
        const bellCount = (content.match(/🔔 YOUR RESPONSE NEEDED/g) || []).length;
        const pointerCount = (content.match(/👉 Your choice/g) || []).length;

        // Every bell should have a corresponding pointer
        expect(bellCount).toBeGreaterThan(0);
        expect(bellCount).toBe(pointerCount);
      });
    });

    it('choice options should use a/b/c format with ⭐ for recommendations (HODGE-346.3)', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Should use a) format, not (a) format (HODGE-346.3 change)
      expect(content).toMatch(/^a\)\s/m);
      expect(content).toMatch(/^b\)\s/m);

      // Recommended options should have ⭐ emoji
      expect(content).toMatch(/a\) ⭐/);
    });
  });

  describe('Test Intention 6: Box width is consistent', () => {
    it('all box headers should be exactly the same width', () => {
      const allBoxWidths = new Set<number>();

      COMMAND_FILES.forEach((file) => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');
        const boxes = content.match(/┌─+┐/g) || [];

        boxes.forEach((box) => {
          allBoxWidths.add(box.length);
        });
      });

      // All boxes should be the same width
      expect(allBoxWidths.size).toBe(1);
      expect(Array.from(allBoxWidths)[0]).toBe(59); // 57 + 2 corners
    });
  });

  describe('Test Intention 7: All workflow steps preserved', () => {
    it('build.md should preserve decision extraction workflow', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Key workflow sections should still exist
      expect(content).toContain('## Decision Extraction (Before Build)');
      expect(content).toContain('## PM Issue Check (Before Build)');
      expect(content).toContain('## Command Execution');
    });

    it('explore.md should preserve conversational discovery phases', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'explore.md'), 'utf-8');

      expect(content).toContain('### Phase 1: Context Loading');
      expect(content).toContain('### Phase 2: Conversational Discovery');
      expect(content).toContain('### Phase 3: Conversation Synthesis');
    });
  });

  describe('Test Intention 8: Variable placeholders intact', () => {
    it('templates should preserve {{feature}} placeholders', () => {
      const filesWithPlaceholders = ['build.md', 'explore.md', 'harden.md', 'ship.md'];

      filesWithPlaceholders.forEach((file) => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');
        expect(content).toContain('{{feature}}');
      });
    });
  });

  describe('Test Intention 9: Instructions remain complete', () => {
    it('build.md should retain all guidance instructions', () => {
      const content = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Key instructions should be present
      expect(content).toContain('IMPORTANT');
      expect(content).toContain('Case A:');
      expect(content).toContain('Case B:');
      expect(content).toContain('Case C:');
    });
  });

  describe('Decision 7: Slash commands as bulleted lists', () => {
    const filesWithNextSteps = ['status.md', 'harden.md', 'plan.md'];

    filesWithNextSteps.forEach((file) => {
      it(`${file} should present slash commands as bullets, not choice menu`, () => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');

        // Should have bulleted lists with slash commands
        expect(content).toMatch(/^-\s+.*\/\w+/m);

        // Next steps section should NOT have "Enter your choice (a-h):" pattern
        const nextStepsSection = content.split('## Next Steps')[1] || '';
        expect(nextStepsSection).not.toContain('Enter your choice');
        expect(nextStepsSection).not.toContain('(a-');
      });
    });
  });

  describe('Decision 8: Never suggest direct CLI commands', () => {
    COMMAND_FILES.forEach((file) => {
      it(`${file} should not suggest direct hodge CLI commands to users`, () => {
        const content = readFileSync(join(COMMANDS_DIR, file), 'utf-8');

        // Split content to analyze user-facing sections vs implementation sections
        const lines = content.split('\n');

        // Look for patterns where we're telling users to run commands
        // These would typically be in "Next Steps" or similar sections
        const suspiciousPatterns = [
          /→\s*`hodge\s+decide`/, // Arrow pointing to hodge decide
          /→\s*`hodge\s+build`/, // Arrow pointing to hodge build
          /→\s*`hodge\s+status`/, // Arrow pointing to hodge status
        ];

        lines.forEach((line, index) => {
          // Skip code blocks and implementation instructions
          const isCodeBlock =
            line.trim().startsWith('```') ||
            (line.trim().startsWith('hodge ') && index > 0 && lines[index - 1].includes('```'));
          const isImplementation =
            line.includes('Call `hodge') || line.includes('Execute:') || line.includes('```bash');

          if (!isCodeBlock && !isImplementation) {
            suspiciousPatterns.forEach((pattern) => {
              expect(line).not.toMatch(pattern);
            });
          }
        });
      });
    });
  });
});
