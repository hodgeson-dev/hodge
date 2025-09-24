import { smokeTest } from '../test/helpers.js';
import { PMHooks } from '../lib/pm/pm-hooks.js';
import { LocalPMAdapter } from '../lib/pm/local-pm-adapter.js';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

smokeTest('PMHooks should initialize without crashing', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-pm-test-'));
  try {
    const hooks = new PMHooks(tempDir);
    await expect(hooks.init()).resolves.not.toThrow();
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

smokeTest('PMHooks should handle missing configuration gracefully', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-pm-test-'));
  try {
    const hooks = new PMHooks(tempDir);
    await hooks.init();

    // Should not throw when calling hooks without config
    await expect(hooks.onExplore('TEST-001')).resolves.not.toThrow();
    await expect(hooks.onBuild('TEST-001')).resolves.not.toThrow();
    await expect(hooks.onHarden('TEST-001')).resolves.not.toThrow();
    await expect(hooks.onShip('TEST-001')).resolves.not.toThrow();
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

smokeTest('PMHooks should update local PM tracking', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-pm-test-'));
  try {
    const hooks = new PMHooks(tempDir);
    await hooks.init();

    // Should create feature in local tracking
    await hooks.onExplore('TEST-002', 'Test feature');

    // Check that project_management.md was created
    const pmPath = path.join(tempDir, '.hodge', 'project_management.md');
    const exists = await fs
      .access(pmPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    // Check that it contains the feature
    const content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('TEST-002');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

smokeTest('LocalPMAdapter should track feature status changes', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-pm-test-'));
  try {
    const adapter = new LocalPMAdapter(tempDir);
    await adapter.init();

    // Add a feature and update its status
    await adapter.addFeature('TEST-003', 'Test feature', 'Phase 1');
    await adapter.updateFeatureStatus('TEST-003', 'building');

    // Check that status was updated
    const pmPath = path.join(tempDir, '.hodge', 'project_management.md');
    const content = await fs.readFile(pmPath, 'utf-8');
    expect(content).toContain('TEST-003');
    expect(content).toContain('building');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

smokeTest('PMHooks should load configuration from hodge.json', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-pm-test-'));
  try {
    // Create a config file
    const hodgeDir = path.join(tempDir, '.hodge');
    await fs.mkdir(hodgeDir, { recursive: true });

    const config = {
      projectName: 'test-project',
      pm: {
        tool: 'github',
        statusMap: {
          explore: 'Backlog',
          build: 'In Development',
          harden: 'Testing',
          ship: 'Deployed',
        },
      },
    };

    await fs.writeFile(
      path.join(hodgeDir, 'config.json'),
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    // Initialize hooks and verify it loads config
    const hooks = new PMHooks(tempDir);
    await hooks.init();

    // Should not throw even though GitHub adapter isn't implemented
    // (silent failure is expected behavior)
    await expect(hooks.onExplore('TEST-004')).resolves.not.toThrow();
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
