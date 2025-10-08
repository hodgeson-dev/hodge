---
frontmatter_version: "1.0.0"
scope: reusable
type: language
language: javascript
applies_to:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  files: ["package.json"]
  # Targets ES2020+ (modern JavaScript with optional chaining, nullish coalescing, etc.)
---

# JavaScript ES2020+ Best Practices

Modern JavaScript best practices for ES2020 and later, focusing on clean syntax, async patterns, and modern language features.

---

## Modern Syntax Adoption
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use modern JavaScript syntax features for cleaner, more maintainable code. Prefer optional chaining (`?.`) for safe property access, nullish coalescing (`??`) over `||` for default values, template literals over string concatenation, and object/array spread over `Object.assign()` or `concat()`.

**Guidance**: Modern syntax reduces boilerplate and prevents bugs. `user?.profile?.name` is safer than `user && user.profile && user.profile.name`. Nullish coalescing (`value ?? default`) only triggers on null/undefined, while `||` triggers on any falsy value (0, '', false). Template literals improve readability for string interpolation.

---

## Variable Declarations
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use `const` by default for all variables. Only use `let` when reassignment is necessary. Never use `var` as it has function scope which causes bugs.

**Guidance**: `const` signals that a value won't change, making code easier to reason about. `let` indicates intentional reassignment. `var` is legacy and should be avoided - it has function scope (not block scope) and hoisting behavior that leads to bugs. Flag any use of `var` as a warning.

---

## Arrow Functions
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use arrow functions for callbacks and short functions. Use traditional functions for methods that need `this` context. Avoid arrow functions in object literals for methods.

**Guidance**: Arrow functions have lexical `this` binding, making them ideal for callbacks. However, they don't have their own `this`, so avoid for object methods that need `this` context. `const add = (a, b) => a + b` is clearer than `function add(a, b) { return a + b }` for simple functions. Omit braces for single-expression arrows.

---

## Destructuring Patterns
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use destructuring to extract values from objects and arrays. Destructure function parameters for clarity, destructure imports for explicit dependencies, and use rest syntax for remaining properties.

**Example**:
```javascript
// Function parameters
function greet({ name, age }) { }

// Imports
const { foo, bar } = require('lib');

// Rest syntax
const { id, ...rest } = user;
```

**Guidance**: Destructuring makes code self-documenting by naming the values you care about. It's especially valuable for function parameters with many options. Use defaults in destructuring (`{ name = 'Anonymous' }`). Don't over-destructure - sometimes `user.name` is clearer than destructuring for a single property.

---

## Async Patterns
**Enforcement: SUGGESTED** | **Severity: WARNING**

Prefer `async`/`await` over promise chains for readability. Always handle promise rejections with try/catch or `.catch()`. Use `Promise.all()` for parallel async operations, `Promise.allSettled()` when some failures are acceptable.

**Guidance**: `async`/`await` makes async code look synchronous and improves error handling. However, unhandled promise rejections crash Node.js - must handle errors. Sequential awaits run in series (`await a; await b`), `Promise.all([a(), b()])` runs in parallel. Reference general coding standards for error handling philosophy.

---

## Module Patterns (ESM)
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Prefer named exports over default exports for better refactoring and explicit dependencies. Use `import`/`export` syntax over `require`/`module.exports` when possible. Keep one logical module per file, avoid circular dependencies.

**Guidance**: Named exports enable better IDE refactoring and explicit imports. Default exports hide what's being imported. `import { foo } from './lib'` is clearer than `import lib from './lib'`. Circular dependencies indicate design issues - consider dependency inversion or restructuring modules.

---

## Modern Array Methods
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Use functional array methods over imperative loops for transformations. Prefer `map`/`filter`/`reduce` over `for` loops, `find`/`findIndex` over manual iteration, `some`/`every` for boolean checks, and array spread `[...arr]` over `Array.from()` when simpler.

**Guidance**: Functional methods declare intent better than loops. `users.filter(u => u.active).map(u => u.name)` is clearer than equivalent for-loop. However, don't abuse `reduce` for everything - complex reducers hurt readability. Performance difference is negligible for most use cases - prioritize clarity.

---
