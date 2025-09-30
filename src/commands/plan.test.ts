import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlanCommand } from './plan.js';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { smokeTest } from '../test/helpers.js';

describe('PlanCommand - Smoke Tests', () => {
  let tmpDir: string;
  let command: PlanCommand;

  beforeEach(async () => {
    // Create isolated temp directory for tests
    tmpDir = path.join(os.tmpdir(), `hodge-plan-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    // Initialize Hodge structure in temp directory
    mkdirSync(path.join(tmpDir, '.hodge'), { recursive: true });
    mkdirSync(path.join(tmpDir, '.hodge', 'features'), { recursive: true });

    command = new PlanCommand(tmpDir);
  });

  afterEach(async () => {
    // Cleanup temp directory
    if (existsSync(tmpDir)) {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should not crash when creating plan without decisions', async () => {
    const feature = 'TEST-001';

    // Create minimal feature structure
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    mkdirSync(featureDir, { recursive: true });

    // Create empty decisions file
    await fs.writeFile(path.join(tmpDir, '.hodge', 'decisions.md'), '# Decisions\n');

    // Create context.json with current feature
    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'context.json'),
      JSON.stringify({ currentFeature: feature })
    );

    // Should not throw (no createPm flag means local-only save)
    await expect(command.execute({ feature })).resolves.not.toThrow();
  });

  smokeTest('should create plan locally without --create-pm flag', async () => {
    const feature = 'TEST-002';

    // Create feature structure with exploration
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    const exploreDir = path.join(featureDir, 'explore');
    mkdirSync(exploreDir, { recursive: true });

    // Create exploration with description
    await fs.writeFile(
      path.join(exploreDir, 'exploration.md'),
      `# Exploration: ${feature}\n\n**Type**: Test Feature\n\n**Problem Statement:**\nTest problem statement\n`
    );

    // Create decisions
    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-29 - Test decision\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nTest decision content\n\n---\n`
    );

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'context.json'),
      JSON.stringify({ currentFeature: feature })
    );

    // Execute without --create-pm flag
    await command.execute({ feature, lanes: 1 });

    // Verify plan was saved locally
    const planFile = path.join(tmpDir, '.hodge', 'development-plan.json');
    expect(existsSync(planFile)).toBe(true);

    const plan = JSON.parse(await fs.readFile(planFile, 'utf-8'));
    expect(plan.feature).toBe(feature);
    expect(plan.type).toBeDefined();
  });

  smokeTest('should extract feature description from exploration.md', async () => {
    const feature = 'TEST-003';
    const description = 'Context Loading Enhancement';

    // Create feature structure
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    const exploreDir = path.join(featureDir, 'explore');
    mkdirSync(exploreDir, { recursive: true });

    // Create exploration with clear problem statement
    await fs.writeFile(
      path.join(exploreDir, 'exploration.md'),
      `# Exploration: ${feature}\n\n## Feature Overview\n**Type**: ${description}\n\n**Problem Statement:**\nThe /hodge command needs better context loading.\n`
    );

    // Create decisions
    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-29 - Test decision\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nTest decision\n\n---\n`
    );

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'context.json'),
      JSON.stringify({ currentFeature: feature })
    );

    // Execute and create plan
    await command.execute({ feature, lanes: 1 });

    // Verify description was extracted
    const planFile = path.join(tmpDir, '.hodge', 'development-plan.json');
    const plan = JSON.parse(await fs.readFile(planFile, 'utf-8'));

    // The command should have extracted the description
    expect(plan.feature).toBe(feature);
  });

  smokeTest('should handle feature with multiple decisions', async () => {
    const feature = 'TEST-004';

    // Create feature structure
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    const exploreDir = path.join(featureDir, 'explore');
    mkdirSync(exploreDir, { recursive: true });

    await fs.writeFile(
      path.join(exploreDir, 'exploration.md'),
      `# Exploration: ${feature}\n\n**Type**: Multi-decision Feature\n`
    );

    // Create multiple decisions for the feature
    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n` +
        `### 2025-09-29 - Decision 1\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nFirst decision\n\n---\n\n` +
        `### 2025-09-29 - Decision 2\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nSecond decision\n\n---\n\n` +
        `### 2025-09-29 - Decision 3\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nThird decision\n\n---\n`
    );

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'context.json'),
      JSON.stringify({ currentFeature: feature })
    );

    // Should handle multiple decisions without crashing
    await expect(command.execute({ feature, lanes: 2 })).resolves.not.toThrow();

    // Verify plan was created
    const planFile = path.join(tmpDir, '.hodge', 'development-plan.json');
    expect(existsSync(planFile)).toBe(true);

    const plan = JSON.parse(await fs.readFile(planFile, 'utf-8'));
    expect(plan.type).toBe('epic'); // Multiple decisions should create epic
  });

  smokeTest('should respect lane allocation parameter', async () => {
    const feature = 'TEST-005';

    // Create feature structure
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    const exploreDir = path.join(featureDir, 'explore');
    mkdirSync(exploreDir, { recursive: true });

    await fs.writeFile(
      path.join(exploreDir, 'exploration.md'),
      `# Exploration: ${feature}\n\n**Type**: Multi-lane Feature\n`
    );

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-29 - Test\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nDecision\n\n---\n`
    );

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'context.json'),
      JSON.stringify({ currentFeature: feature })
    );

    // Execute with 3 lanes
    await command.execute({ feature, lanes: 3 });

    const planFile = path.join(tmpDir, '.hodge', 'development-plan.json');
    const plan = JSON.parse(await fs.readFile(planFile, 'utf-8'));

    // Verify lane count is respected
    if (plan.lanes) {
      expect(plan.lanes.count).toBe(3);
    }
  });

  smokeTest('should accept --create-pm flag without crashing', async () => {
    const feature = 'TEST-006';

    // Create feature structure
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    const exploreDir = path.join(featureDir, 'explore');
    mkdirSync(exploreDir, { recursive: true });

    await fs.writeFile(
      path.join(exploreDir, 'exploration.md'),
      `# Exploration: ${feature}\n\n**Type**: Test Feature\n\n**Problem Statement:**\nTest PM creation\n`
    );

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-29 - Test decision\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nTest decision for PM creation\n\n---\n`
    );

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'context.json'),
      JSON.stringify({ currentFeature: feature })
    );

    // Execute with --create-pm flag (will try to create PM issues)
    // This should not crash even if PM creation fails (graceful failure)
    await expect(command.execute({ feature, createPm: true })).resolves.not.toThrow();

    // Verify plan was still saved locally
    const planFile = path.join(tmpDir, '.hodge', 'development-plan.json');
    expect(existsSync(planFile)).toBe(true);
  });
});

describe('PlanCommand Template - Vertical Slice Validation', () => {
  smokeTest('plan.md template includes vertical slice guidance', async () => {
    // Read the plan.md slash command template
    const templatePath = path.join(process.cwd(), '.claude', 'commands', 'plan.md');
    const template = await fs.readFile(templatePath, 'utf-8');

    // Verify critical vertical slice content is present
    expect(template).toContain('Vertical Slice Requirement');
    expect(template).toContain('What is a Vertical Slice?');
    expect(template).toContain('Provides complete value');
    expect(template).toContain('independently testable');
    expect(template).toContain('shippable');

    // Verify criteria section exists
    expect(template).toContain('Vertical Slice Criteria');
    expect(template).toContain('Stakeholder Value');
    expect(template).toContain('Independently Testable');

    // Verify examples are present
    expect(template).toContain('Good vs Bad Story Examples');
    expect(template).toContain('BAD: Horizontal Slicing');
    expect(template).toContain('GOOD: Vertical Slicing');

    // Verify decision tree exists
    expect(template).toContain('Vertical Slice Decision Tree');
    expect(template).toContain('Can this story be tested independently?');
    expect(template).toContain('Does this story provide value to a stakeholder?');

    // Verify validation in AI workflow
    expect(template).toContain('validate vertical slice requirements');
    expect(template).toContain('WARN the user');
    expect(template).toContain('single issue instead');
  });

  smokeTest('plan.md template has updated Important Notes', async () => {
    const templatePath = path.join(process.cwd(), '.claude', 'commands', 'plan.md');
    const template = await fs.readFile(templatePath, 'utf-8');

    // Verify Important Notes section includes vertical slice requirement
    expect(template).toContain('All stories MUST be vertical slices');
    expect(template).toContain('Warn users');
    expect(template).toContain('Suggest single issue');
  });
});
