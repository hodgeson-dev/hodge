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

