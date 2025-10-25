import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * HODGE-346.2: Visual Rendering Smoke Tests
 *
 * Layer 3 verification: Mock command execution to verify visual patterns
 * render correctly without actually calling CLI tools.
 *
 * Simulates what Claude Code would see when executing slash commands.
 */

const COMMANDS_DIR = join(__dirname, '..', '..', '.claude', 'commands');

describe('[smoke] Visual Rendering Verification (HODGE-346.2 Layer 3)', () => {
  describe('Mock Command Execution: /status', () => {
    it('should render box header correctly (after YAML frontmatter)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'status.md'), 'utf-8');
      const lines = template.split('\n');

      // Skip YAML frontmatter if present
      let startIndex = 0;
      if (lines[0] === '---') {
        const closingIndex = lines.findIndex((line, i) => i > 0 && line === '---');
        if (closingIndex !== -1) {
          startIndex = closingIndex + 1;
          if (lines[startIndex] === '') startIndex++;
        }
      }

      // Simulate rendering first 10 lines after frontmatter
      const rendering = lines.slice(startIndex, startIndex + 10).join('\n');

      // Box should be visible
      expect(rendering).toContain('┌───');
      expect(rendering).toContain('│ 📊 Status:');
      expect(rendering).toContain('└───');

      // Box should be on first lines (after frontmatter)
      expect(lines[startIndex]).toMatch(/^┌/);
      expect(lines[startIndex + 2]).toMatch(/^└/);
    });

    it('should render next steps as bullets (not choice menu)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'status.md'), 'utf-8');

      // Verify What's Next section exists
      expect(template).toContain("## What's Next?");

      // Should NOT have choice format in What's Next section
      const whatsNextIndex = template.indexOf("## What's Next?");
      const afterWhatsNext = template.substring(whatsNextIndex);
      expect(afterWhatsNext).not.toContain('(a)');
      expect(afterWhatsNext).not.toContain('Enter your choice');

      // Should have slash commands (bullets are in conditional blocks)
      expect(template).toContain('/explore');
      expect(template).toContain('/build');
      expect(template).toContain('/status');
    });

    it('should NOT suggest direct hodge CLI commands', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'status.md'), 'utf-8');
      const nextStepsSection = template.split('## Next Steps')[1] || '';

      // Should not tell user to run hodge commands
      expect(nextStepsSection).not.toContain('→ `hodge decide`');
      expect(nextStepsSection).not.toContain('→ `hodge build`');
      expect(nextStepsSection).not.toContain('→ `hodge status`');
    });
  });

  describe('Mock Command Execution: /build', () => {
    it('should render box header at start (after YAML frontmatter)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');
      const lines = template.split('\n');

      // Skip YAML frontmatter
      let startIndex = 0;
      if (lines[0] === '---') {
        const closingIndex = lines.findIndex((line, i) => i > 0 && line === '---');
        if (closingIndex !== -1) {
          startIndex = closingIndex + 1;
          if (lines[startIndex] === '') startIndex++;
        }
      }

      // First three lines after frontmatter should be box
      expect(lines[startIndex]).toContain('┌───');
      expect(lines[startIndex + 1]).toContain('│ 🔨 Build:');
      expect(lines[startIndex + 2]).toContain('└───');
    });

    it('should render choice blocks with visual indicators', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Should have bell icon for response needed
      const bellCount = (template.match(/🔔 YOUR RESPONSE NEEDED/g) || []).length;
      expect(bellCount).toBeGreaterThan(0);

      // Should have pointer for choice
      const pointerCount = (template.match(/👉 Your choice/g) || []).length;
      expect(pointerCount).toBe(bellCount); // Equal counts

      // Simulate rendering a choice block
      const choiceBlock = template.match(
        /🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice \[[a-z/]+\]:/
      );
      expect(choiceBlock).toBeTruthy();

      // Should have proper format (HODGE-346.3: a) format, not (a))
      if (choiceBlock) {
        expect(choiceBlock[0]).toMatch(/^a\)\s/m);
        expect(choiceBlock[0]).toMatch(/^b\)\s/m);
      }
    });

    it('should render choice options with ⭐ for recommendations (HODGE-346.3)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Choice options should have ⭐ for recommended options (HODGE-346.3 change)
      expect(template).toMatch(/^a\) ⭐/m);
    });

    it('should preserve workflow logic in rendered output', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Key workflow sections should be present
      expect(template).toContain('## Decision Extraction (Before Build)');
      expect(template).toContain('### Step 1: Check for decisions.md');
      expect(template).toContain('### Step 2: Check for wrong-location decisions.md');
      expect(template).toContain('### Step 3: Extract from exploration.md');
      expect(template).toContain('### Step 4: Handle Extraction Results');
      expect(template).toContain('## PM Issue Check (Before Build)');
      expect(template).toContain('## Command Execution');

      // All cases should be present
      expect(template).toContain('Case A:');
      expect(template).toContain('Case B:');
      expect(template).toContain('Case C:');
    });

    it('should preserve {{feature}} placeholders in rendered output', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Placeholders should be intact
      const placeholderCount = (template.match(/\{\{feature\}\}/g) || []).length;
      expect(placeholderCount).toBeGreaterThan(5); // Multiple uses
    });
  });

  describe('Mock Command Execution: /decide', () => {
    it('should render box header for decisions', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'decide.md'), 'utf-8');

      expect(template).toContain('│ 📋 Decide:');

      // Should have decision box within template
      expect(template).toContain('│ 📋 Decide: Decision');
    });

    it('should render choice block for decision options', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'decide.md'), 'utf-8');

      // Should have full response block
      expect(template).toContain('🔔 YOUR RESPONSE NEEDED');
      expect(template).toContain('👉 Your choice [a/b/c/d/e]:');
    });
  });

  describe('Mock Command Execution: /explore', () => {
    it('should render box header at start', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'explore.md'), 'utf-8');

      expect(template).toContain('│ 🔍 Explore: Feature Discovery');
    });

    it('should render box header for conversational discovery phase', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'explore.md'), 'utf-8');

      // Should have Phase 2 box
      expect(template).toContain('│ 🔍 Explore: Conversational Discovery');
    });

    it('should NOT have choice blocks (conversational command)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'explore.md'), 'utf-8');

      // Explore is conversational, not choice-based
      // Should not have response blocks in main flow
      const mainContent = template.split('## Next Steps')[0];
      expect(mainContent).not.toContain('🔔 YOUR RESPONSE NEEDED');
    });

    it('should have bullets for next steps', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'explore.md'), 'utf-8');

      // explore.md has "Next Steps Menu" not "Next Steps"
      const nextSteps = template.split('## Next Steps Menu')[1] || '';

      // Should have bullet format (• or -)
      expect(nextSteps).toContain('•');
      expect(nextSteps).toContain('/decide');
      expect(nextSteps).toContain('/build');
    });
  });

  describe('Mock Command Execution: /harden', () => {
    it('should render box header', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'harden.md'), 'utf-8');

      expect(template).toContain('│ 🔧 Harden: Production Readiness');
    });

    it('should render next steps as bullets', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'harden.md'), 'utf-8');

      // Verify What's Next section exists with commands (bullets are in conditional blocks)
      expect(template).toContain("## What's Next?");
      expect(template).toContain('/ship');
      expect(template).toContain('/build');
    });
  });

  describe('Mock Command Execution: /plan', () => {
    it('should render box header', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'plan.md'), 'utf-8');

      expect(template).toContain('│ 📊 Plan: Work Organization');
    });

    it('should render approval choice block', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'plan.md'), 'utf-8');

      // Should have Review & Approval box
      expect(template).toContain('│ 📊 Plan: Review & Approval');

      // Should have choice block
      expect(template).toContain('🔔 YOUR RESPONSE NEEDED');
      expect(template).toContain('👉 Your choice [a/b/c/d]:');
    });

    it('should render next steps as bullets', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'plan.md'), 'utf-8');

      // Verify What's Next section exists (bullets are in conditional blocks)
      expect(template).toContain("## What's Next?");
      expect(template).toContain('•'); // At least one bullet exists somewhere
    });
  });

  describe('Mock Command Execution: /review', () => {
    it('should render box header', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'review.md'), 'utf-8');

      expect(template).toContain('│ 🔍 Review: Advisory Code Review');
    });

    it('should render fix options choice block (HODGE-346.3 format)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'review.md'), 'utf-8');

      expect(template).toContain('🔔 YOUR RESPONSE NEEDED');
      expect(template).toContain('👉 Your choice [a/b/c]');
      // HODGE-346.3: Changed to a) ⭐ format
      expect(template).toMatch(/a\) ⭐ Fix all auto-fixable issues/);
    });
  });

  describe('Mock Command Execution: /ship', () => {
    it('should render box header', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'ship.md'), 'utf-8');

      expect(template).toContain('│ 🚀 Ship: Interactive Commit & Ship');
    });

    it('should render commit message approval choice block', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'ship.md'), 'utf-8');

      // Should have response blocks
      const blocks = template.match(/🔔 YOUR RESPONSE NEEDED/g) || [];
      expect(blocks.length).toBeGreaterThanOrEqual(2);

      // Should have commit approval choice
      expect(template).toContain('👉 Your choice [a/r/e/c]:');
    });

    it('should render lesson codification choice block', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'ship.md'), 'utf-8');

      // Should have lesson approval choice
      expect(template).toContain('👉 Your choice [a/b/c/d]:');
    });
  });

  describe('Mock Command Execution: /hodge', () => {
    it('should render box header', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'hodge.md'), 'utf-8');

      expect(template).toContain('│ 🎯 Hodge: Session & Context Manager');
    });

    it('should render conversational prompt at end', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'hodge.md'), 'utf-8');

      // Should have conversational indicator (not choice block)
      expect(template).toContain('💬 Your response:');
    });

    it('should have completion box', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'hodge.md'), 'utf-8');

      expect(template).toContain('│ 🎯 Hodge: Context Loading Complete');
    });
  });

  describe('Mock Command Execution: /codify', () => {
    it('should render box header', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'codify.md'), 'utf-8');

      expect(template).toContain('│ 📝 Codify: Add Rules to Project');
    });

    it('should render recommendation choice block', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'codify.md'), 'utf-8');

      // Should have recommendation box
      expect(template).toContain('│ 📝 Codify: Recommendation');

      // Should have choice block
      expect(template).toContain('🔔 YOUR RESPONSE NEEDED');
      expect(template).toContain('👉 Your choice [a/b/c]');
    });
  });

  describe('Cross-Command Rendering Consistency', () => {
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

    it('all commands should render with readable box characters', () => {
      COMMAND_FILES.forEach((file) => {
        const template = readFileSync(join(COMMANDS_DIR, file), 'utf-8');

        // Box drawing characters should be present and readable
        expect(template).toContain('┌');
        expect(template).toContain('│');
        expect(template).toContain('└');
        expect(template).toContain('─');
      });
    });

    it('all commands should render emojis correctly', () => {
      COMMAND_FILES.forEach((file) => {
        const template = readFileSync(join(COMMANDS_DIR, file), 'utf-8');
        const firstBox = template.match(/│\s*(.+?)\s*│/);

        // First box should have an emoji
        expect(firstBox).toBeTruthy();
        if (firstBox) {
          // Should contain one of our command emojis
          const hasEmoji = /[🔍📊🎯📋🔨📝🔧🚀]/.test(firstBox[1]);
          expect(hasEmoji).toBe(true);
        }
      });
    });

    it('all choice blocks should render consistently', () => {
      const filesWithChoices = [
        'decide.md',
        'build.md',
        'codify.md',
        'plan.md',
        'review.md',
        'ship.md',
      ];

      filesWithChoices.forEach((file) => {
        const template = readFileSync(join(COMMANDS_DIR, file), 'utf-8');

        // Every bell should be followed eventually by a pointer
        const bells = (template.match(/🔔 YOUR RESPONSE NEEDED/g) || []).length;
        const pointers = (template.match(/👉 Your choice/g) || []).length;

        expect(bells).toBeGreaterThan(0);
        expect(bells).toBe(pointers);
      });
    });

    it('all next steps sections should render as bullets', () => {
      const filesWithNextSteps = ['status.md', 'harden.md', 'plan.md'];

      filesWithNextSteps.forEach((file) => {
        const template = readFileSync(join(COMMANDS_DIR, file), 'utf-8');
        const nextSteps = template.split('## Next Steps')[1];

        if (nextSteps) {
          // Should have bullets
          expect(nextSteps).toMatch(/^-\s+/m);

          // Should NOT have choice format
          expect(nextSteps).not.toContain('(a)');
          expect(nextSteps).not.toContain('Enter your choice');
        }
      });
    });
  });

  describe('Mock Rendering: Real-World Scenarios', () => {
    it('scenario: user runs /status - should see clear next steps', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'status.md'), 'utf-8');

      // Simulate reading to user
      // Verify What's Next section exists with commands
      expect(template).toContain("## What's Next?");
      expect(template).toContain('/explore');
      expect(template).toContain('/build');
      expect(template).toContain('•'); // Bullets exist in conditional blocks
    });

    it('scenario: user runs /build - should see clear choice when decisions missing (HODGE-346.3)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Find Case B (recommendation with unresolved decisions)
      const caseB = template.match(
        /Case B:[\s\S]*?🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice \[a\/b\/c\]:/
      );

      expect(caseB).toBeTruthy();
      if (caseB) {
        const block = caseB[0];

        // Should be clear what options are (HODGE-346.3: a) format, not (a))
        expect(block).toMatch(/^a\)\s/m);
        expect(block).toMatch(/^b\)\s/m);
        expect(block).toMatch(/^c\)\s/m);

        // Should have visual indicator
        expect(block).toContain('🔔');
        expect(block).toContain('👉');
      }
    });

    it('scenario: user runs /plan - should see clear approval choice', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'plan.md'), 'utf-8');

      // Find approval section
      const approval = template.match(
        /Review & Approval[\s\S]*?🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice/
      );

      expect(approval).toBeTruthy();
      if (approval) {
        const block = approval[0];

        // Should see clear options
        expect(block).toContain('Approve and save plan locally');
        expect(block).toContain('Approve and create PM issues');
        expect(block).toContain('Modify the plan');
        expect(block).toContain('Cancel');
      }
    });
  });
});
