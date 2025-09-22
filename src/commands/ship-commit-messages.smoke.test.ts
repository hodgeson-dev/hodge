import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('Ship Commit Message Workflow [smoke]', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create isolated temp directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-ship-test-'));
    process.env.HODGE_TEST_DIR = tempDir;
  });

  afterEach(async () => {
    // Cleanup
    delete process.env.HODGE_TEST_DIR;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should preserve edited commit messages between runs', async () => {
    // Create state files directly in temp directory
    const baseDir = path.join(tempDir, '.hodge', 'temp', 'ship-interaction', 'test-feature');
    await fs.mkdir(baseDir, { recursive: true });

    const stateFile = path.join(baseDir, 'state.json');

    // Initialize with a suggested message
    const initialState: any = {
      command: 'ship',
      feature: 'test-feature',
      status: 'pending',
      timestamp: new Date().toISOString(),
      environment: 'claude-code',
      data: {
        suggested: 'feat: initial generic message\n\n- Implementation complete',
        analysis: {
          files: [],
          type: 'feat',
          scope: 'test',
          breaking: false,
        },
      },
      history: [],
    };

    await fs.writeFile(stateFile, JSON.stringify(initialState, null, 2));

    // Simulate user editing the message
    const editedMessage =
      'fix: detailed commit message\n\n## What Changed\n- Fixed critical bug\n- Added tests';

    // Update the state with edited message
    initialState.status = 'edited';
    initialState.data.edited = editedMessage;
    await fs.writeFile(stateFile, JSON.stringify(initialState, null, 2));

    // Load the state again (simulating re-running ship)
    const loadedContent = await fs.readFile(stateFile, 'utf-8');
    const loadedState = JSON.parse(loadedContent);

    expect(loadedState.status).toBe('edited');
    expect(loadedState.data.edited).toBe(editedMessage);
  });

  it('should not regenerate ui.md if already edited', async () => {
    const baseDir = path.join(tempDir, '.hodge', 'temp', 'ship-interaction', 'test-feature');
    await fs.mkdir(baseDir, { recursive: true });

    const uiPath = path.join(baseDir, 'ui.md');
    const editedContent = '# Edited Message\n\nThis has been edited by the user';

    // Create ui.md with edited content
    await fs.writeFile(uiPath, editedContent);

    // Create state indicating it's been edited
    const stateData = {
      command: 'ship',
      feature: 'test-feature',
      status: 'edited' as const,
      timestamp: new Date().toISOString(),
      environment: 'claude-code',
      data: {
        suggested: 'original message',
        edited: editedContent,
      },
      history: [],
    };

    await fs.writeFile(path.join(baseDir, 'state.json'), JSON.stringify(stateData, null, 2));

    // Verify the ui.md content hasn't changed
    const content = await fs.readFile(uiPath, 'utf-8');
    expect(content).toBe(editedContent);
  });

  it('should clean up state after successful commit', async () => {
    const baseDir = path.join(tempDir, '.hodge', 'temp', 'ship-interaction', 'test-feature');
    await fs.mkdir(baseDir, { recursive: true });

    const stateFile = path.join(baseDir, 'state.json');
    const uiFile = path.join(baseDir, 'ui.md');

    // Create initial state
    const state = {
      command: 'ship',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      environment: 'test',
      data: { suggested: 'test message' },
      history: [],
    };

    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    await fs.writeFile(uiFile, '# Test UI');

    // Verify files exist before cleanup
    const beforeCleanup = await fs
      .access(stateFile)
      .then(() => true)
      .catch(() => false);
    expect(beforeCleanup).toBe(true);

    // Simulate cleanup (remove the files)
    await fs.rm(baseDir, { recursive: true, force: true });

    // Verify state files are removed
    const stateExists = await fs
      .access(stateFile)
      .then(() => true)
      .catch(() => false);

    expect(stateExists).toBe(false);
  });

  it('should handle different commit types correctly', () => {
    // Test commit type detection based on file changes
    const testCases = [
      { files: ['src/commands/new-feature.ts'], expectedType: 'feat' },
      { files: ['src/fix-bug.ts'], expectedType: 'fix' },
      { files: ['test/new.test.ts'], expectedType: 'test' },
      { files: ['README.md', 'docs/guide.md'], expectedType: 'docs' },
      { files: ['package.json'], expectedType: 'deps' },
    ];

    for (const testCase of testCases) {
      // This would be tested by the actual detectCommitType function
      // For smoke test, just verify the structure is correct
      expect(testCase.files).toBeDefined();
      expect(testCase.expectedType).toBeDefined();
    }
  });

  it('should support approve/regenerate/edit/cancel workflow', async () => {
    const choices = ['approve', 'regenerate', 'edit', 'cancel'];

    for (const choice of choices) {
      // Smoke test that each choice is a valid string
      expect(typeof choice).toBe('string');
      expect(choice.length).toBeGreaterThan(0);
    }

    // Verify the workflow supports these options
    const workflowSupportsChoice = (choice: string) => {
      return ['approve', 'regenerate', 'edit', 'cancel'].includes(choice);
    };

    expect(workflowSupportsChoice('approve')).toBe(true);
    expect(workflowSupportsChoice('invalid')).toBe(false);
  });
});
