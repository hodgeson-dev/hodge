# Test Intentions for HODGE-309

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] PM check correctly identifies features WITHOUT externalID as "unmapped"
- [ ] PM check correctly identifies features WITH externalID as "mapped"
- [ ] PM check handles missing feature ID gracefully
- [ ] PM check completes quickly (<100ms)

## Defect-Specific Tests
- [ ] HODGE-298 (no externalID) should be detected as UNMAPPED
- [ ] HODGE-297.1 (has externalID) should be detected as MAPPED
- [ ] Empty id-mappings.json should not crash
- [ ] Malformed JSON should be handled gracefully

## Edge Cases
- [ ] Feature ID with special characters (e.g., "HODGE-297.1")
- [ ] Feature ID that doesn't exist in id-mappings.json
- [ ] Entry with externalID but empty string value
- [ ] Entry with externalID: null
- [ ] Multiline JSON formatting (shouldn't affect grep)

## Template Validation
- [ ] build.md template generates correct bash command
- [ ] Template substitutes {{feature}} placeholder correctly
- [ ] AI receives correct guidance from template
- [ ] Non-blocking behavior preserved (proceeds anyway if unmapped)

## Smoke Tests (Build Phase)
- [ ] Template contains enhanced grep pattern
- [ ] Enhanced grep finds externalID in test data
- [ ] Enhanced grep correctly fails when no externalID present
- [ ] Template documentation is clear and actionable

## Integration Tests (Harden Phase)
- [ ] /build command shows PM prompt for unmapped features
- [ ] /build command skips PM prompt for mapped features
- [ ] PM check works with both HODGE-XXX and HODGE-XXX.Y formats
- [ ] PM check works across different slash commands that use it

## Notes
**Key insight**: This is a template fix, not a code fix. The test strategy should focus on:
1. Template correctness (does build.md have the right bash command?)
2. Bash command correctness (does the grep work with test data?)
3. AI behavior (does the template guide Claude Code correctly?)

**Test data to create**:
- Sample id-mappings.json with mixed entries (some with externalID, some without)
- Edge case entries (null, empty string, special characters)

---
*Generated during exploration phase. Convert to actual tests during build phase.*