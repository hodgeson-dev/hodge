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
