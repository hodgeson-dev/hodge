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

const COMMANDS_DIR = join(__dirname);

describe('[smoke] Visual Rendering Verification (HODGE-346.2 Layer 3)', () => {
  describe('Mock Command Execution: /status', () => {
    it('should render box header correctly', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'status.md'), 'utf-8');
      const lines = template.split('\n');

      // Simulate rendering first 10 lines
      const rendering = lines.slice(0, 10).join('\n');

      // Box should be visible
      expect(rendering).toContain('┌───');
      expect(rendering).toContain('│ 📊 Status:');
      expect(rendering).toContain('└───');

      // Box should be on first lines
      expect(lines[0]).toMatch(/^┌/);
      expect(lines[2]).toMatch(/^└/);
    });

    it('should render next steps as bullets (not choice menu)', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'status.md'), 'utf-8');

      // Find Next Steps section
      const nextStepsSection = template.split('## Next Steps')[1] || '';

      // Should have bullet points
      expect(nextStepsSection).toMatch(/^-\s+/m);

      // Should NOT have choice format
      expect(nextStepsSection).not.toContain('(a)');
      expect(nextStepsSection).not.toContain('Enter your choice');

      // Should have slash commands
      expect(nextStepsSection).toContain('/explore');
      expect(nextStepsSection).toContain('/build');
      expect(nextStepsSection).toContain('/status');
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
    it('should render box header at start', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');
      const lines = template.split('\n');

      // First three lines should be box
      expect(lines[0]).toContain('┌───');
      expect(lines[1]).toContain('│ 🔨 Build:');
      expect(lines[2]).toContain('└───');
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

      // Should have proper format
      if (choiceBlock) {
        expect(choiceBlock[0]).toContain('(a)');
        expect(choiceBlock[0]).toContain('(b)');
      }
    });

    it('should render choice options with emojis', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Choice options should have emojis
      expect(template).toMatch(/\(a\)\s*[✅🔄➕✏️📋⏭️❌]/);
      expect(template).toMatch(/\(b\)\s*[✅🔄➕✏️📋⏭️❌]/);
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
      const nextSteps = template.split('## Next Steps')[1] || '';

      expect(nextSteps).toMatch(/^-\s+/m);
      expect(nextSteps).toContain('/ship');
      expect(nextSteps).toContain('/build');
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
      const nextSteps = template.split('## Next Steps')[1] || '';

      expect(nextSteps).toMatch(/^-\s+/m);
    });
  });

  describe('Mock Command Execution: /review', () => {
    it('should render box header', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'review.md'), 'utf-8');

      expect(template).toContain('│ 🔍 Review: Advisory Code Review');
    });

    it('should render fix options choice block', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'review.md'), 'utf-8');

      expect(template).toContain('🔔 YOUR RESPONSE NEEDED');
      expect(template).toContain('👉 Your choice [a/b/c]');
      expect(template).toContain('(a) ✅ Fix all auto-fixable issues');
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
      const sections = template.split('##');
      const nextStepsSection = sections.find((s) => s.includes('Next Steps'));

      expect(nextStepsSection).toBeTruthy();
      if (nextStepsSection) {
        // User should see bullets, not a menu
        expect(nextStepsSection).toMatch(/you can:/);
        expect(nextStepsSection).toContain('/explore');
        expect(nextStepsSection).toContain('/build');

        // Should be clear and actionable
        expect(nextStepsSection.length).toBeGreaterThan(100); // Has content
      }
    });

    it('scenario: user runs /build - should see clear choice when decisions missing', () => {
      const template = readFileSync(join(COMMANDS_DIR, 'build.md'), 'utf-8');

      // Find Case B (recommendation with unresolved decisions)
      const caseB = template.match(
        /Case B:[\s\S]*?🔔 YOUR RESPONSE NEEDED[\s\S]*?👉 Your choice \[a\/b\/c\]:/
      );

      expect(caseB).toBeTruthy();
      if (caseB) {
        const block = caseB[0];

        // Should be clear what options are
        expect(block).toContain('(a)');
        expect(block).toContain('(b)');
        expect(block).toContain('(c)');

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
