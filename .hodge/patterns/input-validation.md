# Input Validation

**Category**: security
**Frequency**: Used 5 times
**Confidence**: 100%

## Description
Input validation before processing

## Examples

### src/commands/build.ts
```typescript
if (!resolvedFeature) {
      throw new Error
```


### src/commands/harden.ts
```typescript
if (!resolvedFeature) {
      throw new Error
```


### src/lib/pm/linear-adapter.ts
```typescript
if (!state) {
        throw new Error
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-09-24T15:06:23.188Z*
*Last used: 2025-09-24T15:06:23.195Z*
