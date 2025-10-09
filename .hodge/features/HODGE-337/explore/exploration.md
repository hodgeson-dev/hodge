# Exploration: HODGE-337

## Title
Optimize Harden Review Process - Smart Review Scope Selection

## Feature Overview
**PM Issue**: HODGE-337
**Type**: optimization
**Created**: 2025-10-09T03:37:53.711Z
**Updated**: 2025-10-09T04:00:00.000Z

## Problem Statement

The current `/harden` workflow requires a full AI code review of ALL changed files before running validation tests. This can be inefficient for:

1. **Minor changes** (typo fixes, documentation updates, comment changes)
2. **Test-only changes** (adding tests without changing implementation)
3. **Configuration changes** (package.json updates, config file tweaks)
4. **Small incremental updates** (1-2 line changes to existing well-tested code)

**Current workflow** (from `.claude/commands/harden.md`):
```bash
# Step 1: Load review context (all standards, profiles, patterns)
hodge harden {{feature}} --review

# Step 2: Read changed files list
cat .hodge/features/{{feature}}/harden/changed-files.txt

# Step 3: Conduct full AI code review of ALL changed files
cat .hodge/features/{{feature}}/harden/review-context.md
# Review every file against loaded context

# Step 4: Generate review-report.md
# Write full report with blockers/warnings/suggestions

# Step 5: Run harden command
hodge harden {{feature}}
```

**Issue**: This process takes significant time and AI tokens even when changes are trivial or low-risk.

## Optimization Goals

1. **Smart scope selection** - Determine when full review is needed vs. abbreviated review
2. **Fast path for low-risk changes** - Skip or streamline review for minimal changes
3. **Maintain quality gates** - Never compromise on critical standards enforcement
4. **Clear user guidance** - Help developers understand when full review is required

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 11
- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-001
- **Relevant Patterns**: None identified

## Possible Optimization Strategies

### Strategy 1: Change Classification
Classify changes into risk tiers based on:
- Number of files changed
- Lines changed per file
- File types (implementation vs tests vs docs vs config)
- Scope of changes (new features vs bug fixes vs refactoring)

**Risk Tiers**:
- **Trivial** (0-1 files, <10 lines, docs/comments only) → Skip review
- **Low** (1-3 files, <50 lines, tests only) → Quick review
- **Medium** (4-10 files, <200 lines, implementation changes) → Standard review
- **High** (>10 files, >200 lines, major refactoring) → Full comprehensive review

### Strategy 2: Incremental Review Cache
Cache review results for previously reviewed files:
- Track file content hashes
- Skip review if file unchanged since last review
- Only review newly modified portions

### Strategy 3: User-Directed Review Scope
Add flags to allow developers to opt-in/out:
- `--skip-review` - Bypass review entirely (trust developer judgment)
- `--quick-review` - Abbreviated review (check critical standards only)
- `--full-review` - Comprehensive review (current behavior, default for major changes)

### Strategy 4: Differential Review Depth
Vary review depth based on context:
- **Critical files** (src/lib/core, commands) → Always full review
- **Test files** → Focus on test quality standards only
- **Config/docs** → Minimal review (syntax, formatting)

## Implementation Approaches

### Approach 1: YAML Manifest with Tiered Review (RECOMMENDED)

**Description**: CLI analyzes changes and generates a review-manifest.yaml with tier recommendation and pre-filtered context. AI presents tier options to user, reads context selectively based on chosen tier, and conducts review.

**Components**:

**1. CLI Changes** (`src/commands/harden.ts` when `--review` flag):
- Analyze changed files via `git diff HEAD` (count files, lines, types)
- Classify changes into recommended tier using rules:
  - **SKIP**: Only .md files (except standards.md/principles.md), comments-only changes
  - **QUICK**: 1-3 files, <50 lines, test-only or config-only
  - **STANDARD**: 4-10 files, <200 lines, implementation changes (current default)
  - **FULL**: >10 files, >200 lines, or core architecture files touched
- Generate `review-manifest.yaml` with:
  - Recommended tier
  - Change analysis (files, lines, types breakdown)
  - Pre-filtered patterns (match file types in changeset)
  - Pre-filtered profiles (match file types in changeset)
  - Context file paths in precedence order
- Generate `changed-files.txt` (existing behavior)

**2. Template Updates** (`.claude/commands/harden.md`):
- Step 1: AI calls `hodge harden {{feature}} --review`
- Step 2: AI reads `review-manifest.yaml`
- Step 3: AI presents tier options to user with recommendation
- Step 4: Based on user choice, AI reads context files:
  - **SKIP**: No context reading, proceed to validation
  - **QUICK**: Read standards.md + matched patterns + matched profiles only
  - **STANDARD**: Read standards.md + principles.md + matched patterns + matched profiles
  - **FULL**: Read all context (standards, principles, decisions, patterns, profiles, lessons)
- Step 5: AI conducts review, generates review-report.md
- Step 6: AI calls `hodge harden {{feature}}` for validation

**3. Manifest Format** (`review-manifest.yaml`):
```yaml
version: "1.0"
feature: "HODGE-337"
generated_at: "2025-10-09T06:00:00.000Z"

# CLI recommendation based on change analysis
recommended_tier: "quick"

# Change analysis (for AI to explain recommendation)
change_analysis:
  total_files: 3
  total_lines: 45
  breakdown:
    implementation: 1  # src/commands/harden.ts
    test: 1            # src/commands/harden.test.ts
    documentation: 1   # README.md

# Changed files
changed_files:
  - path: "src/commands/harden.ts"
    lines_changed: 12
    change_type: "implementation"
  - path: "src/commands/harden.test.ts"
    lines_changed: 28
    change_type: "test"
  - path: "README.md"
    lines_changed: 5
    change_type: "documentation"

# Context to load (in precedence order)
context:
  project_standards:
    path: ".hodge/standards.md"
    precedence: 1
    required_for_tiers: ["quick", "standard", "full"]

  project_principles:
    path: ".hodge/principles.md"
    precedence: 2
    required_for_tiers: ["standard", "full"]

  project_decisions:
    path: ".hodge/decisions.md"
    precedence: 3
    required_for_tiers: ["full"]
    note: "Large file (3821 lines) - read selectively if needed"

  matched_patterns:
    precedence: 4
    required_for_tiers: ["quick", "standard", "full"]
    files:
      - ".hodge/patterns/test-pattern.md"

  matched_profiles:
    precedence: 5
    required_for_tiers: ["quick", "standard", "full"]
    files:
      - ".hodge/review-profiles/testing/vitest-3.x.md"
      - ".hodge/review-profiles/languages/typescript-5.x.md"

  lessons_learned:
    precedence: 6
    required_for_tiers: ["full"]
    directory: ".hodge/lessons/"
    note: "Read relevant lessons if needed"
```

**Pros**:
- Massive token savings (QUICK: ~1K lines vs FULL: ~8K lines)
- User maintains control via conversation
- CLI does heavy lifting (analysis, filtering)
- AI does interpretation (present options, read selectively, review)
- Scalable (handles growing decisions.md/lessons)
- Clear precedence ordering preserved

**Cons**:
- Requires new CLI logic for change classification
- New manifest format to maintain
- AI template becomes more complex (tier-based logic)

**When to use**: Best for projects with large context files (>5K lines) where token optimization is critical.

---

### Approach 2: Smart Defaults with Manual Override

**Description**: CLI generates review-context.md as today, but adds tier recommendation at the top. AI reads full context but applies different review depth based on tier. Simpler implementation, less token savings.

**Components**:

**1. CLI Changes**:
- Analyze changes (same as Approach 1)
- Add recommendation header to review-context.md:
```markdown
# REVIEW CONTEXT

**RECOMMENDED TIER**: QUICK (3 files, 45 lines, mostly tests)

**Tier Definitions**:
- SKIP: No review needed
- QUICK: Focus on changed code quality only
- STANDARD: Full standards compliance check
- FULL: Comprehensive analysis with patterns/lessons

---

[... rest of existing 8,400-line content ...]
```

**2. Template Updates**:
- Step 1: AI calls `hodge harden {{feature}} --review`
- Step 2: AI reads first 50 lines of review-context.md (get recommendation)
- Step 3: AI presents options to user
- Step 4: Based on choice:
  - **SKIP**: Skip to validation
  - **QUICK**: Read standards section only, review changed files
  - **STANDARD**: Read standards + principles, review changed files
  - **FULL**: Read entire review-context.md, comprehensive review

**Pros**:
- Simpler implementation (minor CLI change)
- Backwards compatible (review-context.md still exists)
- User still gets tier choice

**Cons**:
- Less token savings (AI still loads large file for STANDARD/FULL)
- Doesn't solve 8,400-line file problem
- No pre-filtering of patterns/profiles

**When to use**: Quick win if context files stay <3K lines, or as interim solution before Approach 1.

---

### Approach 3: Progressive Context Loading

**Description**: AI loads context incrementally based on tier, using multiple targeted reads instead of one monolithic file. No manifest, AI decides what to read.

**Components**:

**1. CLI Changes**:
- Generate tier recommendation in `review-metadata.json`:
```json
{
  "recommendedTier": "quick",
  "filesChanged": 3,
  "linesChanged": 45,
  "changeTypes": ["test", "implementation"]
}
```

**2. Template Updates**:
- AI reads context progressively based on chosen tier:

**QUICK tier**:
```bash
cat .hodge/standards.md
grep -l "test\|vitest" .hodge/patterns/*.md | xargs cat
cat .hodge/review-profiles/testing/vitest-3.x.md
```

**STANDARD tier**:
```bash
cat .hodge/standards.md
cat .hodge/principles.md
cat .hodge/patterns/*.md
cat .hodge/review-profiles/testing/*.md
cat .hodge/review-profiles/languages/typescript-5.x.md
```

**FULL tier**:
```bash
cat .hodge/standards.md
cat .hodge/principles.md
cat .hodge/decisions.md
cat .hodge/patterns/*.md
cat .hodge/review-profiles/**/*.md
cat .hodge/lessons/*.md
```

**Pros**:
- No new manifest format
- AI has full flexibility in what to read
- Progressive loading based on need

**Cons**:
- AI must decide what's relevant (not pre-filtered by CLI)
- More Read tool calls (8-12 vs 4-6 in Approach 1)
- Harder to maintain precedence ordering

**When to use**: If you prefer AI flexibility over CLI optimization, or want simpler CLI implementation.

---

## Recommendation

**Use Approach 1 (YAML Manifest with Tiered Review)**

**Rationale**:
1. **Aligns with CLI/AI separation**: CLI discovers structure and filters, AI interprets and presents
2. **Solves the 8,400-line problem**: Token savings scale with context growth
3. **Best user experience**: Clear tier options with accurate time/token estimates
4. **Scalable**: Works even as decisions.md grows to 20K+ lines
5. **Precedence preserved**: Manifest explicitly orders context loading

**Implementation Phases**:
1. **Phase 1**: Add change classification logic to HardenCommand
2. **Phase 2**: Implement review-manifest.yaml generation
3. **Phase 3**: Update harden.md template with tier presentation
4. **Phase 4**: Add smoke tests for tier classification rules

**Key Benefits**:
- Token reduction: 60-80% for QUICK/STANDARD tiers vs current approach
- Solves Read tool limit issue (8,400 lines → selective loading)
- User maintains control (AI presents, user chooses)
- Maintains quality gates (all tiers conduct review, just different depth)

## Test Intentions

From conversation, the following behaviors should be tested:

**Change Classification**:
1. Should classify changes correctly into SKIP/QUICK/STANDARD/FULL tiers based on files/lines/types
2. Should recommend appropriate tier for common change patterns (test-only, docs-only, implementation, major refactor)
3. Should handle edge cases (no changes, mixed change types, large refactors)

**Manifest Generation**:
4. Should generate valid review-manifest.yaml with all required fields
5. Should pre-filter patterns to match only relevant file types in changeset
6. Should pre-filter profiles to match only relevant technologies in changeset
7. Should maintain precedence ordering in manifest (project standards highest, profiles lowest)

**AI Workflow**:
8. Should present tier options to user with accurate time/token estimates
9. Should load only tier-appropriate context files (QUICK: minimal, FULL: comprehensive)
10. Should handle user tier override (accept recommendation or choose different tier)
11. Should conduct review appropriate to chosen tier (QUICK: focus on changes, FULL: comprehensive analysis)
12. Should generate review-report.md documenting findings regardless of tier

**Integration**:
13. Should work with existing review infrastructure (ProfileCompositionService, review-config.md)
14. Should reduce token usage by 60-80% for QUICK/STANDARD tiers vs current FULL review

## Decisions Decided During Exploration

1. ✓ **Manifest format**: Use YAML (vs JSON or embedded in markdown) for readability and structure
2. ✓ **Tier selection flow**: CLI generates recommendation, AI presents options, user chooses (vs CLI enforcing tier)
3. ✓ **Tier system**: Four tiers (SKIP, QUICK, STANDARD, FULL) balances granularity with simplicity
4. ✓ **Context filtering**: CLI pre-filters patterns/profiles by file types (vs AI deciding what's relevant)
5. ✓ **Manifest location**: Store as `review-manifest.yaml` in harden directory (vs metadata embedded in review-context.md)
6. ✓ **Context loading mechanism**: AI reads files listed in manifest using Read tool (vs generating one concatenated file)
7. ✓ **Classification inputs**: Base tier on file count, line count, file types, and specific file paths (vs git diff complexity metrics)
8. ✓ **Risk tolerance**: Balanced-conservative (skip only pure docs, always review implementation)

## Decisions Needed

The following decisions require input during `/decide` phase:

1. **Tier classification thresholds**: Exact boundaries for QUICK/STANDARD/FULL (e.g., "QUICK: ≤3 files AND ≤50 lines" vs "QUICK: ≤5 files AND ≤100 lines")
2. **Mixed change type handling**: How to handle conflicting signals (e.g., 2 test files + 1 core architecture file - should core file override to FULL?)
3. **Critical file path rules**: Should certain paths always trigger FULL tier regardless of change size? (e.g., `src/lib/core/*`, `.hodge/standards.md`)
4. **decisions.md handling in STANDARD tier**: Read selectively via grep, skip entirely, or read specific sections from manifest index?
5. **Large file grep patterns**: Should manifest include suggested grep patterns for files like decisions.md? (e.g., "grep -A 20 'HODGE-33[0-9]'")
6. **Review report format by tier**: Should QUICK tier generate abbreviated report vs FULL tier comprehensive report, or same format for all tiers?

## Implementation Plan (After /decide)

### Phase 1: Change Classification Logic
**Files to Create**:
- `src/lib/review-tier-classifier.ts` - Classification logic with configurable critical paths
- `src/lib/git-diff-analyzer.ts` - Git diff parsing
- `.hodge/review-tier-config.yaml` - Project-specific critical paths and thresholds
- `src/lib/review-tier-classifier.smoke.test.ts` - Smoke tests

**Key Features**:
- Load critical paths from `.hodge/review-tier-config.yaml` (supports glob patterns)
- Parse review profile `applies_to` for dynamic file type detection
- Classify into SKIP/QUICK/STANDARD/FULL based on thresholds
- Critical path override (any critical file → FULL tier)

### Phase 2: Review Manifest Generation
**Files to Create**:
- `src/lib/review-manifest-generator.ts` - YAML manifest generation
- `src/types/review-manifest.ts` - Type definitions
- `src/lib/review-manifest-generator.smoke.test.ts` - Smoke tests

**Files to Modify**:
- `src/commands/harden.ts` - Add `--review` flag handling

**Key Features**:
- Generate `review-manifest.yaml` (no `changed-files.txt` - redundant)
- Pre-filter patterns/profiles based on changed file types
- Include context files with precedence ordering
- Tier-appropriate context lists (QUICK: minimal, FULL: comprehensive)

### Phase 3: Template Updates
**Files to Modify**:
- `.claude/commands/harden.md` - Add tier selection workflow
- `src/lib/claude-commands.ts` - Auto-sync from template

**Key Changes**:
- Step 2a: Read review-manifest.yaml
- Step 2b: Present tier options (SKIP/QUICK/STANDARD/FULL) with time/token estimates
- Step 3: Load context based on chosen tier (precedence order)
- Remove changed-files.txt references (data in manifest)

### Phase 4: Comprehensive Smoke Tests
**Files to Create**:
- `src/commands/harden.smoke.test.ts` - 9+ smoke tests covering all tier rules

**Test Coverage**:
- SKIP tier (pure docs)
- QUICK tier (test-only, within thresholds)
- STANDARD tier (implementation, within thresholds)
- FULL tier (file count, line count, critical paths)
- Mixed changes with critical path override
- Project-specific critical paths (.claude/commands/**)
- Dynamic file type detection from review profiles

### Dependencies to Add
```json
{
  "devDependencies": {
    "js-yaml": "^4.1.0",
    "micromatch": "^4.0.5"
  }
}
```

### Configuration Files
**.hodge/review-tier-config.yaml** (Hodge project):
```yaml
version: "1.0"
critical_paths:
  - "src/lib/core/**"
  - "src/commands/**"
  - ".hodge/standards.md"
  - ".hodge/principles.md"
  - ".claude/commands/**"
tier_thresholds:
  quick:
    max_files: 3
    max_lines: 50
    allowed_types: ["test", "config"]
  standard:
    max_files: 10
    max_lines: 200
  full:
    min_files: 11
    min_lines: 201
```

## Next Steps
- [x] Review exploration findings
- [x] Use `/decide` to make implementation decisions (7 decisions made)
- [ ] Proceed to `/build HODGE-337`
- [ ] Implement Phase 1: Change classification
- [ ] Implement Phase 2: Manifest generation
- [ ] Implement Phase 3: Template updates
- [ ] Implement Phase 4: Smoke tests

---
*Template created: 2025-10-09T03:37:53.711Z*
*Updated with problem statement: 2025-10-09T04:00:00.000Z*
*Updated with implementation plan: 2025-10-09T11:45:00.000Z*
