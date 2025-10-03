# Lessons Learned: HODGE-319.2

## Feature: Invisible Temp File Creation - Replace Bash Heredoc with Write Tool

### The Problem
The `/plan` and `/ship` slash commands used bash heredoc commands (`cat > file << 'EOF'`) to create temporary interaction files for passing data from AI to CLI. These bash commands were visible to users and required approval, creating UX friction where users had to review technical implementation details instead of focusing on actual content (plan structure or commit messages).

Additionally, the templates included `mkdir -p` commands to create parent directories, adding another unnecessary user approval step.

This violated the core principle that AI handles user interaction while CLI is pure backend - users should never see implementation details of data transfer between components.

### Approach Taken
**Template-Only Refactoring** - Zero CLI code changes, pure markdown template updates:

1. **Replaced bash heredoc with Write tool**:
   - `.claude/commands/plan.md`: Replaced `cat > plan.json << 'EOF'` with Write tool instructions
   - `.claude/commands/ship.md`: Replaced heredoc at 3 locations (ui.md, state.json, lessons file)

2. **Eliminated mkdir commands**:
   - Discovered Write tool auto-creates parent directories
   - Removed all `mkdir -p .hodge/temp/...` commands
   - Reduced user approval friction by one step

3. **Maintained identical behavior**:
   - Same file paths (`.hodge/temp/plan-interaction/` and `.hodge/temp/ship-interaction/`)
   - Same JSON/markdown structure
   - Same CLI reading logic (no backend changes)

4. **Comprehensive testing strategy**:
   - 10 smoke tests validating template correctness
   - Manual validation (since slash commands run in Claude Code, not test suite)
   - Existing CLI tests already covered file reading behavior

### Key Learnings

#### 1. Write Tool Auto-Creates Directories
**Discovery**: The Write tool automatically creates parent directories when writing files - no need for explicit `mkdir -p` commands in slash command templates.

**Solution**: Removed all `mkdir` commands from templates, eliminating unnecessary user approval steps.

**Impact**: Cleaner UX with one less approval required per workflow execution.

#### 2. Template-Only Changes Have Unique Testing Constraints
**Challenge**: Slash commands execute in Claude Code environment, not in our test suite, making runtime validation impossible through automated tests.

**Solution**:
- Smoke tests verify template structure (no heredoc, Write tool present, correct paths)
- Manual smoke test confirms runtime behavior
- Trust existing CLI tests for file reading logic

**Pattern**: For template-only refactoring, focus on structural validation rather than runtime testing.

#### 3. Pre-Existing Flaky Tests Can Block Shipping
**Gotcha**: The explore-timing-fix integration test intermittently failed during harden, blocking ship even though it was unrelated to template changes.

**Workaround**: Re-ran harden to get clean validation report.

**Lesson**: Template-only changes should not be blocked by unrelated test flakiness. Need better test isolation or flaky test handling strategy.

### Code Examples

**Before (Bash Heredoc with mkdir):**
```bash
# Old pattern - visible to users, requires multiple approvals
mkdir -p .hodge/temp/plan-interaction/{{feature}}

cat > .hodge/temp/plan-interaction/{{feature}}/plan.json << 'EOF'
{
  "feature": "{{feature}}",
  "type": "epic",
  ...
}
EOF
```

**After (Write Tool - Invisible):**
```markdown
Use the Write tool to create the plan file:

**Write to:** `.hodge/temp/plan-interaction/{{feature}}/plan.json`

Content (replace all {{placeholders}} with actual values):
{
  "feature": "{{feature}}",
  "type": "epic",
  ...
}
```

**Key difference**: Write tool creates directories automatically and executes invisibly - no user approvals required.

### Impact
- ✅ **UX Improvement**: Temp file creation now completely invisible to users
- ✅ **Reduced Friction**: Eliminated both bash heredoc approval AND mkdir approval
- ✅ **Zero Breaking Changes**: File creation behavior identical, just cleaner method
- ✅ **Better Maintainability**: Write tool pattern simpler than bash heredoc
- ✅ **Well-Tested**: 10 smoke tests verify template correctness
- ✅ **All Tests Passing**: 689/689 tests (excluding 1 pre-existing flaky test)

### Reusable Pattern: Write Tool for Slash Command File Creation

**When to use**: Any time a slash command needs to create files for CLI consumption

**Pattern**:
1. Use Write tool instead of bash `cat` or `echo` commands
2. Don't include `mkdir` - Write tool handles directory creation
3. Provide clear placeholder replacement instructions
4. Test with smoke tests (template validation) + manual verification

**Benefits**:
- Invisible to users (no approval friction)
- Auto-creates parent directories
- Cleaner template code
- Easier to maintain

### Related Decisions
- Template-only refactoring pattern (HODGE-306 precedent)
- Zero CLI code changes for UX-only improvements
- Trust Write tool for directory creation
- Accept manual validation for slash command runtime behavior

### Recommendations for Future Work
1. **Fix flaky timing tests** - explore-timing-fix should not block unrelated features
2. **Document Write tool pattern** - Add to .hodge/patterns/ for template developers
3. **Audit other templates** - Check if /decide or /harden have similar bash heredoc patterns
4. **Consider template linting** - Automated check for bash heredoc in slash commands

---
_Documented: 2025-10-03_
_Lessons enhanced with AI analysis and user insights_
