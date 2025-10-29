# Test Intentions: HODGE-361

**Feature**: Add --skip-tests parameter support to /ship AI slash command

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Behavioral Expectations

### 1. Default behavior preserved
**Intent**: `/ship {{feature}}` continues to work exactly as before with full quality gate enforcement

**How to verify**:
- [ ] Run `/ship` command without `--skip-tests` flag
- [ ] Verify all quality checks run (tests, linting, type checking)
- [ ] Verify commit blocks if quality gates fail
- [ ] Verify workflow steps execute in correct order

### 2. Skip-tests parameter works
**Intent**: `/ship {{feature}} --skip-tests` successfully passes flag to CLI and bypasses quality gates without blocking on failures

**How to verify**:
- [ ] Run `/ship {{feature}} --skip-tests` with failing tests
- [ ] Verify quality checks still run (for reporting)
- [ ] Verify commit proceeds despite failures
- [ ] Verify `--skip-tests` flag correctly passed to CLI command

### 3. Discoverability
**Intent**: Template frontmatter and troubleshooting section clearly document `--skip-tests` availability and appropriate usage scenarios

**How to verify**:
- [ ] Check frontmatter shows `<feature-id> [--skip-tests]` in argument-hint
- [ ] Verify troubleshooting section includes skip-tests guidance
- [ ] Confirm documentation explains when to use the flag
- [ ] Ensure usage examples are clear and accurate

## Testing Notes

These are behavior expectations, not implementation details. Focus on what the user experiences, not how the template accomplishes it. Since this is a template change (not code), testing will be manual verification through actual usage.

---
*Generated during exploration phase. Verification checklist for build phase.*
