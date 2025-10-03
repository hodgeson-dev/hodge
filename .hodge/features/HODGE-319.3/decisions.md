# Feature Decisions: HODGE-319.3

This file tracks decisions specific to HODGE-319.3.

## Decisions

<!-- Add your decisions below -->

### 2025-10-03 - Before PM check integration point - place decision extraction logic at line 3 of build

**Status**: Accepted

**Context**:
Feature: HODGE-319.3

**Decision**:
Before PM check integration point - place decision extraction logic at line 3 of build.md before PM check section, decisions available for PM context, follows user's explicit guidance that decisions may exist in PM issue, logical flow of decisions → PM → build

**Rationale**:
Recorded via `hodge decide` command at 10:43:13 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Skip uncovered decisions detection - assume Recommendation covers everything without verification, keeps Phase 2 implementation simple, defers comprehensive decision verification to /decide command, avoids complexity and false positives, aligns with pragmatic Phase 2 approach (UX improvements before sophistication)

**Status**: Accepted

**Context**:
Feature: HODGE-319.3

**Decision**:
Skip uncovered decisions detection - assume Recommendation covers everything without verification, keeps Phase 2 implementation simple, defers comprehensive decision verification to /decide command, avoids complexity and false positives, aligns with pragmatic Phase 2 approach (UX improvements before sophistication)

**Rationale**:
Recorded via `hodge decide` command at 10:42:35 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Auto-move with approval for wrong-location decisions

**Status**: Accepted

**Context**:
Feature: HODGE-319.3

**Decision**:
Auto-move with approval for wrong-location decisions.md - detect file in wrong location (e.g., explore/decisions.md), prompt user to move it to correct location with approval, helps user follow correct structure while preserving their work, aligns with 'discipline to ship' principle

**Rationale**:
Recorded via `hodge decide` command at 10:41:12 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Prompt to pick one for multiple recommendations - present list and let user select which to use, matches 'choose an approach' mental model, clear single decision point, aligns with user agency principle

**Status**: Accepted

**Context**:
Feature: HODGE-319.3

**Decision**:
Prompt to pick one for multiple recommendations - present list and let user select which to use, matches 'choose an approach' mental model, clear single decision point, aligns with user agency principle

**Rationale**:
Recorded via `hodge decide` command at 10:40:35 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Verbatim extraction display - show exact Recommendation text from exploration

**Status**: Accepted

**Context**:
Feature: HODGE-319.3

**Decision**:
Verbatim extraction display - show exact Recommendation text from exploration.md when prompting user, preserves complete context without information loss, user already wrote it so familiar, aligns with informed decision-making principle

**Rationale**:
Recorded via `hodge decide` command at 10:39:50 AM

**Consequences**:
To be determined based on implementation.

---


