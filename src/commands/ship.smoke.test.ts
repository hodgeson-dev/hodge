import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';
import { promises as fs } from 'fs';
import path from 'path';

describe('Ship Command - Smoke Tests', () => {
  smokeTest('should require commit message via -m flag', async () => {
    await withTestWorkspace('ship-requires-message', async (workspace) => {
      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Run ship command with required message flag
      await workspace.hodge('ship test-feature -m "ship: test feature" --skip-tests');
    });
  });

  smokeTest('should accept commit message via -m flag', async () => {
    await withTestWorkspace('ship-with-message', async (workspace) => {
      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Command should use the provided message
      await workspace.hodge('ship test-feature -m "fix: streamline ship workflow" --skip-tests');
    });
  });

  smokeTest('should be completely non-interactive', async () => {
    await withTestWorkspace('ship-non-interactive', async (workspace) => {
      await workspace.writeFile(
        '.hodge/features/test-feature/build/context.json',
        JSON.stringify({
          feature: 'test-feature',
          mode: 'build',
        })
      );

      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Non-interactive with required message
      await workspace.hodge('ship test-feature -m "ship: test feature" --skip-tests');
    });
  });

  smokeTest('should not leave temporary interaction state files', async () => {
    await withTestWorkspace('ship-no-temp-files', async (workspace) => {
      // Initialize git repo
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');

      // Ship with message
      await workspace.hodge('ship test-feature -m "ship: test feature" --skip-tests');

      // Verify no interaction state directory exists
      const tempDir = await workspace.exists('.hodge/temp/ship-interaction');
      if (tempDir) {
        throw new Error('Unexpected: interaction state directory should not exist');
      }
    });
  });

  smokeTest('should always create git commit', async () => {
    await withTestWorkspace('ship-always-commits', async (workspace) => {
      // Initialize git repo with main branch
      await workspace.run('git init');
      await workspace.run('git config user.email "test@example.com"');
      await workspace.run('git config user.name "Test User"');
      await workspace.writeFile('test.txt', 'test');
      await workspace.run('git add .');
      await workspace.run('git commit -m "initial"');
      await workspace.writeFile('test2.txt', 'test2');
      await workspace.run('git add .');
      await workspace.run('git commit -m "feature"');

      // Ship always creates commit (no --no-commit option)
      await workspace.hodge('ship test-feature -m "ship: test feature" --skip-tests');
    });
  });

  smokeTest('should not generate HODGE.md', async () => {
    // Verify ship.ts does not generate HODGE.md
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const content = await fs.readFile(shipPath, 'utf-8');

    // Should NOT call generateFeatureHodgeMD
    expect(content).not.toContain('generateFeatureHodgeMD');
    expect(content).not.toContain('populator.generateFeatureHodgeMD');
  });

  smokeTest('should not backup/restore HODGE.md', async () => {
    // Verify backup/restore logic in both ship.ts and ShipService
    const shipPath = path.join(process.cwd(), 'src', 'commands', 'ship.ts');
    const shipServicePath = path.join(process.cwd(), 'src', 'lib', 'ship-service.ts');

    const [shipContent, serviceContent] = await Promise.all([
      fs.readFile(shipPath, 'utf-8'),
      fs.readFile(shipServicePath, 'utf-8'),
    ]);

    // Should NOT backup featureHodgeMd (in either file)
    expect(shipContent).not.toContain('backup.featureHodgeMd');
    expect(shipContent).not.toContain('featureHodgePath');
    expect(serviceContent).not.toContain('backup.featureHodgeMd');
    expect(serviceContent).not.toContain('featureHodgePath');

    // Should still backup other metadata (project_management.md)
    // ship.ts calls the service, service implements the logic
    expect(shipContent).toContain('shipService.backupMetadata');
    expect(serviceContent).toContain('backupMetadata');
    expect(serviceContent).toContain('restoreMetadata');
  });

  smokeTest('should not generate lessons-draft.md in CLI', async () => {
    const shipTsPath = path.join(process.cwd(), 'src/commands/ship.ts');
    const content = await fs.readFile(shipTsPath, 'utf-8');

    expect(content).not.toContain('generateLessonsDraft');
    expect(content).not.toContain('lessons-draft.md');
  });

  smokeTest('should have comment explaining lessons are handled in slash command', async () => {
    const shipTsPath = path.join(process.cwd(), 'src/commands/ship.ts');
    const content = await fs.readFile(shipTsPath, 'utf-8');

    expect(content).toContain(
      'Lessons learned are now captured in the /ship slash command BEFORE this CLI command runs'
    );
  });

  smokeTest('should still have PatternLearner for pattern detection', async () => {
    // Pattern learning moved to ShipService
    const shipServicePath = path.join(process.cwd(), 'src', 'lib', 'ship-service.ts');
    const content = await fs.readFile(shipServicePath, 'utf-8');

    // Pattern learning is separate from lessons-draft generation
    expect(content).toContain('PatternLearner');
    expect(content).toContain('analyzeShippedCode');
  });
});
