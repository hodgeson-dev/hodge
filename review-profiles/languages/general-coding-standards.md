---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
applies_to:
  - "**/*.ts"
  - "**/*.js"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.py"
  - "**/*.java"
  - "**/*.kt"
  - "**/*.kts"
  - "**/*.go"
version: "1.0.0"
maintained_by: hodge-framework
name: General Coding Standards
description: Universal code quality checks for any language - coupling, SRP, DRY, complexity, naming, error handling
---

# General Coding Standards

This profile contains universal coding principles that apply to any programming language. These standards complement project-specific standards, principles, patterns, and lessons loaded from `.hodge/` directories.

**Note**: Project lessons (`.hodge/lessons/`) and patterns (`.hodge/patterns/`) are automatically loaded by the review system and do not need explicit criteria here.

---

## Single Responsibility Principle
**Enforcement: SUGGESTED** | **Severity: WARNING**

A class or function should have one reason to change. Check if classes/functions do multiple unrelated things, look for god objects or utility classes with disparate responsibilities, and identify classes that would change for multiple reasons.

**Guidance**: Flag when responsibilities are unrelated (e.g., UserService doing auth + validation + database + email). Use project principles to guide interpretation of "responsibility boundaries".

---

## DRY Violations
**Enforcement: GUIDANCE** | **Severity: SUGGESTION**

Don't Repeat Yourself - look for duplicated logic across functions or files, repeated validation patterns, and similar code blocks that could be extracted.

**Guidance**: Focus on substantive duplication, not incidental similarity. Flag when the SAME business logic appears in 3+ places. Suggest extraction to shared service/utility with clear name.

---

## Coupling & Cohesion
**Enforcement: SUGGESTED** | **Severity: WARNING**

Modules should depend on interfaces, not implementations. Check if modules depend on internal details of other modules, look for tight coupling between unrelated components, and identify classes that know too much about other classes.

**Guidance**: Flag when code accesses private details or internal state of other modules. Consider if dependency could be inverted or abstracted.

---

## Complexity Hotspots
**Enforcement: SUGGESTED** | **Severity: WARNING**

Identify areas where cognitive load is high. Flag functions with 4+ levels of nesting, functions longer than 50 lines, and complex conditional logic.

**Guidance**: Consider cognitive load - would this confuse a new team member? Suggest extraction of complex logic into well-named helper functions. Balance readability with performance (readability usually wins per project principles).

---

## Naming Consistency
**Enforcement: GUIDANCE** | **Severity: SUGGESTION**

Names should reveal intent without needing comments. Check if names clearly convey intent, look for misleading or unclear names, and identify inconsistent naming patterns.

**Guidance**: Check against project patterns for naming conventions. Flag names like "handler", "manager", "util" that don't convey specific purpose.

---

## Error Handling
**Enforcement: SUGGESTED** | **Severity: WARNING**

All async operations should handle errors properly. Check for missing error handling in critical paths, empty catch blocks, and uncaught promise rejections.

**Guidance**: Empty catch blocks are code smells unless justified with comment. Error messages should be actionable (tell user what to do).

---

## Code Documentation
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Code should be self-documenting through clear naming, but comments are valuable for explaining WHY, not WHAT. Check if complex business logic lacks explanatory comments, if public APIs are documented, and if comments contradict the code (stale documentation).

**Guidance**: Flag missing documentation for public APIs and complex algorithms. Comments should explain intent, trade-offs, and non-obvious decisions. Avoid redundant comments that just restate the code. Prefer code clarity over comments when possible.

---

## Magic Numbers and Constants
**Enforcement: SUGGESTED** | **Severity: WARNING**

Literal values with unclear meaning should be named constants. Look for repeated numeric or string literals, hard-coded configuration values, and unclear boolean conditions.

**Guidance**: Flag when the same literal appears 3+ times. Suggest extraction to named constant with clear intent. Configuration values (URLs, timeouts, limits) should be constants or environment variables. Simple cases (0, 1, -1, empty string) don't always need extraction.

---

## Code Duplication Detection
**Enforcement: SUGGESTED** | **Severity: WARNING**

Substantial duplicated code should be refactored into shared utilities. Look for near-identical code blocks across multiple functions or files, repeated patterns that could be abstracted, and copy-pasted code with minor variations.

**Guidance**: Focus on semantic duplication (same business logic), not structural similarity (similar syntax). Flag when 10+ lines of identical logic appear in 3+ places. Suggest extraction to shared function/class with descriptive name. Consider if duplication is temporary (rapid prototyping) or permanent (tech debt).

---

## Performance Considerations
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Balance performance with readability - avoid premature optimization but flag obvious performance issues. Check for N+1 queries or inefficient loops, unnecessary computation in hot paths, and missing caching for expensive operations.

**Guidance**: Premature optimization is the root of all evil - readability usually wins. However, flag clear anti-patterns (nested loops with large datasets, synchronous operations in async contexts, repeated expensive computations). Suggest optimization only when measurable impact expected. Reference project principles for performance philosophy.

---

## Security Basics
**Enforcement: MANDATORY** | **Severity: BLOCKER**

Basic security practices must be followed. Check for missing input validation on user-provided data, potential injection vulnerabilities (SQL, command, XSS), hardcoded secrets or credentials in code, and missing sanitization of user input before output.

**Guidance**: All user input is untrusted. Flag direct use of user input in queries, system commands, or HTML rendering. Secrets (API keys, passwords, tokens) must use environment variables or secure vaults. Input validation should happen at system boundaries. Check against project security patterns for validation approach.
