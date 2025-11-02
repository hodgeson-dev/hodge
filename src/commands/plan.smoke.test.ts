import { describe, expect, beforeEach, afterEach } from 'vitest';
import { PlanDecisionAnalyzer } from './plan/plan-decision-analyzer.js';
import { smokeTest } from '../test/helpers.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('PlanCommand - Description Extraction (Smoke Tests)', () => {
  let testDir: string;
  let decisionAnalyzer: PlanDecisionAnalyzer;

  beforeEach(async () => {
    // Create isolated temp directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-plan-test-'));
    decisionAnalyzer = new PlanDecisionAnalyzer(testDir);

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

    // Test via public method in PlanDecisionAnalyzer
    const description = await decisionAnalyzer.getFeatureDescription('TEST-123');

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

    const description = await decisionAnalyzer.getFeatureDescription('TEST-123');

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

    const description = await decisionAnalyzer.getFeatureDescription('TEST-123');

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

    const description = await decisionAnalyzer.getFeatureDescription('TEST-123');

    expect(description).toContain('Smart Description Extraction');
  });

  smokeTest('should return fallback text when no content exists', async () => {
    // No exploration.md, no decisions
    await fs.writeFile(path.join(testDir, '.hodge', 'decisions.md'), '');

    const description = await decisionAnalyzer.getFeatureDescription('TEST-123');

    expect(description).toBe('No description available');
  });
});

describe('PlanCommand - Cascading Decision Loading (Smoke Tests)', () => {
  let testDir: string;
  let decisionAnalyzer: PlanDecisionAnalyzer;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-plan-cascade-'));
    decisionAnalyzer = new PlanDecisionAnalyzer(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  smokeTest('should find decisions in feature-specific decisions.md', async () => {
    // Setup feature-specific decisions
    const featureDir = path.join(testDir, '.hodge', 'features', 'TEST-001');
    await fs.mkdir(path.join(featureDir, 'explore'), { recursive: true });
    await fs.writeFile(
      path.join(featureDir, 'decisions.md'),
      `# Feature Decisions: TEST-001

## Decisions

### 2025-10-02 - Use approach A

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Use approach A for implementation

**Rationale**:
Best practice

**Consequences**:
TBD

---
`
    );

    const decisions = await decisionAnalyzer.analyzeDecisions('TEST-001');

    // Should find the decision from feature-specific file
    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions[0]).toContain('approach A');
  });

  smokeTest(
    'should extract recommendation from exploration.md when decisions.md missing',
    async () => {
      const featureDir = path.join(testDir, '.hodge', 'features', 'TEST-002');
      await fs.mkdir(path.join(featureDir, 'explore'), { recursive: true });

      // Create exploration.md with Recommendation section
      await fs.writeFile(
        path.join(featureDir, 'explore', 'exploration.md'),
        `# Feature Exploration: TEST-002

## Recommendation

**Cascading File Checker with Smart Extraction** is recommended.

**Rationale**:
This is the best approach for the problem.
`
      );

      const decisions = await decisionAnalyzer.analyzeDecisions('TEST-002');

      // Should extract recommendation from exploration.md
      expect(decisions.length).toBeGreaterThan(0);
      expect(decisions[0]).toContain('Cascading File Checker');
    }
  );

  smokeTest('should fall back to global decisions.md', async () => {
    // Setup global decisions only
    const hodgeDir = path.join(testDir, '.hodge');
    await fs.mkdir(hodgeDir, { recursive: true });
    await fs.writeFile(
      path.join(hodgeDir, 'decisions.md'),
      `# Decisions

### 2025-10-02 - Global decision

**Status**: Accepted

**Context**:
Feature: TEST-003

**Decision**:
Use global decision approach

**Rationale**:
Fallback test

**Consequences**:
TBD

---
`
    );

    const decisions = await decisionAnalyzer.analyzeDecisions('TEST-003');

    // Should find decision from global file
    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions[0]).toContain('global decision');
  });

  smokeTest('should handle empty decisions gracefully', async () => {
    const featureDir = path.join(testDir, '.hodge', 'features', 'TEST-004');
    await fs.mkdir(path.join(featureDir, 'explore'), { recursive: true });

    // Create empty decisions.md
    await fs.writeFile(path.join(featureDir, 'decisions.md'), '# Feature Decisions: TEST-004\n');

    const decisions = await decisionAnalyzer.analyzeDecisions('TEST-004');

    // Should return empty array without crashing
    expect(Array.isArray(decisions)).toBe(true);
  });

  smokeTest('should prioritize feature decisions over global', async () => {
    // Setup both feature-specific and global decisions
    const featureDir = path.join(testDir, '.hodge', 'features', 'TEST-005');
    await fs.mkdir(path.join(featureDir, 'explore'), { recursive: true });

    await fs.writeFile(
      path.join(featureDir, 'decisions.md'),
      `### 2025-10-02 - Feature-specific decision

**Context**:
Feature: TEST-005

**Decision**:
Feature-specific approach

---
`
    );

    const hodgeDir = path.join(testDir, '.hodge');
    await fs.mkdir(hodgeDir, { recursive: true });
    await fs.writeFile(
      path.join(hodgeDir, 'decisions.md'),
      `### 2025-10-02 - Global decision

**Context**:
Feature: TEST-005

**Decision**:
Global approach

---
`
    );

    const decisions = await decisionAnalyzer.analyzeDecisions('TEST-005');

    // Should find feature-specific decision, not global
    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions[0]).toContain('Feature-specific');
  });

  smokeTest('should handle malformed exploration.md gracefully', async () => {
    const featureDir = path.join(testDir, '.hodge', 'features', 'TEST-006');
    await fs.mkdir(path.join(featureDir, 'explore'), { recursive: true });

    // Create malformed exploration.md
    await fs.writeFile(
      path.join(featureDir, 'explore', 'exploration.md'),
      '# Malformed\nNo proper sections here'
    );

    const decisions = await decisionAnalyzer.analyzeDecisions('TEST-006');

    // Should return empty array without crashing
    expect(Array.isArray(decisions)).toBe(true);
  });
});
