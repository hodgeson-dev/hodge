/**
 * Test helpers and utilities
 * Common functions for writing better tests
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { expect, it } from 'vitest';

/**
 * Test categories for progressive testing
 */
export const TestCategory = {
  SMOKE: 'smoke',
  INTEGRATION: 'integration',
  UNIT: 'unit',
  ACCEPTANCE: 'acceptance',
} as const;

/**
 * Mark a test with its category
 */
export function testCategory(category: string, name: string): string {
  return `[${category}] ${name}`;
}

/**
 * Create a smoke test
 */
export function smokeTest(name: string, fn: () => void | Promise<void>): void {
  return it(testCategory(TestCategory.SMOKE, name), fn);
}

/**
 * Create an integration test
 */
export function integrationTest(name: string, fn: () => void | Promise<void>): void {
  return it(testCategory(TestCategory.INTEGRATION, name), fn);
}

/**
 * Create a unit test
 */
export function unitTest(name: string, fn: () => void | Promise<void>): void {
  return it(testCategory(TestCategory.UNIT, name), fn);
}

/**
 * Create an acceptance test
 */
export function acceptanceTest(name: string, fn: () => void | Promise<void>): void {
  return it(testCategory(TestCategory.ACCEPTANCE, name), fn);
}

/**
 * Test that a function doesn't throw
 */
export async function doesNotThrow(fn: () => Promise<unknown>): Promise<void> {
  let threw = false;
  let error: unknown;

  try {
    await fn();
  } catch (e) {
    threw = true;
    error = e;
  }

  if (threw) {
    throw new Error(`Expected function not to throw, but it threw: ${String(error)}`);
  }
}

/**
 * Test that a function throws with a specific message
 */
export async function throwsWithMessage(
  fn: () => Promise<unknown>,
  message: string | RegExp
): Promise<void> {
  let threw = false;
  let error: unknown;

  try {
    await fn();
  } catch (e) {
    threw = true;
    error = e;
  }

  if (!threw) {
    throw new Error('Expected function to throw, but it did not');
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  if (typeof message === 'string') {
    expect(errorMessage).toContain(message);
  } else {
    expect(errorMessage).toMatch(message);
  }
}

/**
 * Test output contains expected strings
 */
export function outputContains(output: string, expected: string[]) {
  for (const str of expected) {
    expect(output).toContain(str);
  }
}

/**
 * Test output matches snapshot-like structure
 */
export function outputMatches(
  output: string,
  pattern: {
    includes?: string[];
    excludes?: string[];
    startsWith?: string;
    endsWith?: string;
    lineCount?: number;
  }
): void {
  const { includes = [], excludes = [], startsWith, endsWith, lineCount } = pattern;

  for (const str of includes) {
    expect(output).toContain(str);
  }

  for (const str of excludes) {
    expect(output).not.toContain(str);
  }

  if (startsWith) {
    expect(output).toMatch(new RegExp(`^${escapeRegex(startsWith)}`));
  }

  if (endsWith) {
    expect(output).toMatch(new RegExp(`${escapeRegex(endsWith)}$`));
  }

  if (lineCount !== undefined) {
    const lines = output.split('\n');
    expect(lines.length).toBe(lineCount);
  }
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create a test fixture
 */
export class Fixture<T> {
  private setupFn?: () => T | Promise<T>;
  private teardownFn?: (data: T) => void | Promise<void>;
  private data?: T;

  setup(fn: () => T | Promise<T>) {
    this.setupFn = fn;
    return this;
  }

  teardown(fn: (data: T) => void | Promise<void>) {
    this.teardownFn = fn;
    return this;
  }

  async before() {
    if (this.setupFn) {
      this.data = await this.setupFn();
    }
    return this.data;
  }

  async after() {
    if (this.teardownFn && this.data !== undefined) {
      await this.teardownFn(this.data);
    }
  }

  get() {
    if (this.data === undefined) {
      throw new Error('Fixture not initialized. Call before() first.');
    }
    return this.data;
  }
}

/**
 * Test data builders
 */
export class TestDataBuilder<T> {
  private data: Partial<T> = {};

  with<K extends keyof T>(key: K, value: T[K]) {
    this.data[key] = value;
    return this;
  }

  withDefaults(defaults: Partial<T>) {
    this.data = { ...defaults, ...this.data };
    return this;
  }

  build(): T {
    return this.data as T;
  }

  buildMany(count: number, modifier?: (data: T, index: number) => T): T[] {
    const results: T[] = [];
    for (let i = 0; i < count; i++) {
      let item = this.build();
      if (modifier) {
        item = modifier(item, i);
      }
      results.push(item);
    }
    return results;
  }
}

/**
 * Create a test data builder
 */
export function buildTestData<T>(defaults: Partial<T> = {}) {
  return new TestDataBuilder<T>().withDefaults(defaults);
}

/**
 * Retry a flaky test
 */
export async function retry<T>(
  fn: () => T | Promise<T>,
  options: {
    times?: number;
    delay?: number;
  } = {}
): Promise<T> {
  const { times = 3, delay = 100 } = options;
  let lastError: any;

  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < times - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Test timing utility
 */
export async function measureTime(fn: () => void | Promise<void>) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

/**
 * Assert that a function completes within a time limit
 */
export async function completesWithin(fn: () => void | Promise<void>, ms: number) {
  const time = await measureTime(fn);
  if (time > ms) {
    throw new Error(`Expected to complete within ${ms}ms, but took ${time}ms`);
  }
}
