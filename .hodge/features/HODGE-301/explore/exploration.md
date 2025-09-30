# Exploration: HODGE-301

## Feature Overview
**PM Issue**: HODGE-301
**Type**: general
**Created**: 2025-09-30T03:54:59.077Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Problem Statement

The `/plan` command currently allows creation of epics and stories without enforcing that each story is a **vertical slice** - a complete, testable, shippable piece of value. This can lead to:

1. **Horizontal slicing** - Stories like "Backend API" and "Frontend UI" that don't provide complete value independently
2. **Incomplete stories** - Work items that can't be tested or shipped alone
3. **Unclear value** - Stories that don't clearly benefit any stakeholder (user, admin, developer, tester)

**User's requirement**: Each epic/story MUST be a vertical slice providing complete value, fully testable and shippable. If this isn't possible, create a single issue instead.

## Current State Analysis

**What works:**
- `/plan` command creates epic/story structures
- AI analyzes decisions and proposes breakdown
- PM integration creates issues in Linear/GitHub
- Dependency tracking and lane allocation

**What's missing:**
- No validation that stories are vertical slices
- No guidance for AI on what constitutes a vertical slice
- No enforcement mechanism (stories can be horizontal layers)
- No fallback when vertical slicing isn't feasible

## Implementation Approaches

### Approach 1: Validation Guard with AI Guidance

**Description**: Add validation logic that checks story descriptions for vertical slice criteria, with AI guidance to help users create proper slices.

**Pros**:
- Catches horizontal slicing automatically
- Educates users through guidance messages
- Can be implemented incrementally (warn first, then enforce)
- Works with existing plan command structure

**Cons**:
- Pattern matching may have false positives/negatives
- Requires maintaining validation rules as patterns evolve
- AI might need multiple iterations to get it right

**When to use**: When you want automatic enforcement with helpful feedback to improve over time.

**Implementation details**:
- Add `validateVerticalSlice(story)` function checking for:
  - Complete value proposition (who benefits?)
  - Testability markers (can we verify it works?)
  - Shippability indicators (can it go to production?)
- Update `.claude/commands/plan.md` with vertical slice examples
- Add to `plan.ts`: Auto-validate and provide feedback before creating PM issues

### Approach 2: AI-Driven Vertical Slice Design

**Description**: Enhance the `/plan` command template to explicitly guide AI through vertical slice design, with clear criteria and examples.

**Pros**:
- Leverages AI's context understanding naturally
- More flexible than rule-based validation
- Educational - teaches best practices through examples
- Can handle nuanced situations validation can't

**Cons**:
- Depends on AI following instructions correctly
- No programmatic enforcement (relies on template compliance)
- May vary between AI sessions/models

**When to use**: When you want to guide behavior through examples and trust AI to apply principles rather than enforce rules.

**Implementation details**:
- Update `.claude/commands/plan.md` with:
  - "Vertical Slice Checklist" section
  - Good/bad story examples
  - Decision tree: "Can this be a vertical slice? If no → single issue"
- Add vertical slice criteria to exploration phase
- Include validation questions in plan approval workflow

### Approach 3: Hybrid - Template Guidance + Validation Guard

**Description**: Combine AI guidance with programmatic validation - template teaches principles, code enforces minimum standards.

**Pros**:
- Best of both approaches
- AI guidance reduces false positives (better proposals)
- Validation catches edge cases AI might miss
- Can start permissive (warnings) and tighten over time

**Cons**:
- More complex implementation (two systems to maintain)
- Requires coordination between template and validation logic
- Initial setup takes longer

**When to use**: When you want both educational guidance AND safety net enforcement for production use.

**Implementation details**:
- Enhance `.claude/commands/plan.md` with vertical slice design guidance
- Add `VerticalSliceValidator` class with configurable rules:
  - Pattern detection (warning level)
  - Explicit checks (blocking level)
  - "Single issue" recommendation when slicing fails
- Add interactive decision point: "These stories may not be vertical slices. Options: a) Revise b) Create single issue c) Override (explain why)"

## Recommendation

**Approach 3: Hybrid - Template Guidance + Validation Guard**

This provides the strongest solution because:

1. **Educational first** - AI learns to propose good structures through examples
2. **Safety net** - Validation catches problems before PM issue creation
3. **Progressive enforcement** - Start with warnings, tighten to blocking as patterns mature
4. **Flexibility** - Override mechanism for legitimate edge cases with documentation
5. **Production ready** - Prevents anti-patterns from reaching PM tools

The hybrid approach respects the Hodge philosophy of "freedom to explore, discipline to ship" - guidance during planning, validation before shipping to PM tools.

## Decisions Needed

1. **Validation strictness level**
   - Options: Warn only, Block with override, Strict blocking
   - Recommendation: Block with override (require explanation)
   - Rationale: Balances safety with flexibility for edge cases

2. **Vertical slice criteria**
   - Must define: What makes a story "complete value"?
   - Options:
     - Simple: Has user-facing change + backend + tests
     - Moderate: Provides value to stakeholder + independently testable
     - Strict: Shippable to production + stakeholder acceptance criteria
   - Recommendation: Moderate criteria
   - Rationale: Captures intent without over-constraining creative solutions

3. **Fallback strategy when slicing fails**
   - Options:
     - Auto-convert to single issue
     - Require user decision
     - Block plan generation
   - Recommendation: Require user decision with auto-convert suggestion
   - Rationale: User stays in control, system provides smart default

4. **Where to enforce validation**
   - Options: During plan generation (AI step), Before PM creation (CLI step), Both
   - Recommendation: Both (AI warns during generation, CLI blocks before PM creation)
   - Rationale: Early feedback + safety net before irreversible PM operations

5. **Template updates scope**
   - Options: Minimal (add criteria only), Moderate (criteria + examples), Extensive (criteria + examples + decision trees)
   - Recommendation: Extensive
   - Rationale: One-time investment, long-term educational value

## Test Intentions

**Behavior Checklist** - What should this feature do?

- [ ] When AI proposes epic/stories, it considers vertical slice criteria
- [ ] When stories are horizontal slices (e.g., "Backend" + "Frontend"), validator warns
- [ ] When stories lack clear stakeholder value, validator flags them
- [ ] When stories can't be made into vertical slices, single issue is suggested
- [ ] When user approves stories with warnings, they must provide override explanation
- [ ] When plan is saved without --create-pm, validation is informational only
- [ ] When plan is created with --create-pm, validation is blocking
- [ ] Validation messages clearly explain what's wrong and how to fix it
- [ ] Good vertical slice examples are shown in error messages
- [ ] Template includes "Vertical Slice Checklist" for AI to follow

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-301`

---
*Template created: 2025-09-30T03:54:59.077Z*
*AI exploration to follow*
