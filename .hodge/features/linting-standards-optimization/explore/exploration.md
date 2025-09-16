# Linting Standards Optimization Exploration

## Problem Statement
We regularly encounter two types of ESLint errors during the `/harden` phase:
1. `@typescript-eslint/no-explicit-any`: Use of `any` type
2. `@typescript-eslint/explicit-function-return-type`: Missing explicit return types

This creates friction in our development workflow, requiring fixes late in the process when we should be focused on hardening and shipping.

## Deep Analysis: Are These Linting Errors Important?

### `@typescript-eslint/no-explicit-any` - HIGH IMPORTANCE ⚠️
The `any` type effectively disables TypeScript's type checking, creating several risks:

**Why it matters:**
- **Runtime errors**: `any` allows calling non-existent methods, accessing undefined properties
- **Refactoring hazards**: Changes to data structures won't be caught by the compiler
- **Hidden bugs**: Type mismatches slip through to production
- **Lost IntelliSense**: No autocomplete or type hints in IDEs

**Real example from our codebase:**
```typescript
// Bad - allows runtime errors
function processData(data: any) {
  return data.nonExistent.method(); // Compiles but crashes at runtime
}

// Good - catches errors at compile time
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'method' in data) {
    return (data as SomeType).method();
  }
}
```

**Verdict**: This rule is CRITICAL for type safety and should generally be enforced.

### `@typescript-eslint/explicit-function-return-type` - LOW-MEDIUM IMPORTANCE 📝
TypeScript can infer most return types accurately without explicit annotations.

**Why it's less critical:**
- **TypeScript inference is excellent**: The compiler correctly infers return types 95%+ of the time
- **DRY violation**: Writing `Promise<void>` when TypeScript already knows it's `Promise<void>`
- **Maintenance burden**: Changing implementation requires updating return type
- **False sense of security**: Explicit types can become outdated/wrong

**Real example:**
```typescript
// Unnecessarily verbose
async function fetchUser(id: string): Promise<User | undefined> {
  const user = await db.users.findOne({ id });
  return user;
}

// TypeScript already knows this returns Promise<User | undefined>
async function fetchUser(id: string) {
  const user = await db.users.findOne({ id });
  return user;
}
```

**Verdict**: This rule adds verbosity with minimal safety benefit. Consider disabling or using selectively.

## Three Approaches to Solve This Problem

### Approach 1: Progressive Type Safety 🎯 [RECOMMENDED]

Align linting strictness with Hodge's explore → build → harden → ship philosophy.

**Implementation:**
```json
// .eslintrc.json
{
  "overrides": [
    {
      // Explore mode: Very permissive
      "files": ["**/explore/**/*.ts", "**/.hodge/features/*/explore/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off"
      }
    },
    {
      // Build mode: Warnings only
      "files": ["**/build/**/*.ts", "src/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-function-return-type": "off"
      }
    },
    {
      // Harden mode: Full enforcement
      "files": ["**/ship/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-function-return-type": "off"
      }
    }
  ]
}
```

**Workflow integration:**
```typescript
// In build command
async function runBuild() {
  // Run with warnings
  const { warnings } = await eslint.lintFiles(['src/**/*.ts']);
  console.log(`⚠️  ${warnings.length} type safety warnings to address before ship`);
}

// In harden command
async function runHarden() {
  // Enforce strict rules
  const { errors } = await eslint.lintFiles(['src/**/*.ts'], {
    config: 'eslint-strict'
  });
  if (errors.length > 0) {
    throw new Error('Type safety errors must be fixed before shipping');
  }
}
```

**Pros:**
- ✅ Aligns perfectly with Hodge philosophy
- ✅ Fast exploration, safe production
- ✅ Gradual type improvement
- ✅ No workflow disruption

**Cons:**
- ❌ Requires configuration complexity
- ❌ Risk of technical debt in explore phase
- ❌ Need to track which mode code is in

### Approach 2: Smart Type Helpers 🛠️

Use TypeScript's `unknown` type and helper utilities instead of `any`.

**Implementation:**
```typescript
// src/types/helpers.ts
// Safe type helpers that maintain type safety
export type SafeAny = unknown;
export type TODO<T = unknown> = T; // Explicit marker for incomplete types
export type Relaxed<T> = T | any; // For third-party integration

// Type guards for safe narrowing
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Safe assertion helper
export function assertType<T>(value: unknown, validator: (v: unknown) => v is T): T {
  if (!validator(value)) {
    throw new TypeError('Type assertion failed');
  }
  return value;
}
```

**ESLint configuration:**
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

**Usage example:**
```typescript
// Instead of any
function processApiResponse(data: any) { ... }

// Use unknown with type guards
function processApiResponse(data: unknown) {
  if (isRecord(data) && isString(data.id)) {
    // Now TypeScript knows data has an id property that's a string
    return { userId: data.id };
  }
  throw new Error('Invalid API response');
}
```

**Pros:**
- ✅ Maintains full type safety
- ✅ No configuration changes needed
- ✅ Educational for team
- ✅ Works everywhere

**Cons:**
- ❌ More verbose code
- ❌ Learning curve for type guards
- ❌ Can slow down prototyping

### Approach 3: Automated Type Generation 🤖

Use tools to automatically generate or fix types during the build process.

**Implementation:**
```typescript
// scripts/fix-types.ts
import { ESLint } from 'eslint';
import { Project } from 'ts-morph';

async function autoFixTypes() {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json'
  });

  // Auto-add return types where missing
  project.getSourceFiles().forEach(sourceFile => {
    sourceFile.getFunctions().forEach(func => {
      if (!func.getReturnTypeNode()) {
        const returnType = func.getReturnType();
        func.setReturnType(returnType.getText());
      }
    });
  });

  // Replace any with unknown or inferred type
  project.getSourceFiles().forEach(sourceFile => {
    sourceFile.forEachDescendant(node => {
      if (node.getText() === 'any') {
        // Try to infer better type or use unknown
        node.replaceWithText('unknown');
      }
    });
  });

  await project.save();
}

// Run during build/harden
export async function buildWithTypesFix() {
  console.log('🔧 Auto-fixing types...');
  await autoFixTypes();
  console.log('✅ Types fixed');
}
```

**Integration with build pipeline:**
```json
// package.json
{
  "scripts": {
    "build": "npm run fix-types && npm run compile",
    "fix-types": "ts-node scripts/fix-types.ts",
    "lint:fix": "eslint . --fix --ext .ts"
  }
}
```

**Pros:**
- ✅ Automated solution
- ✅ Consistent type annotations
- ✅ No manual intervention
- ✅ Learn from patterns

**Cons:**
- ❌ Complex setup
- ❌ May generate suboptimal types
- ❌ Requires maintenance
- ❌ Can mask real type issues

## Recommendation

**Choose Approach 1: Progressive Type Safety** with these specific changes:

1. **Immediate actions:**
   - Disable `explicit-function-return-type` entirely (rely on inference)
   - Keep `no-explicit-any` as error in production code
   - Allow `any` in test files and exploration code

2. **Update `/build` command:**
   - Show type warnings but don't fail build
   - Track warning count for visibility
   - Suggest fixes but don't block

3. **Update `/harden` command:**
   - Enforce `no-explicit-any` strictly
   - Auto-fix what's possible
   - Fail if unfixable type issues exist

4. **Configuration changes:**
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "off",
  "@typescript-eslint/no-unsafe-return": "error",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/test/**/*.ts", "**/explore/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "warn"
      }
    }
  ]
}
```

## Why This Solution?

1. **Aligns with Hodge philosophy**: Freedom to explore, discipline to ship
2. **Reduces friction**: No more fighting types during exploration
3. **Maintains safety**: Production code still type-safe
4. **Pragmatic**: Acknowledges that 100% type coverage isn't always valuable
5. **Educational**: Warnings guide learning without blocking progress

## Implementation Plan

```bash
# Phase 1: Update configuration
hodge decide linting-standards-optimization --approach progressive

# Phase 2: Update build command
hodge build --lint-mode=warn

# Phase 3: Update harden command
hodge harden --strict-types

# Phase 4: Document for team
hodge learn --pattern=progressive-types
```

## Next Steps

Choose your next action:
a) Review and decide on approach → `/decide`
b) Test progressive type safety approach in a real feature
c) Create type helper utilities
d) Update ESLint configuration immediately
e) Generate documentation for the team
f) Done for now

Enter your choice (a-f):