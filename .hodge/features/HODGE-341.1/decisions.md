# Feature Decisions: HODGE-341.1

This file tracks decisions specific to HODGE-341.1.

## Decisions

<!-- Add your decisions below -->

### 2025-10-10 - TypeScript file scoping: Run tsc on full project, filter diagnostics to uncommitted files - best UX (users only see errors in their changed files), accurate type checking (tsc understands full project context for cross-file dependencies), implementation filters tsc output by matching diagnostic file paths against uncommitted file list, straightforward 10-15 lines of filtering logic, matches user expectations for scoped review in /harden command

**Status**: Accepted

**Context**:
Feature: HODGE-341.1

**Decision**:
TypeScript file scoping: Run tsc on full project, filter diagnostics to uncommitted files - best UX (users only see errors in their changed files), accurate type checking (tsc understands full project context for cross-file dependencies), implementation filters tsc output by matching diagnostic file paths against uncommitted file list, straightforward 10-15 lines of filtering logic, matches user expectations for scoped review in /harden command. Accepts trade-off: might hide cross-file breaks (file A changed breaks file B) but provides expected focused feedback.

**Rationale**:
Recorded via `hodge decide` command at 11:59:32 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Pass rate calculation: Calculate pass_rate in DiagnosticsService Phase 1 - simple calculation provides immediate user value (see '80% checks passed' at a glance), straightforward definition (pass = 0 issues for that check type), implementation is pass_rate = (checks_with_zero_issues / total_checks_run) * 100, gives high-level code health metric without complexity, Phase 3 can enhance with severity weighting if needed but basic metric is useful now

**Status**: Accepted

**Context**:
Feature: HODGE-341.1

**Decision**:
Pass rate calculation: Calculate pass_rate in DiagnosticsService Phase 1 - simple calculation provides immediate user value (see '80% checks passed' at a glance), straightforward definition (pass = 0 issues for that check type), implementation is pass_rate = (checks_with_zero_issues / total_checks_run) * 100, gives high-level code health metric without complexity, Phase 3 can enhance with severity weighting if needed but basic metric is useful now.

**Rationale**:
Recorded via `hodge decide` command at 11:58:40 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Command templates: Support  placeholder in toolchain

**Status**: Accepted

**Context**:
Feature: HODGE-341.1

**Decision**:
Command templates: Support  placeholder in toolchain.yaml commands - enables flexible file scoping without code changes, handles CLI syntax variation across tools (eslint files as args, go vet uses packages, future tools may use --files flag), simple string replacement (replace '' with files.join(' ') or '.'), prevents accumulation of hard-coded per-tool methods in Phase 2-5, users can fix file scoping by editing config instead of waiting for code changes. Template parsing is straightforward with minimal edge cases.

**Rationale**:
Recorded via `hodge decide` command at 11:57:26 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-10 - Tool version detection: Detect versions in Phase 1 but don't persist to toolchain

**Status**: Accepted

**Context**:
Feature: HODGE-341.1

**Decision**:
Tool version detection: Detect versions in Phase 1 but don't persist to toolchain.yaml yet - detect tool versions now (parse tsc --version, eslint --version) and return in DetectedTool interface with optional version field, but defer persistence to toolchain.yaml and version-based profile matching until Phase 5. Low risk of forgetting, minimal complexity increase, builds infrastructure early without full feature implementation.

**Rationale**:
Recorded via `hodge decide` command at 11:47:02 AM

**Consequences**:
To be determined based on implementation.

---


