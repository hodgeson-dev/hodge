# Feature Exploration: HODGE-315

**Title**: Fix /plan command to check feature-specific decisions files

## Problem Statement

The `/plan` command currently only checks the global `.hodge/decisions.md` file for feature decisions, but when developers use `hodge decide --feature HODGE-XXX`, decisions are written to `.hodge/features/HODGE-XXX/decisions.md` instead. This creates a workflow mismatch where `/plan` reports "No decisions found" even when feature-specific decisions exist, blocking the planning phase and forcing users to manually copy decisions to the global file.

## Conversation Summary

The investigation revealed that the `analyzeDecisions()` method in `src/commands/plan.ts:119` hardcodes the path to the global decisions file. When the `--feature` flag was added to the `/decide` command (as part of HODGE-312), it introduced feature-specific decision files, but the `/plan` command was never updated to look for them.

The root cause is a discrepancy between where decisions are written (feature directory when using `--feature` flag) and where they're read from (always global file). The fix needs to implement a cascading file check strategy that prioritizes feature-specific sources.

Key insights from the discussion:
- Feature decisions should remain in feature directories unless promoted to global during `/ship`
- When `decisions.md` doesn't exist for a feature, the system should extract decisions from `exploration.md` (specifically the "Recommendation" and "Decisions Needed" sections)
- Test intentions from `test-intentions.md` should be loaded as behavioral context but not treated as formal decisions for PM issue creation
- If "Decisions Needed" contains items not covered by "Recommendation", the system should prompt the user for input before proceeding
- All decision instances should be kept without deduplication to preserve context
- The final fallback to global `.hodge/decisions.md` should error if the file is missing

## Implementation Approaches

### Approach 1: Cascading File Checker with Smart Extraction

**Description**: Refactor `analyzeDecisions()` to check multiple sources in priority order: (1) feature-specific `decisions.md`, (2) `exploration.md` (extract Recommendation + Decisions Needed sections), (3) global `decisions.md`. Add extraction logic for markdown sections and user prompting for uncovered decisions.

**Pros**:
- Comprehensive solution that handles all edge cases
- Gracefully degrades through fallback chain
- Extracts semantic meaning from exploration docs
- Interactive prompting improves decision quality
- Minimal changes to existing code structure

**Cons**:
- Requires markdown parsing logic for exploration.md
- Additional complexity for extracting and comparing "Decisions Needed" vs "Recommendation"
- User prompting adds interactive step (may slow down automated workflows)

**When to use**: This is the recommended approach for full feature parity with the intended workflow design.

---

### Approach 2: Simple Feature-First Lookup

**Description**: Modify `analyzeDecisions()` to check `.hodge/features/{feature}/decisions.md` first, then fall back to `.hodge/decisions.md`. Skip exploration.md extraction and user prompting.

**Pros**:
- Minimal code changes (just add one file check)
- Fast implementation (no parsing logic needed)
- No interactive prompts (fully automated)
- Easy to test and maintain

**Cons**:
- Doesn't handle features where `/decide` was skipped
- Ignores valuable context from exploration.md
- Misses opportunity to catch uncovered decisions
- Partial solution that doesn't address full workflow

**When to use**: When you want a quick fix for the immediate bug without addressing the broader workflow gaps.

---

### Approach 3: Unified Decision Registry

**Description**: Create a new `DecisionRegistry` class that abstracts decision loading from all sources. Implement smart merging, deduplication detection (but preserve all instances), and source tracking. Use this registry in `/plan`, `/build`, and `/ship` commands.

**Pros**:
- Centralized decision management
- Reusable across multiple commands
- Provides foundation for future decision analytics
- Source tracking aids debugging
- Clean separation of concerns

**Cons**:
- Larger refactoring effort
- Introduces new abstraction layer
- May be overengineering for current needs
- Requires updating multiple commands

**When to use**: If planning to expand decision management features in the future or if multiple commands need decision loading.

## Recommendation

**Approach 1: Cascading File Checker with Smart Extraction** is recommended.

**Rationale**:
- Addresses the immediate bug while also fixing the broader workflow issue
- Aligns with the stated design intent that features can skip `/decide` and still proceed to `/plan`
- Provides value-add by prompting users about uncovered decisions, preventing surprises later
- Maintains backward compatibility with existing features
- Keeps implementation localized to `plan.ts` without requiring refactoring of other commands
- The markdown parsing is straightforward (just looking for `## Recommendation` and `## Decisions Needed` headers)

Approach 2 is too limited and leaves workflow gaps. Approach 3 is overengineering for the current requirement, though it could be considered for a future refactoring if decision management becomes more complex.

## Test Intentions

### Behavioral Expectations

1. **Should find decisions in feature-specific decisions.md file**
   - Given: Feature has `.hodge/features/{feature}/decisions.md` with decisions
   - When: `hodge plan {feature}` is executed
   - Then: Decisions are extracted from feature file, not global file

2. **Should extract recommendation from exploration.md when decisions.md missing**
   - Given: Feature has no `decisions.md` but has `exploration.md` with Recommendation section
   - When: `hodge plan {feature}` is executed
   - Then: Recommendation is extracted and used as the primary decision

3. **Should extract decisions needed from exploration.md and prompt user if uncovered**
   - Given: Feature has `exploration.md` with "Decisions Needed" section listing 3 decisions, but "Recommendation" only addresses 1
   - When: `hodge plan {feature}` is executed
   - Then: User is prompted about the 2 uncovered decisions before proceeding

4. **Should load test intentions as behavioral context**
   - Given: Feature has `test-intentions.md` with behavioral expectations
   - When: `hodge plan {feature}` is executed
   - Then: Test intentions are loaded but NOT included in PM issue decisions list

5. **Should merge decisions from all sources without deduplication**
   - Given: Feature has decisions in both feature `decisions.md` AND `exploration.md` with some overlap
   - When: `hodge plan {feature}` is executed
   - Then: All decision instances are preserved in the final list

6. **Should fall back to global decisions.md and error if not found**
   - Given: Feature has no feature-specific decision sources
   - When: `hodge plan {feature}` is executed
   - Then: System checks global `.hodge/decisions.md` and errors with helpful message if missing

## Decisions Needed

### Decision 1: Error Message Format for Uncovered Decisions
**Context**: When "Decisions Needed" contains items not covered by "Recommendation", we need to prompt the user.

**Options**:
- a) Block and require user to run `/decide` first
- b) Show interactive prompt with options to proceed anyway or abort
- c) Display warning but continue with plan creation

**Recommendation**: Option (b) - Interactive prompt maintains user agency while highlighting the gap.

---

### Decision 2: Decision Source Metadata
**Context**: When merging decisions from multiple files, should we track which file each decision came from?

**Options**:
- a) Add source metadata (e.g., `[from: decisions.md]`) to each decision string
- b) Keep decisions as plain strings without source tracking
- c) Track source internally but don't expose in PM issues

**Recommendation**: Option (c) initially - keep PM issues clean but add source tracking for debugging purposes in logs or internal data structures.

---

**Exploration completed**: 2025-10-02
