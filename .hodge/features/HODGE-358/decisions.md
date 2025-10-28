# Feature Decisions: HODGE-358

This file tracks decisions specific to HODGE-358.

## Decisions

<!-- Add your decisions below -->

### 2025-10-28 - AI determines which documents need updating based on conversation context

**Status**: Accepted

**Context**:
Feature: HODGE-358

**Decision**:
AI determines which documents need updating based on conversation context. The /checkpoint slash command template provides guidance on typical documents per phase (exploration.md in explore, build-plan.md in build, etc.) but AI uses judgment to update only documents that have changed during the conversation. This leverages AI's understanding of what content evolved while avoiding unnecessary file churn.

**Rationale**:
Recorded via `hodge decide` command at 8:12:17 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-28 - Create minimal checkpoint with required fields only (timestamp, phase, featureId) when there's minimal conversation context to save

**Status**: Accepted

**Context**:
Feature: HODGE-358

**Decision**:
Create minimal checkpoint with required fields only (timestamp, phase, featureId) when there's minimal conversation context to save. This ensures consistent behavior (checkpoint always succeeds), creates timestamp markers, and can include a basic summary like 'Just started [phase]' even with minimal progress.

**Rationale**:
Recorded via `hodge decide` command at 8:11:34 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-28 - Checkpoint files sorted by timestamp (newest first) with precedence hints in manifest

**Status**: Accepted

**Context**:
Feature: HODGE-358

**Decision**:
Checkpoint files sorted by timestamp (newest first) with precedence hints in manifest. The 'hodge hodge HODGE-XXX' CLI command returns the manifest with files sorted and precedence suggested, not the /hodge slash command template. Most recent checkpoint gets high precedence to guide AI reading order during context restoration.

**Rationale**:
Recorded via `hodge decide` command at 8:09:38 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-28 - Enforce required fields (phase, featureId, timestamp) with guidelines for optional fields in checkpoint YAML schema

**Status**: Accepted

**Context**:
Feature: HODGE-358

**Decision**:
Enforce required fields (phase, featureId, timestamp) with guidelines for optional fields in checkpoint YAML schema. This balances consistency for tooling with flexibility for AI to adapt checkpoint content to different situations.

**Rationale**:
Recorded via `hodge decide` command at 8:07:04 PM

**Consequences**:
To be determined based on implementation.

---


