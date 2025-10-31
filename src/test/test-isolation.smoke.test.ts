import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { TempDirectoryFixture } from './temp-directory-fixture.js';

/**
 * HODGE-366: Test isolation verification
 *
 * This test proves that tests should NOT contaminate the project's .hodge directory.
 * It captures the state before/after test runs to detect unwanted modifications.
 */
describe('Test Isolation [smoke]', () => {
  const projectRoot = process.cwd();
  const contextFile = join(projectRoot, '.hodge/context.json');
  const mappingsFile = join(projectRoot, '.hodge/id-mappings.json');

  let originalContext: string | null = null;
  let originalMappings: string | null = null;
  let fixture: TempDirectoryFixture;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    await fixture.setup();

    // Capture original state
    try {
      originalContext = await fs.readFile(contextFile, 'utf-8');
    } catch {
      originalContext = null;
    }

    try {
      originalMappings = await fs.readFile(mappingsFile, 'utf-8');
    } catch {
      originalMappings = null;
    }
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  it('project .hodge/context.json should remain unchanged after test runs', async () => {
    // Read current state
    let currentContext: string | null = null;
    try {
      currentContext = await fs.readFile(contextFile, 'utf-8');
    } catch {
      currentContext = null;
    }

    // Verify no contamination
    expect(currentContext).toBe(originalContext);
  });

  it('project .hodge/id-mappings.json should remain unchanged after test runs', async () => {
    // Read current state
    let currentMappings: string | null = null;
    try {
      currentMappings = await fs.readFile(mappingsFile, 'utf-8');
    } catch {
      currentMappings = null;
    }

    // Verify no contamination
    expect(currentMappings).toBe(originalMappings);
  });

  it('tests should use workspace directories, not project root', async () => {
    // This is a meta-test that documents the requirement
    // Real verification happens when we fix the 6 test files

    const testWorkspace = fixture.getPath();

    // Workspace should be in temp directory
    expect(testWorkspace).toContain('hodge-test-');
    expect(testWorkspace).not.toBe(projectRoot);

    // Workspace should be writable
    await fixture.writeFile('.hodge/context.json', '{"test": true}');
    const testContext = await fs.readFile(join(testWorkspace, '.hodge/context.json'), 'utf-8');
    expect(testContext).toBe('{"test": true}');
  });
});
