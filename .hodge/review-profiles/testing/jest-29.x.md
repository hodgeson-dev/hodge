---
frontmatter_version: "1.0.0"
scope: reusable
type: testing
testing_framework: jest
applies_to:
  - "**/*.test.ts"
  - "**/*.test.js"
  - "**/*.spec.ts"
  - "**/*.spec.js"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  dependencies: ["jest"]
  version_range: ">=29.0.0 <30.0.0"
---

# Jest 29.x Best Practices

Jest-specific testing patterns for version 29.x. References general-test-standards.md for universal testing principles - this profile adds Jest-specific guidance.

---

## Test Organization
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use `describe`/`it` (or `test`) from Jest globals for test organization. Use `describe.each` for parameterized test suites to reduce duplication. Use `test.concurrent` for tests that can safely run in parallel.

**Guidance**: Jest supports both `test` and `it` - pick one style and be consistent in your project. `describe.each` useful for testing same behavior with different inputs. `test.concurrent` improves speed but requires true test isolation (see general-test-standards.md). Reference general test standards for organization philosophy and naming conventions.

---

## Assertion API
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use `expect` with appropriate matchers. Prefer specific matchers (`toEqual`, `toStrictEqual`, `toMatchObject`) over generic ones. Use `toBe` for primitive comparisons, `toThrow` for error assertions.

**Guidance**: `toEqual` does deep equality, `toBe` checks object identity. `toStrictEqual` is stricter (checks undefined properties, array sparseness). `toMatchObject` useful for partial matching. Flag vague assertions like `toBeTruthy()` when more specific matchers available. Jest has rich matcher library - use specific matchers for better error messages. Reference general test standards for assertion quality principles.

---

## Mocking Patterns
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use `jest.mock()` for module mocking (auto-hoisted to top of file). Use `jest.fn()` for function mocks. Use `jest.spyOn()` for spying on existing methods. Always clear mocks with `jest.clearAllMocks()` in `beforeEach` or `afterEach` to ensure test isolation.

**Guidance**: `jest.mock()` is hoisted automatically - no manual hoisting needed. Avoid testing `mock.calls` unless testing integration patterns - that tests implementation, not behavior. Mock at boundaries per general test standards. Clear mocks religiously to prevent test pollution. Use `jest.resetModules()` when module state matters between tests (rare).

---

## Jest-Specific Features
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Leverage Jest's unique features when appropriate. Use `toMatchSnapshot()` for snapshot testing (sparingly - prefer explicit assertions). Use `toMatchInlineSnapshot()` for inline snapshots. Use fake timers with `jest.useFakeTimers()` for time-dependent code. Use `jest.resetModules()` when module state matters between tests.

**Guidance**: Snapshot testing is powerful but brittle - overuse leads to meaningless "update snapshots" commits. Use for complex output structures (React components, large objects). Inline snapshots keep test and expectation together. Fake timers essential for testing setTimeout/setInterval without waiting. These are opt-in features - use when they solve specific problems.

---

## Test Lifecycle
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use `beforeEach`/`afterEach` for test isolation - each test gets clean state. Use `beforeAll`/`afterAll` sparingly as they create shared state between tests. Clean up resources in `afterEach` (temp files, mocks, connections).

**Guidance**: `beforeAll` creates dependencies between tests - violates isolation principle from general-test-standards.md. Only acceptable for truly immutable setup (loading static config). Always pair `beforeEach` with `afterEach` for symmetric setup/teardown. Reference general test standards for temp directory requirements and isolation principles.

---

## Coverage Configuration
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Configure coverage in `jest.config.js` with appropriate provider. Set coverage thresholds appropriate to development phase. Exclude test files, mocks, type definitions from coverage. Use coverage to find untested paths, not as arbitrary quality gate.

**Guidance**: Coverage thresholds should reflect progressive testing model (lower in explore/build, 80%+ in ship). Exclude `**/*.test.ts`, `**/*.spec.ts`, `**/__mocks__/**`, `**/*.d.ts` from coverage. Use `collectCoverageFrom` to target specific directories. Reference general test standards for coverage philosophy - it's a metric, not a goal.

---
