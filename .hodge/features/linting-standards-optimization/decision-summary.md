# Decision: Progressive Type Safety for Linting Standards

## Decision Made
✅ **Approach 1: Progressive Type Safety** has been selected

## What This Means

### Immediate Changes to ESLint Configuration:
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "off", // ← DISABLED
  "@typescript-eslint/no-unsafe-return": "error",           // ← NEW
  "@typescript-eslint/no-unsafe-assignment": "error",       // ← NEW
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/test/**/*.ts", "**/explore/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "warn"  // ← WARNING in tests/explore
      }
    }
  ]
}
```

### How This Affects Development:

#### During Explore Mode:
- ✅ Use `any` freely (no errors)
- ✅ Skip return type annotations
- ✅ Focus on rapid prototyping

#### During Build Mode:
- ⚠️ `any` usage shows warnings (doesn't block)
- ✅ No return type requirements
- 📊 Track warning count for visibility

#### During Harden Mode:
- ❌ `any` usage must be fixed
- ✅ Return types still not required
- 🛡️ Full type safety enforced

## Why This Decision?

1. **No more late-stage type fixing** - Progressive enforcement prevents surprise errors during harden
2. **TypeScript inference is sufficient** - Explicit return types add verbosity without safety benefit
3. **Aligns with Hodge philosophy** - "Freedom to explore, discipline to ship"
4. **Maintains safety** - Production code remains fully type-safe with `no-unsafe-*` rules

## Next Actions

1. ✅ Decision recorded in `.hodge/decisions.md`
2. ⏳ Update ESLint configuration
3. ⏳ Modify build/harden commands to respect new rules
4. ⏳ Update team documentation

## Implementation Timeline
- **Phase 1**: Update ESLint config (immediate)
- **Phase 2**: Update build command with warning tracking
- **Phase 3**: Update harden command with strict enforcement
- **Phase 4**: Document for team and create examples