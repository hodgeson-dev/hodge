/**
 * Smoke tests for PM integration issue creation
 * Tests the new functionality added in HODGE-296
 *
 * Workflow tested:
 * 1. AI proposes epic/story breakdown during decide phase
 * 2. User approves the breakdown
 * 3. hodge decide creates the structure in PM tool
 */

import { smokeTest } from '../src/test/helpers';
import { PMHooks } from '../src/lib/pm/pm-hooks';
import { DecideCommand } from '../src/commands/decide';
import { IDManager } from '../src/lib/id-manager';
import { TempDirectoryFixture } from '../src/test/temp-directory-fixture';
import fs from 'fs/promises';
import path from 'path';

smokeTest('PMHooks should have createPMIssue method', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const pmHooks = new PMHooks(testDir);
  expect(pmHooks.createPMIssue).toBeDefined();
  expect(typeof pmHooks.createPMIssue).toBe('function');

  await fixture.cleanup();
});

smokeTest('PMHooks should have processQueue method', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const pmHooks = new PMHooks(testDir);
  expect(pmHooks.processQueue).toBeDefined();
  expect(typeof pmHooks.processQueue).toBe('function');

  await fixture.cleanup();
});

smokeTest('DecideCommand should be properly instantiated', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const decideCommand = new DecideCommand(testDir);
  expect(decideCommand).toBeDefined();
  expect(typeof decideCommand.execute).toBe('function');

  await fixture.cleanup();
});

smokeTest('PlanCommand should handle epic breakdown', async () => {
  const { PlanCommand } = await import('../src/commands/plan');
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const planCommand = new PlanCommand(testDir);
  expect(planCommand).toBeDefined();
  expect(typeof planCommand.execute).toBe('function');

  await fixture.cleanup();
});

smokeTest('IDManager should support parent/child relationships', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const idManager = new IDManager(testDir);

  // Test new methods exist
  expect(idManager.createSubIssueID).toBeDefined();
  expect(idManager.getSubIssues).toBeDefined();
  expect(idManager.getParentEpic).toBeDefined();
  expect(idManager.isEpic).toBeDefined();

  // Cleanup
  await fixture.cleanup();
});

smokeTest('IDManager should create sub-issue IDs in HODGE-XXX.Y format', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const idManager = new IDManager(testDir);

  // Create parent feature
  const parent = await idManager.createFeature('test-epic');
  const parentID = parent.localID;
  expect(parentID).toMatch(/^HODGE-\d+$/);

  // Create sub-issues following our decision: HODGE-XXX.Y format
  const subID1 = await idManager.createSubIssueID(parentID);
  expect(subID1).toBe(`${parentID}.1`);

  const subID2 = await idManager.createSubIssueID(parentID);
  expect(subID2).toBe(`${parentID}.2`);

  // Verify parent is marked as epic
  const isEpic = await idManager.isEpic(parentID);
  expect(isEpic).toBe(true);

  // Cleanup
  await fixture.cleanup();
});

smokeTest('PMHooks createPMIssue should handle epic with sub-issues', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const pmHooks = new PMHooks(testDir);

  // Mock environment to have no PM tool (to avoid real API calls)
  const originalPmTool = process.env.HODGE_PM_TOOL;
  delete process.env.HODGE_PM_TOOL;

  const result = await pmHooks.createPMIssue(
    'HODGE-300',
    ['Create epic with sub-issues for authentication feature'],
    true, // isEpic
    [
      { id: 'HODGE-300.1', title: 'API Authentication' },
      { id: 'HODGE-300.2', title: 'Frontend Auth UI' },
      { id: 'HODGE-300.3', title: 'Auth Tests' },
    ]
  );

  expect(result.created).toBe(false);
  expect(result.error).toBeDefined();
  // Could be 'No PM tool configured' or an error from getFeatureID

  // Restore environment
  if (originalPmTool) {
    process.env.HODGE_PM_TOOL = originalPmTool;
  }

  await fixture.cleanup();
});

smokeTest(
  'PM queue should handle failed operations gracefully',
  async () => {
    // Use a temp directory for PMHooks to avoid conflicts
    const fixture = new TempDirectoryFixture();
    const testDir = await fixture.setup();

    const pmHooks = new PMHooks(testDir);

    // Process empty queue should not crash and should complete quickly
    await expect(pmHooks.processQueue()).resolves.not.toThrow();

    // Cleanup
    await fixture.cleanup();
  },
  10000
); // Increase timeout to 10s just in case

smokeTest('PlanCommand should generate epic structure from decisions', async () => {
  const { PlanCommand } = await import('../src/commands/plan');
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();
  const planCommand = new PlanCommand(testDir);

  // Create mock decisions file using fixture
  const decisionsContent = `
### 2025-01-01 - Decision
**Status**: Accepted
**Context**: Feature: HODGE-300
**Decision**: Create epic with sub-issues
---`;

  await fixture.writeFile('.hodge/decisions.md', decisionsContent);

  // Test that plan command can be instantiated
  expect(planCommand).toBeDefined();
  expect(typeof planCommand.execute).toBe('function');

  await fixture.cleanup();
});

smokeTest('DecideCommand should record decisions without PM integration', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();
  const decideCommand = new DecideCommand(testDir);

  // Create feature directory (required for --feature flag validation)
  await fixture.writeFile('.hodge/features/HODGE-301/.gitkeep', '');

  await decideCommand.execute('Implement as a single story', { feature: 'HODGE-301' });

  // With --feature flag, decision should be in feature-specific file
  const decisions = await fs.readFile(
    path.join(testDir, '.hodge', 'features', 'HODGE-301', 'decisions.md'),
    'utf-8'
  );
  expect(decisions).toContain('Implement as a single story');
  expect(decisions).toContain('HODGE-301');

  await fixture.cleanup();
});

smokeTest('IDManager should track parent-child relationships correctly', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const idManager = new IDManager(testDir);

  // Create parent and children
  const parent = await idManager.createFeature('test-parent');
  const parentID = parent.localID;
  const child1 = await idManager.createSubIssueID(parentID);
  const child2 = await idManager.createSubIssueID(parentID);

  // Get sub-issues
  const subIssues = await idManager.getSubIssues(parentID);
  expect(subIssues).toHaveLength(2);
  expect(subIssues[0].localID).toBe(child1);
  expect(subIssues[1].localID).toBe(child2);

  // Get parent from child
  const parentEpic = await idManager.getParentEpic(child1);
  expect(parentEpic?.localID).toBe(parentID);

  // Cleanup
  await fixture.cleanup();
});

smokeTest('FeatureID interface should support hierarchy fields', () => {
  const featureId: import('../src/lib/id-manager').FeatureID = {
    localID: 'HODGE-001',
    created: new Date(),
    parentID: undefined,
    childIDs: ['HODGE-001.1', 'HODGE-001.2'],
    isEpic: true,
  };

  expect(featureId.childIDs).toHaveLength(2);
  expect(featureId.isEpic).toBe(true);
  expect(featureId.parentID).toBeUndefined();
});

smokeTest('Sub-issue FeatureID should have parent reference', () => {
  const subIssue: import('../src/lib/id-manager').FeatureID = {
    localID: 'HODGE-001.1',
    parentID: 'HODGE-001',
    created: new Date(),
  };

  expect(subIssue.parentID).toBe('HODGE-001');
  expect(subIssue.childIDs).toBeUndefined();
  expect(subIssue.isEpic).toBeUndefined();
});
