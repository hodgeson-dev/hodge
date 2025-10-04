# Lessons Learned: HODGE-327.1

## Feature: Core Review Engine with Profile System and Layered Quality Criteria

### The Problem

The existing `/review` command was outdated and referenced non-existent `hodge learn` functionality. Investigation into git history (HODGE-317.1 through HODGE-322) revealed a pattern proliferation issue: subprocess spawning patterns spread across the codebase despite being a known anti-pattern. ESLint and TypeScript cannot catch architectural smells like:

- Coupling violations and SRP breaches
- Pattern proliferation across files
- Inconsistent implementation of similar features
- Violations of project-specific lessons learned

We needed AI-driven architectural review that could detect these quality issues while respecting project-specific conventions and lessons.

### Approach Taken

Built a layered review system with three architectural priorities:

**Layer 1 (Highest Priority)**: Project-specific context
- `.hodge/standards.md` - Enforceable rules (overrides everything)
- `.hodge/principles.md` - Project philosophy and values
- `.hodge/patterns/` - Expected solutions and patterns
- `.hodge/lessons/` - Past mistakes to avoid (violations are blockers)

**Layer 2**: Profile domain defaults
- YAML profiles for specific domains (react-components.yml, api-design.yml)
- Provide best practices but can be overridden by Layer 1

**Layer 3**: Universal baseline
- `default.yml` - Language-agnostic code quality (coupling, SRP, DRY, complexity)

**Key Architectural Decision**: Automatic context merging. Standards, principles, patterns, and lessons are ALWAYS loaded regardless of which profile is used. This ensures project conventions always take precedence over generic recommendations.

### Key Learnings

#### 1. The Hodge Workflow Scales Well for Larger Features

**Discovery**: HODGE-327 was an epic with 6 stories. The `/explore` → `/decide` → `/plan` workflow handled this multi-story feature elegantly.

**What Worked**:
- Conversational exploration clarified scope and architectural decisions before coding
- Epic planning broke complex work into shippable vertical slices
- Each story (327.1 through 327.6) delivered independent value
- Story 327.1 focused on core infrastructure, enabling parallel future work

**Impact**: The workflow proved it can handle both small features and large epics without modification. The key is thorough exploration and proper story decomposition.

#### 2. Simple String Patterns Leverage AI Better Than Rigid Rules

**Discovery**: Initial consideration was structured rules (regex patterns, AST queries). We chose simple string patterns that AI interprets freely.

**Solution**:
```yaml
criteria:
  - name: "Lessons Learned Violations"
    severity: blocker
    patterns:
      - "Check for subprocess spawning in tests"
      - "Avoid duplicated validation logic"
      - "Ensure proper test isolation"
```

This approach:
- Keeps profiles human-readable
- Leverages AI's natural language understanding
- Allows nuanced interpretation (context-aware detection)
- Easier to maintain than complex regex/AST rules

#### 3. Layered Architecture Prevents Profile/Standards Conflicts

**Discovery**: Review profiles could recommend practices that conflict with project-specific decisions.

**Solution**: Automatic context merging with clear priority hierarchy. Example conflict resolution:

If `react-components.yml` says "Use functional components" but `.hodge/standards.md` says "This project uses class components for legacy compatibility," the standard overrides the profile. AI uses Layer 1 context to interpret Layer 2 recommendations.

**Impact**: Teams can use generic profiles while maintaining project-specific conventions.

#### 4. Test Isolation Prevented Harden Phase Bugs

**Discovery**: All tests used `os.tmpdir()` for file operations, never touching project `.hodge` directory.

**Why This Mattered**: During harden phase, we ran tests, lint, typecheck, and build in parallel. If tests had modified project state, we would have had race conditions or corrupted tracking files.

**Validation**: 13 tests (8 smoke + 5 integration) all passed consistently, with zero flakiness.

### Code Examples

**Profile Validation with Clear Error Messages**:
```typescript
// src/lib/profile-loader.ts
private validateProfile(profile: ReviewProfile, profileName: string): void {
  const missing: string[] = [];
  if (!profile.name) missing.push('name');
  if (!profile.description) missing.push('description');
  if (!profile.applies_to) missing.push('applies_to');
  if (!profile.criteria) missing.push('criteria');

  if (missing.length > 0) {
    throw new Error(
      `Profile ${profileName} is missing required fields: ${missing.join(', ')}`
    );
  }
}
```

**Graceful Handling of Missing Context Files**:
```typescript
// src/lib/context-aggregator.ts
private loadStandards(): string {
  const standardsPath = join(this.basePath, '.hodge', 'standards.md');
  if (!existsSync(standardsPath)) {
    console.warn('⚠️  Warning: .hodge/standards.md not found');
    return '';
  }
  return readFileSync(standardsPath, 'utf-8');
}
```

### Impact

**Workflow Validation**:
- Epic with 6 stories successfully planned using `/explore` → `/decide` → `/plan`
- Story 327.1 delivered complete, testable infrastructure
- Workflow scales from single features to complex multi-story epics

**Code Quality Infrastructure**:
- AI can now detect architectural issues ESLint misses
- Project-specific lessons automatically enforced
- 3-level severity (blocker/warning/suggestion) guides priorities
- Zero dependencies on external review services

**Extensibility**:
- Profile system supports 6+ languages (TypeScript, JavaScript, Kotlin, Python, Java, Go)
- Custom instructions enable domain-specific analysis
- Layered architecture prevents profile/standards conflicts

**Testing Rigor**:
- 13 tests validate end-to-end flow (profile loading, context aggregation, file analysis)
- Test isolation prevented race conditions during parallel harden validation
- All tests passing in both build and harden phases

### Related Decisions

From `.hodge/features/HODGE-327/decisions.md`:
1. **Custom AI Instructions** - Enables sophisticated project-specific reviews beyond pattern matching
2. **3 Severity Levels** - blocker/warning/suggestion provides clear mental model
3. **No Auto-Fix Mode** - Recommendations only, maintains user control
4. **Medium Verbosity** - Grouped findings balance detail with readability
5. **Manual Triage** - User decides which findings to address with suggested `/explore` commands

### Validation

**Harden Phase Results**:
- ✅ All 13 tests passing (8 smoke + 5 integration)
- ✅ Zero ESLint errors (255 warnings from existing code)
- ✅ Zero TypeScript errors
- ✅ Build successful
- ✅ 87 total test files passing (project-wide)

**Files Created**:
- 6 new implementation files (838 net lines)
- 2 new test files (352 net lines)
- 1 YAML profile (default.yml, 8 criteria)
- 1 slash command template (review.md)

---
_Documented: October 4, 2025_
