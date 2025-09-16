/**
 * Test runners for integration and acceptance testing
 * Provides utilities to run actual commands and verify behavior
 */

import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';

const execAsync = promisify(exec);

/**
 * Run a command and capture output
 */
export async function runCommand(cmd: string, options: {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
} = {}) {
  const { cwd = process.cwd(), env = process.env, timeout = 10000 } = options;

  try {
    const result = await execAsync(cmd, {
      cwd,
      env: env as any,
      timeout,
      encoding: 'utf8'
    });

    return {
      success: true,
      exitCode: 0,
      output: result.stdout,
      error: result.stderr,
      combined: result.stdout + result.stderr
    };
  } catch (error: any) {
    return {
      success: false,
      exitCode: error.code || 1,
      output: error.stdout || '',
      error: error.stderr || error.message,
      combined: (error.stdout || '') + (error.stderr || error.message)
    };
  }
}

/**
 * Run a command in a specific directory
 */
export async function runInDir(dir: string, cmd: string, options: any = {}) {
  return runCommand(cmd, { ...options, cwd: dir });
}

/**
 * Run hodge command directly
 */
export async function runHodge(args: string, options: any = {}) {
  const hodgePath = path.join(process.cwd(), 'dist', 'src', 'bin', 'hodge.js');
  return runCommand(`node ${hodgePath} ${args}`, options);
}

/**
 * Run hodge command with TypeScript directly (for development)
 */
export async function runHodgeTS(args: string, options: any = {}) {
  return runCommand(`npx ts-node src/bin/hodge.ts ${args}`, options);
}

/**
 * Create a test workspace and run commands in it
 */
export class TestWorkspace {
  private dir: string;
  private cleanupFns: Array<() => Promise<void>> = [];

  constructor(name = 'test') {
    this.dir = path.join(os.tmpdir(), `hodge-test-${name}-${Date.now()}`);
  }

  async setup() {
    await fs.ensureDir(this.dir);

    // Initialize git
    await this.run('git init');
    await this.run('git config user.email "test@example.com"');
    await this.run('git config user.name "Test User"');

    // Create basic package.json
    await fs.writeJson(path.join(this.dir, 'package.json'), {
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        test: 'echo "test"',
        lint: 'echo "lint"',
        build: 'echo "build"'
      }
    });

    return this;
  }

  async run(cmd: string) {
    return runInDir(this.dir, cmd);
  }

  async hodge(args: string) {
    return runHodge(args, { cwd: this.dir });
  }

  async writeFile(filePath: string, content: string) {
    const fullPath = path.join(this.dir, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
  }

  async readFile(filePath: string) {
    return fs.readFile(path.join(this.dir, filePath), 'utf8');
  }

  async exists(filePath: string) {
    return fs.pathExists(path.join(this.dir, filePath));
  }

  async cleanup() {
    for (const fn of this.cleanupFns) {
      await fn();
    }
    await fs.remove(this.dir);
  }

  getPath(filePath = '') {
    return path.join(this.dir, filePath);
  }

  addCleanup(fn: () => Promise<void>) {
    this.cleanupFns.push(fn);
  }
}

/**
 * Run a test in an isolated workspace
 */
export async function withTestWorkspace(
  name: string,
  fn: (workspace: TestWorkspace) => Promise<void>
) {
  const workspace = new TestWorkspace(name);
  try {
    await workspace.setup();
    await fn(workspace);
  } finally {
    await workspace.cleanup();
  }
}

/**
 * Capture console output during a test
 */
export async function captureOutput(fn: () => Promise<void>) {
  const originalLog = console.log;
  const originalError = console.error;
  const output: string[] = [];
  const errors: string[] = [];

  console.log = (...args: any[]) => output.push(args.join(' '));
  console.error = (...args: any[]) => errors.push(args.join(' '));

  try {
    await fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  return {
    output: output.join('\n'),
    errors: errors.join('\n'),
    all: [...output, ...errors].join('\n')
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    message?: string;
  } = {}
) {
  const { timeout = 5000, interval = 100, message = 'Condition not met' } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout: ${message}`);
}

/**
 * Mock time-based operations
 */
export class TimeMock {
  private originalDate: typeof Date;
  private currentTime: number;

  constructor(initialTime = Date.now()) {
    this.originalDate = Date;
    this.currentTime = initialTime;
  }

  install() {
    (global as any).Date = class extends this.originalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(this.currentTime);
        } else {
          super(...args);
        }
      }

      static now() {
        return this.currentTime;
      }
    };
  }

  advance(ms: number) {
    this.currentTime += ms;
  }

  setTime(time: number) {
    this.currentTime = time;
  }

  restore() {
    (global as any).Date = this.originalDate;
  }
}