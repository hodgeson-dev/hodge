# Exploration: HODGE-333.4

## Title
Profile Composition System and Harden Integration for AI Code Review

## Problem Statement

After HODGE-333.1-333.3 successfully shipped (frontmatter infrastructure, auto-detection during `hodge init`, and comprehensive profile library with 39 profiles), the review profile system now needs its composition layer and integration into the development workflow. Currently, the `/review file` command only loads a single hardcoded profile (`general-coding-standards.md`), and the `/harden` command uses a manual AI checklist instead of automated code review. We need to:

1. **Build the composition system** that loads all profiles from `.hodge/review-config.md` along with project context and concatenates them with proper precedence rules
2. **Integrate automated review into `/harden`** to replace Step 3's manual checklist with AI-driven code review using the profile system
3. **Expand review scopes** to support `/review directory` and `/review recent --last N` for broader review capabilities beyond single files

This completes the HODGE-333 epic vision: a unified markdown profile architecture that auto-detects project technologies, ships with rich reusable profiles, and integrates seamlessly into the development workflow.

## Conversation Summary

### Context from Shipped Siblings

**HODGE-333.1** (shipped Oct 7) established the foundation:
- Migrated from YAML to markdown + YAML frontmatter format
- Created `ReviewProfileLoader` for loading markdown profiles
- All frontmatter includes `frontmatter_version: "1.0.0"` for schema evolution
- Introduced `ContextAggregator` for loading project files (standards, principles, patterns, lessons)

**HODGE-333.2** (shipped Oct 8) added auto-detection:
- Auto-detects languages, frameworks, testing tools, databases during `hodge init`
- Generates `.hodge/review-config.md` with detected profiles grouped by category
- Profiles declare their own detection rules in frontmatter (frontmatter-driven architecture)
- Created placeholder profiles with full frontmatter, ready for content

**HODGE-333.3** (shipped Oct 8) delivered the profile library:
- 39 review profiles total (8 full-content, 31 placeholders with version documentation)
- 8 comprehensive profiles: general-coding-standards, general-test-standards, typescript-5.x, javascript-es2020+, react-18.x, vitest-1.x, jest-29.x, prisma-5.x
- Each profile uses explicit section-level enforcement markers (`**Enforcement: MANDATORY**`, `**Severity: BLOCKER**`)
- Profiles ship with Hodge framework (part of npm package)

### What HODGE-333.4 Needs to Complete

After discussion, HODGE-333.4 has three main goals:

#### 1. Profile Composition System

The composition system needs to:
- Load all profiles listed in `.hodge/review-config.md`
- Load project context files (`.hodge/standards.md`, `.hodge/principles.md`, `.hodge/decisions.md`, `.hodge/patterns/*`)
- Concatenate files in order with precedence enforcement
- Validate that all files exist, handle missing files appropriately
- Provide clear precedence rules so AI respects project standards over reusable profiles

**Precedence Strategy**: Use explicit instruction block at the top of the concatenated content:
```markdown
# REVIEW CONTEXT - PRECEDENCE RULES

The following context is loaded for this review. **CRITICAL**: Project-specific
files (.hodge/standards.md, principles.md, decisions.md, patterns) take PRECEDENCE
over reusable profiles. If there is ANY conflict between project standards and
profile recommendations, the PROJECT STANDARD wins. Always defer to project standards.

## Project Context (HIGHEST PRECEDENCE)
[standards.md content]
[principles.md content]
[decisions.md content]
[patterns/* content]

## Reusable Review Profiles (LOWER PRECEDENCE)
[profile 1 content]
[profile 2 content]
...
```

**Missing File Handling**:
- **Project files** (standards/principles/decisions/patterns): Fail fast with clear error if missing
- **Reusable profiles**: Warn and continue, noting missing profiles at top of concatenation
- Rationale: Project context is critical for accurate review; missing profiles are less severe

#### 2. /harden Integration - Automated Code Review

The `/harden` command currently has a manual "Step 3: AI Standards Compliance Checklist" that AI follows manually. This needs to be replaced with automated AI code review:

**New /harden workflow**:
1. Get list of changed files in feature using `git diff` for current branch
2. Run automated AI review on those changed files using composition system
3. Review outcomes:
   - **BLOCKER issues found**: Stop hardening, write review-report.md, recommend returning to `/build`
   - **Only WARNINGs/SUGGESTIONs**: Continue to tests, note warnings in report
   - **Clean review**: Continue to tests
4. Run existing validation (tests/lint/typecheck/build)
5. Generate harden-report.md including review results

**Review Report Format**:
```markdown
# Code Review Report: HODGE-333.4

**Reviewed**: 2025-10-08T15:30:00.000Z
**Scope**: Feature changes (12 files)
**Profiles Used**: general-coding-standards, typescript-5.x, vitest-1.x

## Summary
- 🚫 **2 Blockers** (must fix before proceeding)
- ⚠️ **5 Warnings** (should address before ship)
- 💡 **3 Suggestions** (optional improvements)

## Critical Issues (BLOCKER)
### src/lib/profile-loader.ts:45
**Violation**: Error Handling - BLOCKER
Using `any` type in error catch block defeats type safety...
[detailed explanation]

## Warnings
### src/commands/harden.ts:120
**Violation**: Testing Standards - WARNING
Missing integration test for profile composition...
[detailed explanation]

## Suggestions
### src/lib/composition.ts:67
**Violation**: Code Clarity - SUGGESTION
Consider extracting this complex conditional...
[detailed explanation]

## Files Reviewed
1. src/lib/profile-loader.ts
2. src/commands/harden.ts
...
```

**Key difference from `/review` command**: `/harden` only reviews files changed in the current feature (focused on incremental changes), while `/review` can have much broader or narrower scopes and typically reviews already-hardened code.

#### 3. Expanded Review Scopes

Currently only `/review file` is implemented. Add:

**`/review directory <path>`**:
- Reviews all files recursively under the directory
- Respects `.gitignore` patterns (skip `node_modules`, `.git`, etc.)
- Filters to relevant file types based on `applies_to` patterns in profiles

**`/review recent --last N`**:
- Reviews files changed in last N commits on current branch
- Shows which commits are being reviewed
- Excludes deleted files
- Uses `git diff HEAD~N..HEAD --name-only` to get file list

**Removed from scope**: `/review pattern <glob>` - determined to have low value, can add later if needed

### Architecture Decision: ProfileCompositionService

After reviewing project standards (Single Responsibility Principle, separation of concerns) and existing code patterns, the recommendation is to create a new `ProfileCompositionService` separate from `ContextAggregator`:

**Why separate services:**
- **SRP**: ContextAggregator has one clear job (load project context). Adding profile loading would violate SRP.
- **Separation of concerns**: ContextAggregator = project-specific context, ProfileCompositionService = reusable profile system
- **Testability**: Each service independently testable with clear boundaries
- **Progressive enhancement**: Extending the system without modifying working code
- **CLI Architecture Standard**: "Extract testable business logic into Service classes, CLI commands remain thin orchestration wrappers"

**Service responsibilities**:
```typescript
// ContextAggregator (existing, unchanged)
- Load .hodge/standards.md
- Load .hodge/principles.md
- Load .hodge/decisions.md
- Load .hodge/patterns/*
- Load .hodge/lessons/*

// ProfileCompositionService (new)
- Read .hodge/review-config.md
- Load all profiles listed in config
- Validate profile files exist
- Concatenate profiles with precedence markers
- Generate review context string for AI

// Commands orchestrate both
const contextAggregator = new ContextAggregator();
const profileComposer = new ProfileCompositionService();

const projectContext = contextAggregator.loadContext();
const reviewContext = profileComposer.composeReviewContext(projectContext);
```

## Implementation Approaches

### Approach 1: Service-First with Incremental Integration (Recommended)

**Description**: Build the ProfileCompositionService first with comprehensive tests, then integrate into `/review` command, then extend to `/harden`, finally add new review scopes. Each step is independently testable and shippable.

**Implementation phases**:

**Phase 1: ProfileCompositionService** (core functionality)
- Create ProfileCompositionService with profile loading from review-config.md
- Implement concatenation with precedence instruction blocks
- Add validation for missing files (fail fast vs warn and continue)
- Comprehensive unit and integration tests for composition logic
- Service can be tested independently without touching commands

**Phase 2: Update /review file command** (prove composition works)
- Modify ReviewCommand to use ProfileCompositionService
- Replace hardcoded 'general-coding-standards' with full composition
- Update tests to verify full profile loading
- Demonstrates composition system working end-to-end

**Phase 3: /harden integration** (biggest value delivery)
- Add review step before validation in HardenCommand
- Get changed files via `git diff` for current branch
- Run AI review using composition system
- Generate review-report.md in harden directory
- Block on BLOCKER issues, warn on lower severity
- Update harden-report.md to include review results

**Phase 4: Expanded review scopes** (breadth enhancement)
- Implement `/review directory <path>` with recursive file discovery
- Implement `/review recent --last N` with git commit history
- Add .gitignore filtering for directory scope
- File type filtering based on profile `applies_to` patterns

**Pros**:
- Each phase independently testable and valuable
- Early phases prove architecture before complex integrations
- Can adjust based on learnings from each phase
- Service isolation makes debugging easier
- Low risk - failures in later phases don't affect earlier work

**Cons**:
- Longer overall timeline (4 phases vs all-at-once)
- Need to maintain test consistency across phases
- Some overhead from phase transitions

**When to use**: When managing complexity is important and proving architecture before complex integrations reduces risk (our case).

---

### Approach 2: Feature-Complete Big Bang

**Description**: Implement everything in HODGE-333.4 simultaneously - composition service, all review scopes, harden integration - in one large coordinated effort.

**Architecture**:
- Build ProfileCompositionService with all features
- Update ReviewCommand with all three scopes (file/directory/recent)
- Integrate into HardenCommand with review reports
- Test everything together as complete system
- Ship when all components working

**Pros**:
- No coordination between phases
- Can optimize across all components at once
- Single comprehensive test suite
- Faster if no issues encountered
- All features available immediately

**Cons**:
- High risk - nothing ships until everything works
- Harder to isolate and debug issues
- Large, overwhelming code review
- No early validation of architecture decisions
- Difficult to test incrementally

**When to use**: For small, tightly coupled features where phasing adds no value.

---

### Approach 3: Parallel Development Tracks

**Description**: Work on composition system and integrations in parallel, merging when both complete.

**Tracks**:
- **Track A**: ProfileCompositionService + /review file update
- **Track B**: /harden integration + review report generation
- **Track C**: Expanded scopes (directory/recent)

**Pros**:
- Fastest timeline with multiple developers
- Can work on integrations before service fully complete
- Reduces serial dependencies

**Cons**:
- Requires careful coordination between tracks
- Integration complexity at merge points
- Harder for solo developer (Michael)
- Risk of conflicts requiring rework
- Difficult to test interactions until merge

**When to use**: With multiple developers and clear separation of concerns.

## Recommendation

**Use Approach 1: Service-First with Incremental Integration**

This approach best aligns with HODGE-333.4 requirements and Hodge development philosophy:

1. **Complexity Management**: Breaking into 4 phases makes each piece digestible and testable
2. **Risk Mitigation**: Build and prove composition system before complex integrations
3. **Incremental Value**: Each phase delivers something useful (composition → /review update → /harden integration → expanded scopes)
4. **Progressive Enhancement**: Aligns with "The Hodge Way" - build discipline through phased quality gates
5. **Solo Developer Friendly**: Phases are sequential, no coordination overhead
6. **Architecture Validation**: Early phases prove ProfileCompositionService design before complex /harden integration
7. **Testing Philosophy**: "Vibe testing for vibe coding" - test behavior at each phase, not implementation details
8. **Enables Course Correction**: Can adjust approach based on learnings (e.g., if composition is harder than expected, address before /harden)

**Implementation Priority**:
1. **Phase 1**: ProfileCompositionService (foundation)
2. **Phase 2**: Update /review file (prove it works)
3. **Phase 3**: /harden integration (biggest value)
4. **Phase 4**: Expanded scopes (breadth)

## Decisions Decided During Exploration

1. ✓ **Create ProfileCompositionService** - Separate from ContextAggregator for clean separation of concerns (SRP compliance)
2. ✓ **Explicit instruction blocks for precedence** - Clear AI guidance at top of concatenation that project standards override profiles
3. ✓ **Fail fast on missing project files, warn on missing profiles** - Project context is critical; profiles are less severe
4. ✓ **`/review directory` reviews recursively** - All files under directory, respecting .gitignore patterns, filtered by profile applies_to
5. ✓ **`/review recent --last N`** - Reviews files changed in last N commits on current branch, excludes deleted files
6. ✓ **`/harden` runs review before tests** - Blocks on BLOCKER severity, warns on lower severity, allows progression with warnings
7. ✓ **Structured review report format** - Severity-based categories (Blocker/Warning/Suggestion) with file references and detailed explanations
8. ✓ **`/review file` uses full composition** - All profiles from review-config.md, not just general-coding-standards
9. ✓ **Use `git diff` for current branch** - Determines changed files in feature for /harden review scope
10. ✓ **Frontmatter already versioned** - Verified `frontmatter_version: "1.0.0"` exists in all profiles (HODGE-333.1 delivered this)
11. ✓ **Service-first phased approach** - Build ProfileCompositionService, then integrate into /review, then /harden, then expanded scopes
12. ✓ **Review report saved to harden directory** - `.hodge/features/{feature}/harden/review-report.md` for persistent record

## No Decisions Needed

All decisions were resolved during exploration conversation. Ready to proceed to `/decide` and `/build`.

## Test Intentions

### Profile Composition
- ✅ Loads all profiles listed in review-config.md
- ✅ Loads project context (standards, principles, decisions, patterns)
- ✅ Concatenates in correct order (project first, profiles after)
- ✅ Includes precedence instruction block at top
- ✅ Validates files exist, warns/errors on missing files appropriately
- ✅ Handles missing review-config.md gracefully

### Review Scopes
- ✅ `/review file <path>` reviews single file with full composition
- ✅ `/review directory <path>` reviews all files recursively
- ✅ `/review recent --last N` reviews files from last N commits

### /harden Integration
- ✅ Runs review before tests/lint/typecheck
- ✅ Gets changed files via git diff for current branch
- ✅ Detects BLOCKER issues and stops hardening
- ✅ Allows progression with only warnings/suggestions
- ✅ Writes review-report.md to harden directory
- ✅ Updates harden-report.md to include review results

### Error Handling
- ✅ Handles missing profiles gracefully (warn and continue)
- ✅ Handles missing project files gracefully (fail fast with clear error)
- ✅ Handles empty review-config.md
- ✅ Handles git diff errors (not a git repo, etc.)
- ✅ Clear error messages for all failure modes

---

*Template created: 2025-10-08T14:40:23.456Z*
*Exploration completed: 2025-10-08T15:45:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
