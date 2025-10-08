---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
applies_to:
  - "**/*.test.ts"
  - "**/*.test.js"
  - "**/*.spec.ts"
  - "**/*.spec.js"
version: "1.0.0"
maintained_by: hodge-framework
name: General Test Standards
description: Universal testing principles that apply to any testing framework - isolation, organization, quality, and performance
---

# General Test Standards

This profile contains universal testing principles that apply to any testing framework (Vitest, Jest, Playwright, Cypress, etc.). These standards complement project-specific testing patterns and framework-specific profiles.

**Note**: Framework-specific profiles (vitest-1.x.md, jest-29.x.md, etc.) add framework-specific guidance on top of these universal principles.

---

## Test Isolation
**Enforcement: MANDATORY** | **Severity: BLOCKER**

Tests must be completely isolated from each other with no shared state. Each test should create its own fixtures/data, tests must run successfully in any order, and no test should depend on another test's execution or side effects.

**Critical Requirements**:
- **Temporary Directories**: All file operations MUST use `os.tmpdir()` or framework-provided temp directories. Never modify actual project files in tests.
- **No Shared State**: Use `beforeEach`/`afterEach` for setup/teardown, not `beforeAll`/`afterAll` which creates shared state.
- **Clean Up**: Always clean up resources (temp files, database connections, mock servers) in `afterEach` or `afterAll`.
- **Parallel Execution**: Tests should work correctly when run in parallel.

**Guidance**: Violation of test isolation causes flaky tests, hard-to-debug failures, and can corrupt project data. This is a BLOCKER because isolated tests are fundamental to reliable test suites. Reference project lessons for subprocess spawning ban and temp directory requirements.

---

## Test Organization and Naming
**Enforcement: SUGGESTED** | **Severity: WARNING**

Tests should be organized logically with descriptive names that explain behavior, not implementation. Use `describe` blocks to group related tests by feature/component, test names should describe expected behavior ("saves user data" not "calls saveUser()"), and follow Arrange-Act-Assert pattern within each test.

**Guidance**: Good organization makes test failures easy to diagnose. One logical assertion per test (multiple `expect()` calls are OK if testing same behavior). Avoid testing implementation details - test what users see or what APIs guarantee. Group by user-facing features, not by class/function names.

---

## Assertion Quality
**Enforcement: SUGGESTED** | **Severity: WARNING**

Assertions should be specific and meaningful, not vague. Prefer specific matchers over generic ones (use `toEqual(expected)` not `toBeTruthy()`), assert on meaningful outcomes not implementation details, and avoid testing framework internals unless necessary.

**Guidance**: Vague assertions hide bugs and make test failures uninformative. Flag assertions like `toBeTruthy()`, `toBeDefined()` when more specific matchers exist. Never assert on mock call counts or arguments unless testing integration patterns - that's testing implementation, not behavior.

---

## Test Data Management
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Test data should be clear, intentional, and maintainable. Use factories or builders for complex test objects, inline simple data directly in tests for readability, avoid magic values in test data, and make test data intention-revealing.

**Guidance**: Balance DRY with readability - sometimes duplication in tests is good (makes each test self-contained). Factory functions useful for complex objects, but simple data ({id: 1, name: 'test'}) is clearer inline. Test data should make the test's intent obvious.

---

## Mocking Strategy
**Enforcement: SUGGESTED** | **Severity: WARNING**

Mock external dependencies but prefer real implementations for in-process code. Mock network calls, filesystem operations, databases, and external services. Use real implementations for your own code when possible (don't mock what you don't own - test against real library APIs). Mock at system boundaries, not in the middle of your code.

**Guidance**: Over-mocking leads to tests that pass but code that fails. Mock only what crosses process boundaries or is non-deterministic (time, random, external APIs). Integration tests with real dependencies are more valuable than unit tests with extensive mocks. Reference project patterns for mocking strategy.

---

## Test Coverage Philosophy
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Coverage percentage is a metric, not a goal. Focus on testing critical paths and edge cases rather than chasing coverage numbers. Aim for 80%+ coverage for shipped code but allow lower coverage for exploration/build phases. Missing coverage on error handling is more critical than missing coverage on getters/setters.

**Guidance**: 100% coverage doesn't mean bug-free code. Focus coverage on business logic, edge cases, and error paths. Simple getters, setters, and delegation code don't always need tests. Use coverage to find untested critical paths, not as a quality gate. Reference project progressive testing model for phase-appropriate coverage.

---

## Test Performance
**Enforcement: SUGGESTED** | **Severity: WARNING**

Tests should run fast to enable rapid feedback. Unit tests should complete in <10ms per test (ideal), use parallel execution when framework supports it, isolate slow integration tests from fast unit tests, and avoid unnecessary setup/teardown work.

**Guidance**: Slow tests indicate poor architecture (too many dependencies, complex setup). Flag tests that take >100ms unless they're explicitly integration tests. Fast tests enable TDD and frequent test runs. Parallel execution requires proper isolation (see Test Isolation standard above).

---