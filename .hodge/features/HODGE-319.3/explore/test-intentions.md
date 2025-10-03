# Test Intentions for HODGE-319.3

## Purpose
Document what we intend to test when this feature moves to build mode.
These are behavioral expectations for the smart decision extraction feature in `/build`.

## Core Extraction Behavior
- [ ] When no decisions.md exists, /build should read exploration.md
- [ ] When Recommendation section exists, extract it completely and verbatim
- [ ] When Decisions Needed section exists, extract all decision titles
- [ ] When both Recommendation and Decisions Needed exist, present them together with options
- [ ] When neither exists, fall back to current warning behavior

## User Interaction Flow
- [ ] When Recommendation found, prompt user with 3 options: use it / go to /decide / skip
- [ ] When user chooses "use it" (option a), proceed with hodge build using extracted guidance
- [ ] When user chooses "go to /decide" (option b), exit gracefully and suggest command
- [ ] When user chooses "skip" (option c), call hodge build --skip-checks
- [ ] All prompts should be clear, actionable, and match the UX format from exploration

## Edge Cases
- [ ] Handle multiple Recommendation sections: prompt user to pick one from a list
- [ ] Handle malformed Recommendation section: extract what's useable, warn about formatting issues
- [ ] Handle empty Recommendation but present Decisions Needed: suggest /decide process
- [ ] Detect decisions.md in wrong location (explore/decisions.md): offer to move to correct location
- [ ] Skip uncovered decisions detection (too complex for Phase 2, defer to /decide)

## Integration Points
- [ ] Decision extraction happens before PM check (decisions may exist in PM issue)
- [ ] PM issue description may reference decisions (don't duplicate context)
- [ ] All existing /build flows still work (backward compatible with current behavior)
- [ ] Template stays under 200 lines total (maintainability constraint)
- [ ] Extraction logic is placed at line 3 of build.md (before PM check section)

## Error Handling
- [ ] Missing exploration.md → fall back to current warning behavior
- [ ] Malformed markdown → graceful degradation, use what's parseable
- [ ] File read errors → clear error message, suggest manual steps to user
- [ ] User interrupts prompt → exit cleanly without file corruption
- [ ] Extraction fails completely → fall back to hodge build with --skip-checks suggestion

## Template-Specific Tests
- [ ] Bash command to read exploration.md works correctly
- [ ] Regex patterns match Recommendation section: `## Recommendation\s*\n\n\*\*(.+?)\*\*`
- [ ] Regex patterns match Decisions Needed: `### Decision \d+: (.+)` headers
- [ ] Template instructions are clear for AI to parse and present options
- [ ] No CLI code changes needed (pure template enhancement)

## Performance Criteria
- [ ] Extraction adds <100ms to /build command execution
- [ ] Template remains readable and maintainable
- [ ] No additional dependencies or tools required
- [ ] Works with existing Hodge CLI without modifications

## Success Criteria
- [ ] Users can skip /decide and still get intelligent guidance from exploration.md
- [ ] No false positives (correct detection of missing decisions.md)
- [ ] Graceful degradation (fallback to warning if extraction fails)
- [ ] Complete context preserved (both Recommendation and Decisions Needed extracted)
- [ ] User experience matches approved UX flow from exploration

---
*Generated during exploration phase for HODGE-319.3*
*Convert to actual integration tests during build phase*
