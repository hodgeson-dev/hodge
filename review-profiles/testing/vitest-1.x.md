---
frontmatter_version: "1.0.0"
scope: reusable
type: testing
testing_framework: vitest
applies_to:
  - "**/*.test.ts"
  - "**/*.test.js"
  - "**/*.spec.ts"
  - "**/*.spec.js"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  dependencies: ["vitest"]
  version_range: ">=1.0.0 <2.0.0"
---

# Vitest 1.x Best Practices

Vitest-specific testing patterns for version 1.x. References general-test-standards.md for universal testing principles - this profile adds Vitest-specific guidance.

---

## Test Organization
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use `describe`/`it` (or `test`) from Vitest for test organization. Use `describe.each` for parameterized test suites to reduce duplication. Use `it.concurrent` for independent tests that can safely run in parallel.

**Guidance**: Vitest supports both `test` and `it` - pick one style and be consistent in your project. `describe.each` useful for testing same behavior with different inputs. `it.concurrent` improves speed but requires true test isolation (see general-test-standards.md). Reference general test standards for organization philosophy and naming conventions.

---

## Assertion API
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use `expect` from Vitest with appropriate matchers. Prefer specific matchers (`toEqual`, `toStrictEqual`, `toMatchObject`) over generic ones. Use `toBe` for primitive comparisons, `toThrow`/`toThrowError` for error assertions.

**Guidance**: Vitest's matchers are Jest-compatible with additional features. `toEqual` does deep equality, `toBe` checks object identity. `toStrictEqual` is stricter (checks undefined properties). `toMatchObject` useful for partial matching. Flag vague assertions like `toBeTruthy()` when more specific matchers available. Reference general test standards for assertion quality principles.

---

## Mocking Patterns
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use `vi.mock()` for module mocking (auto-hoisted to top of file). Use `vi.fn()` for function mocks. Use `vi.spyOn()` for spying on existing methods. Always clear mocks with `vi.clearAllMocks()` in `beforeEach` or `afterEach` to ensure test isolation.

**Guidance**: Vitest uses `vi` namespace (vs Jest's `jest`). `vi.mock()` is hoisted automatically - no manual hoisting needed. Avoid testing `mock.calls` unless testing integration patterns - that tests implementation, not behavior. Mock at boundaries per general test standards. Clear mocks religiously to prevent test pollution.

---

## Vitest-Specific Features
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Leverage Vitest's unique features when appropriate. Use `vi.stubEnv()` for environment variable mocking, `inlineSnapshot()` for inline snapshots during development, `bench()` for performance benchmarks, and `expectTypeOf` for type-level testing (TypeScript).

**Guidance**: `vi.stubEnv()` is cleaner than `process.env.X = value`. Inline snapshots keep test and expectation together (better for small snapshots). `bench()` useful for performance-critical code but don't over-optimize. Type testing with `expectTypeOf` catches type regressions. These are opt-in features - use when they solve specific problems.

---

## Test Lifecycle
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use `beforeEach`/`afterEach` for test isolation - each test gets clean state. Use `beforeAll`/`afterAll` sparingly as they create shared state between tests. Clean up resources in `afterEach` (temp files, mocks, connections).

**Guidance**: `beforeAll` creates dependencies between tests - violates isolation principle from general-test-standards.md. Only acceptable for truly immutable setup (loading static config). Always pair `beforeEach` with `afterEach` for symmetric setup/teardown. Reference general test standards for temp directory requirements and isolation principles.

---

## Coverage Configuration
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Configure coverage in `vitest.config.ts` with v8 or istanbul provider. Set coverage thresholds appropriate to development phase. Exclude test files, mocks, type definitions from coverage. Use coverage to find untested paths, not as arbitrary quality gate.

**Guidance**: v8 provider is faster, istanbul more accurate. Coverage thresholds should reflect progressive testing model (lower in explore/build, 80%+ in ship). Exclude `**/*.test.ts`, `**/*.spec.ts`, `**/mocks/**`, `**/*.d.ts` from coverage. Reference general test standards for coverage philosophy - it's a metric, not a goal.

---
