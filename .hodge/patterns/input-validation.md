# Input Validation

**Category**: security
**Frequency**: Used 3 times
**Confidence**: 60%

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
*First seen: 2025-10-09T04:06:37.550Z*
*Last used: 2025-10-09T04:06:37.554Z*
