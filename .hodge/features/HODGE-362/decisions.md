# Feature Decisions: HODGE-362

This file tracks decisions specific to HODGE-362.

## Decisions

<!-- Add your decisions below -->

### 2025-10-29 - Use minimal dependency-cruiser configuration with smart exclusions (node_modules, tests, build output) focused on production source code - review existing

**Status**: Accepted

**Context**:
Feature: HODGE-362

**Decision**:
Use minimal dependency-cruiser configuration with smart exclusions (node_modules, tests, build output) focused on production source code - review existing .dependency-cruiser.cjs to determine if it meets these requirements

**Rationale**:
Recorded via `hodge decide` command at 9:47:59 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-29 - Architecture graph generation only at end of /ship (no manual regeneration command) - graph represents shipped, stable architecture as source of truth

**Status**: Accepted

**Context**:
Feature: HODGE-362

**Decision**:
Architecture graph generation only at end of /ship (no manual regeneration command) - graph represents shipped, stable architecture as source of truth

**Rationale**:
Recorded via `hodge decide` command at 9:46:03 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-29 - Use directory depth for dependency-cruiser --collapse parameter, with tech-stack-specific depth levels configured for each supported language (TypeScript/JS, Python, Kotlin, Java, Go, etc

**Status**: Accepted

**Context**:
Feature: HODGE-362

**Decision**:
Use directory depth for dependency-cruiser --collapse parameter, with tech-stack-specific depth levels configured for each supported language (TypeScript/JS, Python, Kotlin, Java, Go, etc.)

**Rationale**:
Recorded via `hodge decide` command at 9:45:21 PM

**Consequences**:
To be determined based on implementation.

---


