# Claude Code Interactive Ship Integration

## The Insight

Instead of treating Claude Code as a limitation (no TTY), we can leverage its markdown-based command system to create a **better** interactive experience than traditional terminals!

## Architecture

### 1. Portable Command Generates Files

When `hodge ship HOD-20` runs in Claude Code environment:

```typescript
// In ship.ts
class ShipCommand {
  async execute(feature: string, options: ShipOptions): Promise<void> {
    const env = this.detectEnvironment();

    if (env.isClaudeCode) {
      // Generate interaction files
      await this.prepareClaudeInteraction(feature);
      return; // Let markdown take over
    }
    // ... normal flow
  }

  async prepareClaudeInteraction(feature: string): Promise<void> {
    const interactionDir = '.hodge/temp/ship-interaction';
    await fs.mkdir(interactionDir, { recursive: true });

    // 1. Analyze changes and generate commit message
    const analysis = await this.analyzeChanges();
    const suggested = await this.generateCommitMessage(feature, analysis);

    // 2. Write state files
    await fs.writeFile(
      `${interactionDir}/state.json`,
      JSON.stringify({
        feature,
        status: 'pending',
        timestamp: new Date().toISOString(),
        analysis,
        suggested,
        files: analysis.files,
        type: analysis.type,
        scope: analysis.scope
      })
    );

    await fs.writeFile(
      `${interactionDir}/commit-message.txt`,
      suggested
    );

    await fs.writeFile(
      `${interactionDir}/diff-summary.md`,
      this.formatDiffSummary(analysis)
    );

    console.log(`
📝 Commit preparation complete!

Claude will now show you an interactive review.
The markdown command will handle the rest.
    `);
  }
}
```

### 2. Enhanced Markdown Command

The `.claude/commands/ship.md` file becomes intelligent and interactive:

```markdown
# /ship Command

This command ships a feature to production with an interactive commit review process.

## Usage
/ship <feature>

## Implementation

First, let me prepare your ship for {{feature}}:

```bash
hodge ship {{feature}}
```

Now let me check what was prepared and show you an interactive review:

```typescript
// Read the prepared state
const fs = require('fs').promises;
const path = require('path');

const stateFile = '.hodge/temp/ship-interaction/state.json';
const messageFile = '.hodge/temp/ship-interaction/commit-message.txt';
const diffFile = '.hodge/temp/ship-interaction/diff-summary.md';

// Load the state
const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
const message = await fs.readFile(messageFile, 'utf-8');
const diff = await fs.readFile(diffFile, 'utf-8');
```

## 📝 Commit Review for {{feature}}

### Changed Files
{{#each state.files}}
- {{this.status}} {{this.path}} ({{this.insertions}}+, {{this.deletions}}-)
{{/each}}

**Type detected**: `{{state.type}}`
**Scope**: `{{state.scope}}`

### Suggested Commit Message

```
{{message}}
```

### Detailed Changes
<details>
<summary>Click to see diff summary</summary>

{{diff}}

</details>

## Choose Your Action

Please select how you'd like to proceed:

### Option A: ✅ Use Suggested Message
If the message looks good, I'll commit with it as-is.

### Option B: ✏️ Edit Message
Tell me your edits and I'll update the commit message. For example:
- "Change the first line to: fix(HOD-20): resolve critical bug"
- "Add a bullet point about performance improvements"
- "Make it more descriptive"

### Option C: 🔄 Generate Alternative
I'll create a different style of commit message. Tell me if you want:
- More detailed
- More concise
- Different tone
- Focus on different aspects

### Option D: 📝 Custom Message
Provide your own complete commit message and I'll use that instead.

### Option E: 🔍 See More Details
I'll show you:
- Full file diffs
- Recent commit history
- Related issues/PRs
- Test results

### Option F: ❌ Cancel
Cancel the ship process and keep changes uncommitted.

**Your choice?** (Reply with A, B, C, D, E, or F, along with any additional instructions)

---

Based on your choice, I'll execute the appropriate action:

{{#if choice == 'A'}}
```bash
hodge ship {{feature}} --confirm
```
{{/if}}

{{#if choice == 'B'}}
First, let me update the message based on your edits:

```javascript
// Update the commit message file
const edited = `{{userEdits}}`;
await fs.writeFile('.hodge/temp/ship-interaction/commit-message.txt', edited);
```

Now I'll commit with the edited message:

```bash
hodge ship {{feature}} --confirm
```
{{/if}}

{{#if choice == 'C'}}
Let me generate an alternative message:

```javascript
// Generate alternative based on user preference
const alternative = generateAlternative('{{style}}');
console.log('New suggestion:', alternative);
```

Would you like to use this alternative? (Yes/No/Edit)
{{/if}}

{{#if choice == 'D'}}
Let me save your custom message:

```javascript
await fs.writeFile('.hodge/temp/ship-interaction/commit-message.txt', `{{customMessage}}`);
```

```bash
hodge ship {{feature}} --confirm
```
{{/if}}

{{#if choice == 'E'}}
Here are the full details:

### Full Diff
```bash
git diff --cached
```

### Recent Commits
```bash
git log --oneline -10
```

### Test Results
```bash
npm test -- --related {{feature}}
```

Now, what would you like to do? (Back to options A-F)
{{/if}}

{{#if choice == 'F'}}
```bash
hodge ship {{feature}} --cancel
```

Ship cancelled. Your changes remain staged but uncommitted.
{{/if}}

## After Commit

✅ **Commit created successfully!**

### Work Log Update
```bash
hodge ship {{feature}} --update-worklog
```

### Next Steps
1. Push to remote: `git push`
2. Create PR if on feature branch
3. Update PM issue status
4. Deploy to staging/production

Would you like me to:
- Push to remote?
- Create a pull request?
- Update the PM issue?
- Show the commit details?
```

### 3. The Portable Command's Confirm Mode

When the markdown command calls `hodge ship HOD-20 --confirm`:

```typescript
class ShipCommand {
  async execute(feature: string, options: ShipOptions): Promise<void> {
    if (options.confirm) {
      return this.executeConfirmedShip(feature);
    }

    if (options.cancel) {
      return this.cancelShip(feature);
    }

    // ... normal flow
  }

  async executeConfirmedShip(feature: string): Promise<void> {
    const stateFile = '.hodge/temp/ship-interaction/state.json';
    const messageFile = '.hodge/temp/ship-interaction/commit-message.txt';

    // Read the (possibly edited) message
    const message = await fs.readFile(messageFile, 'utf-8');
    const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));

    // Execute the commit
    await execAsync('git add .');
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`);

    // Update work log if exists
    if (existsSync('WORK_LOG.md')) {
      await this.updateWorkLog(feature);
    }

    // Clean up interaction files
    await fs.rm('.hodge/temp/ship-interaction', { recursive: true });

    console.log('✅ Commit created successfully!');
    console.log('✅ Work log updated');
    console.log('\nNext: Push to remote with `git push`');
  }
}
```

## Communication Protocol

### State Files Structure

```
.hodge/temp/ship-interaction/
├── state.json           # Current state and metadata
├── commit-message.txt   # The commit message (editable)
├── diff-summary.md      # Formatted diff for display
├── user-choice.txt      # User's selection (A-F)
└── history.jsonl        # History of interactions
```

### state.json Schema

```json
{
  "feature": "HOD-20",
  "status": "pending" | "reviewing" | "edited" | "confirmed" | "cancelled",
  "timestamp": "2024-01-15T10:30:00Z",
  "analysis": {
    "files": [
      {
        "path": "src/commands/ship.ts",
        "status": "modified",
        "insertions": 45,
        "deletions": 12
      }
    ],
    "type": "feat",
    "scope": "ship",
    "breaking": false
  },
  "suggested": "feat(HOD-20): add interactive commit flow\n\n- Implementation details",
  "edited": null,
  "confirmedAt": null
}
```

## Advanced Claude Code Features

### 1. Multi-Step Interaction

The markdown can maintain state across multiple interactions:

```markdown
{{#if state.needsMoreInfo}}
I need more information to generate a good commit message:

1. What was the main goal of these changes?
2. Are there any breaking changes?
3. What issue does this resolve?

Please provide answers and I'll generate a better message.
{{/if}}
```

### 2. Smart Suggestions

```markdown
Based on your changes, I notice:
- You modified test files - shall I include test details?
- There's a TODO removed - shall I mention what was completed?
- This looks like a bug fix - shall I change type from 'feat' to 'fix'?
```

### 3. Visual Diff Review

```markdown
### Visual Summary of Changes

```diff
// src/commands/ship.ts
- const message = options.message || generateDefault();
+ const message = await this.interactiveCommit(feature, options);
+
+ // New interactive flow
+ if (this.isClaudeCode()) {
+   return this.prepareClaudeInteraction(feature);
+ }
```

Rate this change:
- 👍 Looks good
- 🤔 Need to see more context
- 👎 Something seems wrong
```

### 4. Validation and Warnings

```markdown
⚠️ **Potential Issues Detected:**
- Commit message first line is 85 characters (should be < 72)
- No tests found for new functions
- TODO comment added without issue reference

Would you like me to:
- Fix the message length
- Generate a TODO issue
- Continue anyway
```

## Benefits of This Approach

### 1. Better Than Terminal!
- Rich markdown formatting
- Collapsible sections
- Syntax highlighting
- Visual diffs
- Inline documentation

### 2. Maintains Context
- Can review changes while deciding
- See multiple options simultaneously
- Reference previous commits easily

### 3. Educational
- Shows WHY certain message formats are suggested
- Teaches good commit practices
- Provides examples

### 4. Flexible
- User can iterate multiple times
- Can switch between options
- Preserves state between interactions

## Implementation Timeline

### Phase 1: Basic Integration
1. Portable command generates state files
2. Markdown reads and displays them
3. Simple confirm/cancel flow

### Phase 2: Interactive Enhancement
1. Add edit capability
2. Add alternative generation
3. Add validation warnings

### Phase 3: Advanced Features
1. Multi-step interactions
2. Smart suggestions based on patterns
3. Integration with PM tools
4. Commit message templates

## Example User Flow in Claude Code

```
User: /ship HOD-20

Claude: [Runs hodge ship HOD-20, prepares files]

Claude: 📝 Commit Review for HOD-20

Changed Files:
- modified src/commands/ship.ts (145+, 23-)
- added src/lib/claude-integration.ts (89+, 0-)
- modified .claude/commands/ship.md (234+, 45-)

Type detected: feat
Scope: ship

Suggested Commit Message:
```
feat(HOD-20): add Claude Code interactive commit flow

- Generate state files for markdown interaction
- Create rich interactive review in markdown
- Support message editing and alternatives
- Add validation and smart suggestions
```

Choose Your Action:
A: ✅ Use Suggested Message
B: ✏️ Edit Message
C: 🔄 Generate Alternative
...

Your choice?

User: B - change "interactive" to "intelligent interactive"

Claude: I'll update that for you:

[Shows updated message]

feat(HOD-20): add Claude Code intelligent interactive commit flow

- Generate state files for markdown interaction
- Create rich interactive review in markdown
- Support message editing and alternatives
- Add validation and smart suggestions

Shall I commit with this updated message? (Yes/No/Edit more)

User: Yes

Claude: [Runs hodge ship HOD-20 --confirm]

✅ Commit created successfully!
✅ Updated WORK_LOG.md

Next: Push to remote? (Yes/No)

User: Yes

Claude: [Runs git push]

✅ Pushed to origin/main
🎉 Ship complete!
```

This approach turns Claude Code's "limitation" into its greatest strength - a rich, interactive, markdown-based UI that's actually BETTER than a traditional terminal!