# Example: Enhanced ship.md for Claude Code

This is what the actual `.claude/commands/ship.md` file would look like:

```markdown
# Ship Feature to Production

Completes the development cycle by shipping a feature with quality checks and git integration.

## Usage
/ship <feature>

---

First, let me prepare the ship process for {{feature}}:

```bash
hodge ship {{feature}}
```

Now let me load the prepared commit details:

```javascript
const fs = require('fs').promises;
const stateFile = '.hodge/temp/ship-interaction/state.json';
const messageFile = '.hodge/temp/ship-interaction/commit-message.txt';

try {
  const state = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
  const message = await fs.readFile(messageFile, 'utf-8');

  console.log('State loaded successfully');
  console.log(`Files changed: ${state.analysis.files.length}`);
  console.log(`Commit type: ${state.analysis.type}`);
} catch (error) {
  console.log('Preparing fresh analysis...');
}
```

## 📝 Commit Review for {{feature}}

### Changes Summary
Based on my analysis, here's what you're shipping:

| File | Changes | Type |
|------|---------|------|
{{#each files}}
| `{{path}}` | {{insertions}}+ / {{deletions}}- | {{status}} |
{{/each}}

**Detected Type**: `{{type}}` ({{typeDescription}})
**Scope**: `{{scope}}`
**Breaking Changes**: {{#if breaking}}⚠️ YES{{else}}✅ None{{/if}}

### 📋 Suggested Commit Message

```
{{message}}
```

<details>
<summary>📖 Why this message format?</summary>

- **Type prefix** (`{{type}}`): Helps with automatic versioning and changelog generation
- **Scope** (`{{scope}}`): Identifies the affected area of code
- **Description**: Clear, imperative mood ("add" not "adds" or "added")
- **Body**: Explains the "why" behind the changes
- **Footer**: References issues and notes breaking changes

[Learn more about Conventional Commits](https://www.conventionalcommits.org/)
</details>

---

## 🎯 How would you like to proceed?

### Option A: ✅ **Use Suggested Message**
> The message looks perfect, let's commit!

### Option B: ✏️ **Edit the Message**
> I'll help you modify specific parts. Just tell me what to change:
> - "Make it shorter"
> - "Change type to 'fix'"
> - "Add more detail about X"
> - "Change first line to: ..."

### Option C: 🔄 **Generate Alternative Style**
> I'll create a different version. Choose a style:
> - **Detailed**: More context and explanation
> - **Concise**: Just the essentials
> - **Technical**: Focus on implementation details
> - **User-focused**: Emphasize user-facing changes

### Option D: 📝 **Write Custom Message**
> Provide your complete message and I'll use it instead

### Option E: 🔍 **Review More Details**
> See full diffs, test results, or related commits

### Option F: ❌ **Cancel Ship**
> Keep changes staged but don't commit

**Please respond with your choice (A-F) and any additional instructions.**

---

{{#if userChoice}}

{{#if userChoice == 'A'}}
## ✅ Confirming Commit

Using the suggested message:

```bash
hodge ship {{feature}} --confirm
```

Great! I've created the commit. Here's what happened:

✅ **Commit created**: {{commitHash}}
✅ **Work log updated**: 3 tasks marked complete
✅ **PM issue linked**: HOD-20 will be marked as Done

### Next Steps
Would you like me to:
1. **Push to remote** → `git push origin main`
2. **Create a PR** → If you're on a feature branch
3. **View the commit** → `git show HEAD`
4. **Done for now** → Complete!

{{/if}}

{{#if userChoice == 'B'}}
## ✏️ Editing Commit Message

Current message:
```
{{currentMessage}}
```

{{#if userInstruction}}
Based on your instruction: "{{userInstruction}}"

Here's the updated message:

```
{{editedMessage}}
```

Changes made:
- {{#each changes}}{{this}}{{/each}}

**Use this edited version?** (Yes / Edit more / Cancel)
{{else}}
**How would you like to edit it?**

Examples:
- "Change the type to 'fix'"
- "Make the first line: fix(HOD-20): resolve critical ship bug"
- "Add a note about performance improvements"
- "Remove the breaking changes section"

**Your edit instructions:**
{{/if}}

{{/if}}

{{#if userChoice == 'C'}}
## 🔄 Alternative Commit Messages

{{#if style == 'detailed'}}
### Detailed Version
```
feat(HOD-20): implement intelligent interactive commit flow for ship command

This change revolutionizes the commit process by adding environment-aware
interactive capabilities to the ship command, providing optimal UX for each
development environment.

Key improvements:
- Automatic environment detection (Claude Code, Warp, Aider, Continue, Cursor)
- Progressive enhancement with graceful fallbacks
- Rich markdown-based interaction for Claude Code
- File-based communication protocol for state management
- Intelligent commit type detection based on changed files
- Work log integration for automatic task tracking

Technical details:
- New EnvironmentDetector class for runtime detection
- State persistence via JSON files in .hodge/temp/
- Support for both TTY and non-TTY environments
- Universal command flags for automation

Closes HOD-20
```
{{/if}}

{{#if style == 'concise'}}
### Concise Version
```
feat(HOD-20): add interactive commit flow

- Environment-aware interaction
- Progressive enhancement
- Claude Code markdown integration
- Work log updates
```
{{/if}}

{{#if !style}}
**Which style would you prefer?**
- **Detailed** - Comprehensive with full context
- **Concise** - Brief and to the point
- **Technical** - Implementation focused
- **User-focused** - Feature and benefit oriented

**Your preference:**
{{/if}}

**Use this alternative?** (Yes / Try another style / Back to original)

{{/if}}

{{#if userChoice == 'D'}}
## 📝 Custom Commit Message

Please provide your complete commit message:

```
{{userMessage}}
```

{{#if userMessage}}
### Validation Results

{{#if valid}}
✅ Message looks good!
- First line: {{firstLineLength}} chars (< 72 ✓)
- Has body: {{hasBody}}
- References issue: {{hasIssue}}
{{else}}
⚠️ Suggestions:
- {{#each suggestions}}{{this}}{{/each}}
{{/if}}

**Proceed with this custom message?** (Yes / Edit / Cancel)
{{/if}}

{{/if}}

{{#if userChoice == 'E'}}
## 🔍 Detailed Review

### Full Diff
```diff
{{gitDiff}}
```

### Recent Related Commits
```
{{recentCommits}}
```

### Test Results
```
{{testResults}}
```

### File Metrics
- Total files changed: {{totalFiles}}
- Lines added: {{totalAdditions}}
- Lines removed: {{totalDeletions}}
- Test coverage: {{coverage}}%

**Back to commit options** (A-F) or need more details?

{{/if}}

{{#if userChoice == 'F'}}
## ❌ Cancelling Ship

```bash
hodge ship {{feature}} --cancel
```

Ship cancelled. Your changes remain staged but uncommitted.

You can:
- Resume later with `/ship {{feature}}`
- Unstage changes with `git reset`
- View staged changes with `git diff --cached`

{{/if}}

{{/if}}

---

💡 **Pro Tips**:
- Use `/ship {{feature}} --dry-run` to preview without committing
- Add `--no-interactive` to skip this review
- Configure defaults in `.hodge/config.json`
```

## This Markdown Template Provides:

1. **Rich Visual Experience**
   - Tables for file changes
   - Collapsible sections for additional info
   - Syntax highlighting for code
   - Emoji indicators for clarity

2. **Educational Content**
   - Explains WHY certain formats are used
   - Links to documentation
   - Shows examples

3. **Flexible Interaction**
   - Multiple paths based on user preference
   - Can iterate multiple times
   - Preserves context between interactions

4. **Smart Validation**
   - Checks message format
   - Suggests improvements
   - Warns about potential issues

5. **Integration Points**
   - Reads from hodge-generated files
   - Writes user choices back
   - Calls hodge with appropriate flags

This approach makes Claude Code's ship command MORE powerful than traditional terminal interfaces!