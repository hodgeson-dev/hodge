import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlanCommand } from './plan.js';
import { smokeTest } from '../test/helpers.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('PlanCommand - Description Extraction (Smoke Tests)', () => {
  let testDir: string;
  let planCommand: PlanCommand;

  beforeEach(async () => {
    // Create isolated temp directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-plan-test-'));
    planCommand = new PlanCommand(testDir);

    // Create .hodge structure
    await fs.mkdir(path.join(testDir, '.hodge', 'features', 'TEST-123', 'explore'), {
      recursive: true,
    });
    await fs.mkdir(path.join(testDir, '.hodge'), { recursive: true });
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  smokeTest('should extract description from Title field', async () => {
    // Create exploration.md with Title field
    const explorationContent = `# Exploration: TEST-123

**Title**: Fix PM issue description extraction

## Problem Statement
When users execute /build...
`;
    await fs.writeFile(
      path.join(testDir, '.hodge', 'features', 'TEST-123', 'explore', 'exploration.md'),
      explorationContent
    );

    // Access private method via reflection for testing
    const description = await (planCommand as any).getFeatureDescription('TEST-123');

    expect(description).toBe('Fix PM issue description extraction');
  });

  smokeTest('should extract from ## Problem Statement heading', async () => {
    const explorationContent = `# Exploration: TEST-123

## Problem Statement
This is the problem we're solving with this feature.

## Implementation
`;
    await fs.writeFile(
      path.join(testDir, '.hodge', 'features', 'TEST-123', 'explore', 'exploration.md'),
      explorationContent
    );

    const description = await (planCommand as any).getFeatureDescription('TEST-123');

    expect(description).toBe("This is the problem we're solving with this feature.");
  });

  smokeTest('should truncate long descriptions at 100 chars with word boundary', async () => {
    const longTitle =
      'This is a very long feature description that exceeds one hundred characters and should be truncated at a word boundary';
    const explorationContent = `# Exploration: TEST-123

**Title**: ${longTitle}
`;
    await fs.writeFile(
      path.join(testDir, '.hodge', 'features', 'TEST-123', 'explore', 'exploration.md'),
      explorationContent
    );

    const description = await (planCommand as any).getFeatureDescription('TEST-123');

    expect(description.length).toBeLessThanOrEqual(103); // 100 + '...'
    expect(description).toMatch(/\.\.\.$/);
    expect(description).not.toMatch(/\s\.\.\.$/); // Should not end with space before ...
  });

  smokeTest('should fall back to decisions when no exploration exists', async () => {
    // Create decisions.md
    const decisionsContent = `
### 2025-10-01 - Smart Description Extraction approach

**Status**: Accepted

**Context**:
Feature: TEST-123

**Decision**:
Smart Description Extraction approach - enhance getFeatureDescription() to extract from decisions automatically

**Rationale**:
Test decision

**Consequences**:
TBD

---
`;
    await fs.writeFile(path.join(testDir, '.hodge', 'decisions.md'), decisionsContent);

    const description = await (planCommand as any).getFeatureDescription('TEST-123');

    expect(description).toContain('Smart Description Extraction');
  });

  smokeTest('should return fallback text when no content exists', async () => {
    // No exploration.md, no decisions
    await fs.writeFile(path.join(testDir, '.hodge', 'decisions.md'), '');

    const description = await (planCommand as any).getFeatureDescription('TEST-123');

    expect(description).toBe('No description available');
  });
});
