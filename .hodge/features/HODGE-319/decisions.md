# Feature Decisions: HODGE-319

This file tracks decisions specific to HODGE-319.

## Decisions

<!-- Add your decisions below -->

### 2025-10-03 - Just ship it migration strategy - no feature flags or version detection needed, changes only stop creating unused files (HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Just ship it migration strategy - no feature flags or version detection needed, changes only stop creating unused files (HODGE.md, phase-specific context.json), nothing reads these files so no breaking changes, existing shipped features unaffected, new features use new code from start, simplest implementation

**Rationale**:
Recorded via `hodge decide` command at 11:51:06 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Create reusable WorkflowDataExtractor pattern - extract /plan's cascading logic into shared utility (feature decisions → exploration

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Create reusable WorkflowDataExtractor pattern - extract /plan's cascading logic into shared utility (feature decisions → exploration.md → global decisions), all commands use it for consistent graceful degradation, single source of truth, easier to test and maintain, enables consistent behavior across explore/decide/plan/build/harden/ship

**Rationale**:
Recorded via `hodge decide` command at 11:48:28 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Leave existing HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Leave existing HODGE.md files - no cleanup of existing .hodge/features/{feature}/HODGE.md files, they become stale but harmless, non-destructive approach with zero risk of data loss, backward compatible, users can manually delete if desired

**Rationale**:
Recorded via `hodge decide` command at 11:47:34 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Sequential implementation phase order (1→2→3) - complete Quick Wins (bug fix + HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Sequential implementation phase order (1→2→3) - complete Quick Wins (bug fix + HODGE.md elimination) first, then UX Improvements (Write tool + smart extraction), then Standardization (WorkflowDataExtractor pattern), lower risk per change with easy validation, learning from each phase informs next, quick user wins build momentum

**Rationale**:
Recorded via `hodge decide` command at 11:46:50 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Eliminate phase-specific context

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Eliminate phase-specific context.json files only - stop creating .hodge/features/{feature}/{phase}/context.json in explore/build/harden commands, these are never read and only used for HODGE.md population (being eliminated), keep global .hodge/context.json which is actively used by context-manager, auto-save, and save/load commands

**Rationale**:
Recorded via `hodge decide` command at 11:45:27 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Extract and prompt user for /build when /decide skipped - when no decisions

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Extract and prompt user for /build when /decide skipped - when no decisions.md exists, extract Recommendation from exploration.md and prompt user with options: use it, go to /decide, or skip, respects user agency while providing smart default, enables graceful workflow shortcuts

**Rationale**:
Recorded via `hodge decide` command at 11:42:52 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Use Write tool for temp files in /plan and /ship - replace bash heredoc commands with Write tool calls to create plan

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Use Write tool for temp files in /plan and /ship - replace bash heredoc commands with Write tool calls to create plan.json and state.json/ui.md, invisible to user (single tool call), cleaner UX without approval friction, maintains temp file architecture but hides implementation details

**Rationale**:
Recorded via `hodge decide` command at 11:41:59 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Eliminate HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-319

**Decision**:
Eliminate HODGE.md aggregation file entirely - stop creating/updating HODGE.md in all commands (explore, build, harden, ship), removes duplication and maintenance burden, users and AI both read source files directly so no value loss, cleaner file structure

**Rationale**:
Recorded via `hodge decide` command at 11:40:42 PM

**Consequences**:
To be determined based on implementation.

---


