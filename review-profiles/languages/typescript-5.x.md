---
frontmatter_version: "1.0.0"
scope: reusable
type: language
language: typescript
applies_to:
  - "**/*.ts"
  - "**/*.tsx"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  files: ["tsconfig.json"]
  dependencies: ["typescript"]
  version_range: ">=5.0.0 <6.0.0"
---

# TypeScript 5.x Best Practices

Modern TypeScript best practices for version 5.x, focusing on type safety, inference, and leveraging the latest language features.

---

## Strict Mode Configuration
**Enforcement: MANDATORY** | **Severity: BLOCKER**

TypeScript's `strict: true` must be enabled in `tsconfig.json`. This enables all strict type-checking options and catches null/undefined errors, implicit any types, and strict function types at compile time.

**Guidance**: Strict mode is the foundation of TypeScript's value. Without it, TypeScript becomes glorified JSDoc. Projects must enable `strict: true` - this is non-negotiable for new code. Legacy code can use gradual migration strategies, but all new files should pass strict checks.

---

## Avoid `any` Type
**Enforcement: SUGGESTED** | **Severity: WARNING**

The `any` type defeats TypeScript's purpose and hides bugs. Use `unknown` for truly unknown types, use proper types or generics for known shapes, and reserve `any` only for rapid prototyping or interfacing with untyped libraries.

**Guidance**: `any` is allowed in explore phase but should be removed by ship phase. When type is unknown, prefer `unknown` which forces type checking before use. Flag `any` in production code unless justified with comment explaining why proper typing is infeasible. Consider type assertions (`as Type`) over `any` when confident about runtime shape.

---

## Prefer Type Inference
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Let TypeScript infer types when obvious - this reduces noise and improves maintainability. Use explicit types for function parameters and return types (public API), but let TypeScript infer variable types when clear from initialization, and avoid redundant type annotations.

**Guidance**: `const count = 5` is better than `const count: number = 5` (obvious). However, function signatures should be explicit: `function add(a: number, b: number): number`. Explicit types serve as documentation and catch refactoring errors. Use inference for local variables, explicit types for boundaries.

---

## Discriminated Unions for State
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use discriminated unions (tagged unions) for state machines, result types, and variant types. This enables exhaustive type checking with `never` and makes impossible states unrepresentable.

**Example**:
```typescript
type Status =
  | { type: 'loading' }
  | { type: 'success', data: string }
  | { type: 'error', error: Error };
```

**Guidance**: This pattern prevents bugs by making type system enforce valid state transitions. TypeScript can exhaustively check all variants in switch statements. Use for state that has multiple modes with different data shapes. Common in async operations, UI states, and domain models.

---

## Async/Await Best Practices
**Enforcement: SUGGESTED** | **Severity: WARNING**

Prefer `async`/`await` over raw promises for readability and error handling. Always handle errors with try/catch in async functions, return `Promise<T>` types explicitly for public APIs, and avoid promise hell (nested `.then()` chains).

**Guidance**: `async`/`await` makes asynchronous code look synchronous, improving readability. However, errors in async functions become promise rejections - must use try/catch or `.catch()`. Flag missing error handling in async functions. Use `Promise.all()` for parallel operations, not sequential awaits. Reference general coding standards for error handling philosophy.

---

## Utility Types Usage
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Leverage TypeScript's built-in utility types to transform existing types rather than duplicating definitions. Use `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Required<T>` for object transformations, `Record<K, V>` for object maps, and `NonNullable<T>` to exclude null/undefined.

**Guidance**: Utility types reduce duplication and keep types DRY. `Partial<User>` is better than manually making all User fields optional. These types are well-understood by TypeScript developers and improve maintainability. Don't over-engineer - use utilities when they clarify intent, not just to show off type system knowledge.

---

## Generics Best Practices
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use generics for reusable type-safe code. Constrain generics when possible (`<T extends BaseType>`) to enable better type checking and autocomplete. Avoid over-engineering with complex nested generics that hurt readability.

**Guidance**: Single-letter names (T, K, V) are fine for simple generics. Use descriptive names for complex generics (`TUserData`, `TResponse`). Constrain generics to provide better developer experience (`<T extends { id: string }>` enables autocomplete on `id`). Balance type safety with cognitive load - overly complex generics can be worse than simpler less-safe code.

---

## Type Safety in Error Handling
**Enforcement: SUGGESTED** | **Severity: WARNING**

TypeScript 5.x allows typing catch blocks as `unknown`. Never assume caught errors are `Error` type without checking. Use type guards to narrow error types before accessing properties.

**Example**:
```typescript
try {
  await riskyOperation();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

**Guidance**: Catch blocks can receive any type (Error, string, number, object, etc.). Type as `unknown` and use type guards. This prevents runtime errors from accessing `.message` on non-Error objects. Reference general coding standards for error handling patterns.

---
