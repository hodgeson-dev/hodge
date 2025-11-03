/**
 * Smoke tests for sub-feature methods on PM adapters
 * HODGE-377.5: Feature ID Abstraction - Multi-Adapter Support
 */

import { smokeTest } from '../../test/helpers.js';
import { TempDirectoryFixture } from '../../test/temp-directory-fixture.js';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { describe, expect } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('PM Adapter Sub-Feature Methods', () => {
  smokeTest('LocalAdapter.isEpic returns false for feature without sub-features', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    // Create a single feature directory
    const featuresDir = path.join(testDir, '.hodge', 'features');
    await fs.mkdir(path.join(featuresDir, 'HODGE-001'), { recursive: true });

    const adapter = new LocalPMAdapter(testDir);
    const result = await adapter.isEpic('HODGE-001');

    expect(result).toBe(false);
    await fixture.cleanup();
  });

  smokeTest('LocalAdapter.isEpic returns true for feature with sub-features', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    // Create parent and sub-feature directories
    const featuresDir = path.join(testDir, '.hodge', 'features');
    await fs.mkdir(path.join(featuresDir, 'HODGE-377'), { recursive: true });
    await fs.mkdir(path.join(featuresDir, 'HODGE-377.1'), { recursive: true });
    await fs.mkdir(path.join(featuresDir, 'HODGE-377.2'), { recursive: true });

    const adapter = new LocalPMAdapter(testDir);
    const result = await adapter.isEpic('HODGE-377');

    expect(result).toBe(true);
    await fixture.cleanup();
  });

  smokeTest('LocalAdapter.getSubIssues returns sub-features in numeric order', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    // Create parent and sub-feature directories (out of order to test sorting)
    const featuresDir = path.join(testDir, '.hodge', 'features');
    await fs.mkdir(path.join(featuresDir, 'HODGE-377'), { recursive: true });
    await fs.mkdir(path.join(featuresDir, 'HODGE-377.2'), { recursive: true });
    await fs.mkdir(path.join(featuresDir, 'HODGE-377.1'), { recursive: true });
    await fs.mkdir(path.join(featuresDir, 'HODGE-377.10'), { recursive: true });

    const adapter = new LocalPMAdapter(testDir);
    const subIssues = await adapter.getSubIssues('HODGE-377');

    expect(subIssues).toHaveLength(3);
    expect(subIssues[0].id).toBe('HODGE-377.1');
    expect(subIssues[1].id).toBe('HODGE-377.2');
    expect(subIssues[2].id).toBe('HODGE-377.10'); // Numeric sort, not string sort

    await fixture.cleanup();
  });

  smokeTest('LocalAdapter.getParentIssue returns parent ID for sub-feature', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const adapter = new LocalPMAdapter(testDir);
    const parent = await adapter.getParentIssue('HODGE-377.1');

    expect(parent).toBe('HODGE-377');
    await fixture.cleanup();
  });

  smokeTest('LocalAdapter.getParentIssue returns null for root feature', async () => {
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const adapter = new LocalPMAdapter(testDir);
    const parent = await adapter.getParentIssue('HODGE-377');

    expect(parent).toBeNull();
    await fixture.cleanup();
  });
});
