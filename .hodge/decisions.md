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

### 2025-09-21 - Implement Hybrid Progressive Enhancement for test isolation - fix critical bugs immediately (session-manager

**Status**: Accepted

**Context**:
Feature: HODGE-180

**Decision**:
Implement Hybrid Progressive Enhancement for test isolation - fix critical bugs immediately (session-manager.test.ts direct .hodge writes), then gradually migrate tests to use tmpdir() and eventually add TestWorkspace utility for consistent isolation patterns

**Rationale**:
Recorded via `hodge decide` command at 7:32:41 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-21 - Implement Hybrid Progressive Enhancement for save/load optimization with clear AI/CLI separation - slash commands handle user interaction, context presentation, and intelligent orchestration (what AI does best), while CLI commands handle file operations, git integration, and data processing (what code does best)

**Status**: Accepted

**Context**:
Feature: HODGE-168

**Decision**:
Implement Hybrid Progressive Enhancement for save/load optimization with clear AI/CLI separation - slash commands handle user interaction, context presentation, and intelligent orchestration (what AI does best), while CLI commands handle file operations, git integration, and data processing (what code does best)

**Rationale**:
Recorded via `hodge decide` command at 10:23:54 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Tests must NEVER modify the Hodge project's own

**Status**: Accepted

**Context**:
Feature: HODGE-143

**Decision**:
Tests must NEVER modify the Hodge project's own .hodge directory - all tests should use temporary directories or mocks to avoid altering project state

**Rationale**:
Recorded via `hodge decide` command at 1:50:20 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Implement PM Adapter Hooks using Command-Level Integration with phase-appropriate timing: explore/build/harden update PM at START of phase (marking entry), ship updates PM only on SUCCESS (marking completion)

**Status**: Accepted

**Context**:
Feature: HODGE-143

**Decision**:
Implement PM Adapter Hooks using Command-Level Integration with phase-appropriate timing: explore/build/harden update PM at START of phase (marking entry), ship updates PM only on SUCCESS (marking completion). This ensures PM accurately reflects work state - 'in progress' for active phases, 'done' only for successful completion.

**Rationale**:
Recorded via `hodge decide` command at 1:38:07 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Use AI-Based Standards Enforcement - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Status**: Accepted

**Context**:
Feature: HODGE-131-standards-enforcement

**Decision**:
Use AI-Based Standards Enforcement - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Rationale**:
Recorded via `hodge decide` command at 11:52:47 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Use AI-Based Standards Enforcement approach - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Status**: Accepted

**Context**:
Feature: HODGE-131-standards-enforcement

**Decision**:
Use AI-Based Standards Enforcement approach - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Rationale**:
Recorded via `hodge decide` command at 11:50:13 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement Context-Aware Workflow Commands using Implicit Context Reading approach - commands will automatically read from context

**Status**: Accepted

**Context**:
Feature: HODGE-054

**Decision**:
Implement Context-Aware Workflow Commands using Implicit Context Reading approach - commands will automatically read from context.json when no feature argument is provided, maintaining backward compatibility while providing seamless workflow progression

**Rationale**:
Recorded via `hodge decide` command at 10:58:30 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Use Implicit Context Reading approach for context-aware workflow commands - commands will read from context

**Status**: Accepted

**Context**:
Feature: HODGE-054

**Decision**:
Use Implicit Context Reading approach for context-aware workflow commands - commands will read from context.json by default with optional feature override

**Rationale**:
Recorded via `hodge decide` command at 10:53:42 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement Event-Based Auto-Save approach for HODGE-052: auto-save context through command interceptor pattern that wraps feature commands, providing transparent auto-save with minimal code changes

**Status**: Accepted

**Context**:
Feature: HODGE-052

**Decision**:
Implement Event-Based Auto-Save approach for HODGE-052: auto-save context through command interceptor pattern that wraps feature commands, providing transparent auto-save with minimal code changes

**Rationale**:
Recorded via `hodge decide` command at 10:15:55 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - HODGE-003 is production-ready despite project-wide lint issues - the feature extraction code itself has no lint errors, all tests pass, and the functionality is complete

**Status**: Accepted

**Context**:
Feature: HODGE-003

**Decision**:
HODGE-003 is production-ready despite project-wide lint issues - the feature extraction code itself has no lint errors, all tests pass, and the functionality is complete

**Rationale**:
Recorded via `hodge decide` command at 9:16:37 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement formal feature closure workflow: /close command or closure option in /ship to properly transition features to closed state with reasons

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Implement formal feature closure workflow: /close command or closure option in /ship to properly transition features to closed state with reasons

**Rationale**:
Recorded via `hodge decide` command at 8:55:32 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Auto-save current context when switching features with notification to user - provides seamless workflow without data loss

**Status**: Accepted

**Context**:
Feature: HODGE-052

**Decision**:
Auto-save current context when switching features with notification to user - provides seamless workflow without data loss

**Rationale**:
Recorded via `hodge decide` command at 8:55:27 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Use combined detection for feature vs topic: strict pattern (CAPS-123) indicates feature, quotes indicate topic, natural language indicates topic - provides maximum flexibility

**Status**: Accepted

**Context**:
Feature: HODGE-053

**Decision**:
Use combined detection for feature vs topic: strict pattern (CAPS-123) indicates feature, quotes indicate topic, natural language indicates topic - provides maximum flexibility

**Rationale**:
Recorded via `hodge decide` command at 8:55:22 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Use simple format for

**Status**: Accepted

**Context**:
Feature: HODGE-052

**Decision**:
Use simple format for .hodge/context.json initially: { currentFeature, mode, timestamp } - can evolve to richer context as needed

**Rationale**:
Recorded via `hodge decide` command at 8:55:17 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - The /review command must provide dual awareness: 1) Current Claude Code conversation context (actual work in flight), 2) Filesystem persisted state, and 3) Identify any mismatches between them

**Status**: Accepted

**Context**:
General project decision

**Decision**:
The /review command must provide dual awareness: 1) Current Claude Code conversation context (actual work in flight), 2) Filesystem persisted state, and 3) Identify any mismatches between them. This ensures review accuracy.

**Rationale**:
Recorded via `hodge decide` command at 8:52:48 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Switch focus to HODGE-003 (Feature Extraction) - This addresses the core problem of context loss when extracting features from decisions

**Status**: Accepted

**Context**:
Feature: HODGE-003

**Decision**:
Switch focus to HODGE-003 (Feature Extraction) - This addresses the core problem of context loss when extracting features from decisions. Will implement proper feature extraction workflow.

**Rationale**:
Recorded via `hodge decide` command at 8:52:05 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Close HODGE-051 (AI-Executable Commands) - Original multi-tool approach abandoned due to architectural pivot to Claude Code only

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Close HODGE-051 (AI-Executable Commands) - Original multi-tool approach abandoned due to architectural pivot to Claude Code only. Core functionality (context management) implemented via /hodge command. Remaining declarative command work deferred.

**Rationale**:
Recorded via `hodge decide` command at 8:51:59 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Create HODGE-054: Update all workflow commands to be context-aware with optional feature override

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Create HODGE-054: Update all workflow commands to be context-aware with optional feature override

**Rationale**:
Recorded via `hodge decide` command at 8:04:52 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Create HODGE-053: Implement discovery exploration mode for exploring topics without specific features

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Create HODGE-053: Implement discovery exploration mode for exploring topics without specific features

**Rationale**:
Recorded via `hodge decide` command at 8:04:47 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Create HODGE-052: Implement persistent current feature context in

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Create HODGE-052: Implement persistent current feature context in .hodge/context.json with feature switching via /hodge command

**Rationale**:
Recorded via `hodge decide` command at 8:04:44 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Support dual-mode exploration: feature exploration for specific features, and discovery exploration for topics that result in feature creation

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Support dual-mode exploration: feature exploration for specific features, and discovery exploration for topics that result in feature creation

**Rationale**:
Recorded via `hodge decide` command at 8:04:34 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement context-aware commands with persistent current feature state in

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Implement context-aware commands with persistent current feature state in .hodge/context.json - commands operate on current feature by default, with optional explicit feature override

**Rationale**:
Recorded via `hodge decide` command at 8:04:29 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Include core principles from

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Include core principles from .hodge/principles.md in generated HODGE.md for AI context

**Rationale**:
Recorded via `hodge decide` command at 8:04:24 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement /hodge command as primary session and context manager - replaces /context, provides session discovery, feature switching, and context loading

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Implement /hodge command as primary session and context manager - replaces /context, provides session discovery, feature switching, and context loading

**Rationale**:
Recorded via `hodge decide` command at 8:04:19 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - The only hodge CLI command typically used by developers will be init

**Status**: Accepted

**Context**:
General project decision

**Decision**:
The only hodge CLI command typically used by developers will be init.

**Rationale**:
Recorded via `hodge decide` command at 11:07:32 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - There will no longer be any effort given toward making hodge a tool intended for developers to use from the command line

**Status**: Accepted

**Context**:
General project decision

**Decision**:
There will no longer be any effort given toward making hodge a tool intended for developers to use from the command line. Instead, it provides functionality accessed by the Claude Code slash commands to support their workflows.

**Rationale**:
Recorded via `hodge decide` command at 11:06:14 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - All AI interactions and workflows for Claude Code slash commands will be in the

**Status**: Accepted

**Context**:
General project decision

**Decision**:
All AI interactions and workflows for Claude Code slash commands will be in the .claude/commands markdown files. These markdown files will make calls to hodge for those things where coded solutions shine: writing features, decisions, standards, patterns, etc. to files, making calls to PM software, executing Git commands and accessing GitHub, and so on.

**Rationale**:
Recorded via `hodge decide` command at 11:03:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - We are abandoning all effort to enable Hodge to integrate with any AI-assisted software development tool other than Claude Code

**Status**: Accepted

**Context**:
General project decision

**Decision**:
We are abandoning all effort to enable Hodge to integrate with any AI-assisted software development tool other than Claude Code. We may revisit interoperability once we have it working well for Claude Code.

**Rationale**:
Recorded via `hodge decide` command at 10:57:50 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-17 - Implement AI-Executable Slash Commands using Command Orchestration Protocol

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Implement AI-Executable Slash Commands using Command Orchestration Protocol

**Rationale**:
Recorded via `hodge decide` command at 5:43:37 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-17 - Implement PM auto-update using Local-First with Sync approach

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
Implement PM auto-update using Local-First with Sync approach

**Rationale**:
Recorded via `hodge decide` command at 5:13:23 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-17 - Implement session-management using Hybrid with HODGE

**Status**: Accepted

**Context**:
Feature: session-management

**Decision**:
Implement session-management using Hybrid with HODGE.md Enhancement approach

**Rationale**:
Recorded via `hodge decide` command at 5:12:54 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-16 - Implement cross-tool-compatibility using Hybrid approach with HODGE

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Implement cross-tool-compatibility using Hybrid approach with HODGE.md Primary + Tool-Specific Enhancements

**Rationale**:
Recorded via `hodge decide` command at 1:17:05 PM

**Consequences**:
To be determined based on implementation.

---


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

### 2025-01-16 - Defer GitHub and Jira PM adapters until Linear adapter is fully tested

**Status**: Accepted

**Context**:
PM adapter implementation strategy

**Decision**:
Focus on completing and testing Linear adapter before implementing GitHub and Jira adapters

**Rationale**:
- Ensures one adapter works fully before expanding
- Reduces complexity during initial PM integration
- Can learn from Linear implementation before building others

**Consequences**:
- Positive: More focused development effort
- Positive: Better testing of adapter pattern
- Negative: Limits PM tool options initially

---

### 2025-01-16 - Implement actual tsconfig.json reading in standards validator

**Status**: Accepted

**Context**:
TypeScript configuration validation accuracy

**Decision**:
Replace mock data with actual tsconfig.json file reading in standards-validator.ts

**Rationale**:
- Provides accurate validation based on real project configuration
- Ensures standards validation reflects actual TypeScript settings
- Better long-term maintainability

**Consequences**:
- Positive: More accurate standards validation
- Positive: Real configuration awareness
- Negative: Adds file I/O complexity
- Negative: Need error handling for missing/invalid tsconfig

---

### 2025-01-16 - Document interaction state configuration as future enhancement

**Status**: Accepted

**Context**:
Interaction state configuration approach

**Decision**:
Keep interaction state hardcoded for now, document configuration via .hodge/config.json as future enhancement

**Rationale**:
- Reduces initial complexity
- Clear roadmap item for future releases
- Can gather user feedback before implementing

**Consequences**:
- Positive: Simpler initial implementation
- Positive: Clear enhancement path
- Negative: Less flexibility initially
- Negative: May need refactoring later

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


### 2025-09-19 - Abandoning cross-tool compatibility, focusing on Claude Code only

**Status**: Accepted

**Decision**:
Focus exclusively on Claude Code integration for now. Cross-tool compatibility (HODGE.md generation, tool-agnostic formats) will be revisited in a future version.

**Rationale**:
- Simplifies implementation significantly
- Allows faster iteration on Claude-specific features
- Can always add cross-tool support later
- Most users are using Claude Code anyway

**Impact**:
- No need for HODGE.md generation in features
- Can use Claude-specific optimizations
- Simpler architecture overall

