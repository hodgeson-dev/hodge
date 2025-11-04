import { describe, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { RefineCommand } from './refine.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Refine Command Smoke Tests (HODGE-377.6)', () => {
  let fixture: TempDirectoryFixture;
  let tempDir: string;
  let refineCommand: RefineCommand;

  beforeEach(async () => {
    // Create temp directory for isolated testing
    fixture = new TempDirectoryFixture();
    tempDir = await fixture.setup();

    // Create .hodge directory structure
    const hodgeDir = path.join(tempDir, '.hodge');
    await fs.promises.mkdir(hodgeDir, { recursive: true });

    refineCommand = new RefineCommand(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fixture.cleanup();
  });

  smokeTest('Refine command requires exploration.md to exist', async () => {
    // Setup: Feature directory without exploration
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-001');
    await fs.promises.mkdir(featureDir, { recursive: true });

    // Execute & Assert: Should throw error about missing exploration
    await expect(refineCommand.execute('TEST-001')).rejects.toThrow();
  });

  smokeTest('Refine command succeeds when exploration.md exists', async () => {
    // Setup: Feature with exploration
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-001');
    const exploreDir = path.join(featureDir, 'explore');
    await fs.promises.mkdir(exploreDir, { recursive: true });

    // Create exploration.md
    const explorationPath = path.join(exploreDir, 'exploration.md');
    await fs.promises.writeFile(
      explorationPath,
      `# Exploration: TEST-001

## Recommendation
Use Approach 1

## Questions for Refinement
1. **Library choice**: Should we use X or Y?
`
    );

    // Execute: Run refine command
    await refineCommand.execute('TEST-001');

    // Assert: refine/ directory should be created
    const refineDir = path.join(featureDir, 'refine');
    expect(fs.existsSync(refineDir)).toBe(true);
  });

  smokeTest('Refine command rejects existing refinements without --rerun', async () => {
    // Setup: Feature with exploration and existing refinements
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-001');
    const exploreDir = path.join(featureDir, 'explore');
    const refineDir = path.join(featureDir, 'refine');

    await fs.promises.mkdir(exploreDir, { recursive: true });
    await fs.promises.mkdir(refineDir, { recursive: true });

    // Create exploration.md
    await fs.promises.writeFile(
      path.join(exploreDir, 'exploration.md'),
      '# Exploration: TEST-001\n\n## Recommendation\nUse Approach 1'
    );

    // Create existing refinements.md
    const refinementsPath = path.join(refineDir, 'refinements.md');
    await fs.promises.writeFile(refinementsPath, '# Refinement: TEST-001\n\nExisting refinements');

    // Execute & Assert: Should throw error about existing refinements
    await expect(refineCommand.execute('TEST-001')).rejects.toThrow();
  });

  smokeTest('Refine command accepts --rerun flag to regenerate refinements', async () => {
    // Setup: Feature with exploration and existing refinements
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-001');
    const exploreDir = path.join(featureDir, 'explore');
    const refineDir = path.join(featureDir, 'refine');

    await fs.promises.mkdir(exploreDir, { recursive: true });
    await fs.promises.mkdir(refineDir, { recursive: true });

    // Create exploration.md
    await fs.promises.writeFile(
      path.join(exploreDir, 'exploration.md'),
      '# Exploration: TEST-001\n\n## Recommendation\nUse Approach 1'
    );

    // Create existing refinements.md
    const refinementsPath = path.join(refineDir, 'refinements.md');
    await fs.promises.writeFile(refinementsPath, '# Refinement: TEST-001\n\nExisting refinements');

    // Execute: Run refine command with --rerun
    await refineCommand.execute('TEST-001', { rerun: true });

    // Assert: Should succeed (no error thrown)
    expect(fs.existsSync(refinementsPath)).toBe(true);
  });

  smokeTest('Refine command extracts questions from exploration.md', async () => {
    // Setup: Feature with exploration containing questions
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-001');
    const exploreDir = path.join(featureDir, 'explore');
    await fs.promises.mkdir(exploreDir, { recursive: true });

    // Create exploration.md with Questions for Refinement
    const explorationPath = path.join(exploreDir, 'exploration.md');
    await fs.promises.writeFile(
      explorationPath,
      `# Exploration: TEST-001

## Recommendation
Use Approach 1

## Questions for Refinement

1. **Library choice**: Should we use X or Y?
2. **Error handling**: How should we handle edge cases?
3. **Performance**: What caching strategy should we use?
`
    );

    // Execute: Run refine command
    await refineCommand.execute('TEST-001');

    // Assert: CLI should have output context with questions
    // (This is a smoke test - just verify it doesn't crash)
    expect(fs.existsSync(path.join(featureDir, 'refine'))).toBe(true);
  });

  smokeTest('Refine command handles exploration without questions', async () => {
    // Setup: Feature with exploration but no questions
    const featureDir = path.join(tempDir, '.hodge', 'features', 'TEST-001');
    const exploreDir = path.join(featureDir, 'explore');
    await fs.promises.mkdir(exploreDir, { recursive: true });

    // Create exploration.md without Questions for Refinement section
    const explorationPath = path.join(exploreDir, 'exploration.md');
    await fs.promises.writeFile(
      explorationPath,
      `# Exploration: TEST-001

## Recommendation
Use Approach 1

## Implementation Approaches
- Approach 1: Simple and straightforward
`
    );

    // Execute: Run refine command
    await refineCommand.execute('TEST-001');

    // Assert: Should succeed even without questions
    const refineDir = path.join(featureDir, 'refine');
    expect(fs.existsSync(refineDir)).toBe(true);
  });
});
