import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalPMAdapter } from './local-pm-adapter';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { smokeTest } from '../../test/helpers';

describe('LocalPMAdapter', () => {
  let tempDir: string;
  let pmPath: string;
  let adapter: LocalPMAdapter;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-test-'));

    // Now pmPath will be relative to tempDir
    pmPath = path.join(tempDir, '.hodge', 'project_management.md');
    adapter = new LocalPMAdapter(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  smokeTest('should not crash on init', async () => {
    await expect(adapter.init()).resolves.not.toThrow();
  });

  smokeTest('should create project_management.md on init', async () => {
    await adapter.init();
    const exists = await fs
      .access(pmPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });

  smokeTest('should include project plan in template', async () => {
    await adapter.init();
    const content = await fs.readFile(pmPath, 'utf-8');

    expect(content).toContain('## Implementation Phases');
    expect(content).toContain('## Dependencies Graph');
    expect(content).toContain('Phase 1: Foundation');
    expect(content).toContain('HODGE-004 (ID Management)');
  });

  smokeTest('should add new feature to tracking', async () => {
    await adapter.init();
    await adapter.addFeature('TEST-001', 'Test feature for LocalPMAdapter');

    const content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('### TEST-001');
    expect(content).toContain('Test feature for LocalPMAdapter');
  });

  smokeTest('should update feature status', async () => {
    await adapter.init();
    await adapter.addFeature('TEST-002', 'Test status update');
    await adapter.updateFeatureStatus('TEST-002', 'building');

    const content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('TEST-002');
    expect(content).toContain('Building');
  });

  smokeTest('should mark feature complete in project plan', async () => {
    await adapter.init();

    // Add HODGE-006 to active features first
    await adapter.addFeature('HODGE-006', 'Local PM Tracking', 'Phase 3');

    // Ship it
    await adapter.updateFeatureStatus('HODGE-006', 'shipped');

    const content = await fs.readFile(pmPath, 'utf-8');

    // Should be marked complete in project plan
    expect(content).toMatch(/\[x\]\s+HODGE-006/);

    // Should be in completed section
    expect(content).toContain('## Completed Features');
  });

  smokeTest('should handle in-progress status in project plan', async () => {
    await adapter.init();
    await adapter.addFeature('HODGE-006', 'Local PM Tracking');
    await adapter.updateFeatureStatus('HODGE-006', 'building');

    const content = await fs.readFile(pmPath, 'utf-8');

    // Should be marked as in progress in project plan
    expect(content).toMatch(/\[~\]\s+HODGE-006/);
  });

  smokeTest('should preserve project plan structure', async () => {
    await adapter.init();

    const originalContent = await fs.readFile(pmPath, 'utf-8');

    // Add and update features
    await adapter.addFeature('TEST-003', 'Test feature');
    await adapter.updateFeatureStatus('TEST-003', 'building');

    const updatedContent = await fs.readFile(pmPath, 'utf-8');

    // Project plan structure should still be present
    expect(updatedContent).toContain('## Implementation Phases');
    expect(updatedContent).toContain('## Dependencies Graph');

    // Original phases should still be there
    expect(updatedContent).toContain('Phase 1: Foundation');
    expect(updatedContent).toContain('Phase 2: AI Experience Enhancement');
    expect(updatedContent).toContain('Phase 3: Feature Organization');
  });

  smokeTest('should not duplicate features', async () => {
    await adapter.init();

    await adapter.addFeature('TEST-004', 'Test duplicate');
    await adapter.addFeature('TEST-004', 'Test duplicate again');

    const content = await fs.readFile(pmPath, 'utf-8');

    // Should only appear once
    const matches = content.match(/### TEST-004/g);
    expect(matches?.length).toBe(1);
  });

  smokeTest('should move feature to completed on ship', async () => {
    await adapter.init();

    await adapter.addFeature('TEST-005', 'Test ship');
    await adapter.updateFeatureStatus('TEST-005', 'shipped');

    const content = await fs.readFile(pmPath, 'utf-8');

    // Should be in completed section
    const completedIndex = content.indexOf('## Completed Features');
    const featureIndex = content.indexOf('### TEST-005');

    expect(completedIndex).toBeGreaterThan(0);
    expect(featureIndex).toBeGreaterThan(completedIndex);
    expect(content).toContain('- **Status**: Shipped');
  });
});
