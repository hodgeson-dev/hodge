import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('[smoke] build.md template - PM issue check', () => {
  it('should contain PM issue check section', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    // Check for key sections
    expect(buildTemplate).toContain('## PM Issue Check (Before Build)');
    expect(buildTemplate).toContain('Check for PM Issue Mapping');
    expect(buildTemplate).toContain('.hodge/id-mappings.json');
  });

  it('should contain user prompt for unmapped features (HODGE-346.3 format)', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain("doesn't have a PM issue tracking it yet");
    expect(buildTemplate).toContain('Would you like to create a PM issue for this work?');
    // HODGE-346.3: Changed to a) ⭐ format
    expect(buildTemplate).toMatch(/a\) ⭐ Yes - Create a PM issue/);
    expect(buildTemplate).toMatch(/b\) No - Continue without PM tracking/);
  });

  it('should reference /plan command for single issue creation', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain('/plan {{feature}}');
    expect(buildTemplate).toContain('single-issue plan');
  });

  it('should document non-blocking behavior', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain('Proceed with build anyway');
    expect(buildTemplate).toContain('non-blocking');
    expect(buildTemplate).toContain('freedom to explore');
  });

  it('should have skip logic for already mapped features', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain('If Feature IS Already Mapped');
    expect(buildTemplate).toContain('Skip the prompt');
  });
});

describe('[smoke] PM mapping check - grep pattern behavior', () => {
  it('should detect entry WITH externalID as mapped', async () => {
    // Create temp id-mappings.json with entry that HAS externalID
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      const mappingsPath = join(tempDir, 'id-mappings.json');

      const testMappings = {
        'HODGE-297': {
          localID: 'HODGE-297',
          created: '2025-09-29T18:34:46.744Z',
          externalID: '4aa0eecf-5b2b-4c0f-ba16-d89fed8cb98d',
          pmTool: 'linear',
        },
      };

      writeFileSync(mappingsPath, JSON.stringify(testMappings, null, 2));

      // Test the grep pattern from build.md
      try {
        execSync(`cat ${mappingsPath} | grep -A 2 "\\"HODGE-297\\"" | grep "externalID"`, {
          encoding: 'utf-8',
        });
        // If we get here, grep found externalID (exit code 0)
        expect(true).toBe(true);
      } catch (error) {
        // grep failed (exit code 1) - should NOT happen for this test
        expect.fail('Should have found externalID for HODGE-297');
      }
    } finally {
      await fixture.cleanup();
    }
  });

  it('should detect entry WITHOUT externalID as unmapped', async () => {
    // Create temp id-mappings.json with entry that has NO externalID
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      const mappingsPath = join(tempDir, 'id-mappings.json');

      const testMappings = {
        'HODGE-298': {
          localID: 'HODGE-298',
          created: '2025-09-29T19:09:56.299Z',
          // NO externalID field
        },
      };

      writeFileSync(mappingsPath, JSON.stringify(testMappings, null, 2));

      // Test the grep pattern from build.md
      try {
        execSync(`cat ${mappingsPath} | grep -A 2 "\\"HODGE-298\\"" | grep "externalID"`, {
          encoding: 'utf-8',
        });
        // If we get here, grep found externalID - should NOT happen
        expect.fail('Should NOT have found externalID for HODGE-298');
      } catch (error) {
        // grep failed (exit code 1) - this is CORRECT behavior
        expect(true).toBe(true);
      }
    } finally {
      await fixture.cleanup();
    }
  });

  it('should handle feature IDs with dots (sub-stories)', async () => {
    // Test that pattern works with HODGE-297.1 format
    const fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();

    try {
      const mappingsPath = join(tempDir, 'id-mappings.json');

      const testMappings = {
        'HODGE-297.1': {
          localID: 'HODGE-297.1',
          created: '2025-09-29T18:49:50.922Z',
          externalID: '136191a8-5027-41d6-acea-4ee179a4bbaf',
          pmTool: 'linear',
        },
      };

      writeFileSync(mappingsPath, JSON.stringify(testMappings, null, 2));

      // Test the grep pattern with dotted feature ID
      try {
        execSync(`cat ${mappingsPath} | grep -A 2 "\\"HODGE-297.1\\"" | grep "externalID"`, {
          encoding: 'utf-8',
        });
        expect(true).toBe(true);
      } catch (error) {
        expect.fail('Should have found externalID for HODGE-297.1');
      }
    } finally {
      await fixture.cleanup();
    }
  });
});

describe('[smoke] decide.md template - decision prompt formatting', () => {
  it('should have blank line between Topic and Context fields', () => {
    const decideTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/decide.md'),
      'utf-8'
    );

    // Check that Topic and Context are separated by a blank line
    expect(decideTemplate).toContain(
      '**Topic**: {{decision_topic}}\n\n   **Context**: {{brief_context}}'
    );
  });

  it('should display decision prompt sections in correct order', () => {
    const decideTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/decide.md'),
      'utf-8'
    );

    // Verify decision prompt structure
    expect(decideTemplate).toContain('📋 Decide: Decision {{number}} of {{total}}');
    expect(decideTemplate).toContain('**Topic**: {{decision_topic}}');
    expect(decideTemplate).toContain('**Context**: {{brief_context}}');
    expect(decideTemplate).toContain('**Principle Consideration**:');
  });
});

describe('[smoke] build.md template - PM check interpretation', () => {
  it('should include explicit interpretation guidance for grep results', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain('**Interpreting the result:**');
    expect(buildTemplate).toContain(
      '**Empty output (no lines returned)** = Feature is NOT mapped to PM issue'
    );
    expect(buildTemplate).toContain(
      '**Output contains "externalID: ..."** = Feature IS mapped to PM issue'
    );
  });

  it('should clarify when to show PM creation prompt', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain('If the grep returns **empty/no output**');
    expect(buildTemplate).toContain('the feature has no PM issue');
  });

  it('should clarify when to skip PM creation prompt', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain('If the grep returns **output containing "externalID: ..."**');
    expect(buildTemplate).toContain('already has a PM issue');
  });
});

describe('[smoke] explore.md template - Phase 3 preview format', () => {
  it('should show numbered decision list in preview format', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('**Decisions Needed**:');
    expect(exploreTemplate).toContain('1. [Decision question 1]');
    expect(exploreTemplate).toContain('2. [Decision question 2]');
    // HODGE-325: Updated template to show 2 examples instead of 3
  });

  it('should show bold "No Decisions Needed" when no decisions exist', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    // HODGE-325: Updated text to "OR if no unresolved decisions:"
    expect(exploreTemplate).toContain('OR if no unresolved decisions:');
    expect(exploreTemplate).toContain('**No Decisions Needed**');
  });

  it('should preserve other preview sections unchanged', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    // Verify structure is intact
    expect(exploreTemplate).toContain('## Preview: exploration.md Summary');
    expect(exploreTemplate).toContain('**Title**: [generated title]');
    expect(exploreTemplate).toContain('**Problem Statement**: [1-2 sentences]');
    expect(exploreTemplate).toContain('**Key Discussion Points**:');
    expect(exploreTemplate).toContain('**Recommended Approach**: [approach name]');
    expect(exploreTemplate).toContain(
      '**Test Intentions**: [count] behavioral expectations defined'
    );
  });

  it('should include approval options after preview', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('Would you like to:');
    expect(exploreTemplate).toContain('a) ✅ Approve and write to exploration.md');
    expect(exploreTemplate).toContain('b) 🔄 Revise specific sections');
    expect(exploreTemplate).toContain('c) ➕ Add more detail');
    expect(exploreTemplate).toContain('d) ➖ Simplify certain areas');
  });
});

describe('[smoke] ship.md template - --skip-tests parameter support (HODGE-361)', () => {
  it('should document --skip-tests in frontmatter argument-hint', () => {
    const shipTemplate = readFileSync(join(__dirname, '../../.claude/commands/ship.md'), 'utf-8');

    expect(shipTemplate).toContain('argument-hint: <feature-id> [--skip-tests]');
  });

  it('should parse --skip-tests flag in Step 1 bash logic', () => {
    const shipTemplate = readFileSync(join(__dirname, '../../.claude/commands/ship.md'), 'utf-8');

    // Check for flag parsing logic
    expect(shipTemplate).toContain('raw_feature="{{feature}}"');
    expect(shipTemplate).toContain('skip_tests_flag=""');
    expect(shipTemplate).toContain('if [[ "$raw_feature" == *"--skip-tests"* ]]');
    expect(shipTemplate).toContain('skip_tests_flag="--skip-tests"');
  });

  it('should pass skip_tests_flag variable to hodge ship commands', () => {
    const shipTemplate = readFileSync(join(__dirname, '../../.claude/commands/ship.md'), 'utf-8');

    // Check hodge ship is called with skip_tests_flag (after -m flag per HODGE-369)
    expect(shipTemplate).toContain('hodge ship "$feature" -m "$commit_message" $skip_tests_flag');
  });

  it('should document --skip-tests usage in troubleshooting section', () => {
    const shipTemplate = readFileSync(join(__dirname, '../../.claude/commands/ship.md'), 'utf-8');

    expect(shipTemplate).toContain('Need to skip quality gates?');
    expect(shipTemplate).toContain('/ship {{feature}} --skip-tests');
    expect(shipTemplate).toContain("Quality checks will still run but won't block the commit");
    expect(shipTemplate).toContain('emergency hotfixes');
    expect(shipTemplate).toContain('WIP state preservation');
    expect(shipTemplate).toContain('broken test infrastructure');
  });

  it('should recommend fixing issues first in troubleshooting', () => {
    const shipTemplate = readFileSync(join(__dirname, '../../.claude/commands/ship.md'), 'utf-8');

    expect(shipTemplate).toContain('Not recommended for regular workflow');
    expect(shipTemplate).toContain('prefer fixing issues first');
  });
});
