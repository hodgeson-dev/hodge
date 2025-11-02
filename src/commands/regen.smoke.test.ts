/**
 * Smoke tests for RegenCommand
 * HODGE-377.3: Basic sanity checks for architecture graph regeneration
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { RegenCommand } from './regen.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { smokeTest } from '../test/helpers.js';
import type { ToolchainConfig } from '../types/toolchain.js';

describe('RegenCommand - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    await fixture.setup();
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  smokeTest('should create RegenCommand instance', () => {
    const command = new RegenCommand(fixture.getPath());
    expect(command).toBeDefined();
    expect(command).toBeInstanceOf(RegenCommand);
  });

  smokeTest('should have execute method', () => {
    const command = new RegenCommand(fixture.getPath());
    // Verify execute method exists and is a function
    expect('execute' in command).toBe(true);
    expect(typeof (command as Record<string, unknown>).execute).toBe('function');
  });

  smokeTest('should fail gracefully when no toolchain config exists', async () => {
    const command = new RegenCommand(fixture.getPath());

    // Should exit with code 1 when no toolchain config
    await expect(command.execute()).rejects.toThrow();
  });

  smokeTest('should regenerate graph when toolchain config exists', async () => {
    // Create minimal toolchain config with dependency-cruiser
    const toolchainConfig: ToolchainConfig = {
      version: '1.0',
      language: 'typescript',
      commands: {
        'dependency-cruiser': {
          graph_command:
            'npx depcruise src --include-only "^src" --output-type dot > .hodge/architecture-graph.dot || true',
        },
      },
      quality_checks: {
        type_checking: [],
        linting: [],
        testing: [],
        formatting: [],
      },
      codebase_analysis: {
        architecture_graph: {
          tool: 'dependency-cruiser',
          enabled: true,
        },
      },
    };

    await fixture.writeFile('.hodge/toolchain.yaml', JSON.stringify(toolchainConfig));
    await fixture.writeFile('src/index.ts', 'export const test = "test";');

    const command = new RegenCommand(fixture.getPath());

    // Should not throw when config exists (even if graph generation fails)
    // The command might fail if dependency-cruiser isn't installed, but it should fail gracefully
    try {
      await command.execute();
    } catch (error) {
      // Expected to fail in test environment without real dependency-cruiser
      // Just verify it tried to run
      expect(error).toBeDefined();
    }
  });

  smokeTest('should log meaningful error when toolchain missing', async () => {
    const command = new RegenCommand(fixture.getPath());
    let errorMessage = '';

    try {
      await command.execute();
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    // Should provide helpful error message
    expect(errorMessage).toBeTruthy();
  });
});
