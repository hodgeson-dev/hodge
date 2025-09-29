/**
 * Mock factories for testing
 * Provides easy-to-use mock creators for common dependencies
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from 'vitest';

/**
 * Create a mock file system with sensible defaults
 */
export function createMockFs(
  options: {
    exists?: boolean;
    content?: string;
    files?: string[];
    throwOn?: string[];
  } = {}
) {
  const { exists = false, content = '', files = [], throwOn = [] } = options;

  return {
    existsSync: vi.fn((_path: string) => {
      if (throwOn.includes('existsSync')) throw new Error('Mock error');
      return exists;
    }),
    promises: {
      readFile: vi.fn(async (_path: string) => {
        if (throwOn.includes('readFile')) throw new Error('Mock error');
        return content;
      }),
      writeFile: vi.fn(async (_path: string, _data: string) => {
        if (throwOn.includes('writeFile')) throw new Error('Mock error');
      }),
      mkdir: vi.fn(async (_path: string, _options?: any) => {
        if (throwOn.includes('mkdir')) throw new Error('Mock error');
      }),
      readdir: vi.fn(async (_path: string) => {
        if (throwOn.includes('readdir')) throw new Error('Mock error');
        return files;
      }),
      access: vi.fn(async (_path: string) => {
        if (throwOn.includes('access')) throw new Error('Mock error');
        if (!exists) throw new Error('ENOENT');
      }),
      appendFile: vi.fn(async (_path: string, _data: string) => {
        if (throwOn.includes('appendFile')) throw new Error('Mock error');
      }),
      rm: vi.fn(async (_path: string, _options?: any) => {
        if (throwOn.includes('rm')) throw new Error('Mock error');
      }),
    },
  };
}

/**
 * Create a mock cache manager
 */
export function createMockCache(
  options: {
    hits?: Map<string, any>;
    ttl?: number;
  } = {}
) {
  const { hits = new Map() } = options;

  return {
    get: vi.fn((key: string) => hits.get(key)),
    set: vi.fn((key: string, value: any) => hits.set(key, value)),
    clear: vi.fn(() => hits.clear()),
    getOrLoad: vi.fn(async (key: string, loader: () => Promise<any>) => {
      if (hits.has(key)) return hits.get(key);
      const value = await loader();
      hits.set(key, value);
      return value;
    }),
    invalidate: vi.fn((pattern?: string) => {
      if (!pattern) {
        hits.clear();
      } else {
        const regex = new RegExp(pattern);
        for (const key of hits.keys()) {
          if (regex.test(key)) hits.delete(key);
        }
      }
    }),
    getStats: vi.fn(() => ({
      hits: 10,
      misses: 5,
      hitRate: 0.67,
      size: hits.size,
      memoryUsage: 1024,
    })),
  };
}

/**
 * Create a mock console with output capture
 */
export function createMockConsole() {
  const output: string[] = [];
  const errors: string[] = [];

  return {
    log: vi.fn((...args: any[]) => {
      output.push(args.join(' '));
    }),
    error: vi.fn((...args: any[]) => {
      errors.push(args.join(' '));
    }),
    warn: vi.fn((...args: any[]) => {
      output.push(`WARN: ${args.join(' ')}`);
    }),
    info: vi.fn((...args: any[]) => {
      output.push(`INFO: ${args.join(' ')}`);
    }),
    getOutput: () => output.join('\n'),
    getErrors: () => errors.join('\n'),
    clear: () => {
      output.length = 0;
      errors.length = 0;
    },
  };
}

/**
 * Create a mock git interface
 */
export function createMockGit(
  options: {
    branch?: string;
    files?: string[];
    status?: string;
    remote?: string;
  } = {}
) {
  const { branch = 'main', files = [], status = 'clean', remote = 'origin' } = options;

  return {
    branch: vi.fn(() => branch),
    status: vi.fn(() => status),
    diff: vi.fn(() => files.join('\n')),
    add: vi.fn(),
    commit: vi.fn(),
    push: vi.fn(),
    remote: vi.fn(() => remote),
    log: vi.fn(() => 'commit abc123\nAuthor: Test\nDate: Today\n\nTest commit'),
  };
}

/**
 * Create a mock PM adapter
 */
export function createMockPM(
  options: {
    issues?: Map<string, any>;
    canConnect?: boolean;
  } = {}
) {
  const { issues = new Map(), canConnect = true } = options;

  return {
    test: vi.fn(async () => canConnect),
    findIssue: vi.fn(async (id: string) => issues.get(id)),
    createIssue: vi.fn(async (data: any) => {
      const id = `TEST-${Date.now()}`;
      issues.set(id, { id, ...data });
      return { id, ...data };
    }),
    updateIssue: vi.fn(async (id: string, data: any) => {
      const issue = issues.get(id);
      if (!issue) throw new Error('Issue not found');
      const updated = { ...issue, ...data };
      issues.set(id, updated);
      return updated;
    }),
    getIssues: () => issues,
  };
}

/**
 * Create a mock chalk for testing colorized output
 */
export function createMockChalk() {
  const identity = (str: string) => str;

  return {
    blue: Object.assign(identity, { bold: identity }),
    green: Object.assign(identity, { bold: identity }),
    yellow: Object.assign(identity, { bold: identity }),
    red: Object.assign(identity, { bold: identity }),
    cyan: Object.assign(identity, { bold: identity }),
    gray: identity,
    dim: identity,
    bold: identity,
    underline: identity,
    italic: identity,
  };
}

/**
 * Create a complete mock environment
 */
export function createMockEnvironment(options: any = {}) {
  return {
    fs: createMockFs(options.fs),
    cache: createMockCache(options.cache),
    console: createMockConsole(),
    git: createMockGit(options.git),
    pm: createMockPM(options.pm),
    chalk: createMockChalk(),
  };
}
