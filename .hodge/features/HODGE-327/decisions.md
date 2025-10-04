# Feature Decisions: HODGE-327

This file tracks decisions specific to HODGE-327.

## Decisions

<!-- Add your decisions below -->

### 2025-10-04 - Support custom AI instructions with guidelines - review profiles can include custom_instructions field for context-specific analysis beyond pattern matching, enabling sophisticated project-specific reviews while requiring documentation of best practices for writing effective instructions to maintain quality

**Status**: Accepted

**Context**:
Feature: HODGE-327

**Decision**:
Support custom AI instructions with guidelines - review profiles can include custom_instructions field for context-specific analysis beyond pattern matching, enabling sophisticated project-specific reviews while requiring documentation of best practices for writing effective instructions to maintain quality

**Rationale**:
Recorded via `hodge decide` command at 11:05:10 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - Simplified 3 severity levels: blocker/warning/suggestion - blocker issues should prevent shipping (lessons-learned violations, severe coupling), warnings should be addressed before ship (missing error handling, complexity), suggestions are refactoring opportunities (DRY violations, naming improvements), providing clear mental model without over-categorization

**Status**: Accepted

**Context**:
Feature: HODGE-327

**Decision**:
Simplified 3 severity levels: blocker/warning/suggestion - blocker issues should prevent shipping (lessons-learned violations, severe coupling), warnings should be addressed before ship (missing error handling, complexity), suggestions are refactoring opportunities (DRY violations, naming improvements), providing clear mental model without over-categorization

**Rationale**:
Recorded via `hodge decide` command at 11:03:49 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - No auto-fix mode (recommendations only) - /review provides analysis and suggested /explore commands for users to implement fixes manually, maintaining full user control and encouraging understanding before making changes, with potential for future --auto-fix flag if proven safe and useful

**Status**: Accepted

**Context**:
Feature: HODGE-327

**Decision**:
No auto-fix mode (recommendations only) - /review provides analysis and suggested /explore commands for users to implement fixes manually, maintaining full user control and encouraging understanding before making changes, with potential for future --auto-fix flag if proven safe and useful

**Rationale**:
Recorded via `hodge decide` command at 11:02:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - Grouped findings with file references (medium verbosity) as default - reports group similar issues together with file:line references and suggested /explore commands, balancing actionability with signal-to-noise ratio, with --verbose and --summary flags available for users who want different detail levels

**Status**: Accepted

**Context**:
Feature: HODGE-327

**Decision**:
Grouped findings with file references (medium verbosity) as default - reports group similar issues together with file:line references and suggested /explore commands, balancing actionability with signal-to-noise ratio, with --verbose and --summary flags available for users who want different detail levels

**Rationale**:
Recorded via `hodge decide` command at 11:01:43 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - Manual triage only (no PM integration) - review reports remain advisory/analytical without automatic PM issue creation, but each finding includes suggested /explore command text to make it easy for users to convert findings into trackable features when they choose to act on them

**Status**: Accepted

**Context**:
Feature: HODGE-327

**Decision**:
Manual triage only (no PM integration) - review reports remain advisory/analytical without automatic PM issue creation, but each finding includes suggested /explore command text to make it easy for users to convert findings into trackable features when they choose to act on them

**Rationale**:
Recorded via `hodge decide` command at 11:00:07 PM

**Consequences**:
To be determined based on implementation.

---


