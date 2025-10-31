/**
 * HODGE-371: Smoke tests for CLI cleanup
 * Verifies that removed commands and options are no longer available
 */

import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { existsSync } from 'fs';
import path from 'path';

describe('[smoke] HODGE-371: CLI cleanup verification', () => {
  smokeTest('todos command file should not exist', () => {
    const todosPath = path.join(process.cwd(), 'src', 'commands', 'todos.ts');
    expect(existsSync(todosPath)).toBe(false);
  });

  smokeTest('link command file should not exist', () => {
    const linkPath = path.join(process.cwd(), 'src', 'commands', 'link.ts');
    expect(existsSync(linkPath)).toBe(false);
  });

  smokeTest('todo-checker utility should not exist', () => {
    const todoCheckerPath = path.join(process.cwd(), 'src', 'lib', 'todo-checker.ts');
    expect(existsSync(todoCheckerPath)).toBe(false);
  });

  smokeTest('explore command should not reference deleted options', async () => {
    const explorePath = path.join(process.cwd(), 'src', 'commands', 'explore.ts');
    const { readFileSync } = await import('fs');
    const content = readFileSync(explorePath, 'utf-8');

    // Check that deleted options are not in the file
    expect(content).not.toContain('fromSpec');
    expect(content).not.toContain('prePopulate');
    expect(content).not.toContain('--force');
  });

  smokeTest('harden command should not reference autoFix option', async () => {
    const hardenPath = path.join(process.cwd(), 'src', 'commands', 'harden.ts');
    const { readFileSync } = await import('fs');
    const content = readFileSync(hardenPath, 'utf-8');

    // autoFixable should still exist (different context), but not autoFix option
    expect(content).not.toContain('autoFix?:');
  });

  smokeTest('context command should not reference deleted options', async () => {
    const contextPath = path.join(process.cwd(), 'src', 'commands', 'context.ts');
    const { readFileSync } = await import('fs');
    const content = readFileSync(contextPath, 'utf-8');

    // Check that deleted options are not in the interface
    expect(content).not.toContain('list?:');
    expect(content).not.toContain('recent?:');
    expect(content).not.toContain('todos?:');
  });

  smokeTest('bin/hodge.ts should not reference todos or link commands', async () => {
    const hodgePath = path.join(process.cwd(), 'src', 'bin', 'hodge.ts');
    const { readFileSync } = await import('fs');
    const content = readFileSync(hodgePath, 'utf-8');

    expect(content).not.toContain('todosCmd');
    expect(content).not.toContain('linkCmd');
    expect(content).not.toContain("command('todos')");
    expect(content).not.toContain("command('link");
  });
});
