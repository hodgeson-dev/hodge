/**
 * Smoke tests for .hodge/.gitignore patterns
 * HODGE-377.3: Verify gitignore patterns correctly exclude auto-generated files
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { StructureGenerator } from './structure-generator.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { smokeTest } from '../test/helpers.js';
import type { ProjectInfo, ProjectType } from './detection.js';
import fs from 'fs/promises';
import path from 'path';

describe('Gitignore Patterns - Smoke Tests (HODGE-377.3)', () => {
  let fixture: TempDirectoryFixture;
  let generator: StructureGenerator;
  let mockProjectInfo: ProjectInfo;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    await fixture.setup();
    generator = new StructureGenerator(fixture.getPath());

    mockProjectInfo = {
      name: 'test-project',
      type: 'node' as ProjectType,
      pmTool: null,
      hasExistingConfig: false,
      detectedTools: {
        packageManager: 'npm',
        testFramework: [],
        linting: [],
        buildTools: [],
        hasGit: true,
      },
      rootPath: fixture.getPath(),
    };
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  smokeTest('should create .hodge/.gitignore with all three patterns', async () => {
    await generator.generateStructure(mockProjectInfo);

    const gitignorePath = path.join(fixture.getPath(), '.hodge', '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');

    // Verify all three patterns exist
    expect(content).toContain('context.json');
    expect(content).toContain('architecture-graph.dot');
    expect(content).toContain('features/**/ship-record.json');
  });

  smokeTest('should include helpful comments in gitignore', async () => {
    await generator.generateStructure(mockProjectInfo);

    const gitignorePath = path.join(fixture.getPath(), '.hodge', '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');

    // Verify comments explaining why files are ignored
    expect(content).toContain('auto-generated');
    expect(content).toContain('hodge regen');
  });

  smokeTest('should preserve existing gitignore content when appending', async () => {
    // Create .hodge directory and existing gitignore
    await fixture.writeFile('.hodge/.gitignore', '# Existing content\ncustom-pattern.txt\n');

    await generator.generateStructure(mockProjectInfo);

    const gitignorePath = path.join(fixture.getPath(), '.hodge', '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');

    // Verify both existing and new patterns
    expect(content).toContain('custom-pattern.txt');
    expect(content).toContain('architecture-graph.dot');
    expect(content).toContain('features/**/ship-record.json');
  });

  smokeTest('should not duplicate patterns when re-running init', async () => {
    // Run generateStructure twice
    await generator.generateStructure(mockProjectInfo);
    await generator.generateStructure(mockProjectInfo);

    const gitignorePath = path.join(fixture.getPath(), '.hodge', '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');

    // Count occurrences of architecture-graph.dot
    const matches = content.match(/architecture-graph\.dot/g);
    expect(matches).toBeDefined();
    expect(matches!.length).toBe(1); // Should only appear once
  });

  smokeTest('should use ** glob pattern for nested ship records', async () => {
    await generator.generateStructure(mockProjectInfo);

    const gitignorePath = path.join(fixture.getPath(), '.hodge', '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');

    // Verify the pattern uses ** for any nesting level
    expect(content).toContain('features/**/ship-record.json');
  });

  smokeTest('should separate patterns by category with comments', async () => {
    await generator.generateStructure(mockProjectInfo);

    const gitignorePath = path.join(fixture.getPath(), '.hodge', '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');

    // Verify categorization comments
    expect(content).toMatch(/Session state.*HODGE-377\.1/i);
    expect(content).toMatch(/Architecture graph/i);
    expect(content).toMatch(/Ship records/i);
  });
});
