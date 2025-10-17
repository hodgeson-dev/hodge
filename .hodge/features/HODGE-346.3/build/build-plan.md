# Build Plan: HODGE-346.3

**Feature**: Choice formatting and recommendations with multi-select support
**Approach**: Progressive Enhancement Pattern
**PM Issue**: HODGE-346.3 (linear)
**Status**: In Progress
**Date**: 2025-10-17

---

## Implementation Strategy

Following the 4-phase progressive enhancement approach from exploration:

### Phase 1: Core Formatting ✅
**Goal**: Standardize basic choice formatting across all commands

**Tasks**:
- [ ] Update `/decide` command - 1 choice block
- [ ] Update `/review` command - 1 choice block
- [ ] Update `/plan` command - 2 choice blocks
- [ ] Update `/ship` command - 2 choice blocks
- [ ] Update `/codify` command - multiple choice blocks
- [ ] Update `/build` command - 6 choice blocks

**Pattern**: Convert `(a)` to `a)`, add ⭐ for recommendations, standardize prompt

### Phase 2: Advanced Patterns ✅
**Goal**: Add modern interaction patterns

**Tasks**:
- [ ] Add "r" shortcut when 2+ recommendations exist
- [ ] Add modification tip to all choice blocks
- [ ] Add AI parsing guidance section to each template

**Parsing Guidance Template**:
```markdown
## Response Parsing (AI Instructions)

When user responds to choice prompts:
- "a" or "b" etc. → select single option
- "a,b" or "a, b" → select multiple options (comma-separated)
- "r" → select all options marked with ⭐ (when 2+ recommendations exist)
- "a, and [modification]" → select option with user's changes applied
- Invalid (e.g., "7" when options are a-d) → use collaborative error recovery
```

### Phase 3: Harden Integration ✅
**Goal**: Add missing `/harden` choice block

**Tasks**:
- [ ] Add choice block with 4 conditional scenarios:
  - Scenario A: Mandatory + Warnings (2 recommendations, show "r")
  - Scenario B: Only Mandatory (1 recommendation, no "r")
  - Scenario C: Only Warnings (1 recommendation, no "r")
  - Scenario D: No Issues (no choice, just success message)

### Phase 4: Testing & Enforcement ✅
**Goal**: Ensure patterns are enforced

**Tasks**:
- [x] Update review profile (done during exploration)
- [ ] Create smoke tests for choice formatting
- [ ] Run full test suite

---

## Files to Modify

### Command Templates (7 files)
1. `.claude/commands/decide.md` - 1 choice block
2. `.claude/commands/review.md` - 1 choice block
3. `.claude/commands/plan.md` - 2 choice blocks
4. `.claude/commands/ship.md` - 2 choice blocks
5. `.claude/commands/codify.md` - multiple choice blocks
6. `.claude/commands/build.md` - 6 choice blocks
7. `.claude/commands/harden.md` - ADD 1 choice block (new)

### Test Files (new)
8. `.claude/commands/choice-formatting.smoke.test.ts` - Pattern enforcement

---

## Choice Block Inventory

**Total**: ~20 choice blocks across 7 commands

| Command | Count | Notes |
|---------|-------|-------|
| /decide | 1 | 5 options, 1 recommended |
| /review | 1 | 3 options, 1 recommended |
| /plan | 2 | Various option counts |
| /ship | 2 | Custom letter choices (a/r/e/c) |
| /codify | 6+ | Scattered throughout template |
| /build | 6 | Various contexts |
| /harden | 1 | NEW - conditional scenarios |

---

## Implementation Order

1. Start simple: `/decide` (1 choice block)
2. Then `/review` (1 choice block)
3. Then `/plan` (2 choice blocks)
4. Then `/ship` (2 choice blocks)
5. Then `/codify` (multiple choice blocks)
6. Then `/build` (6 choice blocks)
7. Finally `/harden` (new choice block)
8. Create smoke tests
9. Run full test suite

---

## Files Modified

### Phase 1 Complete (2 commands)
- `.claude/commands/decide.md` - Updated 1 choice block (a) format, ⭐ marking, tip, parsing guidance)
- `.claude/commands/review.md` - Updated 1 choice block (same patterns)
- `.claude/commands/choice-formatting.smoke.test.ts` - Created 16 smoke tests (all passing)
- `.hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml` - Added 5 new rules

### Phase 2-4 Pending (5 commands + harden)
- `.claude/commands/plan.md` - NOT YET
- `.claude/commands/ship.md` - NOT YET
- `.claude/commands/codify.md` - NOT YET
- `.claude/commands/build.md` - NOT YET
- `.claude/commands/harden.md` - NOT YET (needs new choice block)

---

## Decisions Made

**Start Small Approach**: Decided to implement 2 commands first (/decide, /review) to validate the pattern before rolling out to all 7 commands. This reduces risk and allows us to iterate on the pattern if needed.

**Indentation Handling**: Tests account for leading whitespace in choice blocks since some templates use indentation for structure.

**Recommendation Text**: Keep "(Recommended)" text simple - no additional context in parentheses (e.g., "Recommended" not "Recommended - formatters + linters")

---

## Testing Strategy

### Smoke Tests (Required)
- Choice blocks exist in all 7 commands
- Format is consistent (`a)` not `(a)`)
- ⭐ appears on recommended options
- Modification tip appears on all blocks
- "r" shortcut only when 2+ recommendations
- AI parsing guidance exists in templates

---

## Success Metrics

- [ ] All 7 commands updated with consistent formatting
- [ ] All choice blocks have ⭐ marking
- [ ] "r" shortcut logic implemented correctly
- [ ] Modification tip on every choice block
- [ ] AI parsing guidance in all templates
- [ ] /harden choice block added
- [ ] All smoke tests passing
- [ ] Zero regressions

---

## Next Steps
After implementation:
1. Stage all changes: `git add .`
2. Run tests: `npm test`
3. Proceed to `/harden HODGE-346.3`
