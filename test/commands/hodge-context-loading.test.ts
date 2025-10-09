import { describe, expect, beforeEach } from 'vitest';
import { smokeTest } from '../../src/test/helpers';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('hodge command context loading', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create isolated test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-test-'));

    // Create minimal .hodge structure
    const hodgeDir = path.join(testDir, '.hodge');
    await fs.ensureDir(hodgeDir);
    await fs.ensureDir(path.join(hodgeDir, 'patterns'));

    // Create test files
    await fs.writeFile(
      path.join(hodgeDir, 'HODGE.md'),
      '# Test HODGE Context\nFeature: test\nMode: explore'
    );
    await fs.writeFile(
      path.join(hodgeDir, 'standards.md'),
      '# Test Standards\nAlways test behavior'
    );
    await fs.writeFile(
      path.join(hodgeDir, 'decisions.md'),
      '# Test Decisions\nDecision 1: Test everything'
    );
    await fs.writeFile(path.join(hodgeDir, 'patterns', 'test.md'), '# Test Pattern');
  });

  smokeTest('should load core context for standard mode', async () => {
    // This test verifies that the /hodge command template
    // will always load core context files first
    const templatePath = path.join(process.cwd(), '.claude/commands/hodge.md');

    const content = await fs.readFile(templatePath, 'utf-8');

    // Check that core loading happens before any conditionals
    expect(content).toContain('### 1. Always Load Core Context First (ALL MODES)');
    expect(content).toContain('cat .hodge/HODGE.md');
    expect(content).toContain('cat .hodge/standards.md');
    expect(content).toContain('cat .hodge/decisions.md');
    expect(content).toContain('ls -la .hodge/patterns/');

    // Verify core loading is outside the conditional blocks
    const coreLoadingIndex = content.indexOf('### 1. Always Load Core Context First');
    const ifFeatureIndex = content.indexOf('{{#if feature}}');
    const elseIndex = content.indexOf('{{else}}');

    expect(coreLoadingIndex).toBeGreaterThan(-1);
    expect(coreLoadingIndex).toBeLessThan(ifFeatureIndex);
    expect(coreLoadingIndex).toBeLessThan(elseIndex);
  });

  smokeTest('should load core context for feature mode', async () => {
    const templatePath = path.join(process.cwd(), '.claude/commands/hodge.md');

    const content = await fs.readFile(templatePath, 'utf-8');

    // Verify feature mode is now "Handle Feature Mode" not primary
    expect(content).toContain('### 2. Handle Feature Mode');

    // Core context should be loaded before feature mode
    const coreLoadingIndex = content.indexOf('### 1. Always Load Core Context First');
    const featureModeIndex = content.indexOf('### 2. Handle Feature Mode');

    expect(coreLoadingIndex).toBeLessThan(featureModeIndex);
  });

  smokeTest('should have consistent section numbering', async () => {
    const templatePath = path.join(process.cwd(), '.claude/commands/hodge.md');

    const content = await fs.readFile(templatePath, 'utf-8');

    // All mode handlers should be section 2
    expect(content).toContain('### 2. Handle Feature Mode');
    expect(content).toContain('### 2. Handle Standard Mode');
  });
});
