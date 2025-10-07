/**
 * Integration Tests for Review Command (HODGE-327.1)
 *
 * Tests end-to-end behavior: profile loading, context aggregation, file validation, output.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReviewCommand } from './review.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { integrationTest } from '../test/helpers.js';

describe('Review Command [integration]', () => {
  let testDir: string;
  let reviewProfilesDir: string;
  let lessonsDir: string;
  let patternsDir: string;

  beforeEach(async () => {
    // Create isolated test directory - NEVER touch the project's .hodge directory
    testDir = join(tmpdir(), `hodge-review-test-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create .hodge structure
    await fs.mkdir(join(testDir, '.hodge'), { recursive: true });
    reviewProfilesDir = join(testDir, '.hodge', 'review-profiles');
    await fs.mkdir(reviewProfilesDir, { recursive: true });

    lessonsDir = join(testDir, '.hodge', 'lessons');
    await fs.mkdir(lessonsDir, { recursive: true });

    patternsDir = join(testDir, '.hodge', 'patterns');
    await fs.mkdir(patternsDir, { recursive: true });

    // Create test profile
    await fs.writeFile(
      join(reviewProfilesDir, 'general-coding-standards.md'),
      `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
name: "Test Quality Profile"
description: "Profile for integration tests"
applies_to:
  - "**/*.ts"
  - "**/*.js"
---

## Test Criterion
**Enforcement: MANDATORY** | **Severity: BLOCKER**

Check for console.log and debugger statements.
`.trim()
    );

    // Create test standards
    await fs.writeFile(
      join(testDir, '.hodge', 'standards.md'),
      '# Test Standards\n\nNo console.log in production.'
    );

    // Create test principles
    await fs.writeFile(
      join(testDir, '.hodge', 'principles.md'),
      '# Test Principles\n\nWrite clean code.'
    );

    // Create test lessons
    await fs.writeFile(
      join(lessonsDir, 'test-lesson.md'),
      '# Test Lesson\n\nAvoid using console.log in production code.'
    );

    // Create test patterns
    await fs.writeFile(
      join(patternsDir, 'test-pattern.md'),
      '# Test Pattern\n\nUse proper logging.'
    );
  });

  afterEach(async () => {
    // Clean up test directory
    if (testDir && testDir.includes('hodge-review-test')) {
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  integrationTest('should successfully review a valid file', async () => {
    // Create test file
    const testFile = join(testDir, 'valid.ts');
    await fs.writeFile(testFile, 'const x = 1;\nexport default x;');

    // Mock cwd to use test directory
    const originalCwd = process.cwd;
    process.cwd = () => testDir;

    try {
      const command = new ReviewCommand();

      // Should not throw - validates entire flow works
      expect(() => command.execute('file', testFile)).not.toThrow();
    } finally {
      process.cwd = originalCwd;
    }
  });

  integrationTest(
    'should load all context layers (standards, principles, patterns, lessons)',
    async () => {
      // Create test file
      const testFile = join(testDir, 'test.ts');
      await fs.writeFile(testFile, 'const y = 2;');

      // Mock cwd and console.log to capture output
      const originalCwd = process.cwd;
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);
      process.cwd = () => testDir;

      try {
        const command = new ReviewCommand();
        command.execute('file', testFile);

        // Verify context was loaded (should see checkmarks in output)
        const output = logs.join('\n');
        expect(output).toContain('**Standards Loaded**');
        expect(output).toContain('**Principles Loaded**');
        expect(output).toContain('**Patterns**:');
        expect(output).toContain('**Lessons**:');
      } finally {
        process.cwd = originalCwd;
        console.log = originalLog;
      }
    }
  );

  integrationTest('should handle missing context files gracefully', async () => {
    // Create minimal test directory without standards/principles
    const minimalDir = join(tmpdir(), `hodge-review-minimal-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(minimalDir, { recursive: true });
    await fs.mkdir(join(minimalDir, '.hodge', 'review-profiles'), { recursive: true });

    // Create minimal profile
    await fs.writeFile(
      join(minimalDir, '.hodge', 'review-profiles', 'general-coding-standards.md'),
      `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
name: "Minimal Profile"
description: "Test"
applies_to: ["**/*.ts"]
---

## Test Criterion
**Enforcement: MANDATORY** | **Severity: BLOCKER**

Test criteria:
  - name: "Test"
    severity: warning
    patterns: ["test"]
`.trim()
    );

    const testFile = join(minimalDir, 'test.ts');
    await fs.writeFile(testFile, 'const z = 3;');

    const originalCwd = process.cwd;
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (msg: string) => logs.push(msg);
    process.cwd = () => minimalDir;

    try {
      const command = new ReviewCommand();
      command.execute('file', testFile);

      // Should warn about missing files but not crash
      const output = logs.join('\n');
      expect(output).toContain('**Patterns**: 0 files');
      expect(output).toContain('**Lessons**: 0 files');
    } finally {
      process.cwd = originalCwd;
      console.log = originalLog;
      await fs.rm(minimalDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  integrationTest('should validate profile exists before reviewing', async () => {
    // Create directory with no profile
    const noProfileDir = join(tmpdir(), `hodge-review-noprofile-${randomBytes(8).toString('hex')}`);
    await fs.mkdir(noProfileDir, { recursive: true });
    await fs.mkdir(join(noProfileDir, '.hodge', 'review-profiles'), { recursive: true });

    const testFile = join(noProfileDir, 'test.ts');
    await fs.writeFile(testFile, 'const a = 1;');

    const originalCwd = process.cwd;
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    process.cwd = () => noProfileDir;

    try {
      const command = new ReviewCommand();
      expect(() => command.execute('file', testFile)).toThrow();
    } finally {
      process.cwd = originalCwd;
      exitSpy.mockRestore();
      await fs.rm(noProfileDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  integrationTest('should read target file successfully', async () => {
    // Create file with known content
    const testFile = join(testDir, 'content-test.ts');
    const testContent = 'function hello() { return "world"; }';
    await fs.writeFile(testFile, testContent);

    const originalCwd = process.cwd;
    process.cwd = () => testDir;

    try {
      const command = new ReviewCommand();

      // Should successfully read file (verifies file reading works)
      expect(() => command.execute('file', testFile)).not.toThrow();
    } finally {
      process.cwd = originalCwd;
    }
  });
});
