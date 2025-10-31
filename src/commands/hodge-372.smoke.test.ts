import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { ContextCommand } from './context.js';
import yaml from 'js-yaml';
import type { ContextManifest } from '../types/context-manifest.js';

/**
 * Smoke tests for HODGE-372: Remove HODGE.md generation
 *
 * Tests verify:
 * 1. ContextCommand no longer generates HODGE.md
 * 2. HODGE.md is not included in manifest global_files
 * 3. context.json remains available for session state
 * 4. /checkpoint command compatibility (manual testing required)
 */
describe('[smoke] ContextCommand - HODGE-372 HODGE.md Removal', () => {
  smokeTest('should not generate HODGE.md file', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    try {
      // Create minimal .hodge structure
      await fixture.writeFile('.hodge/standards.md', '# Standards');
      await fixture.writeFile('.hodge/context.json', '{"feature": "TEST", "mode": "explore"}');

      // Execute context command
      const command = new ContextCommand(fixture.getPath());
      await command.execute({});

      // Verify HODGE.md was NOT created
      let hodgeMdExists = false;
      try {
        await fixture.readFile('.hodge/HODGE.md');
        hodgeMdExists = true;
      } catch {
        // File doesn't exist (expected)
      }

      expect(hodgeMdExists).toBe(false);
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('should not include HODGE.md in global_files manifest', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    // Capture stdout
    const capturedLines: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      capturedLines.push(args.join(' '));
    };

    try {
      // Create minimal .hodge structure
      await fixture.writeFile('.hodge/standards.md', '# Standards');

      // Execute context command
      const command = new ContextCommand(fixture.getPath());
      await command.execute({});

      // Extract YAML (skip logger messages, find version: line)
      const startIdx = capturedLines.findIndex((line) => line.trim().startsWith('version:'));
      expect(startIdx).toBeGreaterThanOrEqual(0);

      // Extract until we hit a non-YAML line
      let endIdx = startIdx;
      for (let i = startIdx + 1; i < capturedLines.length; i++) {
        const line = capturedLines[i];
        if (line.trim() === '' || /^\s/.test(line) || /^[a-z_]+:/.test(line)) {
          endIdx = i;
        } else {
          break;
        }
      }

      const yamlContent = capturedLines.slice(startIdx, endIdx + 1).join('\n');
      const manifest = yaml.load(yamlContent) as ContextManifest;

      // Verify HODGE.md is NOT in global_files
      const hodgeMdFile = manifest.global_files.find((f) => f.path === '.hodge/HODGE.md');
      expect(hodgeMdFile).toBeUndefined();

      // Verify context.json IS in global_files
      const contextFile = manifest.global_files.find((f) => f.path === '.hodge/context.json');
      expect(contextFile).toBeDefined();
    } finally {
      console.log = originalLog;
      await fixture.cleanup();
    }
  });

  smokeTest('should complete without HodgeMDGenerator dependency', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    try {
      // Create minimal .hodge structure
      await fixture.writeFile('.hodge/standards.md', '# Standards');

      // Execute context command - should not throw import errors
      const command = new ContextCommand(fixture.getPath());
      await expect(command.execute({})).resolves.not.toThrow();
    } finally {
      await fixture.cleanup();
    }
  });

  smokeTest('should maintain context.json as session state source', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    // Capture stdout
    const capturedLines: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      capturedLines.push(args.join(' '));
    };

    try {
      // Create context.json with session state
      await fixture.writeFile(
        '.hodge/context.json',
        JSON.stringify({
          feature: 'HODGE-372',
          mode: 'build',
          timestamp: new Date().toISOString(),
        })
      );
      await fixture.writeFile('.hodge/standards.md', '# Standards');

      // Execute context command
      const command = new ContextCommand(fixture.getPath());
      await command.execute({});

      // Extract YAML (skip logger messages)
      const startIdx = capturedLines.findIndex((line) => line.trim().startsWith('version:'));
      let endIdx = startIdx;
      for (let i = startIdx + 1; i < capturedLines.length; i++) {
        const line = capturedLines[i];
        if (line.trim() === '' || /^\s/.test(line) || /^[a-z_]+:/.test(line)) {
          endIdx = i;
        } else {
          break;
        }
      }
      const yamlContent = capturedLines.slice(startIdx, endIdx + 1).join('\n');
      const manifest = yaml.load(yamlContent) as ContextManifest;

      // Verify context.json is available
      const contextFile = manifest.global_files.find((f) => f.path === '.hodge/context.json');
      expect(contextFile?.status).toBe('available');
    } finally {
      console.log = originalLog;
      await fixture.cleanup();
    }
  });

  smokeTest('should work with feature context without HODGE.md', async ({ expect }) => {
    const fixture = new TempDirectoryFixture();
    await fixture.setup();

    // Capture stdout
    const capturedLines: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      capturedLines.push(args.join(' '));
    };

    try {
      // Create feature structure
      await fixture.writeFile('.hodge/standards.md', '# Standards');
      await fixture.writeFile('.hodge/features/HODGE-372/explore/exploration.md', '# Exploration');
      await fixture.writeFile('.hodge/features/HODGE-372/decisions.md', '# Decisions');

      // Execute with feature context
      const command = new ContextCommand(fixture.getPath());
      await command.execute({ feature: 'HODGE-372' });

      // Extract YAML (skip logger messages)
      const startIdx = capturedLines.findIndex((line) => line.trim().startsWith('version:'));
      let endIdx = startIdx;
      for (let i = startIdx + 1; i < capturedLines.length; i++) {
        const line = capturedLines[i];
        if (line.trim() === '' || /^\s/.test(line) || /^[a-z_]+:/.test(line)) {
          endIdx = i;
        } else {
          break;
        }
      }
      const yamlContent = capturedLines.slice(startIdx, endIdx + 1).join('\n');
      const manifest = yaml.load(yamlContent) as ContextManifest;

      // Verify feature context is included
      expect(manifest.feature_context).toBeDefined();
      expect(manifest.feature_context?.feature_id).toBe('HODGE-372');

      // Verify HODGE.md is still not in the list
      const hodgeMdFile = manifest.global_files.find((f) => f.path === '.hodge/HODGE.md');
      expect(hodgeMdFile).toBeUndefined();
    } finally {
      console.log = originalLog;
      await fixture.cleanup();
    }
  });
});
