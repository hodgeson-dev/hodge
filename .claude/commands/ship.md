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
First, let me analyze your git changes and generate a commit message:

```bash
# Get current feature and check status
feature="{{feature}}"
if [ -z "$feature" ]; then
    hodge status
    echo "Please provide a feature name to ship"
    exit 1
fi

# Check if feature is ready to ship
if [ ! -d ".hodge/features/$feature/harden" ]; then
    echo "⚠️ Feature has not been hardened yet"
    echo "Run: hodge harden $feature"
    exit 1
fi

# Analyze git changes
echo "📊 Analyzing changes for $feature..."
git status --short
echo ""
echo "📝 Detailed changes:"
git diff --stat
```

## Step 2: Generate Commit Message
Based on the changes, here's the suggested commit message:

```bash
# Detect commit type from changes
files_changed=$(git diff --name-only)
if echo "$files_changed" | grep -q "test"; then
    type="test"
elif echo "$files_changed" | grep -q "docs\|README\|CHANGELOG"; then
    type="docs"
elif echo "$files_changed" | grep -q "src/commands"; then
    type="feat"
else
    type="feat"
fi

# Get issue ID if available
issue_id=""
if [ -f ".hodge/features/$feature/issue-id.txt" ]; then
    issue_id=$(cat ".hodge/features/$feature/issue-id.txt")
fi

# Generate commit message
if [ -n "$issue_id" ]; then
    commit_msg="$type: $feature ($issue_id)

- Implementation complete
- Tests passing
- Documentation updated
- Closes $issue_id"
else
    commit_msg="$type: $feature

- Implementation complete
- Tests passing
- Documentation updated"
fi

echo "Suggested commit message:"
echo "========================"
echo "$commit_msg"
echo "========================"
```

## Step 3: Review and Approve

**Review the commit message above.** You can either:
1. **Approve it as-is** - I'll use this message
2. **Edit it** - Provide your custom message
3. **Cancel** - Stop the ship process

### To proceed with shipping:

**Option A: Use suggested message**
```bash
# Use printf to properly handle multi-line message
hodge ship "$feature" --message "$(printf '%s' "$commit_msg")" --yes
```

**Option B: Use custom message**
```bash
# Replace with your custom message (use \n for line breaks)
hodge ship "$feature" --message "feat: your feature

- Implementation complete
- Tests passing
- Documentation updated" --yes
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