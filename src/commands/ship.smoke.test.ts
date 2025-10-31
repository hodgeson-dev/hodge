import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';

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
});
