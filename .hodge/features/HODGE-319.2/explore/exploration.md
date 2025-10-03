# Exploration: HODGE-319.2

**Title**: Phase 2 UX - Replace Bash Heredoc with Write Tool for Invisible Temp File Creation

## Problem Statement

The `/plan` and `/ship` slash commands currently use bash heredoc commands (`cat > file << 'EOF'`) to create temporary files for passing structured data from AI generation to CLI execution. These bash commands are visible to users and require approval, creating an awkward UX where users must review technical implementation details like "creating .hodge/temp/plan-interaction/FEATURE/plan.json" instead of focusing on the actual content (the plan structure or commit message).

This violates the principle that AI handles user interaction while CLI is pure backend. Users should never see implementation details of how data is passed between slash commands and CLI.

## Conversation Summary

### Current Behavior Analysis
We identified that two slash commands currently expose bash heredoc patterns:
- **`/plan`**: Creates `plan.json` using `cat > .hodge/temp/plan-interaction/{feature}/plan.json << 'EOF'`
- **`/ship`**: Creates `state.json` and `ui.md` using similar heredoc patterns

These patterns require user approval in Claude Code, breaking the workflow with technical noise.

### Scope Clarification
Through discussion, we established clear boundaries:
- **Change HOW**: Replace bash heredoc with Write tool calls
- **Keep WHAT**: Same file content, same JSON/markdown structure
- **Keep WHERE**: Same file paths (`.hodge/temp/plan-interaction/` and `.hodge/temp/ship-interaction/`)
- **Keep CLI behavior**: No changes to how CLI reads and deletes these files

### Testing Strategy
Since slash commands execute in Claude Code (not our test suite), we cannot directly test runtime file creation. Instead:
- **Smoke tests** verify template changes (no bash heredoc patterns remain, Write tool usage present)
- **Existing CLI tests** already verify file reading logic
- **Manual validation** confirms files are created correctly after changes

## Implementation Approaches

### Approach 1: Template-Only Refactor with Write Tool (RECOMMENDED)
**Description**: Update only the slash command markdown templates to use Write tool instead of bash heredoc. Zero CLI code changes.

**Implementation steps**:
1. Update `.claude/commands/plan.md`:
   - Replace bash `cat > file << 'EOF'` with Write tool calls
   - Keep same file paths and JSON structure
   - Maintain all user prompts and workflow logic

2. Update `.claude/commands/ship.md`:
   - Replace bash heredoc for both `state.json` and `ui.md` creation
   - Keep same file paths and structure
   - Maintain commit message approval workflow

3. Add smoke tests:
   - Verify templates contain Write tool usage
   - Verify no bash heredoc patterns remain
   - Check correct file paths in Write tool calls

4. Manual validation:
   - Run `/plan {feature}` once to verify plan.json created
   - Run `/ship {feature}` once to verify state.json and ui.md created

**Pros**:
- Zero risk to CLI code (no backend changes)
- Clean, invisible UX for users
- Simple to implement and validate
- Follows HODGE-306 template enhancement pattern
- Backward compatible (old temp files still work)

**Cons**:
- Cannot test runtime behavior in automated tests
- Requires manual smoke test for full validation

**When to use**: When fixing UX issues in slash command templates (this case!)

---

### Approach 2: Add Runtime Validation Layer
**Description**: Same as Approach 1, but add CLI validation that checks temp file structure to catch issues early.

**Additional implementation**:
- Add validation in `plan.ts` and `ship.ts` that checks temp file schema
- Log warnings if temp files have unexpected structure
- Create integration tests for validation layer

**Pros**:
- Earlier detection of template errors
- More confidence in changes
- Better debugging information

**Cons**:
- Adds CLI code complexity for UX-only change
- Validation logic requires maintenance
- Overkill for straightforward template change

**When to use**: When temp file structure is complex or frequently changes

**Assessment**: Not recommended - adds complexity without meaningful benefit

---

### Approach 3: Keep Bash Heredoc, Improve Documentation
**Description**: Don't change implementation, just document why users see bash commands.

**Pros**:
- Zero development effort
- No risk of breaking existing workflows

**Cons**:
- UX problem persists
- Violates principle of invisible implementation details
- Users continue seeing technical noise

**When to use**: When Write tool is not available or has limitations

**Assessment**: Not recommended - Write tool solves the problem cleanly

## Recommendation

**Use Approach 1: Template-Only Refactor with Write Tool**

**Rationale**:
1. **Clean UX**: Users see only content, not implementation
2. **Zero risk**: No CLI changes means existing functionality unchanged
3. **Simple**: Two template files, straightforward Write tool replacement
4. **Proven pattern**: HODGE-306 and other template-only changes worked well
5. **Backward compatible**: CLI already handles temp files correctly

**Implementation sequence**:
1. Update plan.md template (day 1)
2. Update ship.md template (day 1)
3. Add smoke tests for both templates (day 1)
4. Manual smoke test: run `/plan` and `/ship` once (day 1)
5. Ship with confidence

**Success metrics**:
- No bash heredoc patterns in plan.md or ship.md
- Write tool calls present with correct paths
- Manual test: temp files created successfully
- Users report cleaner workflow experience

## Test Intentions

### Template Validation (Smoke Tests)

**plan.md template changes**
- [ ] Should not contain bash heredoc patterns (`cat >` or `<< 'EOF'`)
- [ ] Should use Write tool to create plan.json
- [ ] Should specify correct path: `.hodge/temp/plan-interaction/{feature}/plan.json`
- [ ] Should preserve JSON structure (feature, type, stories fields)

**ship.md template changes**
- [ ] Should not contain bash heredoc patterns for state.json creation
- [ ] Should not contain bash heredoc patterns for ui.md creation
- [ ] Should use Write tool to create both files
- [ ] Should specify correct paths: `.hodge/temp/ship-interaction/{feature}/state.json` and `ui.md`
- [ ] Should preserve JSON structure in state.json (command, feature, status, data fields)

### Runtime Behavior (Manual Validation)

**plan.json creation**
- [ ] When running `/plan {feature}`, plan.json should be created in temp directory
- [ ] File should contain valid JSON matching expected structure
- [ ] CLI should read and process file successfully

**ship files creation**
- [ ] When running `/ship {feature}` with approved message, state.json should be created
- [ ] ui.md should be created with commit message preview
- [ ] CLI should read both files and create commit successfully

### Backward Compatibility

**Existing functionality preserved**
- [ ] CLI continues reading temp files with same logic
- [ ] CLI continues deleting temp files after use
- [ ] No changes to file paths or structure
- [ ] Old temp files (if any exist) still work

## Decisions Needed

No decisions needed - scope is clear and straightforward. This is a simple template refactor with well-defined boundaries.

## Next Steps
- [ ] Review this exploration
- [ ] Proceed to `/build HODGE-319.2` with Template-Only Refactor approach
- [ ] Update plan.md and ship.md templates
- [ ] Add smoke tests for template validation
- [ ] Manual smoke test for runtime validation

---
*Exploration completed: 2025-10-03*
*AI-generated through conversational discovery*
