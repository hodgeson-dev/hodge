# Progressive Enhancement: User Experience Per Environment

## Environment Detection Logic

```typescript
class EnvironmentDetector {
  detect(): Environment {
    // 1. Claude Code - Check for .claude directory or specific env vars
    if (existsSync('.claude/') || process.env.CLAUDE_WORKSPACE) {
      return {
        name: 'claude-code',
        capabilities: {
          tty: false,
          fileEdit: true,
          prompts: false,
          gitIntegration: true,
          customCommands: true
        }
      };
    }

    // 2. Aider - Has specific env markers
    if (process.env.AIDER_CHAT_HISTORY_FILE || process.argv.includes('--aider')) {
      return {
        name: 'aider',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,  // Built-in git handling
          customCommands: false
        }
      };
    }

    // 3. Continue.dev - VS Code extension environment
    if (process.env.CONTINUE_WORKSPACE || process.env.VSCODE_PID) {
      return {
        name: 'continue',
        capabilities: {
          tty: false,
          fileEdit: true,
          prompts: false,  // Can't do CLI prompts
          gitIntegration: true,
          customCommands: true
        }
      };
    }

    // 4. Cursor - Modified VS Code
    if (process.env.CURSOR_WORKSPACE || process.env.CURSOR_IDE) {
      return {
        name: 'cursor',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,
          customCommands: true
        }
      };
    }

    // 5. Warp - Check for Warp terminal
    if (process.env.TERM_PROGRAM === 'WarpTerminal' || process.env.WARP_SESSION) {
      return {
        name: 'warp',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,
          customCommands: true,
          workflows: true  // Special Warp feature
        }
      };
    }

    // 6. Default terminal
    if (process.stdin.isTTY) {
      return {
        name: 'terminal',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,
          customCommands: false
        }
      };
    }

    // 7. Non-interactive fallback
    return {
      name: 'non-interactive',
      capabilities: {
        tty: false,
        fileEdit: false,
        prompts: false,
        gitIntegration: true,
        customCommands: false
      }
    };
  }
}
```

## Default User Experience by Environment

### 1. Claude Code
**Default Behavior**: File-based interaction with clear instructions

```bash
$ hodge ship HOD-20
```

**What the user sees:**
```
🚀 Preparing to ship: HOD-20

📝 Analyzing changes...
  Modified: src/commands/ship.ts
  Modified: src/lib/commit-generator.ts
  Added: src/lib/interactive-commit.ts

📝 Suggested commit message has been saved to:
   .hodge/temp/commit-HOD-20.txt

────────────────────────────────────────
feat(HOD-20): add interactive commit flow to ship command

- Implement progressive enhancement for different environments
- Add intelligent commit type detection
- Create file-based fallback for non-TTY environments
- Update work log integration on successful commit
────────────────────────────────────────

To proceed with this commit:
  ✅ hodge ship HOD-20 --confirm

To edit the message first:
  ✏️  Edit .hodge/temp/commit-HOD-20.txt
  Then run: hodge ship HOD-20 --confirm

To cancel:
  ❌ hodge ship HOD-20 --cancel
```

**Why this UX?**
- Claude Code can't do interactive prompts in the terminal
- File-based approach allows users to review/edit in their editor
- Clear command options prevent confusion
- Commit message is persisted so user can review at leisure

### 2. Warp Terminal (with workflows)
**Default Behavior**: Full interactive experience with workflow integration

```bash
$ hodge ship HOD-20
```

**What the user sees:**
```
🚀 Preparing to ship: HOD-20

📝 Analyzing changes...
  Modified: 3 files
  Type detected: feat
  Scope: ship command

📝 Suggested commit message:
────────────────────────────────────────
feat(HOD-20): add interactive commit flow to ship command

- Implement progressive enhancement for different environments
- Add intelligent commit type detection
- Create file-based fallback for non-TTY environments
- Update work log integration on successful commit
────────────────────────────────────────

Options:
1. ✅ Use as-is
2. ✏️  Edit interactively
3. 📝 Open in editor
4. 🔍 See detailed diff
5. 🔄 Generate alternative
6. ❌ Cancel

Your choice (1-6): 2

✏️  Edit mode (Ctrl+D when done):
feat(HOD-20): add smart interactive commit flow
[User types their changes...]
^D

📝 Updated message:
────────────────────────────────────────
feat(HOD-20): add smart interactive commit flow

- Progressive enhancement based on environment
- Intelligent commit type detection
- File-based fallback for non-TTY
- Work log updates on success
────────────────────────────────────────

Proceed with commit? (Y/n): Y

✅ Creating commit...
✅ Commit created successfully!
✅ Updated WORK_LOG.md
   Progress: 5/10 tasks complete

Next: Push to remote? (Y/n): _
```

**Warp Workflow Integration:**
```yaml
# .warp/workflows/ship.yaml
name: Ship Feature
description: Interactive ship with commit review
steps:
  - command: hodge ship {{feature}}
    description: Start shipping process
  - prompt:
      message: Review commit message?
      options: [yes, edit, regenerate]
  - conditional:
      if: edit
      command: $EDITOR .hodge/temp/commit.txt
  - command: hodge ship {{feature}} --confirm
```

**Why this UX?**
- Warp has full TTY support for rich interaction
- Workflow integration allows saved sequences
- Multiple edit options cater to different preferences
- Can leverage Warp's AI features for message improvement

### 3. Aider
**Default Behavior**: Respects Aider's git integration, offers enhancement

```bash
$ hodge ship HOD-20
```

**What the user sees:**
```
🚀 Preparing to ship: HOD-20

⚠️  Aider environment detected
    Aider typically handles commits. Choose integration mode:

1. 🤝 Cooperate with Aider (recommended)
   - Generate message, let Aider commit

2. 🔀 Bypass Aider
   - Hodge handles the entire commit

3. 📋 Just generate message
   - Copy to clipboard for manual use

Your choice (1-3): 1

📝 Generating commit message for Aider...

────────────────────────────────────────
feat(HOD-20): add interactive commit flow to ship command

- Implement progressive enhancement for different environments
- Add intelligent commit type detection
- Create file-based fallback for non-TTY environments
- Update work log integration on successful commit
────────────────────────────────────────

✅ Message copied to clipboard
📝 Message saved to: .aider.commit.md

To use with Aider:
  /commit [paste message]

Or let Aider auto-commit with its next change:
  Message will be suggested automatically
```

**Why this UX?**
- Aider has its own git commit workflow
- Avoids conflicts by offering cooperation
- Still provides value through intelligent message generation
- Clipboard integration for smooth workflow

### 4. Continue.dev
**Default Behavior**: File-based with VS Code integration hints

```bash
$ hodge ship HOD-20
```

**What the user sees:**
```
🚀 Preparing to ship: HOD-20

📝 Analyzing changes in VS Code workspace...
  Modified: 3 files
  Type: feat
  PM Issue: HOD-20

📝 Commit message prepared:
────────────────────────────────────────
feat(HOD-20): add interactive commit flow to ship command

- Implement progressive enhancement for different environments
- Add intelligent commit type detection
- Create file-based fallback for non-TTY environments
- Update work log integration on successful commit
────────────────────────────────────────

VS Code Integration Options:
1. 📋 View in new tab: .hodge/temp/commit-HOD-20.txt
2. 🔄 Open Source Control panel to review changes
3. ✅ Commit directly: hodge ship HOD-20 --confirm

💡 Tip: Install Hodge VS Code extension for better integration
   - Adds commit message templates
   - Provides UI for review/edit
   - Integrates with Source Control panel
```

**VS Code Extension Integration (future):**
```typescript
// If VS Code extension is installed
if (vscode.extensions.getExtension('hodge.vscode')) {
  // Show QuickPick UI
  const choice = await vscode.window.showQuickPick([
    '✅ Use suggested message',
    '✏️ Edit in modal',
    '📝 Open in editor',
    '❌ Cancel'
  ]);

  // Handle choice through VS Code API
}
```

**Why this UX?**
- Continue.dev runs in VS Code but has limited prompt capabilities
- Leverages VS Code's built-in git integration
- Suggests future extension for better UX
- File-based approach ensures compatibility

### 5. Cursor
**Default Behavior**: Full interactive with AI enhancement options

```bash
$ hodge ship HOD-20
```

**What the user sees:**
```
🚀 Preparing to ship: HOD-20

📝 Analyzing changes...
  Modified: 3 files
  Type detected: feat

🤖 Cursor AI Integration Available
   Would you like Cursor to enhance the commit message? (Y/n): Y

📝 AI-Enhanced commit message:
────────────────────────────────────────
feat(HOD-20): add interactive commit flow with progressive enhancement

This change introduces an intelligent commit system that adapts to
different development environments, providing the best possible UX
for each context.

- Implement environment detection for Claude Code, Warp, Aider, Continue, and Cursor
- Add progressive enhancement with graceful fallbacks
- Create intelligent commit type detection based on file patterns
- Integrate work log updates for task tracking
- Support both interactive prompts and file-based workflows

Breaking changes: None
Related issues: HOD-20
────────────────────────────────────────

Options:
1. ✅ Use AI-enhanced version
2. 📝 Use original version
3. ✏️  Edit interactively
4. 🔄 Re-generate with different style
5. ❌ Cancel

Your choice (1-5): 1

✅ Creating commit...
✅ Commit created successfully!
✅ Updated WORK_LOG.md

🚀 Push to origin/main? (Y/n): _
```

**Why this UX?**
- Cursor has full terminal capabilities
- Can leverage Cursor's AI for message enhancement
- Provides choice between AI and traditional generation
- Interactive editing available for fine-tuning

## Fallback Behaviors

### When TTY Detection Fails
```bash
$ hodge ship HOD-20
```

```
🚀 Preparing to ship: HOD-20

⚠️  Non-interactive environment detected
   Using file-based workflow

📝 Commit message saved to: .hodge/temp/commit-HOD-20.txt

Review the message and run ONE of:
  hodge ship HOD-20 --confirm    # Use as-is
  hodge ship HOD-20 --message "your custom message"  # Override
  hodge ship HOD-20 --cancel     # Cancel ship

Auto-commit in 30 seconds with --auto flag:
  hodge ship HOD-20 --auto
```

### When Environment Can't Be Determined
```bash
$ hodge ship HOD-20 --debug
```

```
🚀 Preparing to ship: HOD-20

🔍 Environment Detection:
  TTY: false
  CI: false
  Editor: vim (from $EDITOR)
  Git: available

📝 Using safe defaults:
  - File-based message review
  - No auto-commit without --confirm
  - Conservative approach

Message saved to: .hodge/temp/commit-HOD-20.txt
Run with --confirm to proceed
```

## Configuration Override

Users can force a specific behavior via `.hodge/config.json`:

```json
{
  "ship": {
    "interactive": "always" | "never" | "auto",
    "commitMode": "prompt" | "file" | "auto",
    "aiEnhancement": true | false,
    "workLogUpdate": true | false,
    "commitTypes": {
      "feat": "New features",
      "fix": "Bug fixes",
      "docs": "Documentation",
      "style": "Code style",
      "refactor": "Refactoring",
      "test": "Tests",
      "chore": "Maintenance"
    }
  }
}
```

## Command-Line Flags (Universal)

These work in ALL environments:

```bash
# Skip all interaction
hodge ship HOD-20 --no-interactive

# Force file-based editing
hodge ship HOD-20 --edit

# Provide message directly
hodge ship HOD-20 --message "feat: quick fix"

# Auto-confirm suggested message
hodge ship HOD-20 --yes

# Dry run (show what would happen)
hodge ship HOD-20 --dry-run
```

## Summary Table

| Environment | Default Mode | Prompts | File Edit | AI Features | Special |
|------------|--------------|---------|-----------|-------------|---------|
| Claude Code | File-based | ❌ | ✅ | ❌ | Clear instructions |
| Warp | Interactive | ✅ | ✅ | ✅ | Workflows |
| Aider | Cooperative | ✅ | ✅ | ✅ | Git integration |
| Continue | File + Hints | ❌ | ✅ | ❌ | VS Code hints |
| Cursor | Interactive | ✅ | ✅ | ✅ | AI enhancement |
| Terminal | Interactive | ✅ | ✅ | ❌ | Standard flow |
| Unknown | File-based | ❌ | ✅ | ❌ | Safe fallback |