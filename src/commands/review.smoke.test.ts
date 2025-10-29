/**
 * Smoke Tests for Review Command (HODGE-344.4)
 *
 * Tests core command structure, method signatures, and basic contract validation.
 * Full integration testing happens in harden phase.
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { ReviewCommand } from './review.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { ReviewCommandOptions } from './review.js';

describe('ReviewCommand - Smoke Tests (HODGE-344.4)', () => {
  let fixture: TempDirectoryFixture;
  let command: ReviewCommand;

  beforeEach(() => {
    fixture = new TempDirectoryFixture('hodge-review-');
    command = new ReviewCommand();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  smokeTest('should instantiate without errors', () => {
    expect(command).toBeDefined();
    expect(command).toBeInstanceOf(ReviewCommand);
  });

  smokeTest('should have execute method', () => {
    expect(command.execute).toBeDefined();
    expect(typeof command.execute).toBe('function');
  });

  smokeTest('execute method should accept ReviewCommandOptions', () => {
    const options: ReviewCommandOptions = {
      file: 'src/test.ts',
    };
    // Just verify type signature compiles, don't execute
    expect(options).toBeDefined();
  });

  smokeTest('should accept --file flag', () => {
    const options: ReviewCommandOptions = {
      file: 'src/lib/config.ts',
    };
    expect(options.file).toBe('src/lib/config.ts');
  });

  smokeTest('should accept --directory flag', () => {
    const options: ReviewCommandOptions = {
      directory: 'src/commands/',
    };
    expect(options.directory).toBe('src/commands/');
  });

  smokeTest('should accept --last flag', () => {
    const options: ReviewCommandOptions = {
      last: 3,
    };
    expect(options.last).toBe(3);
  });

  smokeTest('should accept --fix flag', () => {
    const options: ReviewCommandOptions = {
      file: 'src/test.ts',
      fix: true,
    };
    expect(options.fix).toBe(true);
  });

  smokeTest('should accept multiple scope flags in options (runtime validation in execute)', () => {
    // Verify type system allows multiple flags (validation happens at runtime)
    const options: ReviewCommandOptions = {
      file: 'src/test.ts',
      directory: 'src/',
    };
    expect(options).toBeDefined();
    expect(options.file).toBe('src/test.ts');
    expect(options.directory).toBe('src/');
  });

  smokeTest('should accept empty options object (runtime validation in execute)', () => {
    // Verify type system allows empty options (validation happens at runtime)
    const options: ReviewCommandOptions = {};
    expect(options).toBeDefined();
  });

  smokeTest('should have private parseScope method', () => {
    // Access via prototype to verify method exists (not testing implementation)
    const proto = Object.getPrototypeOf(command);
    expect(proto.parseScope).toBeDefined();
  });

  smokeTest('should have private discoverFiles method', () => {
    const proto = Object.getPrototypeOf(command);
    expect(proto.discoverFiles).toBeDefined();
  });

  smokeTest('should have private createReviewDirectory method', () => {
    const proto = Object.getPrototypeOf(command);
    expect(proto.createReviewDirectory).toBeDefined();
  });

  smokeTest('should have private formatTimestamp method', () => {
    const proto = Object.getPrototypeOf(command);
    expect(proto.formatTimestamp).toBeDefined();
  });

  smokeTest('should have private sanitizePath method', () => {
    const proto = Object.getPrototypeOf(command);
    expect(proto.sanitizePath).toBeDefined();
  });

  smokeTest('should have private writeManifest method', () => {
    const proto = Object.getPrototypeOf(command);
    expect(proto.writeManifest).toBeDefined();
  });

  smokeTest('should have private handleAutoFix method', () => {
    const proto = Object.getPrototypeOf(command);
    expect(proto.handleAutoFix).toBeDefined();
  });

  smokeTest('formatTimestamp should produce YYYY-MM-DD-HHMMSS format', () => {
    const date = new Date('2025-10-15T14:30:45.123Z');
    const proto = Object.getPrototypeOf(command);
    const formatted = proto.formatTimestamp.call(command, date);

    // Verify format (exact values depend on timezone)
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}$/);
  });

  smokeTest('sanitizePath should remove leading/trailing slashes', () => {
    const proto = Object.getPrototypeOf(command);
    const sanitized = proto.sanitizePath.call(command, '/src/lib/config.ts/');

    expect(sanitized).not.toMatch(/^\//);
    expect(sanitized).not.toMatch(/\/$/);
  });

  smokeTest('sanitizePath should convert slashes to hyphens', () => {
    const proto = Object.getPrototypeOf(command);
    const sanitized = proto.sanitizePath.call(command, 'src/lib/config.ts');

    expect(sanitized).not.toContain('/');
    expect(sanitized).toContain('-');
  });

  smokeTest('sanitizePath should truncate long paths', () => {
    const proto = Object.getPrototypeOf(command);
    const longPath = 'a'.repeat(150) + '/file.ts';
    const sanitized = proto.sanitizePath.call(command, longPath);

    expect(sanitized.length).toBeLessThanOrEqual(100);
  });

  smokeTest('parseScope should handle file scope', () => {
    const proto = Object.getPrototypeOf(command);
    const scope = proto.parseScope.call(command, { file: 'test.ts' });

    expect(scope.type).toBe('file');
    expect(scope.target).toBe('test.ts');
  });

  smokeTest('parseScope should handle directory scope', () => {
    const proto = Object.getPrototypeOf(command);
    const scope = proto.parseScope.call(command, { directory: 'src/' });

    expect(scope.type).toBe('directory');
    expect(scope.target).toBe('src/');
  });

  smokeTest('parseScope should handle commits scope', () => {
    const proto = Object.getPrototypeOf(command);
    const scope = proto.parseScope.call(command, { last: 5 });

    expect(scope.type).toBe('commits');
    expect(scope.target).toBe('5');
  });
});
