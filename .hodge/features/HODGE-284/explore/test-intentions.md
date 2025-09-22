# Test Intentions for HODGE-284 - Multiple Decisions Fix

## Purpose
Document what we intend to test for the /decide command's ability to gather multiple decisions.

## Core Requirements
- [ ] Should gather decisions from multiple sources (TODOs, exploration notes, etc.)
- [ ] Should present multiple decisions when they exist
- [ ] Should handle single decision gracefully when only one exists
- [ ] Should not artificially create decisions when none exist

## Decision Gathering Tests
- [ ] Should find TODOs in codebase and present as decisions
- [ ] Should extract approach decisions from exploration notes
- [ ] Should identify scope decisions from feature discussions
- [ ] Should recognize technical choice points as decisions
- [ ] Should gather naming convention decisions
- [ ] Should collect testing strategy decisions

## Presentation Tests
- [ ] Should number decisions correctly (Decision 1 of N)
- [ ] Should provide context for each decision
- [ ] Should include pros/cons for each option
- [ ] Should allow skipping individual decisions
- [ ] Should handle user choosing from multiple decisions

## Edge Cases
- [ ] Should handle when no decisions are found
- [ ] Should handle when 10+ decisions are found (pagination?)
- [ ] Should handle malformed TODOs gracefully
- [ ] Should deduplicate similar decisions
- [ ] Should prioritize recent/relevant decisions

## Integration Tests
- [ ] Should work with current exploration workflow
- [ ] Should integrate with hodge decide CLI command
- [ ] Should update decisions.md correctly for multiple decisions
- [ ] Should maintain feature association for all decisions

## User Experience
- [ ] Should clearly indicate total number of decisions upfront
- [ ] Should provide clear navigation between decisions
- [ ] Should summarize decisions made at the end
- [ ] Should allow reviewing decisions before finalizing

## Implementation-Specific Tests

### For Decision Categories Framework (if chosen)
- [ ] Should check all defined categories
- [ ] Should mark categories as N/A when appropriate
- [ ] Should not force decisions in empty categories
- [ ] Should provide helpful prompts for each category

### For Enhanced Instructions (if chosen)
- [ ] Should execute search commands correctly
- [ ] Should parse search results into decisions
- [ ] Should handle empty search results

### For Automated Collection (if chosen)
- [ ] Should collect decisions from all sources
- [ ] Should output valid JSON format
- [ ] Should integrate with decide workflow

## Notes
Key scenarios to test:
- Fresh project with no TODOs → Should still find approach decisions
- Project with many TODOs → Should present most relevant ones
- After exploration → Should find multiple decision types
- Mid-development → Should find scope and technical decisions

---
*Generated during exploration phase. Convert to actual tests during build phase.*