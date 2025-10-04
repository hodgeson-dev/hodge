# Feature Decisions: HODGE-322

This file tracks decisions specific to HODGE-322.

## Decisions

<!-- Add your decisions below -->

### 2025-10-03 - Target 60% lines/statements coverage (conservative) - realistic and achievable with this refactoring, ~4% improvement from current 56

**Status**: Accepted

**Context**:
Feature: HODGE-322

**Decision**:
Target 60% lines/statements coverage (conservative) - realistic and achievable with this refactoring, ~4% improvement from current 56.18%, accounts for deleted code + new tests, proves pattern works while leaving room for future refactoring to hit 80% ultimate goal

**Rationale**:
Recorded via `hodge decide` command at 2:40:08 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Add Service extraction pattern to

**Status**: Accepted

**Context**:
Feature: HODGE-322

**Decision**:
Add Service extraction pattern to .hodge/patterns/test-pattern.md - already has HODGE-321 example, pattern is fundamentally about making CLI testable, developers look there for testing guidance, keeps all testing patterns discoverable in one location

**Rationale**:
Recorded via `hodge decide` command at 2:39:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Mock execAsync() and file I/O in ShipService tests - provides fast tests (<100ms), no filesystem pollution, easy error scenario testing, follows standard unit testing for Service classes, and aligns with behavior-focused testing by verifying returned data

**Status**: Accepted

**Context**:
Feature: HODGE-322

**Decision**:
Mock execAsync() and file I/O in ShipService tests - provides fast tests (<100ms), no filesystem pollution, easy error scenario testing, follows standard unit testing for Service classes, and aligns with behavior-focused testing by verifying returned data

**Rationale**:
Recorded via `hodge decide` command at 2:38:27 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - ShipCommand calls pmHooks

**Status**: Accepted

**Context**:
Feature: HODGE-322

**Decision**:
ShipCommand calls pmHooks.onShip() directly - no unnecessary wrapper since pmHooks is already a well-designed testable service, keeps ShipService focused on ship-specific business logic rather than orchestration

**Rationale**:
Recorded via `hodge decide` command at 2:37:37 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Keep metadata backup/restore in ShipService - all ship-related logic in one place, easy to test, only ShipCommand uses it currently, can extract to MetadataService later if other commands need it (progressive enhancement)

**Status**: Accepted

**Context**:
Feature: HODGE-322

**Decision**:
Keep metadata backup/restore in ShipService - all ship-related logic in one place, easy to test, only ShipCommand uses it currently, can extract to MetadataService later if other commands need it (progressive enhancement)

**Rationale**:
Recorded via `hodge decide` command at 1:59:55 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Single method runQualityGates(options) returning aggregated results - provides single responsibility, easier to test, matches ShipCommand usage pattern, and can refactor to separate methods later if needed (progressive enhancement)

**Status**: Accepted

**Context**:
Feature: HODGE-322

**Decision**:
Single method runQualityGates(options) returning aggregated results - provides single responsibility, easier to test, matches ShipCommand usage pattern, and can refactor to separate methods later if needed (progressive enhancement)

**Rationale**:
Recorded via `hodge decide` command at 1:59:14 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Trust static analysis from exploration - delete dead code without additional verification logging because analysis was thorough (slash command template review + git hook analysis), tests will catch issues immediately, and git history preserves code if restoration needed

**Status**: Accepted

**Context**:
Feature: HODGE-322

**Decision**:
Trust static analysis from exploration - delete dead code without additional verification logging because analysis was thorough (slash command template review + git hook analysis), tests will catch issues immediately, and git history preserves code if restoration needed

**Rationale**:
Recorded via `hodge decide` command at 1:58:32 PM

**Consequences**:
To be determined based on implementation.

---


