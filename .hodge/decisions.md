# Architecture Decisions

This file tracks key architectural and technical decisions made during development.

## Decision Template

### [Date] - Decision Title

**Status**: Proposed | Accepted | Deprecated | Superseded

**Context**: 
Describe the context and problem that led to this decision.

**Decision**: 
State the decision clearly.

**Rationale**: 
Explain why this decision was made, considering alternatives.

**Consequences**: 
List the positive and negative consequences of this decision.

---

## Decisions

<!-- Add your decisions below -->

### 2025-09-16 - TODO Comment Convention

**Status**: Accepted

**Context**:
During development, we often need to mark code that needs future work. Without a consistent convention, these markers get lost or forgotten, leading to technical debt and missed requirements. We need a searchable, consistent way to track incomplete work directly in the codebase.

**Decision**:
Adopt a consistent `// TODO:` comment format for marking incomplete work. Include phase information when relevant (e.g., `// TODO: [harden] Add error handling`). All TODOs must be reviewed before shipping.

**Rationale**:
- Provides consistent, searchable markers for incomplete work
- Phase information helps prioritize when to address each TODO
- Visible directly in code where the work needs to be done
- Can be easily searched across the entire codebase
- Aligns with Hodge's phase-based development model

**Consequences**:
- Positive: Consistent tracking of incomplete work
- Positive: Phase markers help with prioritization
- Positive: Easy to search and audit before shipping
- Positive: Reduces risk of shipping incomplete features
- Negative: Requires discipline to review before shipping
- Negative: Can accumulate if not regularly addressed

---

### 2025-09-16 - linting-standards-optimization

**Status**: Accepted

**Context**:
General project decision

**Decision**:
linting-standards-optimization

**Rationale**:
Recorded via `hodge decide` command at 6:45:49 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-15 - Use Progressive Enhancement approach for interactive ship commits with environment-specific optimizations

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Use Progressive Enhancement approach for interactive ship commits with environment-specific optimizations

**Rationale**:
Recorded via `hodge decide` command at 8:50:42 PM

**Consequences**:
To be determined based on implementation.

---

### 2025-01-15 - Git Push Integration for Ship Command

**Status**: Accepted

**Context**:
The ship command currently creates commits but doesn't push to remote. Users need to manually push after shipping, which breaks the flow and risks forgetting to push important changes. We need to integrate push functionality while supporting different environments and workflows.

**Decision**:
Adopt a hybrid approach with ship hooks - extend the ship command with optional push functionality that can be enabled via flags or configuration, while maintaining backwards compatibility.

**Rationale**:
- Provides flexibility without breaking existing workflows
- Progressive Enhancement allows optimal UX per environment (Claude Code, Terminal, CI)
- Branch-aware intelligence prevents dangerous operations (pushing to main)
- Maintains context from ship to push operations
- Can be disabled easily with `--no-push` flag

**Consequences**:
- **Positive**: Complete ship workflow in one command, safety checks prevent mistakes, works across all environments
- **Negative**: Increased complexity in ship command, requires careful configuration management
- **Implementation**: Phase 1 (basic push), Phase 2 (Progressive Enhancement), Phase 3 (PR creation)

---

### 2025-09-13 - PM Tool Selection During Init

**Status**: Accepted

**Context**: 
The hodge init command was not asking users about PM tool selection when none was detected, making it difficult for users to configure their preferred PM integration.

**Decision**: 
Ask for PM tool selection only when not detected during initialization.

**Rationale**: 
This provides a smart balance - minimal questions for users while ensuring PM configuration when needed. Users who already have PM tools configured via environment variables won't be asked unnecessarily.

**Consequences**: 
- Positive: Better PM tool discovery and configuration during setup
- Positive: Maintains minimal interaction philosophy
- Negative: Users wanting a different PM tool than detected need to use post-init config

---

### 2025-09-13 - PM Scripts Distribution

**Status**: Accepted

**Context**: 
Users need PM management scripts (create issues, update status, etc.) to integrate Hodge with their project management tools, but we need an efficient distribution method.

**Decision**: 
Deploy PM scripts to .hodge/pm-scripts/ during initialization when a PM tool is selected.

**Rationale**: 
Immediate availability is important for user experience. Having scripts locally allows customization for team-specific workflows. The size increase is minimal compared to the value provided.

**Consequences**: 
- Positive: Scripts immediately available after init
- Positive: Can be customized for specific team needs
- Positive: Works offline once installed
- Negative: Increases initial project size
- Negative: Scripts may become outdated over time

---

### 2025-09-13 - Pattern Learning During Init

**Status**: Accepted (Revised)

**Context**:
For existing codebases, Hodge could learn established patterns and standards, but we need to decide when and how to offer this capability.

**Decision**:
Ask about pattern learning only in interactive mode (`hodge init --interactive`). The default `hodge init` remains quick with minimal prompts.

**Rationale**:
Keeping quick mode as default maintains the original "one-question setup" philosophy while providing an interactive option for users who want comprehensive setup with PM tool selection and pattern learning.

**Consequences**:
- Positive: Maintains simple default experience
- Positive: Interactive mode available for those who want it
- Positive: No breaking change from current behavior
- Negative: Users might not discover interactive features
- Negative: Need to educate about --interactive flag

---

### 2025-01-15 - Hodgeson Branding Strategy

**Status**: Accepted

**Context**:
The project needs a cohesive branding strategy. Proposed naming: "Hodgeson" as project name, "hodge" as CLI command, and ".podge" as portable archive extension. Need to determine NPM package name, GitHub repository, web domain, and visual identity.

**Decision**:
Adopt Hybrid Practical Naming with Compass Rose logo:
- NPM Package: `hodge-cli`
- GitHub: `hodgeson/hodge-cli`
- Domain: `hodgeson.com`
- Logo: Compass rose with three colored points (explore/build/ship)

**Rationale**:
- `hodge-cli` likely available on NPM and SEO-friendly
- Clear hierarchy: Hodgeson (project) → hodge (CLI) → .podge (archives)
- Compass rose perfectly captures exploration theme
- Three logo points map directly to three modes
- Professional, scalable visual identity

**Consequences**:
- Positive: Clear brand identity and naming hierarchy
- Positive: Room for ecosystem growth (hodge-patterns, hodge-podge)
- Positive: Memorable visual identity that reinforces core concepts
- Negative: Need to migrate from current "hodge" naming
- Negative: Requires coordinated rebranding effort

---

### 2025-01-19 - Core Mode Commands Implementation Pattern

**Status**: Accepted

**Context**:
HOD-20 requires implementing explore/build/harden commands. After exploring three approaches (Stateful Mode Manager, Lightweight Command Pattern, Plugin-Based Architecture), we need to choose an implementation strategy that balances simplicity, consistency, and future extensibility.

**Decision**:
Implement core mode commands using the Lightweight Command Pattern, following the exact pattern established by the init command.

**Rationale**:
- Consistency: Matches the existing init command pattern perfectly, maintaining codebase uniformity
- Simplicity: Minimal abstraction makes the code easy to understand and maintain
- Speed: Fastest to implement and ship, aligning with "ship fast, iterate often" philosophy
- Pragmatic: Solves the immediate need without over-engineering
- Evolutionary: Can be refactored to a more complex architecture later if needed

**Consequences**:
- Positive: Maintains consistent codebase patterns
- Positive: Quick to implement and test
- Positive: Easy for future developers to understand
- Positive: Leverages existing test infrastructure
- Negative: Some code duplication across commands (acceptable trade-off)
- Negative: Less flexible for complex future requirements (can evolve later)

---

### 2025-01-19 - Delete All Skipped Implementation Tests

**Status**: Accepted

**Context**:
After implementing our progressive testing strategy, we have 47 tests marked as skipped because they test implementation details (console output, mock calls, internal state) rather than behavior. These tests clutter the codebase and may confuse developers about our testing philosophy.

**Decision**:
Delete all 47 skipped tests completely from the codebase.

**Rationale**:
- Aligns with our "test behavior, not implementation" philosophy
- Reduces cognitive load and prevents confusion about what kinds of tests are valuable
- Git history preserves the tests if ever needed for reference
- Our 265 behavioral tests provide comprehensive coverage
- Keeping skipped tests sends mixed signals about testing standards

**Consequences**:
- Positive: Cleaner, more focused test suite
- Positive: Clear demonstration of testing philosophy
- Positive: Reduced maintenance burden and file size
- Positive: No ambiguity about what should be tested
- Negative: Cannot easily reference old test patterns (mitigated by git history)
- Negative: Lose examples of what NOT to test (mitigated by documentation)

---

### 2025-09-16 - Progressive Type Safety for Linting Standards

**Status**: Accepted

**Context**:
We regularly encounter two types of ESLint errors during the `/harden` phase that create friction:
- `@typescript-eslint/no-explicit-any`: Use of `any` type
- `@typescript-eslint/explicit-function-return-type`: Missing explicit return types

After deep analysis, we determined:
- `no-explicit-any` is CRITICAL for type safety (prevents runtime errors, refactoring hazards)
- `explicit-function-return-type` has LOW-MEDIUM importance (TypeScript inference is sufficient 95%+ of the time)

**Decision**:
Implement Progressive Type Safety approach that aligns linting strictness with Hodge's explore → build → harden → ship philosophy.

**Implementation**:
1. Disable `explicit-function-return-type` entirely (rely on TypeScript inference)
2. Keep `no-explicit-any` as error in production code
3. Allow `any` as warning in test files and exploration code
4. Add `no-unsafe-return` and `no-unsafe-assignment` as errors for additional safety

**Rationale**:
- Aligns perfectly with Hodge philosophy: "Freedom to explore, discipline to ship"
- Reduces friction during development while maintaining production safety
- Pragmatic acknowledgment that 100% type coverage isn't always valuable
- TypeScript's inference is excellent and explicit return types add verbosity without safety benefit
- Progressive enforcement allows fast prototyping with gradual type improvement

**Consequences**:
- Positive: No more late-stage type fixing during harden phase
- Positive: Faster exploration and prototyping
- Positive: Production code remains fully type-safe
- Positive: Warnings guide learning without blocking progress
- Negative: Risk of technical debt accumulation in explore phase (mitigated by warnings)
- Negative: Need to track which mode code is in (acceptable trade-off)

