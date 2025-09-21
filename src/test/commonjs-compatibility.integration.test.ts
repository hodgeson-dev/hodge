import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('CommonJS Compatibility [integration]', () => {
  let testDir: string;
  const hodgePath = path.join(__dirname, '../../dist/src/bin/hodge.js');

  beforeEach(async () => {
    // Create isolated test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-commonjs-test-'));
  });

  afterEach(async () => {
    // Cleanup
    await fs.remove(testDir);
  });

  it('should execute full hodge workflow without CommonJS warnings', async () => {
    // Initialize hodge project
    const initResult = execSync(`node ${hodgePath} init --force 2>&1`, {
      encoding: 'utf-8',
      cwd: testDir,
    });

    expect(initResult).not.toContain('ExperimentalWarning');
    expect(fs.existsSync(path.join(testDir, '.hodge'))).toBe(true);

    // Run explore command
    const exploreResult = execSync(`node ${hodgePath} explore test-feature 2>&1`, {
      encoding: 'utf-8',
      cwd: testDir,
    });

    expect(exploreResult).not.toContain('ExperimentalWarning');
    expect(exploreResult).not.toContain('CommonJS module');

    // Run build command
    const buildResult = execSync(`node ${hodgePath} build test-feature 2>&1`, {
      encoding: 'utf-8',
      cwd: testDir,
    });

    expect(buildResult).not.toContain('ExperimentalWarning');
    expect(buildResult).not.toContain('loading ES Module');
  });

  it('should handle all primary commands without warnings', async () => {
    // Initialize project first
    execSync(`node ${hodgePath} init --force`, {
      encoding: 'utf-8',
      cwd: testDir,
    });

    // Test primary commands
    const commands = ['--help', 'explore test-feature', 'build test-feature', 'decide 1'];

    for (const cmd of commands) {
      const result = execSync(`node ${hodgePath} ${cmd} 2>&1`, {
        encoding: 'utf-8',
        cwd: testDir,
      });

      expect(result).not.toContain('ExperimentalWarning');
      expect(result).not.toContain('loading ES Module');
    }
  });

  it('should work with package.json chalk dependency', async () => {
    // Verify our downgraded chalk version works in temp project
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        chalk: '^4.1.2',
      },
    };

    await fs.writeJson(path.join(testDir, 'package.json'), packageJson);

    // Create a simple test file
    const testScript = `
      const chalk = require('chalk');
      console.log(chalk.green('✓ Success'));
    `;

    await fs.writeFile(path.join(testDir, 'test.js'), testScript);

    // Copy node_modules chalk to temp dir (avoid npm install in test)
    const chalkPath = path.join(__dirname, '../../node_modules/chalk');
    const targetModulesPath = path.join(testDir, 'node_modules');
    await fs.ensureDir(targetModulesPath);
    await fs.copy(chalkPath, path.join(targetModulesPath, 'chalk'));

    // Also copy chalk's dependencies
    const chalkDeps = ['ansi-styles', 'supports-color', 'has-flag'];
    for (const dep of chalkDeps) {
      const depPath = path.join(__dirname, '../../node_modules', dep);
      if (await fs.pathExists(depPath)) {
        await fs.copy(depPath, path.join(targetModulesPath, dep));
      }
    }

    const result = execSync(`node test.js 2>&1`, {
      encoding: 'utf-8',
      cwd: testDir,
    });

    expect(result).not.toContain('ExperimentalWarning');
    expect(result).toContain('✓ Success');
  });
});
