# Feature Decisions: HODGE-372

This file tracks decisions specific to HODGE-372.

## Decisions

<!-- Add your decisions below -->

### 2025-10-31 - Fully delete HodgeMDGenerator infrastructure (~500 lines) - remove all HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-372

**Decision**:
Fully delete HodgeMDGenerator infrastructure (~500 lines) - remove all HODGE.md generation code from src/lib/hodge-md/ directory. Git history preserves the implementation if ever needed. Aligns with YAGNI and reduces maintenance burden.

**Rationale**:
Recorded via `hodge decide` command at 11:13:40 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-31 - Use passive cleanup for HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-372

**Decision**:
Use passive cleanup for HODGE.md removal - stop generating it, add .gitignore entry, let existing files remain. No active migration logic needed since there are no external users yet.

**Rationale**:
Recorded via `hodge decide` command at 11:10:17 AM

**Consequences**:
To be determined based on implementation.

---


