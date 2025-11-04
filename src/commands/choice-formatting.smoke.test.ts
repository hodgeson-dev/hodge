/**
 * Smoke tests for HODGE-346.3: Choice formatting and recommendations
 *
 * These tests verify that slash command templates follow consistent
 * choice formatting patterns as defined in the UX review profile.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const COMMANDS_DIR = join(__dirname, '..', '..', '.claude', 'commands');

// Commands that should have choice blocks
const COMMANDS_WITH_CHOICES = [
  'review.md',
  'plan.md',
  'ship.md',
  'codify.md',
  'build.md',
  'harden.md',
];

describe('[smoke] HODGE-346.3: Choice Formatting Standards', () => {
  describe('All Commands Updated (/review, /plan, /ship, /codify, /build, /harden)', () => {
    COMMANDS_WITH_CHOICES.forEach((filename) => {
      const filepath = join(COMMANDS_DIR, filename);
      const content = readFileSync(filepath, 'utf-8');

      it(`${filename}: should use a) format (not (a) or **a)**) for choices`, () => {
        // Should have choices in a) b) c) format (may have leading whitespace)
        // Using {0,10} instead of * to prevent backtracking
        const hasCorrectFormat = /^[ \t]{0,10}[a-z]\) /m.test(content);
        expect(hasCorrectFormat).toBe(true);

        // Should NOT have (a) format in choice lists (start of line or after whitespace)
        // Using {0,10} instead of * to prevent backtracking
        const hasWrongFormat1 = /^[ \t]{0,10}\([a-z]\) /m.test(content);
        expect(hasWrongFormat1).toBe(false);

        // Should NOT have **a)** format (bold)
        const hasWrongFormat2 = /\*\*[a-z]\)\*\*/m.test(content);
        expect(hasWrongFormat2).toBe(false);
      });

      it(`${filename}: should mark recommended options with ⭐ emoji (if recommendations exist)`, () => {
        // Some commands like codify don't have recommendations (approval is default)
        // Skip this test for those commands
        if (filename === 'codify.md') {
          // Codify uses "approve" as default, not a lettered choice
          return;
        }

        // Look for star emoji in choice lines (may have leading whitespace)
        // Using {0,10} instead of * to prevent backtracking
        const hasStarEmoji = /^[ \t]{0,10}[a-z]\) ⭐/m.test(content);
        expect(hasStarEmoji).toBe(true);
      });

      it(`${filename}: should include "(Recommended)" text (if recommendations exist)`, () => {
        // Some commands like codify don't have recommendations
        if (filename === 'codify.md') {
          return;
        }

        // Star emoji should be followed by text that includes "(Recommended)"
        // Using [^]+ instead of .* to prevent catastrophic backtracking, with reasonable limit
        const hasRecommendedText = /⭐[^]{0,200}\(Recommended\)/s.test(content);
        expect(hasRecommendedText).toBe(true);
      });

      it(`${filename}: should include modification tip on choice blocks`, () => {
        // Look for the tip pattern
        const hasTip = /💡 Tip: You can modify any choice/i.test(content);
        expect(hasTip).toBe(true);

        // Tip should use "and" not "but"
        const tipText = /💡 Tip:.*$/m.exec(content)?.[0] || '';
        expect(tipText).toContain('and');
        expect(tipText).not.toContain('but');
      });

      it(`${filename}: should include AI parsing guidance section`, () => {
        // Look for Response Parsing header
        const hasParsingSection = /## Response Parsing \(AI Instructions\)/i.test(content);
        expect(hasParsingSection).toBe(true);

        // Should document all key patterns
        const parsingContent = /## Response Parsing[\s\S]*?(?=\n##)/.exec(content)?.[0];
        expect(parsingContent).toBeDefined();

        if (parsingContent) {
          expect(parsingContent).toContain('"a" or "b"');
          expect(parsingContent).toContain('"a,b" or "a, b"');
          expect(parsingContent).toContain('"r"');
          expect(parsingContent).toContain('"a, and [modification]"');
          expect(parsingContent).toContain('Invalid');
        }
      });

      it(`${filename}: should use standard prompt format`, () => {
        // Look for the standard prompt pattern
        // Codify has special format: "or type 'approve'"
        if (filename === 'codify.md') {
          const hasPrompt = /👉 Your choice \[[a-z/]+\] or type "approve":/i.test(content);
          expect(hasPrompt).toBe(true);
        } else {
          const hasStandardPrompt = /👉 Your choice \[[a-z/]+\]:/i.test(content);
          expect(hasStandardPrompt).toBe(true);
        }
      });
    });
  });

  describe('Phase 1: Pattern Consistency', () => {
    it('should use consistent modification tip format across commands', () => {
      const tips = COMMANDS_WITH_CHOICES.map((filename) => {
        const filepath = join(COMMANDS_DIR, filename);
        const content = readFileSync(filepath, 'utf-8');
        return /💡 Tip:.*$/m.exec(content)?.[0] || '';
      });

      // All tips should start the same way
      tips.forEach((tip) => {
        expect(tip).toMatch(/💡 Tip: You can modify any choice/);
      });
    });

    it('should use consistent AI parsing guidance format across commands', () => {
      const guidanceSections = COMMANDS_WITH_CHOICES.map((filename) => {
        const filepath = join(COMMANDS_DIR, filename);
        const content = readFileSync(filepath, 'utf-8');
        return /## Response Parsing.*?(?=\n##)/s.exec(content)?.[0] || '';
      });

      // All guidance sections should have the same structure
      guidanceSections.forEach((guidance) => {
        expect(guidance).toContain('## Response Parsing (AI Instructions)');
        expect(guidance).toContain('When user responds to choice prompts:');
      });
    });
  });

  describe('Phase 1: Recommendation Logic', () => {
    COMMANDS_WITH_CHOICES.forEach((filename) => {
      const filepath = join(COMMANDS_DIR, filename);
      const content = readFileSync(filepath, 'utf-8');

      it(`${filename}: should not show "r" shortcut when only 0-1 recommendations`, () => {
        // Count recommendations in the file
        const recommendationCount = (content.match(/⭐/g) || []).length;

        // Get all choice prompts
        const prompts = content.match(/👉 Your choice \[[^\]]+\]:/g) || [];

        if (recommendationCount <= 1) {
          // Should NOT have "r" shortcut in any prompt
          // eslint-disable-next-line sonarjs/no-nested-functions -- Test pattern with forEach
          prompts.forEach((prompt) => {
            expect(prompt).not.toMatch(/\bor r for/i);
          });
        }

        // Note: We'll test "r" shortcut presence when we have 2+ recommendations
        // in later phases (plan, ship, codify, build, harden)
      });
    });
  });
});
