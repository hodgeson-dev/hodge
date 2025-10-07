# Feature Decisions: HODGE-333

This file tracks decisions specific to HODGE-333.

## Decisions

<!-- Add your decisions below -->

### 2025-10-06 - Support optional dependencies with conditional syntax using

**Status**: Accepted

**Context**:
Feature: HODGE-333

**Decision**:
Support optional dependencies with conditional syntax using ? suffix - profiles can mark dependencies as optional (e.g., 'languages/typescript.md?'), loader checks review-config.md auto-detection results to determine if optional dependency should be loaded, provides smart adaptation without loading irrelevant profiles

**Rationale**:
Recorded via `hodge decide` command at 10:08:49 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-06 - Defer /harden integration strategy to HODGE-333

**Status**: Accepted

**Context**:
Feature: HODGE-333

**Decision**:
Defer /harden integration strategy to HODGE-333.4 or separate story - decision requires implementation experience from earlier stories (frontmatter, auto-detection, composition), follows YAGNI and progressive enhancement by building foundation first before integration

**Rationale**:
Recorded via `hodge decide` command at 10:06:09 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-06 - No migration communication needed - Hodge hasn't been released publicly yet, so no existing HODGE-327

**Status**: Accepted

**Context**:
Feature: HODGE-333

**Decision**:
No migration communication needed - Hodge hasn't been released publicly yet, so no existing HODGE-327.1 users with default.yml to migrate, can proceed with breaking changes freely in pre-release development

**Rationale**:
Recorded via `hodge decide` command at 10:05:22 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-06 - No profile customization in review-config

**Status**: Accepted

**Context**:
Feature: HODGE-333

**Decision**:
No profile customization in review-config.md for now, defer to future story - keep review-config.md as simple profile list, users can override rules in .hodge/standards.md which already supports project-specific overrides, follows YAGNI and progressive enhancement principles

**Rationale**:
Recorded via `hodge decide` command at 10:03:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-06 - Show results only for auto-detection logging - clean, focused output showing what was detected (TypeScript, React, etc

**Status**: Accepted

**Context**:
Feature: HODGE-333

**Decision**:
Show results only for auto-detection logging - clean, focused output showing what was detected (TypeScript, React, etc.) without verbose checking details, maintaining professional UX and respecting user's time

**Rationale**:
Recorded via `hodge decide` command at 10:02:00 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-06 - Version the frontmatter schema with frontmatter_version field - include frontmatter_version: '1

**Status**: Accepted

**Context**:
Feature: HODGE-333

**Decision**:
Version the frontmatter schema with frontmatter_version field - include frontmatter_version: '1.0.0' in all markdown files with YAML frontmatter to enable future schema evolution, migration paths, and backward compatibility

**Rationale**:
Recorded via `hodge decide` command at 10:01:16 PM

**Consequences**:
To be determined based on implementation.

---


