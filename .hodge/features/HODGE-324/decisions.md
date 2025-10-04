# Feature Decisions: HODGE-324

This file tracks decisions specific to HODGE-324.

## Decisions

<!-- Add your decisions below -->

### 2025-10-04 - Ask lessons prompt upfront with y/n before ship execution - clean linear flow with minimal decision points

**Status**: Accepted

**Context**:
Feature: HODGE-324

**Decision**:
Ask lessons prompt upfront with y/n before ship execution - clean linear flow with minimal decision points

**Rationale**:
Recorded via `hodge decide` command at 6:29:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - CLI stages everything with existing git add -A in ship command - no special staging logic needed in template

**Status**: Accepted

**Context**:
Feature: HODGE-324

**Decision**:
CLI stages everything with existing git add -A in ship command - no special staging logic needed in template

**Rationale**:
Recorded via `hodge decide` command at 6:29:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - No draft created if user skips lessons - CLI doesn't generate any lesson files, keeps workspace clean

**Status**: Accepted

**Context**:
Feature: HODGE-324

**Decision**:
No draft created if user skips lessons - CLI doesn't generate any lesson files, keeps workspace clean

**Rationale**:
Recorded via `hodge decide` command at 6:29:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - Remove generateLessonsDraft from CLI entirely - slash command owns entire lessons workflow, creates finalized lesson directly

**Status**: Accepted

**Context**:
Feature: HODGE-324

**Decision**:
Remove generateLessonsDraft from CLI entirely - slash command owns entire lessons workflow, creates finalized lesson directly

**Rationale**:
Recorded via `hodge decide` command at 6:29:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - Keep lessons documentation optional - user can skip if desired, feature ships without them - respects workflow preferences while encouraging best practice

**Status**: Accepted

**Context**:
Feature: HODGE-324

**Decision**:
Keep lessons documentation optional - user can skip if desired, feature ships without them - respects workflow preferences while encouraging best practice

**Rationale**:
Recorded via `hodge decide` command at 6:29:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - Commit only finalized AI-enhanced lesson (

**Status**: Accepted

**Context**:
Feature: HODGE-324

**Decision**:
Commit only finalized AI-enhanced lesson (.hodge/lessons/{feature}-{slug}.md), not the draft - draft is working artifact that doesn't need version control

**Rationale**:
Recorded via `hodge decide` command at 6:29:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-04 - Lessons enhancement happens between Step 3 (commit message approval) and Step 4 (hodge ship execution) - ensures lessons are included in version control with the feature

**Status**: Accepted

**Context**:
Feature: HODGE-324

**Decision**:
Lessons enhancement happens between Step 3 (commit message approval) and Step 4 (hodge ship execution) - ensures lessons are included in version control with the feature

**Rationale**:
Recorded via `hodge decide` command at 6:29:14 PM

**Consequences**:
To be determined based on implementation.

---


