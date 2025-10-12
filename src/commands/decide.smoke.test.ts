import { describe, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { DecideCommand } from './decide.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Decide Command --feature Flag (HODGE-313)', () => {
  let tempDir: string;
  let decideCommand: DecideCommand;

  beforeEach(async () => {
    // Create temp directory for isolated testing
    tempDir = path.join(os.tmpdir(), `hodge-test-${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });

    // Create .hodge directory structure
    const hodgeDir = path.join(tempDir, '.hodge');
    await fs.promises.mkdir(hodgeDir, { recursive: true });

    decideCommand = new DecideCommand(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
  });

  smokeTest('Feature decision writes ONLY to feature decisions.md (not global)', async () => {
    // Setup: Create feature directory
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-001');
    await fs.promises.mkdir(featureDir, { recursive: true });

    // Verify directory was created before proceeding
    expect(fs.existsSync(featureDir)).toBe(true);

    // Execute: Record decision with --feature flag
    await decideCommand.execute('Test feature decision', { feature: 'TEST-001' });

    // Assert: Decision should exist in feature file
    const featureDecisionsFile = path.join(featureDir, 'decisions.md');
    expect(fs.existsSync(featureDecisionsFile)).toBe(true);

    const featureContent = await fs.promises.readFile(featureDecisionsFile, 'utf-8');
    expect(featureContent).toContain('Test feature decision');
    expect(featureContent).toContain('Feature Decisions: TEST-001');

    // Assert: Decision should NOT exist in global file
    const globalDecisionsFile = path.join(tempDir, '.hodge', 'decisions.md');
    if (fs.existsSync(globalDecisionsFile)) {
      const globalContent = await fs.promises.readFile(globalDecisionsFile, 'utf-8');
      expect(globalContent).not.toContain('Test feature decision');
    }
  });

  smokeTest('Global decision writes ONLY to global decisions.md (not feature)', async () => {
    // Execute: Record decision WITHOUT --feature flag
    await decideCommand.execute('Test global decision');

    // Assert: Decision should exist in global file
    const globalDecisionsFile = path.join(tempDir, '.hodge', 'decisions.md');
    expect(fs.existsSync(globalDecisionsFile)).toBe(true);

    const globalContent = await fs.promises.readFile(globalDecisionsFile, 'utf-8');
    expect(globalContent).toContain('Test global decision');
    expect(globalContent).toContain('Architecture Decisions');

    // Assert: No feature directory should be created
    const featuresDir = path.join(tempDir, '.hodge', 'features');
    expect(fs.existsSync(featuresDir)).toBe(false);
  });

  smokeTest('Multiple feature decisions accumulate in decisions.md', async () => {
    // Setup: Create feature directory
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-002');
    await fs.promises.mkdir(featureDir, { recursive: true });

    // Execute: Record two decisions for same feature
    await decideCommand.execute('First decision', { feature: 'TEST-002' });
    await decideCommand.execute('Second decision', { feature: 'TEST-002' });

    // Assert: Both decisions should exist in same file
    const featureDecisionsFile = path.join(featureDir, 'decisions.md');
    const content = await fs.promises.readFile(featureDecisionsFile, 'utf-8');

    expect(content).toContain('First decision');
    expect(content).toContain('Second decision');

    // Assert: File has proper structure with multiple decision entries
    const decisionHeaders = content.match(/^### \d{4}-/gm) || [];
    expect(decisionHeaders.length).toBe(2);
  });

  smokeTest('Error when feature directory does not exist', async () => {
    // Execute & Assert: Should throw error when feature directory doesn't exist
    await expect(
      decideCommand.execute('Test decision', { feature: 'NONEXISTENT' })
    ).rejects.toThrow('Feature directory not found: NONEXISTENT');

    // Assert: No decisions.md file created
    const featureDir = path.join(tempDir, '.hodge', 'features', 'NONEXISTENT');
    expect(fs.existsSync(featureDir)).toBe(false);
  });

  smokeTest('Feature decisions file uses correct template format', async () => {
    // Setup: Create feature directory
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-003');
    await fs.promises.mkdir(featureDir, { recursive: true });

    // Execute: Record decision
    await decideCommand.execute('Template test decision', { feature: 'TEST-003' });

    // Assert: File has correct template structure
    const featureDecisionsFile = path.join(featureDir, 'decisions.md');
    const content = await fs.promises.readFile(featureDecisionsFile, 'utf-8');

    // Check template header
    expect(content).toContain('# Feature Decisions: TEST-003');
    expect(content).toContain('## Decisions');
    expect(content).toContain('<!-- Add your decisions below -->');

    // Check decision format (same as global)
    expect(content).toContain('**Status**: Accepted');
    expect(content).toContain('**Context**:');
    expect(content).toContain('Feature: TEST-003');
    expect(content).toContain('**Decision**:');
    expect(content).toContain('**Rationale**:');
    expect(content).toContain('**Consequences**:');
  });
});
