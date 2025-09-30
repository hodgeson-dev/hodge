import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ContextCommand } from './context.js';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Smoke tests for HODGE-297: Enhanced Context Loading
 *
 * Tests verify the new context loading features:
 * 1. Load recent 20 decisions (not full file)
 * 2. Load id-mappings.json only when feature has PM issue
 * 3. Load all .md and .json files in current phase directory
 */
describe('ContextCommand - HODGE-297 Enhanced Loading', () => {
  smokeTest('should load recent decisions without crashing', async ({ expect }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

    try {
      // Create test .hodge directory
      const hodgeDir = path.join(tmpDir, '.hodge');
      await fs.mkdir(hodgeDir, { recursive: true });

      // Create decisions.md with test content
      const decisionsContent = `# Architecture Decisions

## Decisions

### 2025-09-30 - Test Decision 1
**Status**: Accepted
**Decision**: Test decision 1

### 2025-09-29 - Test Decision 2
**Status**: Accepted
**Decision**: Test decision 2
`;
      await fs.writeFile(path.join(hodgeDir, 'decisions.md'), decisionsContent);

      // Execute with tmpDir basePath - should not crash
      const command = new ContextCommand(tmpDir);
      const result = await command.loadRecentDecisions(20);

      // Should return content
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should detect phase without crashing', async ({ expect }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

    try {
      // Create test feature directory with build phase
      const featureDir = path.join(tmpDir, '.hodge', 'features', 'test-feature', 'build');
      await fs.mkdir(featureDir, { recursive: true });

      // Execute with tmpDir basePath
      const command = new ContextCommand(tmpDir);
      const phase = await command.detectPhase('test-feature');

      // Should detect build phase
      expect(phase).toBe('build');
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should check for linked PM issue without crashing', async ({ expect }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

    try {
      // Create test feature directory without PM issue
      const featureDir = path.join(tmpDir, '.hodge', 'features', 'test-feature');
      await fs.mkdir(featureDir, { recursive: true });

      // Execute with tmpDir basePath
      const command = new ContextCommand(tmpDir);
      const hasIssue = await command.hasLinkedPMIssue('test-feature');

      // Should return false (no issue-id.txt)
      expect(hasIssue).toBe(false);
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should load phase files without crashing', async ({ expect }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

    try {
      // Create test feature directory with files
      const buildDir = path.join(tmpDir, '.hodge', 'features', 'test-feature', 'build');
      await fs.mkdir(buildDir, { recursive: true });

      // Create test files
      await fs.writeFile(path.join(buildDir, 'build-plan.md'), '# Build Plan');
      await fs.writeFile(path.join(buildDir, 'context.json'), '{}');
      await fs.writeFile(path.join(buildDir, 'notes.txt'), 'notes'); // Should be ignored

      // Execute with tmpDir basePath
      const command = new ContextCommand(tmpDir);
      const files = await command.loadPhaseFiles('test-feature', 'build');

      // Should find 2 files (.md and .json, not .txt)
      expect(files).toHaveLength(2);
      expect(files).toContain('build-plan.md');
      expect(files).toContain('context.json');
      expect(files).not.toContain('notes.txt');
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should execute context command without crashing', async ({ expect }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

    try {
      // Create minimal .hodge directory
      const hodgeDir = path.join(tmpDir, '.hodge');
      await fs.mkdir(hodgeDir, { recursive: true });

      // Execute with tmpDir basePath
      const command = new ContextCommand(tmpDir);

      // Should not crash with empty options
      await expect(command.execute({})).resolves.not.toThrow();
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
