# Feature Decisions: HODGE-321

This file tracks decisions specific to HODGE-321.

## Decisions

<!-- Add your decisions below -->

### 2025-10-03 - Accept lower coverage for init and logs as user-facing exceptions - these are interactive CLI tools with console I/O, acknowledges architectural difference from AI-orchestrated commands, realistic approach to testing interactive tools

**Status**: Accepted

**Context**:
Feature: HODGE-321

**Decision**:
Accept lower coverage for init and logs as user-facing exceptions - these are interactive CLI tools with console I/O, acknowledges architectural difference from AI-orchestrated commands, realistic approach to testing interactive tools

**Rationale**:
Recorded via `hodge decide` command at 12:17:03 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Exclude scripts/ directory from coverage - these are standalone development tools, not core application code, excluding them makes coverage metrics meaningful and focused on application quality

**Status**: Accepted

**Context**:
Feature: HODGE-321

**Decision**:
Exclude scripts/ directory from coverage - these are standalone development tools, not core application code, excluding them makes coverage metrics meaningful and focused on application quality

**Rationale**:
Recorded via `hodge decide` command at 12:16:23 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Refactor all three commands (harden, ship, save) in this feature - fixes all coverage issues at once with consistent implementation pattern, provides complete solution to CI failures

**Status**: Accepted

**Context**:
Feature: HODGE-321

**Decision**:
Refactor all three commands (harden, ship, save) in this feature - fixes all coverage issues at once with consistent implementation pattern, provides complete solution to CI failures

**Rationale**:
Recorded via `hodge decide` command at 12:15:40 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Add to Standards under CLI Architecture section - standards are enforced and already contain CLI Architecture Standards, provides clear location for AI reference and enforcement

**Status**: Accepted

**Context**:
Feature: HODGE-321

**Decision**:
Add to Standards under CLI Architecture section - standards are enforced and already contain CLI Architecture Standards, provides clear location for AI reference and enforcement

**Rationale**:
Recorded via `hodge decide` command at 12:14:43 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Use Service classes pattern (HardenService, ShipService, SaveService) - simple, clear separation, already proven in decide/explore/load/build commands, easy to test and maintain

**Status**: Accepted

**Context**:
Feature: HODGE-321

**Decision**:
Use Service classes pattern (HardenService, ShipService, SaveService) - simple, clear separation, already proven in decide/explore/load/build commands, easy to test and maintain

**Rationale**:
Recorded via `hodge decide` command at 12:13:02 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - Exclude scripts/, src/bin/, and execute() methods only - minimal exclusion of standalone tools and CLI entry point, keeps testable business logic measured

**Status**: Accepted

**Context**:
Feature: HODGE-321

**Decision**:
Exclude scripts/, src/bin/, and execute() methods only - minimal exclusion of standalone tools and CLI entry point, keeps testable business logic measured

**Rationale**:
Recorded via `hodge decide` command at 12:12:07 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-03 - 80% for lines/statements/functions, 75% for branches - realistic for CLI architecture, focuses on meaningful coverage, aligns with testable behavior rather than requiring CLI orchestration testing

**Status**: Accepted

**Context**:
Feature: HODGE-321

**Decision**:
80% for lines/statements/functions, 75% for branches - realistic for CLI architecture, focuses on meaningful coverage, aligns with testable behavior rather than requiring CLI orchestration testing

**Rationale**:
Recorded via `hodge decide` command at 12:08:39 PM

**Consequences**:
To be determined based on implementation.

---


