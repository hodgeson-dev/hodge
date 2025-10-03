# Input Validation

**Category**: security
**Frequency**: Used 6 times
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


### src/commands/ship.ts
```typescript
if (!resolvedFeature) {
      throw new Error
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-10-03T15:21:59.886Z*
*Last used: 2025-10-03T15:21:59.893Z*
