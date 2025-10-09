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
  - "**/*.test.tsx"
  - "**/*.spec.tsx"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  dependencies: ["vitest"]
  version_range: ">=3.0.0 <4.0.0"
---

# Vitest 3.x Best Practices

Vitest-specific testing patterns for version 3.x. References general-test-standards.md for universal testing principles - this profile adds Vitest 3.x-specific guidance.

---

## Test Organization
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use `describe`/`it` (or `test`) from Vitest for test organization. Use `describe.each` for parameterized test suites to reduce duplication. Use `it.concurrent` for independent tests that can safely run in parallel.

**Guidance**: Vitest 3.x continues to support both `test` and `it` - pick one style and be consistent in your project. `describe.each` is useful for testing same behavior with different inputs. `it.concurrent` improves speed but requires true test isolation (see general-test-standards.md). Vitest 3.x has improved concurrent test handling with better error reporting. Reference general test standards for organization philosophy and naming conventions.

---

## Assertion API
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use `expect` from Vitest with appropriate matchers. Prefer specific matchers (`toEqual`, `toStrictEqual`, `toMatchObject`) over generic ones. Use `toBe` for primitive comparisons, `toThrow`/`toThrowError` for error assertions.

**Guidance**: Vitest 3.x matchers are Jest-compatible with additional features and improved type inference. `toEqual` does deep equality, `toBe` checks object identity. `toStrictEqual` is stricter (checks undefined properties). `toMatchObject` useful for partial matching. Flag vague assertions like `toBeTruthy()` when more specific matchers available. Vitest 3.x has improved type safety for matchers - TypeScript will now catch many matcher mismatches at compile time. Reference general test standards for assertion quality principles.

---

## Mocking Patterns
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use `vi.mock()` for module mocking (auto-hoisted to top of file). Use `vi.fn()` for function mocks. Use `vi.spyOn()` for spying on existing methods. Always clear mocks with `vi.clearAllMocks()` in `beforeEach` or `afterEach` to ensure test isolation.

**Guidance**: Vitest uses `vi` namespace (vs Jest's `jest`). `vi.mock()` is hoisted automatically - no manual hoisting needed. Vitest 3.x has improved mock handling with better ESM support and clearer error messages when mocks fail. Avoid testing `mock.calls` unless testing integration patterns - that tests implementation, not behavior. Mock at boundaries per general test standards. Clear mocks religiously to prevent test pollution. Vitest 3.x includes `vi.resetAllMocks()` and `vi.restoreAllMocks()` for different reset strategies.

---

## Vitest 3.x-Specific Features
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Leverage Vitest 3.x's enhanced features when appropriate. Use `vi.stubEnv()` for environment variable mocking, `inlineSnapshot()` for inline snapshots during development, `bench()` for performance benchmarks with improved precision, and `expectTypeOf` for type-level testing (TypeScript).

**New in 3.x**:
- Improved workspace support for monorepos
- Better browser mode with enhanced Playwright integration
- Enhanced coverage reporting with v8 provider improvements
- Improved watch mode with smarter test re-runs
- Better error diffs and stack traces

**Guidance**: `vi.stubEnv()` is cleaner than `process.env.X = value`. Inline snapshots keep test and expectation together (better for small snapshots). `bench()` useful for performance-critical code with 3.x's improved measurement accuracy. Type testing with `expectTypeOf` catches type regressions. Workspace support allows testing multiple packages with shared config. Browser mode is production-ready in 3.x for UI component testing.

---

## Test Lifecycle
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use `beforeEach`/`afterEach` for test isolation - each test gets clean state. Use `beforeAll`/`afterAll` sparingly as they create shared state between tests. Clean up resources in `afterEach` (temp files, mocks, connections).

**Guidance**: `beforeAll` creates dependencies between tests - violates isolation principle from general-test-standards.md. Only acceptable for truly immutable setup (loading static config). Always pair `beforeEach` with `afterEach` for symmetric setup/teardown. Vitest 3.x has improved lifecycle hook error handling - errors in hooks now provide clearer context about which test failed. Reference general test standards for temp directory requirements and isolation principles.

---

## Coverage Configuration
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Configure coverage in `vitest.config.ts` with v8 or istanbul provider. Set coverage thresholds appropriate to development phase. Exclude test files, mocks, type definitions from coverage. Use coverage to find untested paths, not as arbitrary quality gate.

**Vitest 3.x Coverage Improvements**:
- V8 provider is faster and more accurate than ever
- Istanbul provider updated for better TypeScript support
- Support for custom coverage providers
- Improved threshold reporting (per-file, per-directory)
- Better handling of dynamic imports in coverage

**Guidance**: v8 provider is recommended for Vitest 3.x - significantly faster than istanbul with comparable accuracy. Coverage thresholds should reflect progressive testing model (lower in explore/build, 80%+ in ship). Exclude `**/*.test.ts`, `**/*.spec.ts`, `**/mocks/**`, `**/*.d.ts` from coverage. Use `coverage.include` to focus on specific directories. Vitest 3.x supports per-file thresholds for gradual coverage improvement. Reference general test standards for coverage philosophy - it's a metric, not a goal.

---

## Browser Mode (New in 3.x)
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use Vitest's browser mode for UI component testing when you need real browser APIs. Configure with `browser: { enabled: true, name: 'chromium' }` in vitest.config.ts. Use for components that rely on browser-specific features (DOM, Web APIs, visual rendering).

**Guidance**: Browser mode runs tests in real browsers via Playwright or WebdriverIO. Use for testing browser-specific behavior (localStorage, canvas, animations). For most unit tests, jsdom or happy-dom is sufficient and faster. Browser mode in 3.x is production-ready with improved stability and better error reporting. Pair with `@vitest/ui` for visual debugging of browser tests.

---

## Workspace Support (Enhanced in 3.x)
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

For monorepos, use Vitest workspaces to share configuration across packages while allowing package-specific overrides. Define workspace in `vitest.workspace.ts` or `vitest.workspace.json`.

**Example**:
```typescript
// vitest.workspace.ts
export default ['packages/*']
```

**Guidance**: Workspaces allow running tests for multiple packages in parallel while sharing base configuration. Each package can override coverage thresholds, test environment, or other settings. Vitest 3.x has significantly improved workspace performance and reliability. Use for monorepos where packages share test infrastructure but have different requirements.

---

## Snapshot Testing
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use snapshots for data structures and serializable output, not for implementation details. Update snapshots intentionally with `vitest -u`, review snapshot changes in PR reviews.

**Guidance**: Snapshots are useful for complex output (JSON responses, rendered HTML, error messages). Avoid snapshotting internal state or implementation details. Vitest 3.x has improved snapshot diffing with better readability for large objects. Inline snapshots (`toMatchInlineSnapshot()`) keep snapshot close to test for better readability. Review snapshot changes carefully - they should reflect intentional behavior changes, not accidental breaking changes.

---

## Performance and Watch Mode
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Leverage Vitest 3.x's improved watch mode for faster development feedback. Use `pool: 'threads'` for CPU-bound tests, `pool: 'forks'` for tests that require process isolation.

**Vitest 3.x Watch Mode Improvements**:
- Smarter test re-runs based on dependency graph
- Better file watching with reduced false positives
- Improved performance for large test suites
- Interactive filtering and test selection

**Guidance**: Watch mode in 3.x is highly optimized - it only re-runs tests affected by changes. Use `--changed` flag to run only tests for changed files. `--related` runs tests that import the changed file. Pool configuration affects test isolation and performance - threads are faster but share memory, forks provide better isolation but are slower. Reference general test standards for performance testing philosophy.

---
