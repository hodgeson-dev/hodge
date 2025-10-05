# Input Validation

**Category**: security
**Frequency**: Used 8 times
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
*First seen: 2025-10-05T06:33:49.960Z*
*Last used: 2025-10-05T06:33:49.980Z*
