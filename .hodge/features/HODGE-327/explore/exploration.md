# Exploration: HODGE-327

## Title
Revamp /review command for AI-driven architectural code review

## Problem Statement

The `/review` command currently references non-existent `hodge learn` functionality and duplicates capabilities now handled by `/status`, `/decide`, and `/ship`. However, evidence from recent features (HODGE-317.1, HODGE-318, HODGE-319.1, HODGE-320, HODGE-322) reveals a critical gap: **we lack AI-driven architectural review for code quality issues that automated tools cannot detect**.

Recent history shows subprocess spawning antipatterns proliferated to 15+ test files despite being "fixed" in HODGE-317.1, and HODGE-318 reintroduced the banned pattern just one day after elimination. ESLint and automated tooling cannot catch architectural issues like coupling violations, single responsibility problems, DRY violations across files, naming inconsistencies, complexity hotspots, or lessons-learned violations.

Additionally, two distinct review needs emerged: (1) feature-level review during development to ensure new code meets quality standards, and (2) architectural review of entire subsystems or cross-cutting concerns to identify refactoring opportunities and pattern drift across multiple shipped features.

## Conversation Summary

### Initial Analysis: Evidence of Need

Investigation of git history revealed compelling evidence for AI-driven code review:

**HODGE-317.1 through HODGE-320 Pattern**: The subprocess spawning antipattern was "fixed" in test-isolation tests, then:
- Reintroduced in HODGE-318 (one day later)
- Caught in HODGE-319.1 (regression fix)
- Discovered in 15 MORE files in HODGE-320 (hidden in test helpers)
- Became a CRITICAL mandatory standard: "Subprocess Spawning Ban - Exceptions: None"

**HODGE-322**: The `/harden` command itself had validation bugs that gave false positives/negatives, "blocking production deploys."

This pattern demonstrates that systemic code review looking across the codebase could have caught:
- Indirect subprocess spawning in test helpers before proliferation
- The regression in HODGE-318 before merge
- The fact that "fixing test-isolation tests" didn't address the root cause

### What Automated Tools Cannot Catch

ESLint and linters can catch syntax violations and simple patterns, but only human/AI review can detect:
- **Coupling**: Services knowing too much about other services' internals
- **Single Responsibility**: Classes doing multiple unrelated things
- **DRY violations**: Logic appearing in multiple files with slight variations
- **Naming**: Misleading or inconsistent naming across codebase
- **Complexity**: Deeply nested logic that's hard to reason about
- **Extensibility**: Hardcoded cases that will break when extended
- **Maintainability**: Clever code that will confuse future developers
- **Context-aware decisions**: Understanding why banned patterns appear and whether exceptions are justified

### Two Distinct Use Cases

**Use Case 1: Feature-Level Review (During Development)**
- **Scope**: Single feature's code changes
- **Timing**: During `/harden` before ship
- **Questions**: Does new code follow SRP? Is it coupled inappropriately? Are we duplicating logic? Does naming make sense?
- **Natural Home**: Enhanced `/harden` command

**Use Case 2: Architectural Review (Periodic Deep Dive)**
- **Scope**: Entire subsystems or cross-cutting concerns
- **Timing**: Ad-hoc when something feels off, or periodic (every 5-10 features)
- **Questions**: Are CLI commands maintaining consistent patterns? Is slash command template structure getting bloated? Are interactions between components staying clean? What refactoring opportunities emerged from recent features?
- **Natural Home**: Dedicated `/review` command

### Extensibility Requirements

Hodge is intended to help build all kinds of applications (not just Hodge itself). While Hodge has unique review needs (slash command quality, CLI-template coordination), the review mechanism must support arbitrary project types with their own specialized quality needs (React components, API design, database schemas, etc.).

## Implementation Approaches

### Approach 1: Configurable Profile-Based Review System

**Description**: Build a flexible review system where review criteria are defined in configuration profiles rather than hardcoded logic. AI loads profiles to understand what to look for, then analyzes code against those criteria.

**Architecture**:
```
.hodge/review-profiles/
├── default.yml                    # Standard code quality (all projects)
├── hodge-self-review.yml          # Slash commands + CLI coordination
├── react-components.yml           # React-specific patterns
├── api-design.yml                 # REST/GraphQL API consistency
├── test-quality.yml               # Test architecture patterns
└── custom/                        # Project-specific profiles
    └── my-project-patterns.yml
```

**Profile Structure** (YAML for readability):
```yaml
name: "Hodge Self-Review"
description: "Reviews slash command quality and CLI-template coordination"
applies_to:
  - "glob: .claude/commands/*.md"
  - "glob: src/commands/*.ts"

criteria:
  - name: "Slash Command Template Consistency"
    severity: critical
    patterns:
      - "Check all .md files follow same structure"
      - "Verify step numbering is consistent"
      - "Ensure all templates include error handling guidance"

  - name: "CLI-Template Coordination"
    severity: critical
    patterns:
      - "Verify slash command calls match CLI command signatures"
      - "Check that templates reference actual CLI flags"
      - "Ensure state files referenced in templates are created by CLI"

  - name: "Cross-File DRY Violations"
    severity: opportunity
    patterns:
      - "Look for duplicated bash commands across templates"
      - "Check for repeated validation logic"

  - name: "Lessons Learned Violations"
    severity: critical
    reference: ".hodge/lessons/"
    patterns:
      - "Check for subprocess spawning in tests (HODGE-317.1)"
      - "Verify test isolation (HODGE-308)"
      - "Ensure no CommonJS patterns (HODGE-318)"
```

**Invocation**:
```bash
/review file src/commands/ship.ts
/review directory src/commands/
/review pattern "CLI commands"
/review recent --last 5              # Last 5 features
/review all --profile hodge-self-review
```

**Output**: Markdown report with severity levels
```markdown
# Code Review Report: src/commands/

## Critical Issues (2)
1. **Lessons Learned Violation**: Subprocess spawning detected in 3 files
   - src/commands/foo.test.ts:45 - Uses execSync()
   - Violates: HODGE-317.1 Subprocess Spawning Ban
   - Recommendation: Use direct function calls pattern

## Opportunities (5)
1. **DRY Violation**: Validation logic duplicated across 4 commands
   - Extract to shared ValidationService
   - Files: build.ts, harden.ts, ship.ts, explore.ts
```

**Pros**:
- Highly extensible - add profiles for any tech stack
- Reusable profiles across projects (publish to npm/registry)
- AI reads declarative config instead of hardcoded logic
- Clear separation of "what to check" (profiles) from "how to check" (AI analysis)
- Projects can start with built-in profiles and customize incrementally

**Cons**:
- Requires designing profile schema carefully
- More complex initial implementation
- Profile quality determines review quality

**When to use**: This approach is ideal for a framework intended to support diverse project types, as it makes review criteria first-class configuration rather than code.

---

### Approach 2: Hardcoded Review Types with Plugin System

**Description**: Build specific review types into the CLI (code-quality, slash-commands, api-design, etc.) and allow projects to add custom reviewers via a plugin system.

**Architecture**:
```typescript
// Built-in reviewers
class CodeQualityReviewer {
  analyze(files: string[]): Report { /* ... */ }
}

class SlashCommandReviewer {
  analyze(templates: string[]): Report { /* ... */ }
}

// Plugin interface
interface ReviewPlugin {
  name: string;
  analyze(scope: Scope): Report;
}

// Project registers custom reviewers
// .hodge/review-plugins.ts
export const reviewers: ReviewPlugin[] = [
  new MyCustomReactReviewer(),
  new MyApiDesignReviewer()
];
```

**Invocation**:
```bash
/review code src/commands/          # Uses CodeQualityReviewer
/review slash-commands              # Uses SlashCommandReviewer
/review custom:react-components     # Uses registered plugin
```

**Pros**:
- Type-safe TypeScript implementation
- Full programmatic control in plugins
- Can leverage existing npm packages in reviewers
- Clear extension points

**Cons**:
- Requires TypeScript knowledge to extend
- Harder to share reviewer logic across projects (npm publishing required)
- Built-in reviewers become opinionated (harder to customize)
- Plugin code runs in Hodge process (security/stability risk)

**When to use**: When you want strong typing and programmatic control, and expect most users to stick with built-in reviewers.

---

### Approach 3: Template-Driven Review (Extend Slash Commands)

**Description**: Treat review as another AI template in `.claude/commands/review.md` with sophisticated prompting to guide AI through architectural analysis. No CLI command needed - pure AI-driven.

**Architecture**:
```markdown
# .claude/commands/review.md

## Review Scope: {{scope}}

Load review guidelines:
- .hodge/standards.md
- .hodge/lessons/*.md
- .hodge/patterns/*.md

Analyze {{scope}} for:
1. Coupling & Cohesion
2. Single Responsibility
3. DRY violations
4. Naming consistency
5. Complexity hotspots
...

Special review types:
{{#if hodge-project}}
- Slash command template quality
- CLI-template coordination
{{/if}}

{{#if react-project}}
- Component composition
- Hook usage patterns
{{/if}}

Generate markdown report...
```

**Pros**:
- Zero CLI code needed
- Fully flexible - AI adapts to any prompt
- Easy to modify review criteria (just edit markdown)
- Works with any project type (AI infers from context)

**Cons**:
- No structured output guarantees
- Hard to version control "review quality"
- Prompts can drift or become bloated
- Difficult to test systematically
- No reusable "review profile" concept

**When to use**: For rapid prototyping of review functionality before committing to a structured approach.

## Recommendation

**Use Approach 1: Configurable Profile-Based Review System**

This approach best aligns with Hodge's philosophy and architectural needs:

1. **Extensibility**: Hodge must support diverse project types. Profiles make review criteria first-class configuration that any project can define.

2. **Reusability**: Starter profiles for common tech stacks (React, API design, test quality) can be shared and improved by the community.

3. **AI-First Architecture**: AI reads declarative YAML/JSON configs and performs analysis - this matches Hodge's "AI analyzes, backend executes" principle.

4. **Hodge Self-Review**: Built-in `hodge-self-review.yml` profile handles unique slash command quality and CLI-template coordination needs without hardcoding them.

5. **Progressive Enhancement**: Projects start with `default.yml`, add relevant profiles (React, API, etc.), then create custom profiles as patterns emerge.

6. **Integration Points**:
   - `/review` uses profiles for architectural review (ad-hoc, periodic)
   - `/harden` uses profile subset for feature-level review (mandatory)
   - Both share same profile format and analysis engine

**Implementation Phases**:
1. **Build Phase**: Core review engine + profile loader + basic CLI command
2. **Harden Phase**: `default.yml` + `hodge-self-review.yml` profiles, integrate subset into `/harden`
3. **Ship Phase**: Documentation, starter profiles for React/Vue/API/Test patterns

## Decisions Decided During Exploration

1. ✓ **Keep `/review` as separate command** - Architectural review is distinct from feature hardening validation; serves different purposes at different times
2. ✓ **Scope-based invocation** - Support file/directory/pattern/recent/all scopes for flexibility in what to analyze
3. ✓ **Profile-based extensibility** - Review criteria defined in config files, not hardcoded, enabling arbitrary project types
4. ✓ **Hodge-specific profiles included** - Built-in support for slash command quality and CLI-template coordination via `hodge-self-review.yml`
5. ✓ **NOT required for shipping** - `/harden` remains the quality gate, `/review` is analytical/advisory
6. ✓ **Evidence-based value** - Subprocess spawning proliferation across HODGE-317.1→320 proves need for cross-codebase pattern detection
7. ✓ **YAML for profiles** - Readability over tooling support; review configs should be human-friendly
8. ✓ **Integrate subset into `/harden`** - Feature-level review should use same profile system during development
9. ✓ **Starter profiles for common stacks** - Ship with React, Vue, API design, test quality profiles to provide immediate value

## Decisions Needed

1. Should review reports integrate with PM tools to auto-create refactoring issues? (Consider: automated tracking vs manual triage of findings)
2. How verbose should reports be by default? (Consider: signal-to-noise ratio for large codebases with many findings)
3. Should there be a `/review --auto-fix` mode for simple issues? (Consider: AI code generation risks vs convenience)
4. What severity levels should profiles support? (Proposal: critical/warning/opportunity/info, but is this sufficient?)
5. Should profiles support custom AI instructions beyond pattern matching? (Consider: flexibility vs consistency in review quality)

## Test Intentions

**Profile System**:
- AI can load and parse YAML review profile configurations
- AI correctly validates profile schema (required fields, valid severity levels)
- AI handles missing or malformed profiles gracefully
- AI can merge multiple profiles when reviewing (e.g., default.yml + hodge-self-review.yml)

**Scope System**:
- AI correctly scopes review to single file when requested
- AI correctly scopes review to directory recursively
- AI correctly scopes review by pattern (e.g., "all CLI commands")
- AI correctly scopes review to recent N features via git history

**Analysis & Reporting**:
- AI generates markdown reports with proper severity categorization
- AI groups related findings (e.g., all DRY violations together)
- AI references specific files and line numbers in findings
- AI includes actionable recommendations in report

**Hodge-Specific Reviews**:
- Hodge-specific profile catches slash command template quality issues (structure, consistency, error handling)
- Hodge-specific profile detects CLI-template coordination problems (mismatched signatures, missing flags, orphaned state files)
- Hodge-specific profile identifies lessons-learned violations (subprocess spawning, test isolation, etc.)

**Extensibility**:
- Projects can define custom review profiles
- Custom profiles correctly override/extend built-in profiles
- Starter profiles work for common tech stacks (React component patterns, API design consistency)

**Integration with /harden**:
- `/harden` can load feature-level review profile subset
- Feature-level review runs before automated validation
- Review findings are surfaced in harden pre-check

---

*Template created: 2025-10-04T05:12:53.906Z*
*Exploration completed: 2025-10-04T05:30:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
