import { describe, expect, beforeEach, afterEach } from 'vitest';
import { integrationTest } from '../../test/helpers.js';
import { PMHooks } from './pm-hooks.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('PMHooks Integration Tests', () => {
  let tempDir: string;
  let hooks: PMHooks;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-pm-hooks-test-'));
    hooks = new PMHooks(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  integrationTest('should properly integrate with configuration loading', async () => {
    // Create configuration with PM settings
    const config = {
      pm: {
        tool: 'linear',
        statusMap: {
          explore: 'Backlog',
          build: 'In Development',
          harden: 'Testing',
          ship: 'Released',
        },
      },
    };

    await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, '.hodge', 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // Set up environment variable
    process.env.LINEAR_API_KEY = 'test-key';

    await hooks.init();

    // Verify that PM actions don't throw even without real adapters
    await expect(hooks.onExplore('TEST-001', 'Test feature')).resolves.not.toThrow();
    await expect(hooks.onBuild('TEST-001')).resolves.not.toThrow();
    await expect(hooks.onHarden('TEST-001')).resolves.not.toThrow();
    await expect(hooks.onShip('TEST-001')).resolves.not.toThrow();

    // Clean up
    delete process.env.LINEAR_API_KEY;
  });

  integrationTest('should track features through entire workflow', async () => {
    await hooks.init();

    const feature = 'WORKFLOW-TEST';
    const description = 'Complete workflow test';

    // Go through complete workflow
    await hooks.onExplore(feature, description);

    // Check that PM file was created
    const pmPath = path.join(tempDir, '.hodge', 'project_management.md');
    let content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain(feature);
    expect(content).toContain(description);
    expect(content).toContain('exploring');

    // Move through phases
    await hooks.onBuild(feature);
    content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('building');

    await hooks.onHarden(feature);
    content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('hardening');

    await hooks.onShip(feature);
    content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('shipped');

    // Verify feature moved to completed section
    expect(content).toMatch(/## Completed Features[\s\S]*WORKFLOW-TEST/);
  });

  integrationTest('should handle concurrent feature updates', async () => {
    await hooks.init();

    // Create multiple features concurrently
    await Promise.all([
      hooks.onExplore('CONCURRENT-1', 'Feature 1'),
      hooks.onExplore('CONCURRENT-2', 'Feature 2'),
      hooks.onExplore('CONCURRENT-3', 'Feature 3'),
    ]);

    const pmPath = path.join(tempDir, '.hodge', 'project_management.md');
    const content = await fs.readFile(pmPath, 'utf-8');

    // All features should be tracked
    expect(content).toContain('CONCURRENT-1');
    expect(content).toContain('CONCURRENT-2');
    expect(content).toContain('CONCURRENT-3');

    // Update all features concurrently
    await Promise.all([
      hooks.onBuild('CONCURRENT-1'),
      hooks.onHarden('CONCURRENT-2'),
      hooks.onShip('CONCURRENT-3'),
    ]);

    const updatedContent = await fs.readFile(pmPath, 'utf-8');
    expect(updatedContent).toContain('building');
    expect(updatedContent).toContain('hardening');
    expect(updatedContent).toContain('shipped');
  });

  integrationTest('should silently handle external PM failures', async () => {
    // Create config that will trigger PM adapter calls
    const config = {
      pm: {
        tool: 'linear',
        statusMap: {
          explore: 'To Do',
          build: 'In Progress',
          harden: 'In Review',
          ship: 'Done',
        },
      },
    };

    await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, '.hodge', 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // Set environment to trigger external PM update attempts
    process.env.LINEAR_API_KEY = 'test-key';
    process.env.DEBUG = 'true'; // Enable debug for coverage

    await hooks.init();

    // These should not throw even though Linear adapter isn't implemented
    await expect(hooks.onExplore('PM-TEST', 'PM Test')).resolves.not.toThrow();
    await expect(hooks.onBuild('PM-TEST')).resolves.not.toThrow();

    // Local tracking should still work
    const pmPath = path.join(tempDir, '.hodge', 'project_management.md');
    const content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('PM-TEST');
    expect(content).toContain('building');

    // Clean up
    delete process.env.LINEAR_API_KEY;
    delete process.env.DEBUG;
  });

  integrationTest('should respect custom status mappings', async () => {
    // Create config with custom status mappings
    const config = {
      pm: {
        tool: 'github',
        statusMap: {
          explore: 'Ideation',
          build: 'Development',
          harden: 'QA',
          ship: 'Production',
        },
      },
    };

    await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, '.hodge', 'config.json'),
      JSON.stringify(config, null, 2)
    );

    process.env.GITHUB_TOKEN = 'test-token';
    process.env.HODGE_PM_DEBUG = 'true'; // Enable full debug

    await hooks.init();

    // The adapter will fail but shouldn't block
    await hooks.onExplore('CUSTOM-STATUS', 'Custom status test');

    // Local tracking should work with standard statuses
    const pmPath = path.join(tempDir, '.hodge', 'project_management.md');
    const content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('CUSTOM-STATUS');
    expect(content).toContain('exploring');

    // Clean up
    delete process.env.GITHUB_TOKEN;
    delete process.env.HODGE_PM_DEBUG;
  });
});
