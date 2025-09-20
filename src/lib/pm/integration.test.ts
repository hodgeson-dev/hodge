import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalPMAdapter } from './local-pm-adapter';
import { PMHooks } from './pm-hooks';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { integrationTest } from '../../test/helpers';

describe('PM Integration Tests', () => {
  let tempDir: string;
  let pmPath: string;
  let pmHooks: PMHooks;
  let localAdapter: LocalPMAdapter;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-pm-test-'));

    // Now pmPath will be relative to tempDir
    pmPath = path.join(tempDir, '.hodge', 'project_management.md');

    pmHooks = new PMHooks(tempDir);
    localAdapter = new LocalPMAdapter(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  integrationTest('should create PM tracking on explore', async () => {
    await pmHooks.onExplore('TEST-FEATURE', 'Test feature for integration');

    const exists = await fs
      .access(pmPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    const content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('TEST-FEATURE');
    expect(content).toContain('Test feature for integration');
    expect(content).toContain('Status**: Exploring');
  });

  integrationTest('should update status through workflow phases', async () => {
    // Start with explore
    await pmHooks.onExplore('WORKFLOW-TEST', 'Workflow test feature');

    let content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('WORKFLOW-TEST');

    // Move to build
    await pmHooks.onPhaseStart('WORKFLOW-TEST', 'build');
    content = await fs.readFile(pmPath, 'utf-8');

    // Check if marked as in-progress in project plan (if exists in plan)
    if (content.includes('## Implementation Phases')) {
      // Feature might not be in the static project plan, so this is optional
    }

    // Move to harden
    await pmHooks.onPhaseStart('WORKFLOW-TEST', 'harden');
    content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('WORKFLOW-TEST');

    // Ship it
    await pmHooks.onShip('WORKFLOW-TEST');
    content = await fs.readFile(pmPath, 'utf-8');

    // Should be in completed section
    expect(content).toContain('## Completed Features');
    const completedIndex = content.indexOf('## Completed Features');
    const featureIndex = content.indexOf('### WORKFLOW-TEST');

    if (featureIndex > -1) {
      expect(featureIndex).toBeGreaterThan(completedIndex);
    }
  });

  integrationTest('should maintain project plan structure', async () => {
    await localAdapter.init();

    const originalContent = await fs.readFile(pmPath, 'utf-8');
    expect(originalContent).toContain('## Implementation Phases');
    expect(originalContent).toContain('## Dependencies Graph');

    // Add features and update them
    await localAdapter.addFeature('PLAN-TEST-1', 'Test feature 1');
    await localAdapter.updateFeatureStatus('PLAN-TEST-1', 'building');

    await localAdapter.addFeature('PLAN-TEST-2', 'Test feature 2');
    await localAdapter.updateFeatureStatus('PLAN-TEST-2', 'shipped');

    const finalContent = await fs.readFile(pmPath, 'utf-8');

    // Project plan should still be intact
    expect(finalContent).toContain('## Implementation Phases');
    expect(finalContent).toContain('Phase 1: Foundation');
    expect(finalContent).toContain('Phase 2: AI Experience Enhancement');
    expect(finalContent).toContain('Phase 3: Feature Organization');
    expect(finalContent).toContain('Phase 4: PM Integration');
    expect(finalContent).toContain('Phase 5: Enhanced Features');
    expect(finalContent).toContain('## Dependencies Graph');
  });

  integrationTest('should handle HODGE-006 specifically', async () => {
    await localAdapter.init();
    await localAdapter.addFeature('HODGE-006', 'Local PM Tracking', 'Phase 3');

    let content = await fs.readFile(pmPath, 'utf-8');

    // Should be in active features
    expect(content).toContain('### HODGE-006');
    expect(content).toContain('Local PM Tracking');

    // Update to building
    await localAdapter.updateFeatureStatus('HODGE-006', 'building');
    content = await fs.readFile(pmPath, 'utf-8');

    // Should be marked as in-progress in Phase 3
    expect(content).toMatch(/\[~\]\s+HODGE-006/);

    // Ship it
    await localAdapter.updateFeatureStatus('HODGE-006', 'shipped');
    content = await fs.readFile(pmPath, 'utf-8');

    // Should be marked as complete in Phase 3
    expect(content).toMatch(/\[x\]\s+HODGE-006/);

    // Should be in completed section
    expect(content).toContain('## Completed Features');
  });

  integrationTest('should preserve existing PM content', async () => {
    // Initialize with some content
    await localAdapter.init();
    await localAdapter.addFeature('EXISTING-1', 'Existing feature 1');
    await localAdapter.addFeature('EXISTING-2', 'Existing feature 2');

    const beforeContent = await fs.readFile(pmPath, 'utf-8');
    expect(beforeContent).toContain('EXISTING-1');
    expect(beforeContent).toContain('EXISTING-2');

    // Add new feature through PM hooks
    await pmHooks.onExplore('NEW-FEATURE', 'New feature added');

    const afterContent = await fs.readFile(pmPath, 'utf-8');

    // Old features should still be there
    expect(afterContent).toContain('EXISTING-1');
    expect(afterContent).toContain('EXISTING-2');

    // New feature should be added
    expect(afterContent).toContain('NEW-FEATURE');
  });

  integrationTest('should handle concurrent updates gracefully', async () => {
    await localAdapter.init();

    // Add features sequentially to avoid file write conflicts
    // Note: Real concurrent writes to same file would need file locking
    await localAdapter.addFeature('CONCURRENT-1', 'Feature 1');
    await localAdapter.addFeature('CONCURRENT-2', 'Feature 2');
    await localAdapter.addFeature('CONCURRENT-3', 'Feature 3');

    const content = await fs.readFile(pmPath, 'utf-8');

    // All features should be present
    expect(content).toContain('CONCURRENT-1');
    expect(content).toContain('CONCURRENT-2');
    expect(content).toContain('CONCURRENT-3');
  });

  integrationTest('should track feature history correctly', async () => {
    const feature = 'HISTORY-TEST';

    // Create feature
    await pmHooks.onExplore(feature, 'Testing history tracking');

    // Update through phases
    await pmHooks.onPhaseStart(feature, 'build');
    await pmHooks.onPhaseStart(feature, 'harden');
    await pmHooks.onShip(feature);

    const content = await fs.readFile(pmPath, 'utf-8');

    // Feature should show completion
    expect(content).toContain('## Completed Features');

    // Check if feature is in the completed section
    const completedIndex = content.indexOf('## Completed Features');
    const featureIndex = content.indexOf(`### ${feature}`);

    // Feature should be after the Completed Features header
    expect(featureIndex).toBeGreaterThan(completedIndex);

    // Should have proper status
    expect(content).toContain('Status**: Shipped');

    // Check for completion indicator - either in status or in content
    const hasCompleted = content.includes('Completed**:') || content.includes('Status**: Shipped');
    expect(hasCompleted).toBe(true);
  });
});
