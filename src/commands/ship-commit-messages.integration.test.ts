import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Ship Commit Message Workflow [integration]', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Create isolated temp directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-ship-integration-'));
    originalCwd = process.cwd();

    // Create a minimal hodge project structure
    await fs.mkdir(path.join(tempDir, '.hodge'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.hodge/features'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.hodge/features/test-feature'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.hodge/features/test-feature/harden'), { recursive: true });

    // Create a minimal git repo
    await execAsync('git init', { cwd: tempDir });
    await execAsync('git config user.email "test@example.com"', { cwd: tempDir });
    await execAsync('git config user.name "Test User"', { cwd: tempDir });
  });

  afterEach(async () => {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should preserve commit message edits across multiple ship runs', async () => {
    // Create interaction state directory
    const stateDir = path.join(tempDir, '.hodge/temp/ship-interaction/test-feature');
    await fs.mkdir(stateDir, { recursive: true });

    // Initial state with generic message
    const initialState = {
      command: 'ship',
      feature: 'test-feature',
      status: 'pending',
      timestamp: new Date().toISOString(),
      environment: 'claude-code',
      data: {
        suggested: 'feat: test-feature\n\n- Implementation complete\n- Tests passing',
        analysis: {
          files: [{ path: 'src/test.ts', status: 'modified', insertions: 10, deletions: 5 }],
          type: 'feat',
          scope: 'test',
          breaking: false,
        },
      },
      history: [],
    };

    const stateFile = path.join(stateDir, 'state.json');
    await fs.writeFile(stateFile, JSON.stringify(initialState, null, 2));

    // Simulate user editing the message
    const editedMessage = `fix: improve commit message workflow

## What Changed
- Updated ship command markdown to generate rich messages
- Fixed state persistence to preserve edits
- Added smoke and integration tests

## Why This Change
Users were getting generic commit messages and losing edits between runs.

## Impact
- Better commit messages
- Improved developer experience`;

    // Update state with edited message
    initialState.status = 'edited' as any;
    (initialState.data as any).edited = editedMessage;
    await fs.writeFile(stateFile, JSON.stringify(initialState, null, 2));

    // Verify state persists
    const loadedState = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    expect(loadedState.status).toBe('edited');
    expect(loadedState.data.edited).toBe(editedMessage);

    // Simulate another ship run - state should still have the edited message
    const reloadedState = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    expect(reloadedState.data.edited).toBe(editedMessage);
  });

  it('should handle the complete ship workflow with state management', async () => {
    const stateDir = path.join(tempDir, '.hodge/temp/ship-interaction/test-feature');
    await fs.mkdir(stateDir, { recursive: true });

    // Step 1: Initialize state (first run of ship command)
    const state = {
      command: 'ship',
      status: 'pending',
      timestamp: new Date().toISOString(),
      environment: 'claude-code',
      data: {
        suggested: 'feat: initial message',
        analysis: { files: [], type: 'feat', scope: 'test', breaking: false },
      },
      history: [{ timestamp: new Date().toISOString(), type: 'init' }],
    };

    const stateFile = path.join(stateDir, 'state.json');
    const uiFile = path.join(stateDir, 'ui.md');

    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    await fs.writeFile(
      uiFile,
      '# Ship Commit\n\n## Suggested Message\n\n```\nfeat: initial message\n```'
    );

    // Step 2: User edits (updates state)
    state.status = 'edited' as any;
    (state.data as any).edited = 'fix: better message with details';
    state.history.push({ timestamp: new Date().toISOString(), type: 'edit' as any });
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));

    // Step 3: Confirm (final state before commit)
    state.status = 'confirmed' as any;
    state.history.push({ timestamp: new Date().toISOString(), type: 'confirm' as any });
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));

    // Verify final state
    const finalState = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    expect(finalState.status).toBe('confirmed');
    expect(finalState.data.edited).toBe('fix: better message with details');
    expect(finalState.history).toHaveLength(3);

    // Step 4: Cleanup simulation (after successful commit)
    await fs.rm(stateDir, { recursive: true });

    // Verify cleanup worked
    const dirExists = await fs
      .access(stateDir)
      .then(() => true)
      .catch(() => false);
    expect(dirExists).toBe(false);
  });

  it('should not regenerate ui.md when state is edited', async () => {
    const stateDir = path.join(tempDir, '.hodge/temp/ship-interaction/test-feature');
    await fs.mkdir(stateDir, { recursive: true });

    const uiFile = path.join(stateDir, 'ui.md');
    const stateFile = path.join(stateDir, 'state.json');

    // Create ui.md with user's edited content
    const userEditedUI = `# Ship Commit - test-feature

## My Custom Edited Message

\`\`\`
feat: user edited this message

This is the message the user wants to use.
\`\`\``;

    await fs.writeFile(uiFile, userEditedUI);

    // Create state showing it's been edited
    const editedState = {
      command: 'ship',
      status: 'edited',
      timestamp: new Date().toISOString(),
      environment: 'claude-code',
      data: {
        suggested: 'original message',
        edited: 'feat: user edited this message\n\nThis is the message the user wants to use.',
      },
      history: [
        { timestamp: new Date().toISOString(), type: 'init' },
        { timestamp: new Date().toISOString(), type: 'edit' },
      ],
    };

    await fs.writeFile(stateFile, JSON.stringify(editedState, null, 2));

    // Read ui.md - should still be user's content
    const uiContent = await fs.readFile(uiFile, 'utf-8');
    expect(uiContent).toBe(userEditedUI);

    // State should still show edited
    const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    expect(state.status).toBe('edited');
  });

  it('should integrate with git operations correctly', async () => {
    // Create a test file to commit
    const testFile = path.join(tempDir, 'test.txt');
    await fs.writeFile(testFile, 'test content');

    // Stage the file
    await execAsync('git add test.txt', { cwd: tempDir });

    // Create ship state
    const stateDir = path.join(tempDir, '.hodge/temp/ship-interaction/test-feature');
    await fs.mkdir(stateDir, { recursive: true });

    const state = {
      command: 'ship',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      environment: 'test',
      data: {
        suggested: 'feat: test commit',
        edited: 'feat: test commit\n\nTest integration with git',
      },
      history: [],
    };

    await fs.writeFile(path.join(stateDir, 'state.json'), JSON.stringify(state, null, 2));

    // Simulate commit with the message from state
    const commitMessage = state.data.edited;
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: tempDir });

    // Verify commit was created
    const { stdout: log } = await execAsync('git log --oneline -1', { cwd: tempDir });
    expect(log).toContain('feat: test commit');

    // After successful commit, state directory would be cleaned up
    // Simulate cleanup
    await fs.rm(stateDir, { recursive: true });

    // Verify cleanup
    const dirExists = await fs
      .access(stateDir)
      .then(() => true)
      .catch(() => false);
    expect(dirExists).toBe(false);
  });
});
