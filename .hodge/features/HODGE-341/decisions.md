# Feature Decisions: HODGE-341

This file tracks decisions specific to HODGE-341.

## Decisions

<!-- Add your decisions below -->

### 2025-10-11 - Harden report optimization: Only show detailed output on failures (Phase 2) - current harden-report.md includes full output of all tests/linting/typecheck (3000+ lines when all pass), making it unreadable and exceeding token limits. Phase 2 should modify generateReport() in harden.ts to: (1) When all validations pass: show only summary stats ("466 tests passed"), no detailed output; (2) When validations fail: show only failing test output, error messages, and relevant context; (3) Keep validation-results.json for programmatic access to full data. Benefits: reports become readable, AI can process them within token limits, focus on actionable failures only.

**Status**: Accepted for Phase 2

**Context**:
Feature: HODGE-341 (Phase 2 - /harden integration)
Discovered during HODGE-341.1 ship: harden-report.md was 48,239 tokens (exceeded 25K limit)

**Decision**:
Harden report optimization: Only show detailed output on failures (Phase 2) - current harden-report.md includes full output of all tests/linting/typecheck (3000+ lines when all pass), making it unreadable and exceeding token limits. Phase 2 should modify generateReport() in harden.ts to: (1) When all validations pass: show only summary stats ("466 tests passed"), no detailed output; (2) When validations fail: show only failing test output, error messages, and relevant context; (3) Keep validation-results.json for programmatic access to full data. Benefits: reports become readable, AI can process them within token limits, focus on actionable failures only.

**Rationale**:
User feedback during HODGE-341.1 ship - report was too large to read, contained unnecessary passing test output. Smart filtering makes reports actionable and AI-processable.

**Consequences**:
- Phase 2 implementation: Modify harden.ts generateReport() method (lines 228-292)
- Add conditional logic: if (allPassed) show summary only, else show failures only
- Update HardenService to track failure-specific output separately from full output
- Backward compatible: validation-results.json still has full data

---

### 2025-10-10 - Implementation phase prioritization: Ship all 6 phases (Complete Feature) - Phase 1: Core toolchain infrastructure (ToolchainService, DiagnosticsService, toolchain

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Implementation phase prioritization: Ship all 6 phases (Complete Feature) - Phase 1: Core toolchain infrastructure (ToolchainService, DiagnosticsService, toolchain.yaml, TypeScript/JS basic tools); Phase 2: Advanced tool integration (eslint-sonarjs, jscpd, dependency-cruiser, Semgrep with bundled rules); Phase 3: Critical file selection and AI integration (scoring algorithm, cap at top 10, integrate with /harden); Phase 4: AI profile compression (dual .md/.yaml format, 87% token reduction); Phase 5: Multi-language support (Python, Go, Rust, monorepo support); Phase 6: Auto-fix workflow (tools auto-fix, AI-assisted fixes). Delivers complete user experience with hybrid tool+AI review system.

**Rationale**:
Recorded via `hodge decide` command at 10:08:35 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Rule distribution documentation: Document in review profiles (YAML frontmatter) - co-located with profile content, both

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Rule distribution documentation: Document in review profiles (YAML frontmatter) - co-located with profile content, both .md (human) and .yaml (AI) show which checks are tool-enforced vs AI-reviewed. Clear attribution per rule at point of use. Example: tool_checks section lists type_safety (typescript compiler), complexity (eslint-plugin-sonarjs), duplication (jscpd); ai_checks section lists semantic_naming, architectural_alignment, lessons_violations. Distributed but contextually relevant.

**Rationale**:
Recorded via `hodge decide` command at 10:01:19 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Service architecture: ToolchainService + DiagnosticsService separation - clear single responsibility principle: ToolchainService handles tool detection, configuration loading, and tool execution; DiagnosticsService handles result aggregation and critical file selection

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Service architecture: ToolchainService + DiagnosticsService separation - clear single responsibility principle: ToolchainService handles tool detection, configuration loading, and tool execution; DiagnosticsService handles result aggregation and critical file selection. Testable in isolation, clean interface between services. ToolchainService returns RawToolResults[], DiagnosticsService transforms to unified DiagnosticReport. DiagnosticsService reusable across commands (/harden, /review).

**Rationale**:
Recorded via `hodge decide` command at 10:00:19 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Multi-language project handling: Single root toolchain

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Multi-language project handling: Single root toolchain.yaml with multi-language support - single file to manage with clear project-wide view, detection runs once and understands whole repo. Structure supports 'language: multi' with projects array containing path, language, commands, and quality_checks per subproject. Enables monorepo support (TypeScript + Python + Go) while maintaining single configuration file. More complex YAML but pragmatic for real-world monorepos.

**Rationale**:
Recorded via `hodge decide` command at 9:59:31 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - AI review scope triggers: AI always reviews diagnostics + critical files (via scoring algorithm) - consistent behavior users can rely on, critical file selector scores files by risk factors (critical paths, blocker/critical issues, complexity, security, new files, large changes) and caps at top 10 files for token budget

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
AI review scope triggers: AI always reviews diagnostics + critical files (via scoring algorithm) - consistent behavior users can rely on, critical file selector scores files by risk factors (critical paths, blocker/critical issues, complexity, security, new files, large changes) and caps at top 10 files for token budget. Balances thoroughness with efficiency. AI adds judgment-based review (naming, architecture, lessons) that tools cannot provide.

**Rationale**:
Recorded via `hodge decide` command at 9:58:41 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Review context optimization: Skip review-context

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Review context optimization: Skip review-context.yaml - use file manifest approach (HODGE-334 pattern) - CLI identifies which files to load (standards.md, principles.md, recent decisions, relevant lessons), AI reads and interprets naturally during review. No sync burden since AI always reads current content. Follows established HODGE-334 pattern: CLI discovers structure, AI interprets content. Accept higher token usage to avoid maintenance nightmare of keeping compressed file in sync with 5+ source files.

**Rationale**:
Recorded via `hodge decide` command at 9:57:49 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - AI profile compression strategy: Dual format - keep

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
AI profile compression strategy: Dual format - keep .md files for human documentation, add .yaml files for AI consumption - no breaking changes, human documentation stays readable while AI gets optimized 87% token reduction (1500 → 200 tokens). Migrate profiles incrementally. Structure: .hodge/review-profiles/languages/typescript-5.x.md (human) + typescript-5.x.yaml (AI). Accept two-file maintenance burden as trade-off for preserving both use cases.

**Rationale**:
Recorded via `hodge decide` command at 9:50:12 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Semgrep custom rules: Ship default rules for common frameworks (Prisma, React, GraphQL, etc

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Semgrep custom rules: Ship default rules for common frameworks (Prisma, React, GraphQL, etc.) bundled with Hodge, allow user additions in .hodge/semgrep-rules/ - provides value out of box, educational for users to see examples, users can customize/extend with project-specific rules. Hodge runs both built-in rules and project-specific rules. Maintenance burden accepted as trade-off for immediate framework pattern detection value.

**Rationale**:
Recorded via `hodge decide` command at 9:48:40 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Tool availability handling: Skip missing tools with warning, continue with available tools - non-blocking approach aligns with progressive enhancement, provides clear feedback about what's missing with installation instructions

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Tool availability handling: Skip missing tools with warning, continue with available tools - non-blocking approach aligns with progressive enhancement, provides clear feedback about what's missing with installation instructions. When quality_checks maps to empty array (e.g., 'duplication: []'), skip that check type with recommendation. Exception: maintainability index always calculated internally using Hodge's algorithm (not tool-dependent), so it always runs regardless of external tools.

**Rationale**:
Recorded via `hodge decide` command at 9:47:19 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Diagnostic aggregation format: Use universal DiagnosticReport format with normalized severity levels (blocker/critical/major/minor/info) - single format works across all tools and languages, AI can consume unified format easily, focuses on user-visible outcomes (what failed, where, how to fix)

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Diagnostic aggregation format: Use universal DiagnosticReport format with normalized severity levels (blocker/critical/major/minor/info) - single format works across all tools and languages, AI can consume unified format easily, focuses on user-visible outcomes (what failed, where, how to fix). Requires parser for each tool format but provides consistent reporting and comparable severity levels across TypeScript, Python, Go, etc.

**Rationale**:
Recorded via `hodge decide` command at 9:42:24 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Toolchain config structure: Use single 'commands' section (not detected_tools or available_tools) - auto-generated by 'hodge init', regenerated by 'hodge init --refresh' with warning

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Toolchain config structure: Use single 'commands' section (not detected_tools or available_tools) - auto-generated by 'hodge init', regenerated by 'hodge init --refresh' with warning. Users override by directly editing command fields in the commands section. No separate command_overrides section needed. Structure: commands.[tool_name].command contains the executable command, quality_checks.[check_type] maps to tool names. Simple, single source of truth design.

**Rationale**:
Recorded via `hodge decide` command at 9:41:00 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Tool detection priority order: Config files > Dependency files > PATH - Config file presence (e

**Status**: Accepted

**Context**:
Feature: HODGE-341

**Decision**:
Tool detection priority order: Config files > Dependency files > PATH - Config file presence (e.g., .eslintrc, mypy.ini, .golangci.yml) indicates active usage and takes highest priority, dependency files (package.json, pyproject.toml, Cargo.toml) show explicit installation as second priority, PATH as fallback catches globally installed tools. This language-agnostic principle works across all ecosystems while strongly aligning with behavior-focused testing - config files prove active usage intent.

**Rationale**:
Recorded via `hodge decide` command at 9:27:06 AM

**Consequences**:
To be determined based on implementation.

---


