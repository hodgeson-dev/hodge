/**
 * Smoke tests for HODGE-370: Complete test isolation fixes
 * Verifies that contextManager singleton is eliminated and all commands use basePath injection
 */

import { smokeTest } from '../test/helpers.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { ContextManager } from './context-manager.js';
import { BuildCommand } from '../commands/build.js';
import { HardenCommand } from '../commands/harden.js';
import { ShipCommand } from '../commands/ship.js';

smokeTest('ContextManager should be instantiable with basePath', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const contextManager = new ContextManager(testDir);
  expect(contextManager).toBeDefined();

  await fixture.cleanup();
});

smokeTest('BuildCommand should accept basePath in constructor', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const buildCommand: BuildCommand = new BuildCommand(testDir);
  expect(buildCommand).toBeDefined();
  expect(typeof buildCommand.execute).toBe('function');

  await fixture.cleanup();
});

smokeTest('HardenCommand should accept basePath in constructor', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const hardenCommand: HardenCommand = new HardenCommand(testDir);
  expect(hardenCommand).toBeDefined();
  expect(typeof hardenCommand.execute).toBe('function');

  await fixture.cleanup();
});

smokeTest('ShipCommand should accept basePath in constructor', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const shipCommand: ShipCommand = new ShipCommand(testDir);
  expect(shipCommand).toBeDefined();
  expect(typeof shipCommand.execute).toBe('function');

  await fixture.cleanup();
});

smokeTest('ContextManager should use provided basePath for file operations', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const contextManager: ContextManager = new ContextManager(testDir);

  // Save context - should create files in testDir, not project root
  await contextManager.save({ feature: 'TEST-001', mode: 'explore' });

  // Verify file was created in test directory
  const contextFile: string = await fixture.readFile('.hodge/context.json');
  expect(contextFile).toBeDefined();
  expect(contextFile).toContain('TEST-001');

  await fixture.cleanup();
});

smokeTest('Multiple ContextManager instances should operate independently', async () => {
  const fixture1 = new TempDirectoryFixture();
  const fixture2 = new TempDirectoryFixture();
  const testDir1 = await fixture1.setup();
  const testDir2 = await fixture2.setup();

  const manager1: ContextManager = new ContextManager(testDir1);
  const manager2: ContextManager = new ContextManager(testDir2);

  // Write different data to each
  await manager1.save({ feature: 'TEST-001', mode: 'explore' });
  await manager2.save({ feature: 'TEST-002', mode: 'build' });

  // Verify isolation - each manager reads from its own directory
  const context1 = await manager1.load();
  const context2 = await manager2.load();

  expect(context1.feature).toBe('TEST-001');
  expect(context2.feature).toBe('TEST-002');

  await fixture1.cleanup();
  await fixture2.cleanup();
});
