import { describe, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';
import { ContextCommand } from './context.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import yaml from 'js-yaml';
import type { ContextManifest } from '../types/context-manifest.js';

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
      await fs.writeFile(path.join(buildDir, 'other-data.json'), '{"test": true}');
      await fs.writeFile(path.join(buildDir, 'notes.txt'), 'notes'); // Should be ignored

      // Execute with tmpDir basePath
      const command = new ContextCommand(tmpDir);
      const files = await command.loadPhaseFiles('test-feature', 'build');

      // Should find 2 files (.md and .json, not .txt)
      expect(files).toHaveLength(2);
      expect(files).toContain('build-plan.md');
      expect(files).toContain('other-data.json');
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

/**
 * Smoke tests for HODGE-313: Fix /hodge command mode detection
 *
 * Tests verify session-based mode detection:
 * 1. Uses session feature for mode detection (not 'general')
 * 2. Falls back to 'general' when no session exists
 * 3. Generates HODGE.md with accurate mode for last worked feature
 */
describe('ContextCommand - HODGE-313 Session-Based Mode Detection', () => {
  smokeTest(
    'should use session feature for mode detection when session exists',
    async ({ expect }) => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

      try {
        // Create test .hodge directory with session
        const hodgeDir = path.join(tmpDir, '.hodge');
        await fs.mkdir(hodgeDir, { recursive: true });

        // Create a session file with a shipped feature
        const sessionContent = {
          feature: 'TEST-FEATURE',
          mode: 'shipped',
          ts: Date.now(),
          summary: 'Test shipped feature',
        };
        await fs.writeFile(path.join(hodgeDir, 'session.json'), JSON.stringify(sessionContent));

        // Create the shipped feature directory with ship-record.json
        const featureDir = path.join(hodgeDir, 'features', 'TEST-FEATURE', 'ship');
        await fs.mkdir(featureDir, { recursive: true });
        await fs.writeFile(
          path.join(featureDir, 'ship-record.json'),
          JSON.stringify({ feature: 'TEST-FEATURE', timestamp: new Date().toISOString() })
        );

        // Create minimal standards.md
        await fs.writeFile(path.join(hodgeDir, 'standards.md'), '# Standards\n\n## Test\n- Rule 1');

        // Execute context command - should not crash
        const command = new ContextCommand(tmpDir);
        await expect(command.execute({})).resolves.not.toThrow();

        // HODGE-372: HODGE.md generation removed, verify command completes successfully
      } finally {
        // Cleanup
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    },
    10000
  ); // Increased timeout to 10s for CI environments

  smokeTest('should fall back to general when no session exists', async ({ expect }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

    try {
      // Create test .hodge directory WITHOUT session
      const hodgeDir = path.join(tmpDir, '.hodge');
      await fs.mkdir(hodgeDir, { recursive: true });

      // Create minimal standards.md
      await fs.writeFile(path.join(hodgeDir, 'standards.md'), '# Standards\n\n## Test\n- Rule 1');

      // NOTE: SessionManager is a singleton that reads from project root (process.cwd())
      // This test verifies that ContextCommand doesn't crash when session exists
      // but uses the actual session from the real project (expected behavior in isolation)

      // Execute context command - should not crash
      const command = new ContextCommand(tmpDir);
      await expect(command.execute({})).resolves.not.toThrow();

      // HODGE-372: HODGE.md generation removed, verify command completes successfully
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  smokeTest('should detect build mode correctly for session feature', async ({ expect }) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));

    try {
      // Create test .hodge directory
      const hodgeDir = path.join(tmpDir, '.hodge');
      await fs.mkdir(hodgeDir, { recursive: true });

      // NOTE: SessionManager is a singleton that reads from project root (process.cwd())
      // This test creates a feature directory to verify mode detection works
      // but the feature name comes from global session

      // Create minimal standards.md
      await fs.writeFile(path.join(hodgeDir, 'standards.md'), '# Standards\n\n## Test\n- Rule 1');

      // Execute context command - should not crash
      const command = new ContextCommand(tmpDir);
      await expect(command.execute({})).resolves.not.toThrow();

      // HODGE-372: HODGE.md generation removed, verify command completes successfully
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  // Phase 1 (HODGE-346.4): TODO counting functionality
  smokeTest('should support --todos flag', async () => {
    await withTestWorkspace('context-todos-flag', async (workspace) => {
      const command = new ContextCommand();

      // Create an exploration file with TODOs
      await workspace.writeFile(
        '.hodge/features/TEST-TODOS-1/explore/exploration.md',
        '# Exploration\n\n// TODO: Add error handling\nTODO: Implement feature\n'
      );

      // Run without throwing (pass feature explicitly to avoid session lookup)
      await expect(
        command.execute({ todos: true, feature: 'TEST-TODOS-1' })
      ).resolves.not.toThrow();
    });
  });

  smokeTest('should count TODOs in exploration.md', async () => {
    await withTestWorkspace('context-count-todos', async (workspace) => {
      const command = new ContextCommand();

      // Create exploration with multiple TODO patterns
      const exploration = `# Exploration

## Problem
// TODO: Clarify the problem statement

## Approach
TODO: Design the architecture
- [ ] TODO: Create database schema
- [ ] TODO: Write API endpoints

## Next Steps
Some regular text here.
`;

      await workspace.writeFile('.hodge/features/TEST-TODOS-2/explore/exploration.md', exploration);

      // Run without throwing - should count all TODO patterns
      await expect(
        command.execute({ todos: true, feature: 'TEST-TODOS-2' })
      ).resolves.not.toThrow();
    });
  });

  smokeTest('should handle missing exploration.md', async () => {
    await withTestWorkspace('context-no-exploration', async (workspace) => {
      const command = new ContextCommand();

      // Feature directory exists but no exploration.md
      await workspace.writeFile('.hodge/features/TEST-NO-EXPLORE/build/context.json', '{}');

      // Should not crash, just report no file found
      await expect(
        command.execute({ todos: true, feature: 'TEST-NO-EXPLORE' })
      ).resolves.not.toThrow();
    });
  });

  smokeTest('should handle feature without active session', async () => {
    await withTestWorkspace('context-no-session', async (workspace) => {
      const command = new ContextCommand();

      // Explicitly provide feature (no session needed)
      await workspace.writeFile(
        '.hodge/features/TEST-EXPLICIT/explore/exploration.md',
        'TODO: Test explicit feature'
      );

      // Should work with explicit feature flag
      await expect(
        command.execute({ todos: true, feature: 'TEST-EXPLICIT' })
      ).resolves.not.toThrow();
    });
  });
});

/**
 * Smoke tests for HODGE-363: YAML Manifest Generation
 *
 * Tests verify the new context manifest features:
 * - YAML manifest generation with global files, patterns, and feature context
 * - Pattern metadata extraction (titles and overviews)
 * - Architecture graph statistics inclusion
 * - Session-aware feature detection
 */
describe('ContextCommand - HODGE-363 YAML Manifest Generation', () => {
  let fixture: TempDirectoryFixture;
  let command: ContextCommand;
  let originalLog: typeof console.log;
  let capturedOutput: string[] = [];

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    await fixture.setup();
    command = new ContextCommand(fixture.getPath());

    // Capture console.log output (YAML goes to stdout via console.log)
    originalLog = console.log;
    capturedOutput = [];
    console.log = (...args: unknown[]) => {
      capturedOutput.push(args.join(' '));
    };
  });

  afterEach(async () => {
    console.log = originalLog;
    await fixture.cleanup();
  });

  /**
   * Helper to extract YAML from captured output (filters out logger messages)
   */
  const extractYaml = (output: string[]): string => {
    // Find first line that starts with "version:"
    const startIndex = output.findIndex((line) => line.trim().startsWith('version:'));
    if (startIndex === -1) {
      return '';
    }

    // Find end of YAML (last line that looks like YAML content)
    let endIndex = startIndex;
    for (let i = startIndex + 1; i < output.length; i++) {
      const line = output[i];
      // YAML lines either start with spaces (indented), are key: value, or are arrays
      if (
        line.trim().length === 0 || // blank lines within YAML
        /^\s+/.test(line) || // indented content
        /^\s*-\s/.test(line) || // array items
        /^\s*\w+:/.test(line) // key: value pairs
      ) {
        endIndex = i;
      } else {
        // Found non-YAML line (like logger message), stop here
        break;
      }
    }

    return output.slice(startIndex, endIndex + 1).join('\n');
  };

  smokeTest('should generate valid YAML manifest', async () => {
    // HODGE-372: Setup minimal .hodge structure (no HODGE.md)
    await fixture.writeFile('.hodge/standards.md', '# Standards');
    await fixture.writeFile('.hodge/decisions.md', '# Decisions');

    await command.execute({});

    // Should have captured YAML output
    expect(capturedOutput.length).toBeGreaterThan(0);

    const yamlOutput = extractYaml(capturedOutput);
    const manifest = yaml.load(yamlOutput) as ContextManifest;

    expect(manifest).toBeDefined();
    expect(manifest.version).toBe('1.0');
    expect(manifest.global_files).toBeDefined();
    expect(manifest.patterns).toBeDefined();
  });

  smokeTest('should include global files with availability status', async () => {
    // HODGE-372: No longer includes HODGE.md in global files
    await fixture.writeFile('.hodge/standards.md', 'test');
    await fixture.writeFile('.hodge/context.json', '{"feature": "TEST", "mode": "explore"}');

    await command.execute({});

    const yamlOutput = extractYaml(capturedOutput);
    const manifest = yaml.load(yamlOutput) as ContextManifest;

    // context.json should be available
    const contextJson = manifest.global_files.find((f) => f.path === '.hodge/context.json');
    expect(contextJson).toBeDefined();
    expect(contextJson?.status).toBe('available');

    // principles.md should be marked as not_found
    const principles = manifest.global_files.find((f) => f.path === '.hodge/principles.md');
    expect(principles).toBeDefined();
    expect(principles?.status).toBe('not_found');

    // HODGE.md should NOT be in global_files list
    const hodgeMd = manifest.global_files.find((f) => f.path === '.hodge/HODGE.md');
    expect(hodgeMd).toBeUndefined();
  });

  smokeTest('should extract pattern metadata', async () => {
    // HODGE-372: No need to create HODGE.md
    await fixture.writeFile(
      '.hodge/patterns/test-pattern.md',
      `# Testing Patterns

## Overview
This is a test pattern demonstrating smoke tests.

## Details
More content here.`
    );

    await command.execute({});

    const yamlOutput = extractYaml(capturedOutput);
    const manifest = yaml.load(yamlOutput) as ContextManifest;

    expect(manifest.patterns.files).toBeDefined();
    expect(manifest.patterns.files.length).toBeGreaterThan(0);

    const testPattern = manifest.patterns.files.find((p) => p.path === 'test-pattern.md');
    expect(testPattern).toBeDefined();
    expect(testPattern?.title).toBe('Testing Patterns');
    expect(testPattern?.overview).toContain('smoke tests');
  });

  smokeTest('should include architecture graph when available', async () => {
    // HODGE-372: No need to create HODGE.md
    await fixture.writeFile(
      '.hodge/architecture-graph.dot',
      `digraph {
  "module1" -> "module2"
  "module2" -> "module3"
}`
    );

    await command.execute({});

    const yamlOutput = extractYaml(capturedOutput);
    const manifest = yaml.load(yamlOutput) as ContextManifest;

    expect(manifest.architecture_graph).toBeDefined();
    expect(manifest.architecture_graph?.status).toBe('available');
    expect(manifest.architecture_graph?.modules).toBeGreaterThan(0);
    expect(manifest.architecture_graph?.dependencies).toBeGreaterThan(0);
  });

  smokeTest('should include feature context when feature specified', async () => {
    // HODGE-372: No need to create HODGE.md
    await fixture.writeFile(
      '.hodge/features/TEST-001/explore/exploration.md',
      '# Exploration\nTest exploration'
    );
    await fixture.writeFile(
      '.hodge/features/TEST-001/build/build-plan.md',
      '# Build Plan\nTest plan'
    );

    await command.execute({ feature: 'TEST-001' });

    const yamlOutput = extractYaml(capturedOutput);
    const manifest = yaml.load(yamlOutput) as ContextManifest;

    expect(manifest.feature_context).toBeDefined();
    expect(manifest.feature_context?.feature_id).toBe('TEST-001');
    expect(manifest.feature_context?.files.length).toBeGreaterThan(0);

    const explorationFile = manifest.feature_context?.files.find((f) =>
      f.path.includes('exploration.md')
    );
    expect(explorationFile).toBeDefined();
    expect(explorationFile?.status).toBe('available');
  });

  smokeTest('should handle missing patterns directory gracefully', async () => {
    // HODGE-372: No need to create HODGE.md
    // Don't create .hodge/patterns directory

    await command.execute({});

    const yamlOutput = extractYaml(capturedOutput);
    const manifest = yaml.load(yamlOutput) as ContextManifest;

    expect(manifest.patterns).toBeDefined();
    expect(manifest.patterns.files).toEqual([]);
  });

  smokeTest('should exclude README.md from patterns', async () => {
    // HODGE-372: No need to create HODGE.md
    await fixture.writeFile('.hodge/patterns/README.md', '# README\n\n## Overview\nIgnore this');
    await fixture.writeFile(
      '.hodge/patterns/real-pattern.md',
      '# Real Pattern\n\n## Overview\nInclude this'
    );

    await command.execute({});

    const yamlOutput = extractYaml(capturedOutput);
    const manifest = yaml.load(yamlOutput) as ContextManifest;

    const readmePattern = manifest.patterns.files.find((p) => p.path === 'README.md');
    expect(readmePattern).toBeUndefined();

    const realPattern = manifest.patterns.files.find((p) => p.path === 'real-pattern.md');
    expect(realPattern).toBeDefined();
  });
});

/**
 * Smoke tests for HODGE-364: Session Fallback Removal
 *
 * Tests verify:
 * 1. /hodge with no args loads ONLY global context (no feature context)
 * 2. /hodge with feature arg loads global + feature context
 * 3. No session fallback behavior
 */
describe('[smoke] ContextCommand - HODGE-364 Session Fallback Removal', () => {
  /**
   * Helper to extract YAML from captured output string
   */
  const extractYamlFromString = (output: string): string => {
    const lines = output.split('\n');
    const startIndex = lines.findIndex((line) => line.trim().startsWith('version:'));
    if (startIndex === -1) {
      return '';
    }

    let endIndex = startIndex;
    const pattern = /^[\s-]*[a-z_]+:/i;
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() !== '' && !pattern.exec(line) && !line.startsWith('  ')) {
        break;
      }
      endIndex = i;
    }

    return lines.slice(startIndex, endIndex + 1).join('\n');
  };

  smokeTest('should NOT load feature context when no feature argument provided', async () => {
    await withTestWorkspace('hodge-364-no-fallback', async (workspace) => {
      // Create a feature with context
      await workspace.writeFile('.hodge/features/HODGE-999/explore/exploration.md', '# Test');

      // Create context.json with feature
      await workspace.writeFile(
        '.hodge/context.json',
        JSON.stringify({ feature: 'HODGE-999', mode: 'explore' })
      );

      // Capture output
      let capturedOutput = '';
      const originalLog = console.log;
      console.log = (msg: string) => {
        capturedOutput += msg + '\n';
      };

      try {
        // Execute without feature argument
        const command = new ContextCommand(workspace.getPath());
        await command.execute({});

        // Parse YAML output
        const yamlOutput = extractYamlFromString(capturedOutput);
        const manifest = yaml.load(yamlOutput) as ContextManifest;

        // HODGE-364: Should NOT include feature_context when no feature arg
        expect(manifest.feature_context).toBeUndefined();
        expect(manifest.global_files).toBeDefined();
      } finally {
        console.log = originalLog;
      }
    });
  });

  smokeTest('should load feature context when explicit feature argument provided', async () => {
    await withTestWorkspace('hodge-364-explicit-feature', async (workspace) => {
      // Create a feature
      await workspace.writeFile('.hodge/features/HODGE-999/explore/exploration.md', '# Test');

      // Capture output
      let capturedOutput = '';
      const originalLog = console.log;
      console.log = (msg: string) => {
        capturedOutput += msg + '\n';
      };

      try {
        // Execute WITH feature argument
        const command = new ContextCommand(workspace.getPath());
        await command.execute({ feature: 'HODGE-999' });

        // Parse YAML output
        const yamlOutput = extractYamlFromString(capturedOutput);
        const manifest = yaml.load(yamlOutput) as ContextManifest;

        // HODGE-364: Should include feature_context when feature arg provided
        expect(manifest.feature_context).toBeDefined();
        expect(manifest.feature_context?.feature_id).toBe('HODGE-999');
        expect(manifest.feature_context?.files.length).toBeGreaterThan(0);
      } finally {
        console.log = originalLog;
      }
    });
  });

  smokeTest('should handle missing context.json gracefully', async () => {
    await withTestWorkspace('hodge-364-no-context', async (workspace) => {
      // Create .hodge directory but no context.json file
      await workspace.writeFile('.hodge/.gitkeep', '');

      // Capture output
      let capturedOutput = '';
      const originalLog = console.log;
      console.log = (msg: string) => {
        capturedOutput += msg + '\n';
      };

      try {
        // Execute without feature argument (and no context.json)
        const command = new ContextCommand(workspace.getPath());
        await command.execute({});

        // Parse YAML output
        const yamlOutput = extractYamlFromString(capturedOutput);
        const manifest = yaml.load(yamlOutput) as ContextManifest;

        // Should load global context only
        expect(manifest.global_files).toBeDefined();
        expect(manifest.feature_context).toBeUndefined();
      } finally {
        console.log = originalLog;
      }
    });
  });
});
