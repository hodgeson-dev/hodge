/**
 * Smoke tests for PM adapter ID detection (HODGE-377.2)
 * Tests isValidIssueID() method across all adapters
 */

import { describe, expect } from 'vitest';
import { smokeTest } from '../../test/helpers.js';
import { LinearAdapter } from './linear-adapter.js';
import { GitHubAdapter } from './github-adapter.js';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { TempDirectoryFixture } from '../../test/temp-directory-fixture.js';

describe('PM Adapter ID Detection - Smoke Tests', () => {
  smokeTest('LinearAdapter should detect valid Linear IDs', async () => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    // Mock adapter with minimal config
    const adapter = new LinearAdapter({
      config: {
        tool: 'linear',
        apiKey: 'test-api-key-that-is-long-enough',
        teamId: 'test-team-id',
      },
    });

    // Valid Linear IDs
    expect(adapter.isValidIssueID('HOD-123')).toBe(true);
    expect(adapter.isValidIssueID('PROJ-456')).toBe(true);
    expect(adapter.isValidIssueID('ABC-1')).toBe(true);

    // Invalid formats
    expect(adapter.isValidIssueID('#123')).toBe(false);
    expect(adapter.isValidIssueID('123')).toBe(false);
    expect(adapter.isValidIssueID('Fix ABC-123 bug')).toBe(false);
    expect(adapter.isValidIssueID('add user auth')).toBe(false);

    await fixture.cleanup();
  });

  smokeTest('GitHubAdapter should detect valid GitHub issue IDs', async () => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    // Create a mock git repo to satisfy GitHub adapter's parseGitHubRepo
    await fixture.writeFile(
      '.git/config',
      `[remote "origin"]
\turl = git@github.com:test/repo.git`
    );

    const adapter = new GitHubAdapter({
      config: {
        tool: 'github',
        apiKey: 'ghp_test123',
      },
    });

    // Valid GitHub IDs
    expect(adapter.isValidIssueID('#123')).toBe(true);
    expect(adapter.isValidIssueID('123')).toBe(true);
    expect(adapter.isValidIssueID('#1')).toBe(true);

    // Invalid formats
    expect(adapter.isValidIssueID('HOD-123')).toBe(false);
    expect(adapter.isValidIssueID('PROJ-456')).toBe(false);
    expect(adapter.isValidIssueID('Fix issue #123')).toBe(false);
    expect(adapter.isValidIssueID('add user auth')).toBe(false);

    await fixture.cleanup();
  });

  smokeTest('LocalPMAdapter should detect valid local IDs', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const adapter = new LocalPMAdapter(testDir);

    // Valid local IDs
    expect(adapter.isValidIssueID('HOD-001')).toBe(true);
    expect(adapter.isValidIssueID('HODGE-123')).toBe(true);
    expect(adapter.isValidIssueID('HOD-999')).toBe(true);

    // Invalid formats
    expect(adapter.isValidIssueID('#123')).toBe(false);
    expect(adapter.isValidIssueID('123')).toBe(false);
    expect(adapter.isValidIssueID('PROJ-123')).toBe(false);
    expect(adapter.isValidIssueID('Fix HOD-123 bug')).toBe(false);
    expect(adapter.isValidIssueID('add user auth')).toBe(false);

    await fixture.cleanup();
  });

  smokeTest('Adapters should trim whitespace before validation', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const linear = new LinearAdapter({
      config: {
        tool: 'linear',
        apiKey: 'test-api-key-that-is-long-enough',
        teamId: 'test-team-id',
      },
    });
    const local = new LocalPMAdapter(testDir);

    // Whitespace should be trimmed
    expect(linear.isValidIssueID('  HOD-123  ')).toBe(true);
    expect(local.isValidIssueID('  HODGE-456  ')).toBe(true);

    await fixture.cleanup();
  });

  smokeTest('Adapters should only match entire input string', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const linear = new LinearAdapter({
      config: {
        tool: 'linear',
        apiKey: 'test-api-key-that-is-long-enough',
        teamId: 'test-team-id',
      },
    });
    const local = new LocalPMAdapter(testDir);

    // Partial matches should fail (ID within description)
    expect(linear.isValidIssueID('Fix ABC-123 authentication bug')).toBe(false);
    expect(linear.isValidIssueID('Implement feature described in PROJ-456')).toBe(false);
    expect(local.isValidIssueID('See HOD-001 for details')).toBe(false);

    await fixture.cleanup();
  });
});
