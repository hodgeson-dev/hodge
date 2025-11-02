/**
 * Smoke tests for explore command flag enhancements (HODGE-377.2)
 * Tests --create-issue and --rerun flags
 */

import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ExploreCommand } from './explore.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { IDManager } from '../lib/id-manager.js';
import { ExploreService } from '../lib/explore-service.js';

describe('Explore Command Flags - Smoke Tests (HODGE-377.2)', () => {
  smokeTest('should accept --create-issue flag with title', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const idManager = new IDManager(testDir);
    const exploreService = new ExploreService(testDir);
    const command = new ExploreCommand(idManager, exploreService, testDir);

    // Should not throw when --create-issue is provided with --title
    await expect(
      command.execute('test-feature', {
        createIssue: true,
        title: 'Test Issue',
        description: 'Test description',
      })
    ).resolves.not.toThrow();

    await fixture.cleanup();
  });

  smokeTest('should require --title when using --create-issue', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const idManager = new IDManager(testDir);
    const exploreService = new ExploreService(testDir);
    const command = new ExploreCommand(idManager, exploreService, testDir);

    // Mock process.exit to capture the error
    let exitCalled = false;
    const originalExit = process.exit.bind(process);
    process.exit = (() => {
      exitCalled = true;
    }) as never;

    try {
      await command.execute('test-feature', {
        createIssue: true,
        // title is missing
      });

      // Should have called process.exit(1)
      expect(exitCalled).toBe(true);
    } finally {
      process.exit = originalExit as never;
      await fixture.cleanup();
    }
  });

  smokeTest('should accept --rerun flag with reason', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const idManager = new IDManager(testDir);
    const exploreService = new ExploreService(testDir);
    const command = new ExploreCommand(idManager, exploreService, testDir);

    // Should not throw when --rerun is provided with reason
    await expect(
      command.execute('test-feature', {
        rerun: 'Need to reconsider approach',
      })
    ).resolves.not.toThrow();

    await fixture.cleanup();
  });

  smokeTest('should handle --create-issue before normal exploration flow', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const idManager = new IDManager(testDir);
    const exploreService = new ExploreService(testDir);
    const command = new ExploreCommand(idManager, exploreService, testDir);

    // When --create-issue is present, it should return early and not run normal exploration
    await command.execute('test-feature', {
      createIssue: true,
      title: 'Test Feature',
      description: 'Description',
    });

    // Feature directory should NOT be created (that happens in normal exploration)
    const featureDir = `${testDir}/.hodge/features/test-feature`;
    const fs = await import('fs/promises');
    await expect(fs.access(featureDir)).rejects.toThrow();

    await fixture.cleanup();
  });

  smokeTest('should handle --rerun before normal exploration flow', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const idManager = new IDManager(testDir);
    const exploreService = new ExploreService(testDir);
    const command = new ExploreCommand(idManager, exploreService, testDir);

    // When --rerun is present, it should return early and not run normal exploration
    await command.execute('test-feature', {
      rerun: 'Reconsidering approach',
    });

    // Feature directory should NOT be created (rerun has different flow)
    const featureDir = `${testDir}/.hodge/features/test-feature`;
    const fs = await import('fs/promises');
    await expect(fs.access(featureDir)).rejects.toThrow();

    await fixture.cleanup();
  });

  smokeTest('normal exploration should work when flags are not present', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    // Initialize hodge structure
    await fixture.writeFile('.hodge/standards.md', '# Standards');
    await fixture.writeFile('.hodge/id-mappings.json', '{}');

    const idManager = new IDManager(testDir);
    const exploreService = new ExploreService(testDir);
    const command = new ExploreCommand(idManager, exploreService, testDir);

    // Normal exploration without flags should create feature directory
    await command.execute('test-feature', {});

    // Feature directory SHOULD be created in normal flow
    const featureDir = `${testDir}/.hodge/features`;
    const fs = await import('fs/promises');
    await expect(fs.access(featureDir)).resolves.not.toThrow();

    await fixture.cleanup();
  });
});
