# Exploration: HODGE-283 - Standards Enforcement Clarity

## Feature Analysis
**Type**: Meta-improvement for standards enforcement
**Purpose**: Ensure AI assistants properly understand and apply standards at the required enforcement level during build/harden/ship phases
**PM Issue**: HODGE-283

## Problem Statement
During /build, /harden, and /ship commands, AI assistants need to "ultrathink" about whether all standards in `.hodge/standards.md`, principles in `.hodge/principles.md`, and patterns in `.hodge/patterns/` are being followed at the level required by each phase.

**Key Question**: Is it sufficient for the standards.md file to have "**THESE STANDARDS ARE MANDATORY**" at the top, or does each individual standard need to be marked with its enforcement level?

## Current State Analysis

### What Works Well
- Clear progressive enforcement model (Explore → Build → Harden → Ship)
- Standards.md has strong top-level declaration of mandatory status
- Phase-specific enforcement is documented in Progressive Enforcement section
- Critical standards are marked with **⚠️ CRITICAL** labels

### Issues Identified
1. **Ambiguous Enforcement Levels**: Not all standards clearly indicate which phase they become mandatory
2. **Mixed Granularity**: Some sections have phase-specific requirements (Testing Requirements table), others don't
3. **AI Interpretation Challenge**: AI must infer enforcement level from context rather than explicit markers
4. **Inconsistent Labeling**: Only some standards use **⚠️ CRITICAL** markers

## Recommended Approaches

### Approach 1: Fine-Grained Enforcement Markers
**Description**: Add explicit enforcement level markers to each individual standard

**Implementation**:
```markdown
## Core Standards
- TypeScript with strict mode [MANDATORY: Build+]
- ESLint rules enforced [MANDATORY: Harden+]
- Prettier formatting [SUGGESTED: Build, MANDATORY: Ship]
```

**Pros**:
- Crystal clear enforcement at each level
- No ambiguity for AI interpretation
- Easy to scan and understand
- Granular control over each standard

**Cons**:
- More verbose documentation
- Harder to maintain (must update each item)
- Potential for inconsistencies between items

### Approach 2: Phase-Grouped Standards
**Description**: Reorganize standards by phase with clear sections

**Implementation**:
```markdown
## Explore Phase Standards (Suggestions Only)
- Use any types freely
- Skip tests entirely

## Build Phase Standards (Should Follow)
- Basic type safety required
- At least 1 smoke test

## Harden Phase Standards (Must Follow)
- Strict types required
- Integration tests required

## Ship Phase Standards (Strictly Enforced)
- All tests must pass
- 80% code coverage required
```

**Pros**:
- Clear progression through phases
- Easy to understand what's required at each level
- Natural grouping for AI to process
- Aligns with Hodge philosophy

**Cons**:
- Some standards apply to multiple phases
- Potential duplication between sections
- Major restructuring of existing docs

### Approach 3: Enhanced Header Metadata (Recommended)
**Description**: Keep current structure but add enforcement metadata headers to each section

**Implementation**:
```markdown
## Core Standards
**Enforcement: Build(suggested) → Harden(required) → Ship(mandatory)**

- TypeScript with strict mode
- ESLint rules enforced
- Prettier formatting

## CLI Architecture Standards
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: All Hodge CLI commands MUST be non-interactive.
```

**Pros**:
- Minimal changes to existing structure
- Clear enforcement progression per section
- Preserves readability
- Easy for AI to parse section-level rules
- Maintains backward compatibility

**Cons**:
- Still some interpretation needed within sections
- Not as granular as per-item marking

## Recommendation
I recommend **Approach 3: Enhanced Header Metadata** because:
1. It provides clear enforcement guidance without major restructuring
2. Maintains the readability and flow of current documentation
3. Gives AI clear signals about when each section becomes mandatory
4. Easy to implement and maintain
5. Aligns with progressive enhancement principle

## Implementation Plan
1. Add enforcement metadata to each section header in standards.md
2. Create a enforcement guide in principles.md explaining the notation
3. Update slash command templates to remind AI to check enforcement levels
4. Add a quick reference table at the top of standards.md

## Test Intentions Updates
- [ ] AI should correctly identify which standards apply at each phase
- [ ] AI should raise warnings for "should follow" violations in harden
- [ ] AI should block shipping for any "mandatory" violations
- [ ] Enforcement checks should be clear in AI responses
- [ ] Standards enforcement should be progressive and predictable

## Next Steps
- [ ] Review the three approaches and their trade-offs
- [ ] Use `/decide` to choose the approach
- [ ] Proceed to `/build HODGE-283` with chosen approach

---
*Generated with AI-enhanced exploration (2025-09-22T06:01:46.825Z)*
