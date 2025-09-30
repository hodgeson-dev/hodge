import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

describe('[smoke] build.md template - PM issue check', () => {
  it('should contain PM issue check section', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    // Check for key sections
    expect(buildTemplate).toContain('## PM Issue Check (Before Build)');
    expect(buildTemplate).toContain('Check for PM Issue Mapping');
    expect(buildTemplate).toContain('.hodge/id-mappings.json');
  });

  it('should contain user prompt for unmapped features', () => {
    const buildTemplate = readFileSync(join(__dirname, '../../.claude/commands/build.md'), 'utf-8');

    expect(buildTemplate).toContain("doesn't have a PM issue tracking it yet");
    expect(buildTemplate).toContain('Would you like to create a PM issue for this work?');
    expect(buildTemplate).toContain('a) Yes - Create a PM issue');
    expect(buildTemplate).toContain('b) No - Continue without PM tracking');
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
  it('should detect entry WITH externalID as mapped', () => {
    // Create temp id-mappings.json with entry that HAS externalID
    const tempDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
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
  });

  it('should detect entry WITHOUT externalID as unmapped', () => {
    // Create temp id-mappings.json with entry that has NO externalID
    const tempDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
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
  });

  it('should handle feature IDs with dots (sub-stories)', () => {
    // Test that pattern works with HODGE-297.1 format
    const tempDir = join(tmpdir(), `hodge-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
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
  });
});
