# Feature Decisions: HODGE-337

This file tracks decisions specific to HODGE-337.

## Decisions

<!-- Add your decisions below -->

### 2025-10-09 - Use same review-report

**Status**: Accepted

**Context**:
Feature: HODGE-337

**Decision**:
Use same review-report.md format for all tiers (QUICK, STANDARD, FULL) with consistent structure: Summary, Critical Issues, Warnings, Suggestions, Files Reviewed, Conclusion. SKIP tier outputs 'No review conducted' message only. Content depth varies naturally based on context loaded, but format remains consistent.

**Rationale**:
Recorded via `hodge decide` command at 11:40:57 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-09 - No grep patterns in manifest - AI decides what to grep for large files

**Status**: Accepted

**Context**:
Feature: HODGE-337

**Decision**:
No grep patterns in manifest - AI decides what to grep for large files. Manifest lists file paths with size warnings, AI has full flexibility to read selectively, grep for patterns, or read entirely based on review needs. Maintains clean CLI/AI separation.

**Rationale**:
Recorded via `hodge decide` command at 11:39:42 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-09 - Skip decisions

**Status**: Accepted

**Context**:
Feature: HODGE-337

**Decision**:
Skip decisions.md entirely in STANDARD tier - only include in FULL tier. STANDARD reads standards.md, principles.md, patterns, and profiles. This keeps STANDARD tier fast while FULL tier provides comprehensive decision history when needed.

**Rationale**:
Recorded via `hodge decide` command at 11:38:52 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-09 - Use minimal critical file path list (src/lib/core/*, src/commands/*,

**Status**: Accepted

**Context**:
Feature: HODGE-337

**Decision**:
Use minimal critical file path list (src/lib/core/*, src/commands/*, .hodge/standards.md, .hodge/principles.md) - keep it simple and iterate based on experience if additional paths need FULL tier treatment

**Rationale**:
Recorded via `hodge decide` command at 11:38:13 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-09 - Use critical file override for mixed changes - any change to critical paths (src/lib/core/*, src/commands/*,

**Status**: Accepted

**Context**:
Feature: HODGE-337

**Decision**:
Use critical file override for mixed changes - any change to critical paths (src/lib/core/*, src/commands/*, .hodge/standards.md, .hodge/principles.md) always triggers FULL tier recommendation regardless of change size

**Rationale**:
Recorded via `hodge decide` command at 11:36:48 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-09 - Use conservative tier classification thresholds: SKIP (pure docs/comments only), QUICK (≤3 files AND ≤50 lines AND tests/config-only), STANDARD (≤10 files AND ≤200 lines), FULL (>10 files OR >200 lines OR critical paths)

**Status**: Accepted

**Context**:
Feature: HODGE-337

**Decision**:
Use conservative tier classification thresholds: SKIP (pure docs/comments only), QUICK (≤3 files AND ≤50 lines AND tests/config-only), STANDARD (≤10 files AND ≤200 lines), FULL (>10 files OR >200 lines OR critical paths)

**Rationale**:
Recorded via `hodge decide` command at 11:35:45 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-09 - Use Approach 1 - YAML Manifest with Tiered Review for optimizing harden review process

**Status**: Accepted

**Context**:
Feature: HODGE-337

**Decision**:
Use Approach 1 - YAML Manifest with Tiered Review for optimizing harden review process

**Rationale**:
Recorded via `hodge decide` command at 11:34:13 PM

**Consequences**:
To be determined based on implementation.

---


