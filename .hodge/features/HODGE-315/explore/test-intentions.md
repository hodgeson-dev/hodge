# Test Intentions: HODGE-315

## Overview
This document defines behavioral expectations for the fix to `/plan` command decision loading.

## Behavioral Test Intentions

### 1. Feature-Specific Decision File Priority
**What**: The system should check feature-specific decisions.md before global file
**Why**: Honors feature-first architecture where decisions live with the feature
**How to verify**:
- Create feature with decisions in `.hodge/features/TEST-1/decisions.md`
- Run `hodge plan TEST-1`
- Verify decisions are loaded from feature file, not global

---

### 2. Exploration Recommendation Extraction
**What**: Extract decision from exploration.md Recommendation section when decisions.md missing
**Why**: Allows features that skip `/decide` to still proceed to `/plan`
**How to verify**:
- Create feature with only `exploration.md` (no decisions.md)
- Add "## Recommendation" section with approach decision
- Run `hodge plan TEST-1`
- Verify recommendation is extracted as primary decision

---

### 3. Uncovered Decisions Detection
**What**: Compare "Decisions Needed" vs "Recommendation" and prompt user for gaps
**Why**: Prevents shipping features with unaddressed decision points
**How to verify**:
- Create exploration.md with "## Decisions Needed" listing 3 decisions
- Add "## Recommendation" that only addresses 1 decision
- Run `hodge plan TEST-1`
- Verify user is prompted about 2 uncovered decisions

---

### 4. Test Intentions Context Loading
**What**: Load test-intentions.md as behavioral context (not formal decisions)
**Why**: Provides build context without cluttering PM issues with test details
**How to verify**:
- Create feature with test-intentions.md
- Run `hodge plan TEST-1 --create-pm`
- Verify test intentions are loaded but NOT in PM issue description

---

### 5. Multi-Source Decision Merging
**What**: Preserve all decision instances from all sources without deduplication
**Why**: Different sources provide different context; all should be available
**How to verify**:
- Create decisions in both decisions.md and exploration.md with partial overlap
- Run `hodge plan TEST-1`
- Verify all decision instances appear in output (count matches total, not unique)

---

### 6. Global Fallback with Error
**What**: Fall back to global decisions.md and error if not found
**Why**: Ensures there's always a source of truth even for features without local decisions
**How to verify**:
- Create feature with no local decision sources
- Temporarily rename `.hodge/decisions.md`
- Run `hodge plan TEST-1`
- Verify helpful error message about missing decisions
- Restore `.hodge/decisions.md` and verify success

---

### 7. Backward Compatibility
**What**: Existing features with decisions only in global file still work
**Why**: Don't break existing workflows during migration
**How to verify**:
- Use existing feature like HODGE-313 (no feature decisions.md)
- Run `hodge plan HODGE-313`
- Verify decisions are loaded from global file successfully

---

## Edge Cases

### Empty Files
- Feature has empty decisions.md → Should skip to next source
- Exploration.md exists but has no "Recommendation" section → Should skip to next source
- All files exist but are empty → Should fall back to global and potentially error

### Malformed Content
- decisions.md has invalid markdown → Should handle gracefully, log warning, continue
- exploration.md "Recommendation" section has no actual content → Skip to next source
- "Decisions Needed" section is malformed → Skip uncovered decision prompting

### File Permissions
- Feature decisions.md exists but is unreadable → Log error, continue to next source
- Global decisions.md is unreadable → Error with helpful message (final fallback)

---

## Success Criteria

- ✅ All 7 behavioral tests pass
- ✅ No existing tests break (backward compatibility)
- ✅ Error messages are helpful and actionable
- ✅ Code handles edge cases gracefully
- ✅ Performance: No noticeable slowdown from checking multiple files
