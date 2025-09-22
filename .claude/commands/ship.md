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
Save the message to the interaction state and proceed with shipping:
```bash
# Save the approved message to both ui.md AND state.json for hodge ship to use
mkdir -p .hodge/temp/ship-interaction/{{feature}}

# Save to ui.md for display
cat > .hodge/temp/ship-interaction/{{feature}}/ui.md << 'EOF'
# Ship Commit - {{feature}}

## Approved Commit Message

```
[The approved commit message]
```
EOF

# Save to state.json with "edited" status so ship command uses it
cat > .hodge/temp/ship-interaction/{{feature}}/state.json << 'EOF'
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
EOF

# Run ship with the message (it will detect and use the edited state)
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
Then save their edited version to state files:
```bash
# Save the edited message to both ui.md AND state.json
mkdir -p .hodge/temp/ship-interaction/{{feature}}

cat > .hodge/temp/ship-interaction/{{feature}}/ui.md << 'EOF'
# Ship Commit - {{feature}}

## Edited Commit Message

```
[User's edited commit message]
```
EOF

cat > .hodge/temp/ship-interaction/{{feature}}/state.json << 'EOF'
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
EOF

# Run ship with the edited message
hodge ship "{{feature}}"
```

**If (c) Cancel:**
```bash
echo "Ship cancelled. Your changes remain uncommitted."
echo "Run '/ship {{feature}}' when ready to try again."
```

## Step 4: Ship Quality Checks
The ship command will:
- ✅ Run all tests
- ✅ Check code coverage
- ✅ Verify documentation
- ✅ Create git commit with approved message
- ✅ Update PM tracking
- ✅ Learn patterns from shipped code

## Step 5: Capture lessons learned
After shipping, reflect on what was learned:

### Consider Global Improvements
- **Pattern Candidate**: Did you create reusable code that could become a pattern?
- **Standards Update**: Should any standards be updated based on this work?
- **Tool Enhancement**: Any workflow improvements to suggest?

### Document Lessons
```bash
# Create lessons learned entry
lessons_file=".hodge/lessons/$feature-$(date +%Y%m%d).md"
mkdir -p .hodge/lessons

cat > "$lessons_file" << EOF
# Lessons from $feature

## What Worked Well
- [Document successes]

## Challenges Faced
- [Document challenges and solutions]

## Patterns Discovered
- [Any reusable patterns identified]

## Recommendations
- [Future improvements]

EOF
```

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