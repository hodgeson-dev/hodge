# Exploration: HODGE-333

## Title
Unified Profile Architecture with Markdown Format and Composition System

## Problem Statement

HODGE-327 envisioned a comprehensive two-level AI review system: (1) feature-level review integrated into `/harden` for reviewing changes during development, and (2) architectural `/review` command for periodic deep dives into subsystems and cross-cutting concerns. The plan included extensible profiles and multiple review scopes (file/directory/pattern/recent/all). HODGE-327.1 successfully shipped `/review file` with YAML profiles, but subsequent architectural analysis revealed fundamental issues that require redesigning the profile system:

1. **Format Inconsistency**: Mixing YAML profiles with markdown standards/patterns/lessons creates format inconsistency and context inefficiency
2. **Redundant Custom Directory**: Project-specific rules don't need `review-profiles/custom/` since they naturally belong in `.hodge/standards.md`
3. **Enforcement Ambiguity**: Implicit inheritance of enforcement levels across long documents risks AI losing track
4. **Manual Configuration**: No auto-detection means every project must manually configure profiles
5. **Migration Path**: Need to transition from YAML while preserving existing `/review file` functionality

We must redesign the profile architecture with a unified markdown format and intelligent composition system while preserving HODGE-327's vision of two-level review and enabling future scope expansion.

## Conversation Summary

### Architectural Evolution from HODGE-327

**HODGE-327 Original Vision**:
- Two-level review: feature-level (in `/harden`) + architectural (standalone `/review`)
- Multiple scopes: file, directory, pattern, recent, all
- Extensible profiles for any tech stack
- Integration points with harden phase

**HODGE-327.1 Shipped**:
- `/review file <path>` command working
- YAML profile format (`default.yml`)
- Three-layer architecture: project standards/principles/lessons (Layer 1) + domain profiles (Layer 2) + universal baseline (Layer 3)
- Automatic merge strategy (project files always loaded, override profiles)
- Report persistence with metadata

**What Needs Redesign**:
- Profile format (YAML → markdown)
- Profile organization (eliminate custom/ directory)
- Enforcement tracking (explicit vs implicit)
- Auto-detection and composition

### Unified Markdown Architecture Decision

After ultra-deep analysis, we decided to **break YAML compatibility and go all-in on markdown** for several reasons:

**Why Markdown**:
1. **Context Efficiency**: Prose is more compact than YAML (15-20 tokens vs 30-40 tokens per rule)
2. **Format Consistency**: Standards, principles, patterns, lessons all use markdown - profiles should too
3. **Human Readability**: Easier to read, write, and maintain
4. **AI Understanding**: Better for natural language processing
5. **Extensibility**: Can mix narrative explanation with structured metadata

**Decision**: All files use markdown + YAML frontmatter for metadata.

### No Custom Directory - Project Files Suffice

**Key Insight**: If every project has `.hodge/standards.md` for project-specific rules, why have `review-profiles/custom/`? It's redundant!

**Correct Architecture**:
```
.hodge/                              # Project-specific
├── standards.md                     # THIS project's rules
├── principles.md                    # THIS project's philosophy
├── patterns/*.md                    # THIS project's patterns
└── lessons/*.md                     # THIS project's lessons

review-profiles/                     # Reusable (ships with Hodge)
├── general-coding-standards.md      # Universal quality
├── languages/
│   ├── javascript.md
│   ├── typescript.md
│   └── python.md
└── tech-stacks/
    ├── react.md
    ├── vue.md
    ├── api-design.md
    └── test-quality.md
```

**No `custom/` directory needed!** Project-specific rules live in `.hodge/standards.md`.

### Frontmatter Schema Design

**Explicit Section-Level Enforcement Decision**: After considering multiple approaches (file-level only, hybrid file+section, section-only), we chose **explicit enforcement on every section** to prevent AI tracking errors.

**Why Explicit**:
- Long documents (10-15 sections, 3000+ tokens) risk AI forgetting file-level default
- AI is simultaneously analyzing code AND tracking enforcement (cognitive load)
- Implicit inheritance ("use file default unless stated") requires state tracking
- Safety over verbosity - review quality depends on correct enforcement

**Project Files Frontmatter**:

`.hodge/standards.md`:
```yaml
---
scope: project
type: standards
version: "2.0.0"
last_updated: "2025-10-05"
---

# Project Standards

## Logging Standards
**Enforcement: MANDATORY** | **Severity: BLOCKER**
Commands must use dual logging (console + pino)...

## Code Style Guidelines
**Enforcement: SUGGESTED** | **Severity: WARNING**
Prefer immutable data structures...
```

`.hodge/principles.md`:
```yaml
---
scope: project
type: philosophy
enforcement: guidance
version: "1.0.0"
---

# The Hodge Way
Freedom to explore, discipline to ship...
```

`.hodge/patterns/test-pattern.md`:
```yaml
---
scope: project
category: testing
applies_to: ["**/*.test.ts"]
related_standards: ["Testing Requirements"]
version: "1.2.0"
---

# Test Pattern: Behavior Testing

## Pattern
**Enforcement: SUGGESTED** | **Severity: WARNING**
Test what users see, not how it works...
```

`.hodge/lessons/HODGE-317.1-*.md`:
```yaml
---
feature: HODGE-317.1
date: "2025-09-30"
severity: critical
category: testing
tags: ["subprocess", "zombie-processes"]
related_standards: ["Subprocess Spawning Ban"]
---

# HODGE-317.1: Eliminate Subprocess Spawning

## The Violation
**Enforcement: MANDATORY** | **Severity: BLOCKER**
Never spawn subprocesses in tests...
```

**Reusable Profiles Frontmatter**:

`review-profiles/general-coding-standards.md`:
```yaml
---
scope: reusable
type: universal
applies_to: ["**/*"]
version: "1.0.0"
maintained_by: hodge-framework
---

# General Coding Standards

## Single Responsibility Principle
**Enforcement: SUGGESTED** | **Severity: WARNING**
Functions and classes should do one thing...

## DRY Violations
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**
Don't repeat yourself across the codebase...
```

`review-profiles/languages/typescript.md`:
```yaml
---
scope: reusable
language: typescript
applies_to: ["**/*.ts", "**/*.tsx"]
requires: ["languages/javascript.md"]
version: "1.0.0"
maintained_by: hodge-framework
---

# TypeScript Best Practices

## Type Safety
**Enforcement: MANDATORY** | **Severity: BLOCKER**
Use strict mode in tsconfig.json...

## Type Annotations
**Enforcement: SUGGESTED** | **Severity: WARNING**
Prefer type inference over explicit annotations...
```

`review-profiles/tech-stacks/react.md`:
```yaml
---
scope: reusable
tech_stack: react
applies_to: ["**/*.jsx", "**/*.tsx"]
requires:
  - "languages/javascript.md"
  - "languages/typescript.md"
version: "1.0.0"
maintained_by: hodge-framework
---

# React Best Practices

## Component Patterns
**Enforcement: SUGGESTED** | **Severity: WARNING**
Use functional components with hooks over class components...

## Hook Rules
**Enforcement: MANDATORY** | **Severity: BLOCKER**
Hooks must follow Rules of Hooks (not conditional, not in loops)...
```

### Auto-Detection and Review Configuration

**Decision**: Auto-detect during `hodge init` and generate `.hodge/review-config.md`.

**Auto-Detection Logic**:
- **Language**: Check for tsconfig.json (TypeScript), package.json engines (Node/JS), Cargo.toml (Rust), etc.
- **Framework**: Parse package.json dependencies (react, vue, express, etc.)
- **Testing**: Check package.json devDependencies (vitest, jest, pytest, etc.)
- **Database**: Look for prisma, drizzle, typeorm in dependencies
- **UI Library**: Check for MUI, chakra-ui, tailwind in dependencies

`.hodge/review-config.md`:
```yaml
---
version: "1.0.0"
created_by: hodge init
last_updated: "2025-10-05"
auto_detected: true
---

# Review Configuration

This file specifies which review profiles to use for this project.
Generated by `hodge init` based on project structure.

## Active Profiles

- `general-coding-standards` - Universal quality checks
- `languages/typescript` - TypeScript-specific rules
- `tech-stacks/react` - React component patterns
- `tech-stacks/test-quality` - Testing best practices

## Auto-Detection Results

Detected during `hodge init`:
- **Language**: TypeScript (found tsconfig.json)
- **Framework**: React (found "react" in package.json dependencies)
- **Testing**: Vitest (found "vitest" in package.json devDependencies)
- **UI Library**: MUI (found "@mui/material" in package.json dependencies)

## Manual Customization

You can add or remove profiles by editing this list.
Changes are preserved when running `hodge init --update` (future feature).

## Profile Customization (Future)

```yaml
# Override severity for specific profiles
overrides:
  "languages/typescript":
    "Type Annotations": suggestion  # Downgrade from warning
```
```

**Note**: `hodge init --update` is marked as future work (not in HODGE-333 scope).

### Composition System and Precedence

**How Review Works**:
1. Load project files (`.hodge/standards.md`, `.hodge/principles.md`, `.hodge/patterns/*`, `.hodge/lessons/*`)
2. Load reusable profiles from `.hodge/review-config.md`
3. Resolve profile dependencies (`requires:` field)
4. Merge all content with precedence rules
5. AI analyzes code against merged context

**Precedence Rules** (highest to lowest):
1. **Project standards.md** - Always overrides everything
2. **Project lessons** - Violations are blockers
3. **Project patterns** - Expected patterns for this codebase
4. **Project principles** - Guides interpretation
5. **Reusable profiles** - Domain-specific best practices

**Example Conflict Resolution**:
If `react.md` says "Use functional components" but `.hodge/standards.md` says "This legacy project uses class components", the standard wins and AI should not flag class components.

**Profile Dependencies**:
```yaml
# react.md
requires:
  - "languages/javascript.md"
  - "languages/typescript.md"  # Optional if project uses TS
```

Composition system loads dependencies first, then the requesting profile.

### Preserving HODGE-327 Vision

**Two-Level Review System**:

1. **Feature-Level Review** (future HODGE-327.5):
   - Integrated into `/harden` command
   - Reviews only files changed in current feature
   - Uses same profile system as architectural review
   - Blocks shipping if blockers found

2. **Architectural Review** (existing `/review` command):
   - Standalone command for periodic deep dives
   - Multiple scopes: file, directory, pattern, recent, all
   - Ad-hoc or scheduled (every 5-10 features)

**Scope Expansion** (future, enabled by this architecture):

Currently implemented:
- `/review file <path>` - HODGE-327.1 (shipped)

Future scopes enabled by unified architecture:
- `/review directory <path>` - Review entire directory recursively
- `/review pattern <glob>` - Review files matching glob pattern
- `/review recent --last N` - Review files changed in last N commits
- `/review all` - Review entire codebase

**Migration Path for HODGE-327.1**:

HODGE-333 must not break existing `/review file` functionality:
- Migrate `default.yml` → `general-coding-standards.md` + other profiles
- Update profile loader to handle markdown format
- Maintain semantic equivalence (same rules, same behavior)
- Preserve report format and persistence

## Implementation Approaches

### Approach 1: Phased Epic with Incremental Delivery (Recommended)

**Description**: Break HODGE-333 into 4 stories that build on each other, delivering value incrementally while managing complexity. Each story is independently shippable and testable.

**Story Breakdown**:

**HODGE-333.1: Frontmatter Infrastructure + YAML Migration**
- Implement YAML frontmatter parser for markdown files
- Define schemas for all file types (standards, principles, patterns, lessons, profiles)
- Migrate `default.yml` → multiple markdown files:
  - `general-coding-standards.md` (SRP, DRY, coupling, complexity)
  - `languages/javascript.md` (if applicable)
  - `languages/typescript.md` (if applicable)
- Update profile loader to handle markdown format
- Add section-level enforcement detection
- Maintain `/review file` compatibility (backward compatible behavior)
- Add frontmatter to existing Hodge `.hodge/standards.md`, `.hodge/principles.md` (as examples)

**Deliverable**: `/review file` works with markdown profiles, YAML deprecated

**HODGE-333.2: Auto-Detection in hodge init**
- Implement language detection (tsconfig.json, package.json, etc.)
- Implement framework detection (parse package.json dependencies)
- Implement testing tool detection (vitest, jest, pytest, etc.)
- Generate `.hodge/review-config.md` with detected profiles
- Add auto-detection output to `hodge init` command
- Handle manual edits (preserve user customizations)

**Deliverable**: `hodge init` auto-generates review-config.md

**HODGE-333.3: Reusable Profile Library**
- Create `general-coding-standards.md` (SRP, DRY, coupling, complexity, naming)
- Create `languages/javascript.md` (JS idioms, common pitfalls)
- Create `languages/typescript.md` (TS type safety, strict mode)
- Create `languages/python.md` (Python conventions, PEP 8)
- Create `tech-stacks/react.md` (component patterns, hooks, performance)
- Create `tech-stacks/vue.md` (composition API, reactivity)
- Create `tech-stacks/api-design.md` (REST/GraphQL consistency)
- Create `tech-stacks/test-quality.md` (test architecture, isolation)
- Ship profiles with Hodge framework (part of npm package)
- Document profile creation pattern for community

**Deliverable**: Rich profile library ships with Hodge

**HODGE-333.4: Composition System + Future Enablement**
- Implement profile dependency resolution (`requires:` field)
- Implement precedence rules (project overrides profiles)
- Optimize context loading (only load relevant profiles)
- Add composition logging (show which profiles loaded)
- Enable future scope expansion (architecture ready for directory/pattern/recent)
- Enable future harden integration (document pattern)
- Add profile merging tests (conflict resolution)

**Deliverable**: Full composition system, ready for scope expansion

**Pros**:
- Each story independently valuable and shippable
- Complexity managed through phasing
- Can adjust plan based on learnings from each story
- Incremental testing reduces risk
- Demonstrates value early (migration first, then enhancements)

**Cons**:
- Longer overall timeline
- Need to maintain consistency across stories
- Some overhead from story transitions

**When to use**: When managing complexity is important and incremental delivery provides value.

---

### Approach 2: Big Bang Implementation

**Description**: Implement everything in HODGE-333 at once - migration, frontmatter, auto-detection, profile library, and composition system all in a single large story.

**Architecture**:
- Single comprehensive PR
- All components built together
- Tested as complete system
- Ships when everything is done

**Pros**:
- Avoid coordination between stories
- Can optimize across all components
- Single comprehensive test suite
- Faster if no issues encountered

**Cons**:
- High risk - nothing ships until everything works
- Harder to test incrementally
- Difficult to debug issues
- Overwhelming code review
- No early feedback on architecture choices

**When to use**: For small, tightly coupled features where phasing adds no value.

---

### Approach 3: Parallel Tracks

**Description**: Work on migration and new features in parallel, merging at the end.

**Tracks**:
- **Track A**: Migration (YAML → markdown) + frontmatter infrastructure
- **Track B**: Profile library creation (languages, tech-stacks)
- **Track C**: Auto-detection + composition system

**Pros**:
- Fastest timeline if multiple developers
- Can start profile library before migration complete
- Reduces serial dependencies

**Cons**:
- Requires careful coordination
- Integration complexity at merge
- Harder for solo developer
- Risk of conflicts between tracks

**When to use**: With multiple developers and clear separation of concerns.

## Recommendation

**Use Approach 1: Phased Epic with Incremental Delivery**

This approach best aligns with HODGE-333 requirements and constraints:

1. **Complexity Management**: Breaking into 4 stories makes each piece digestible and testable
2. **Risk Mitigation**: Migration first proves the concept before building on it
3. **Incremental Value**: Each story delivers something useful (migration → auto-detection → library → composition)
4. **Flexibility**: Can adjust based on learnings (e.g., if migration reveals issues, fix before proceeding)
5. **Solo Developer Friendly**: Stories are sequential, no coordination overhead
6. **Preserves HODGE-327.1**: Migration story maintains `/review file` compatibility
7. **Enables Future Work**: Final story sets up architecture for scope expansion and harden integration

**Implementation Priority**:
1. **HODGE-333.1**: Frontmatter + migration (foundation)
2. **HODGE-333.2**: Auto-detection (user experience enhancement)
3. **HODGE-333.3**: Profile library (breadth of coverage)
4. **HODGE-333.4**: Composition system (completeness and future-readiness)

## Decisions Decided During Exploration

1. ✓ **Break YAML compatibility** - All-in on markdown format, no dual YAML/markdown support during transition
2. ✓ **Explicit section-level enforcement** - Every section has enforcement marker to prevent AI tracking errors
3. ✓ **Auto-detection during hodge init** - Generates review-config.md based on project structure (tsconfig, package.json, etc.)
4. ✓ **No custom/ directory** - Project-specific rules belong in .hodge/standards.md, not review-profiles/custom/
5. ✓ **Phased epic approach** - 4 stories for incremental delivery (migration → auto-detection → library → composition)
6. ✓ **Preserve HODGE-327 vision** - Two-level review system (feature + architectural) and scope expansion enabled
7. ✓ **Unified frontmatter schemas** - Consistent markdown + YAML frontmatter format, different metadata per file type
8. ✓ **Maintain /review file compatibility** - Don't break HODGE-327.1 shipped functionality during migration
9. ✓ **Profile composition system** - Merge project .hodge/* files + reusable profiles with precedence rules
10. ✓ **Enable future harden integration** - Architecture supports HODGE-327.5 feature-level review
11. ✓ **Reusable profile library ships with Hodge** - Part of npm package, community can contribute
12. ✓ **Manual updates preserved** - hodge init --update (future) preserves manual edits to review-config.md

## Decisions Needed

1. Should we version the frontmatter schema itself for future evolution (e.g., `frontmatter_version: "1.0.0"`)?
2. How verbose should auto-detection logging be in `hodge init` output (show all checks or just results)?
3. Should review-config.md support profile customization (override severity levels for specific rules)?
4. What's the migration communication strategy for existing HODGE-327.1 users with default.yml?
5. How should /harden integration work - separate profile or subset of main profiles (story 333.4 decision)?
6. Should profile `requires:` support optional vs mandatory dependencies (e.g., TypeScript only if project uses it)?

## Test Intentions

### Frontmatter Parsing and Validation
- Can parse YAML frontmatter from markdown files
- Validates required fields per file type (standards, principles, patterns, lessons, profiles)
- Handles malformed frontmatter gracefully with clear error messages
- Supports all frontmatter schemas (project files + reusable profiles)

### Explicit Enforcement Detection
- Reads section-level enforcement markers (`**Enforcement: MANDATORY**`)
- Reads section-level severity markers (`**Severity: BLOCKER**`)
- Correctly categorizes violations by severity (blocker/warning/suggestion)
- No implicit inheritance tracking required

### YAML to Markdown Migration
- Converts existing default.yml to markdown format(s)
- Maintains semantic equivalence (same rules, same behavior)
- Profile content maps correctly (criteria → sections)
- Custom instructions preserved in markdown

### Backward Compatibility
- `/review file` continues working after migration
- Report format and persistence unchanged
- Existing review reports remain readable
- No breaking changes for HODGE-327.1 users

### Auto-Detection (hodge init)
- Detects TypeScript (tsconfig.json present)
- Detects JavaScript (package.json without tsconfig)
- Detects React (package.json dependencies contain "react")
- Detects Vue (package.json dependencies contain "vue")
- Detects testing tools (vitest, jest, pytest in devDependencies)
- Detects UI libraries (MUI, chakra-ui, tailwind)
- Generates review-config.md with detected profiles
- Preserves manual edits to review-config.md

### Profile Composition with Precedence
- Loads project .hodge/standards.md, principles.md, patterns/*, lessons/*
- Loads reusable profiles from review-config.md
- Resolves profile dependencies (requires: field)
- Merges with correct precedence (project standards override profiles)
- Project standards override profile recommendations (conflict resolution)
- AI receives merged context for review

### Reusable Profile Library Creation
- Creates general-coding-standards.md (SRP, DRY, coupling, naming, complexity)
- Creates languages/typescript.md (type safety, strict mode, inference)
- Creates languages/javascript.md (JS idioms, common pitfalls)
- Creates tech-stacks/react.md (hooks, components, performance)
- Creates tech-stacks/test-quality.md (test architecture, isolation)
- Ships profiles with Hodge framework (npm package includes them)
- Profile frontmatter schemas validated

### Future-Readiness for Scope Expansion
- Architecture supports directory scope (`/review directory <path>`)
- Architecture supports pattern scope (`/review pattern <glob>`)
- Architecture supports recent scope (`/review recent --last N`)
- Architecture supports all scope (`/review all`)
- No blockers for adding scope expansion in future stories

---

*Template created: 2025-10-05T06:47:00.000Z*
*Exploration completed: 2025-10-05T08:30:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
