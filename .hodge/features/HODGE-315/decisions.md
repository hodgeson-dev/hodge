# Feature Decisions: HODGE-315

This file tracks decisions specific to HODGE-315.

## Decisions

<!-- Add your decisions below -->

### 2025-10-02 - Track decision source internally but don't expose in PM issues - maintain clean PM issue output for stakeholders while preserving source tracking in logs and internal data structures for debugging purposes, with option to expose later if needed

**Status**: Accepted

**Context**:
Feature: HODGE-315

**Decision**:
Track decision source internally but don't expose in PM issues - maintain clean PM issue output for stakeholders while preserving source tracking in logs and internal data structures for debugging purposes, with option to expose later if needed

**Rationale**:
Recorded via `hodge decide` command at 1:02:34 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Show interactive prompt for uncovered decisions - when 'Decisions Needed' contains items not covered by 'Recommendation', ask the user how they would like to resolve those decisions, get user response, and proceed with their guidance

**Status**: Accepted

**Context**:
Feature: HODGE-315

**Decision**:
Show interactive prompt for uncovered decisions - when 'Decisions Needed' contains items not covered by 'Recommendation', ask the user how they would like to resolve those decisions, get user response, and proceed with their guidance

**Rationale**:
Recorded via `hodge decide` command at 1:01:51 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Use Cascading File Checker with Smart Extraction approach - refactor analyzeDecisions() to check multiple sources in priority order: (1) feature-specific decisions

**Status**: Accepted

**Context**:
Feature: HODGE-315

**Decision**:
Use Cascading File Checker with Smart Extraction approach - refactor analyzeDecisions() to check multiple sources in priority order: (1) feature-specific decisions.md, (2) exploration.md (extract Recommendation + Decisions Needed sections), (3) global decisions.md, with markdown parsing logic and user prompting for uncovered decisions

**Rationale**:
Recorded via `hodge decide` command at 12:58:54 PM

**Consequences**:
To be determined based on implementation.

---


