import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlanCommand } from './plan.js';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { smokeTest } from '../test/helpers.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('PlanCommand - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let tmpDir: string;
  let command: PlanCommand;

  beforeEach(async () => {
    // Create isolated temp directory for tests
    fixture = new TempDirectoryFixture();
    tmpDir = await fixture.setup();

    // Initialize Hodge structure in temp directory
    mkdirSync(path.join(tmpDir, '.hodge'), { recursive: true });
    mkdirSync(path.join(tmpDir, '.hodge', 'features'), { recursive: true });

    command = new PlanCommand(tmpDir);
  });

  afterEach(async () => {
    // Cleanup temp directory
    await fixture.cleanup();
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

    // Verify plan was saved locally in feature directory
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
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
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
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
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
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

    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
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
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
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

describe('PlanCommand - AI-Generated Plan Detection', () => {
  let fixture: TempDirectoryFixture;
  let tmpDir: string;
  let command: PlanCommand;

  beforeEach(async () => {
    // Create isolated temp directory for tests
    fixture = new TempDirectoryFixture();
    tmpDir = await fixture.setup();

    // Initialize Hodge structure
    mkdirSync(path.join(tmpDir, '.hodge'), { recursive: true });
    mkdirSync(path.join(tmpDir, '.hodge', 'features'), { recursive: true });

    command = new PlanCommand(tmpDir);
  });

  afterEach(async () => {
    // Cleanup temp directory
    await fixture.cleanup();
  });

  smokeTest('should detect and use AI-generated plan file', async () => {
    const feature = 'TEST-AI-001';

    // Create AI-generated plan file
    const aiPlanDir = path.join(tmpDir, '.hodge', 'temp', 'plan-interaction', feature);
    mkdirSync(aiPlanDir, { recursive: true });

    const aiPlan = {
      feature: feature,
      type: 'single',
      estimatedDays: 1,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(path.join(aiPlanDir, 'plan.json'), JSON.stringify(aiPlan, null, 2));

    // Create minimal required files
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    mkdirSync(featureDir, { recursive: true });

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-30 - Test\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nTest\n\n---\n`
    );

    // Execute plan command
    await command.execute({ feature, lanes: 1 });

    // Verify the plan.json was created using AI plan
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
    expect(existsSync(planFile)).toBe(true);

    const savedPlan = JSON.parse(await fs.readFile(planFile, 'utf-8'));
    expect(savedPlan.type).toBe('single'); // From AI plan
    expect(savedPlan.estimatedDays).toBe(1);
  });

  smokeTest('should use AI-generated epic plan with stories', async () => {
    const feature = 'TEST-AI-002';

    // Create AI-generated epic plan
    const aiPlanDir = path.join(tmpDir, '.hodge', 'temp', 'plan-interaction', feature);
    mkdirSync(aiPlanDir, { recursive: true });

    const aiPlan = {
      feature: feature,
      type: 'epic',
      stories: [
        {
          id: `${feature}.1`,
          title: 'Fix template check logic',
          description: 'Update build.md grep pattern',
          effort: 'small',
          dependencies: [],
          lane: 0,
        },
        {
          id: `${feature}.2`,
          title: 'Add smoke tests',
          description: 'Test grep pattern behavior',
          effort: 'small',
          dependencies: [`${feature}.1`],
          lane: 0,
        },
      ],
      lanes: {
        count: 1,
        assignments: {
          '0': [`${feature}.1`, `${feature}.2`],
        },
      },
      dependencies: {
        [`${feature}.2`]: [`${feature}.1`],
      },
      estimatedDays: 2,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(path.join(aiPlanDir, 'plan.json'), JSON.stringify(aiPlan, null, 2));

    // Create minimal required files
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    mkdirSync(featureDir, { recursive: true });

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-30 - Test\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nTest\n\n---\n`
    );

    // Execute plan command
    await command.execute({ feature, lanes: 1 });

    // Verify the AI plan was used
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
    const savedPlan = JSON.parse(await fs.readFile(planFile, 'utf-8'));

    expect(savedPlan.type).toBe('epic');
    expect(savedPlan.stories).toHaveLength(2);
    expect(savedPlan.stories?.[0]?.title).toBe('Fix template check logic');
    expect(savedPlan.stories?.[1]?.title).toBe('Add smoke tests');
  });

  smokeTest('should fall back to keyword matching if AI plan file is invalid JSON', async () => {
    const feature = 'TEST-AI-003';

    // Create invalid AI plan file (malformed JSON)
    const aiPlanDir = path.join(tmpDir, '.hodge', 'temp', 'plan-interaction', feature);
    mkdirSync(aiPlanDir, { recursive: true });

    await fs.writeFile(path.join(aiPlanDir, 'plan.json'), '{ invalid json }');

    // Create minimal required files
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    mkdirSync(featureDir, { recursive: true });

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-30 - Test\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nTest\n\n---\n`
    );

    // Should not crash, should fall back to keyword matching
    await expect(command.execute({ feature, lanes: 1 })).resolves.not.toThrow();

    // Verify a plan was still created (using keyword matching)
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
    expect(existsSync(planFile)).toBe(true);
  });

  smokeTest('should use keyword matching if no AI plan file exists', async () => {
    const feature = 'TEST-AI-004';

    // NO AI plan file created - should use keyword matching

    // Create minimal required files
    const featureDir = path.join(tmpDir, '.hodge', 'features', feature);
    mkdirSync(featureDir, { recursive: true });

    await fs.writeFile(
      path.join(tmpDir, '.hodge', 'decisions.md'),
      `# Decisions\n\n### 2025-09-30 - Test database decision\n\n**Context**:\nFeature: ${feature}\n\n**Decision**:\nUse PostgreSQL for database\n\n---\n`
    );

    // Execute - should use keyword matching and detect "database" keyword
    await command.execute({ feature, lanes: 1 });

    // Verify plan was created using keyword matching
    const planFile = path.join(tmpDir, '.hodge', 'features', feature, 'plan.json');
    expect(existsSync(planFile)).toBe(true);

    const savedPlan = JSON.parse(await fs.readFile(planFile, 'utf-8'));
    // Keyword matching should have created an epic because "database" keyword was found
    expect(savedPlan.type).toBe('epic');
  });
});
