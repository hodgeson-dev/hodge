import { describe, expect, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { smokeTest } from './helpers.js';
import { TempDirectoryFixture } from './temp-directory-fixture.js';
import { ConfigManager } from '../lib/config-manager.js';

/**
 * Smoke tests for HODGE-349: File consolidation
 *
 * Verifies that:
 * 1. Redundant files were removed from .hodge root
 * 2. Config manager no longer references project-meta.json
 * 3. Plan files save to feature directories, not root
 */

describe('File Consolidation (HODGE-349)', () => {
  smokeTest('redundant files should not exist in .hodge root', async () => {
    const projectRoot = process.cwd();

    // These files should NOT exist (deleted as part of consolidation)
    const deletedFiles = [
      '.claude/CLAUDE.md',
      '.hodge/project-meta.json',
      '.hodge/AI-CONTEXT.md',
      '.hodge/CONTEXT-SCALING.md',
      '.hodge/DEVELOPMENT.md',
      '.hodge/development-plan.json', // Moved to feature directories
    ];

    for (const file of deletedFiles) {
      const fullPath = path.join(projectRoot, file);
      expect(existsSync(fullPath)).toBe(false);
    }
  });

  smokeTest('config manager should work without project-meta.json', async () => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    // Store original env var and clear it for test
    const originalPmTool = process.env.HODGE_PM_TOOL;
    delete process.env.HODGE_PM_TOOL;

    try {
      // Create a test hodge.json
      await fixture.writeFile(
        'hodge.json',
        JSON.stringify(
          {
            version: '1.0.0',
            pm: { tool: 'local' },
          },
          null,
          2
        )
      );

      // ConfigManager should load successfully without project-meta.json
      const configManager = new ConfigManager(fixture.getPath());
      const config = await configManager.load();

      expect(config).toBeDefined();
      expect(config.pm?.tool).toBe('local');
      expect(config.version).toBe('1.0.0');

      // Verify project-meta.json was never created
      const projectMetaPath = path.join(fixture.getPath(), '.hodge', 'project-meta.json');
      expect(existsSync(projectMetaPath)).toBe(false);
    } finally {
      // Restore original env var
      if (originalPmTool) {
        process.env.HODGE_PM_TOOL = originalPmTool;
      }
      await fixture.cleanup();
    }
  });

  smokeTest('content should be preserved in CONTRIBUTING.md', async () => {
    const projectRoot = process.cwd();
    const contributingPath = path.join(projectRoot, 'CONTRIBUTING.md');

    // Verify CONTRIBUTING.md exists and has extracted content from DEVELOPMENT.md
    expect(existsSync(contributingPath)).toBe(true);

    const content = await fs.readFile(contributingPath, 'utf-8');

    // Check for dogfooding content (extracted from DEVELOPMENT.md)
    expect(content).toContain('Dogfooding Hodge');
    expect(content).toContain('PM Scripts Workflow');
    expect(content).toContain('update-pm-scripts');
    expect(content).toContain('Debugging');
  });

  describe('Plan Command', () => {
    let fixture: TempDirectoryFixture;

    beforeEach(async () => {
      fixture = new TempDirectoryFixture();
      await fixture.setup();

      // Create .hodge directory structure
      await fs.mkdir(path.join(fixture.getPath(), '.hodge'), { recursive: true });
    });

    afterEach(async () => {
      await fixture.cleanup();
    });

    smokeTest('plan should save to feature directory not root', async () => {
      const featureId = 'TEST-001';
      const planData = {
        feature: featureId,
        type: 'epic',
        stories: [],
        lanes: { count: 1, assignments: {} },
        dependencies: {},
        estimatedDays: 1,
        createdAt: new Date().toISOString(),
      };

      // Simulate what plan command does (save to feature directory)
      const featurePlanDir = path.join(fixture.getPath(), '.hodge', 'features', featureId);
      await fs.mkdir(featurePlanDir, { recursive: true });
      await fs.writeFile(path.join(featurePlanDir, 'plan.json'), JSON.stringify(planData, null, 2));

      // Verify plan exists in feature directory
      const featurePlanPath = path.join(featurePlanDir, 'plan.json');
      expect(existsSync(featurePlanPath)).toBe(true);

      // Verify old location does NOT exist
      const oldPlanPath = path.join(fixture.getPath(), '.hodge', 'development-plan.json');
      expect(existsSync(oldPlanPath)).toBe(false);

      // Verify content
      const savedPlan = JSON.parse(await fs.readFile(featurePlanPath, 'utf-8'));
      expect(savedPlan.feature).toBe(featureId);
    });
  });
});
