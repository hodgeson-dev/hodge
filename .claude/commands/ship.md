# 🚀 Ship Command - Interactive Commit & Ship

## Standards Review Process

### AI Standards Compliance Check
Before shipping, you MUST ensure all standards are met at the **BLOCKING Level**:

- [ ] **All tests passing** (no failures allowed)
- [ ] **No TypeScript errors** (strict mode compliance)
- [ ] **No ESLint errors** (warnings acceptable)
- [ ] **Performance standards met** (CLI < 500ms response)
- [ ] **Documentation updated** (if public APIs changed)
- [ ] **Test coverage >80%** for new code

If any BLOCKING standards are not met, return to `/harden` phase.

## Step 1: Analyze Changes
First, analyze the git changes to understand what was modified:

```bash
# Check if feature is ready
feature="{{feature}}"
if [ ! -d ".hodge/features/$feature/harden" ]; then
    echo "⚠️ Feature has not been hardened yet"
    echo "Run: hodge harden $feature"
    exit 1
fi

# Gather change information
echo "📊 Analyzing changes for $feature..."
git status --short
echo ""
echo "📝 Detailed changes:"
git diff --stat
echo ""
echo "📄 File-by-file changes:"
git diff --name-status
```

## Step 2: Generate Rich Commit Message

Based on the git analysis above, generate a detailed commit message that:
1. Uses conventional commit format (feat:, fix:, test:, docs:, refactor:, chore:)
2. Provides a clear, concise summary in the first line
3. Includes a "What Changed" section with specific details
4. Explains "Why This Change" when the context is clear
5. Lists the "Impact" of the changes
6. References the issue ID if available

**Analyze the actual changes from the git diff above to create a contextual message.**

For example, if package.json changed, list specific dependencies updated.
If tests were added, mention the test count and what they test.
If it's a bug fix, explain what was broken and how it's fixed.

### Generated Commit Message:
```
[Create a rich, detailed commit message based on the actual git diff analysis above]

## What Changed
- [Specific files and changes, e.g., "Modified 3 ship command files"]
- [Dependencies if package.json changed]
- [Test additions with counts]
- [Documentation updates]

## Why This Change
[Explain the motivation based on the feature name and changes]

## Impact
- [User-facing impacts]
- [Developer experience improvements]
- [Performance or reliability changes]
```

## Step 3: Interactive Approval

Present the generated commit message for approval:

```
════════════════════════════════════════════════════════════
COMMIT MESSAGE FOR REVIEW:
════════════════════════════════════════════════════════════
[Display the generated message from Step 2]
════════════════════════════════════════════════════════════

Options:
(a) ✅ Approve - Use this message
(r) 🔄 Regenerate - Create a different message
(e) ✏️ Edit - Let me modify this message
(c) ❌ Cancel - Stop the ship process

Your choice [a/r/e/c]:
```

### Based on User Choice:

**If (a) Approve:**
Save the message to the interaction state and proceed with shipping.

Use the Write tool to save the approved message to both ui.md AND state.json (Write tool creates parent directories automatically):

**Write to:** `.hodge/temp/ship-interaction/{{feature}}/ui.md`
```markdown
# Ship Commit - {{feature}}

## Approved Commit Message

```
[The approved commit message]
```
```

**Write to:** `.hodge/temp/ship-interaction/{{feature}}/state.json`
```json
{
  "command": "ship",
  "feature": "{{feature}}",
  "status": "edited",
  "timestamp": "{{current_iso_timestamp}}",
  "environment": "Claude Code",
  "data": {
    "edited": "[The approved commit message]",
    "suggested": "[Original suggested message if available]"
  },
  "history": [
    {
      "timestamp": "{{current_iso_timestamp}}",
      "type": "edit",
      "data": "User approved message via slash command"
    }
  ]
}
```

**Important**: Replace `{{feature}}` and `{{current_iso_timestamp}}` with actual values, and insert the actual approved commit message in the appropriate locations.

Finally, run ship with the message (it will detect and use the edited state):
```bash
hodge ship "{{feature}}"
```

**If (r) Regenerate:**
Return to Step 2 and create a different version of the commit message, varying:
- The phrasing and structure
- The level of detail
- The emphasis on different aspects

**If (e) Edit:**
Ask the user to provide their edited version:
```
Please provide your edited commit message:
(Paste the complete message below)
```

Then use the Write tool to save their edited version to state files (Write tool creates parent directories automatically):

**Write to:** `.hodge/temp/ship-interaction/{{feature}}/ui.md`
```markdown
# Ship Commit - {{feature}}

## Edited Commit Message

```
[User's edited commit message]
```
```

**Write to:** `.hodge/temp/ship-interaction/{{feature}}/state.json`
```json
{
  "command": "ship",
  "feature": "{{feature}}",
  "status": "edited",
  "timestamp": "{{current_iso_timestamp}}",
  "environment": "Claude Code",
  "data": {
    "edited": "[User's edited commit message]",
    "suggested": "[Original suggested message]"
  },
  "history": [
    {
      "timestamp": "{{current_iso_timestamp}}",
      "type": "edit",
      "data": "User provided custom message via slash command"
    }
  ]
}
```

**Important**: Replace `{{feature}}` and `{{current_iso_timestamp}}` with actual values, and insert the user's actual edited commit message.

Finally, run ship with the edited message:
```bash
hodge ship "{{feature}}"
```

**If (c) Cancel:**
```bash
echo "Ship cancelled. Your changes remain uncommitted."
echo "Run '/ship {{feature}}' when ready to try again."
```

## Step 3.5: Capture Lessons Learned (Optional - Before Commit)

**IMPORTANT**: This step happens BEFORE the ship command executes, so lessons are included in the feature commit.

### Ask User About Lessons

```
Would you like to document lessons learned from this feature? (y/n)

This will be committed with your feature work.
```

If user says **no** or **n**:
- Thank them and skip to Step 4
- No lesson files will be created
- Proceed directly to ship execution

If user says **yes** or **y**, proceed with enhancement questions:

### Gather Lessons Information

Ask the following questions to gather insights (3-4 questions):

**Question 1: What Worked Well**
```
What approach or technique worked particularly well in this implementation?

(Share your thoughts, or type 'skip' to skip this question)
```

**Question 2: What to Improve**
```
If you were implementing this feature again, what would you do differently?

(Share your thoughts, or type 'skip' to skip this question)
```

**Question 3: Gotchas and Surprises**
```
Were there any gotchas, surprises, or unexpected challenges?

(Share your thoughts, or type 'skip' to skip this question)
```

**Question 4: Pattern Potential** (Optional)
```
Did you create reusable code that could become a pattern for others?

(Share your thoughts, or type 'skip' to skip this question)
```

### Analyze and Create Finalized Lesson

After gathering responses, create the enriched lesson:

1. **Read context files**:
   ```bash
   # Get git diff to analyze changes
   git diff --stat
   git diff --name-status

   # Review exploration decisions
   cat ".hodge/features/$feature/explore/exploration.md"

   # Check decisions made
   cat ".hodge/features/$feature/decisions.md" 2>/dev/null || grep -A 10 "Feature: $feature" .hodge/decisions.md
   ```

2. **Generate enriched lesson** combining:
   - Git diff analysis (files changed, scope of changes)
   - User insights from questions above
   - Exploration context and decisions made
   - Lessons structure similar to `HODGE-003-feature-extraction.md`

3. **Create finalized lesson**:

   First, generate descriptive slug from feature title:
   ```bash
   slug=$(echo "{{feature}}" | tr '[:upper:]' '[:lower:]' | sed 's/hodge-//' | sed 's/[^a-z0-9]/-/g')
   echo "Lesson file will be: .hodge/lessons/{{feature}}-${slug}.md"
   ```

   Then use the Write tool to create the enriched lesson (Write tool creates parent directories automatically):

   **Write to:** `.hodge/lessons/{{feature}}-{{slug}}.md`
   ```markdown
# Lessons Learned: {{feature}}

## Feature: [Feature Title]

### The Problem
[Describe the problem this feature solved]

### Approach Taken
[Summarize the implementation approach chosen]

### Key Learnings

#### 1. [Learning Title]
**Discovery**: [What was discovered]

**Solution**: [How it was addressed]

[User insights from questions]

### Code Examples
[Include relevant code patterns if applicable]

### Impact
[Describe the impact and benefits]

### Related Decisions
[List related decisions from decisions.md]

---
_Documented: {{current_date}}_
```

   **Important**: Replace `{{feature}}`, `{{slug}}`, and `{{current_date}}` with actual values, and fill in all bracketed sections with the enriched content.

   Then confirm to the user:
   ```bash
   echo "✅ Lessons documented at: .hodge/lessons/{{feature}}-${slug}.md"
   echo "This will be committed with your feature."
   ```

4. **Example Enriched Lesson Structure**:

   See `.hodge/lessons/HODGE-003-feature-extraction.md` for example of rich lesson format with:
   - Problem statement and context
   - Approach evolution (what worked, what didn't)
   - Key learnings with code examples
   - Impact assessment
   - Related decisions

## Step 4: Ship Quality Checks & Commit

The ship command will:
- ✅ Run all tests
- ✅ Check code coverage
- ✅ Verify documentation
- ✅ Stage all files (including lessons if created) with `git add -A`
- ✅ Create git commit with approved message
- ✅ Update PM tracking
- ✅ Learn patterns from shipped code

## Post-Ship Actions
After successful shipping:
1. Push to remote: `git push`
2. Create PR if needed
3. Monitor production metrics
4. Review and document lessons learned
5. Start next feature with `/explore`

## Troubleshooting
- **Tests failing?** Fix them first with `/build {{feature}}`
- **Not hardened?** Run `/harden {{feature}}` first
- **Need to skip tests?** Add `--skip-tests` (not recommended)