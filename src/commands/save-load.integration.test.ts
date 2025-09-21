import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SaveCommand } from './save.js';
import { LoadCommand } from './load.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Save/Load Commands [integration]', () => {
  let testDir: string;
  let originalDir: string;

  beforeEach(async () => {
    // Save original directory
    originalDir = process.cwd();

    // Create isolated test directory - NEVER touch the project's .hodge directory
    testDir = join(tmpdir(), `hodge-integration-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, '.hodge'), { recursive: true });
    await fs.mkdir(join(testDir, '.hodge', 'saves'), { recursive: true });
    await fs.mkdir(join(testDir, '.hodge', 'features'), { recursive: true });

    // Initialize git repo for testing (SaveManager uses git commands)
    await execAsync('git init', { cwd: testDir });
    await execAsync('git config user.email "test@example.com"', { cwd: testDir });
    await execAsync('git config user.name "Test User"', { cwd: testDir });

    // Create some test files to save
    await fs.writeFile(join(testDir, 'test.ts'), 'console.log("test");');
    await execAsync('git add .', { cwd: testDir });
    await execAsync('git commit -m "initial"', { cwd: testDir });

    // Create context for testing
    const context = {
      feature: 'TEST-INTEGRATION',
      mode: 'build',
      timestamp: new Date().toISOString(),
      lastCommand: 'test',
    };
    await fs.writeFile(join(testDir, '.hodge', 'context.json'), JSON.stringify(context, null, 2));

    // Create decisions file
    await fs.writeFile(
      join(testDir, '.hodge', 'decisions.md'),
      '# Decisions\n\n### 2025-01-01 - Test Decision\n\nTest decision content'
    );

    // Create standards file
    await fs.writeFile(join(testDir, '.hodge', 'standards.md'), '# Standards\n\nTest standards');
  });

  afterEach(async () => {
    // Clean up test directory
    if (testDir && testDir.includes('hodge-integration-test')) {
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should save and load a session successfully', async () => {
    // Create commands with test directory
    const saveCommand = new SaveCommand();
    const loadCommand = new LoadCommand();

    // Mock the basePath for the commands to use test directory
    const originalCwd = process.cwd;
    process.cwd = () => testDir;

    try {
      // Save a session
      await saveCommand.execute('integration-test-save');

      // Verify save was created
      const saves = await fs.readdir(join(testDir, '.hodge', 'saves'));
      expect(saves).toContain('integration-test-save');

      // Verify manifest was created
      const manifestPath = join(
        testDir,
        '.hodge',
        'saves',
        'integration-test-save',
        'manifest.json'
      );
      const manifestExists = await fs
        .access(manifestPath)
        .then(() => true)
        .catch(() => false);
      expect(manifestExists).toBe(true);

      // Load the session
      await loadCommand.execute('integration-test-save');

      // Verify context was updated
      const contextPath = join(testDir, '.hodge', 'context.json');
      const context = JSON.parse(await fs.readFile(contextPath, 'utf-8'));
      expect(context.lastCommand).toBe('load integration-test-save');
    } finally {
      process.cwd = originalCwd;
    }
  });

  it('should handle minimal saves efficiently', async () => {
    const saveCommand = new SaveCommand();
    const originalCwd = process.cwd;
    process.cwd = () => testDir;

    try {
      const startTime = Date.now();

      // Create minimal save
      await saveCommand.execute('minimal-integration-test', { minimal: true });

      const elapsed = Date.now() - startTime;

      // Should be very fast for minimal save
      expect(elapsed).toBeLessThan(500);

      // Verify only manifest exists (minimal save)
      const saveDir = join(testDir, '.hodge', 'saves', 'minimal-integration-test');
      const files = await fs.readdir(saveDir);
      expect(files).toContain('manifest.json');

      // Manifest should be valid
      const manifest = JSON.parse(await fs.readFile(join(saveDir, 'manifest.json'), 'utf-8'));
      expect(manifest.version).toBe('2.0');
      expect(manifest.type).toBeDefined();
    } finally {
      process.cwd = originalCwd;
    }
  });

  it('should list saves correctly', async () => {
    const saveCommand = new SaveCommand();
    const loadCommand = new LoadCommand();
    const originalCwd = process.cwd;
    process.cwd = () => testDir;

    try {
      // Create multiple saves
      await saveCommand.execute('list-test-1');
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      await saveCommand.execute('list-test-2');
      await saveCommand.execute('list-test-3', { minimal: true });

      // Mock console.log to capture output
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.join(' '));
      };

      try {
        // List saves
        await loadCommand.execute(undefined, { list: true });

        // Verify all saves are listed
        const output = logs.join('\n');
        expect(output).toContain('list-test-1');
        expect(output).toContain('list-test-2');
        expect(output).toContain('list-test-3');
        expect(output).toContain('3 saved sessions');
      } finally {
        console.log = originalLog;
      }
    } finally {
      process.cwd = originalCwd;
    }
  });

  it('should load most recent save automatically', async () => {
    const saveCommand = new SaveCommand();
    const loadCommand = new LoadCommand();
    const originalCwd = process.cwd;
    process.cwd = () => testDir;

    try {
      // Create saves with delays to ensure order
      await saveCommand.execute('old-save');
      await new Promise((resolve) => setTimeout(resolve, 100));
      await saveCommand.execute('recent-save');

      // Load most recent
      await loadCommand.execute(undefined, { recent: true });

      // Check that context was updated with most recent
      const context = JSON.parse(
        await fs.readFile(join(testDir, '.hodge', 'context.json'), 'utf-8')
      );
      expect(context.lastCommand).toBe('load recent-save');
    } finally {
      process.cwd = originalCwd;
    }
  });

  it('should preserve session metadata through save/load cycle', async () => {
    const saveCommand = new SaveCommand();
    const loadCommand = new LoadCommand();
    const originalCwd = process.cwd;
    process.cwd = () => testDir;

    try {
      // Set up specific context
      const testContext = {
        feature: 'METADATA-TEST',
        mode: 'harden',
        timestamp: new Date().toISOString(),
        lastCommand: 'test-command',
        lastSave: 'previous-save',
      };
      await fs.writeFile(
        join(testDir, '.hodge', 'context.json'),
        JSON.stringify(testContext, null, 2)
      );

      // Save
      await saveCommand.execute('metadata-test-save');

      // Load
      await loadCommand.execute('metadata-test-save');

      // Verify metadata preserved
      const manifest = JSON.parse(
        await fs.readFile(
          join(testDir, '.hodge', 'saves', 'metadata-test-save', 'manifest.json'),
          'utf-8'
        )
      );

      expect(manifest.session.feature).toBe('METADATA-TEST');
      expect(manifest.session.phase).toBe('harden');
      expect(manifest.session.lastAction).toBe('test-command');
    } finally {
      process.cwd = originalCwd;
    }
  });
});
