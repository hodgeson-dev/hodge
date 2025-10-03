# Input Validation

**Category**: security
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Input validation before processing

## Examples

### src/lib/pm/base-adapter.ts
```typescript
if (!targetState) {
      throw new Error
```


### src/lib/pm/env-validator.ts
```typescript
function validatePMEnvironment
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
*First seen: 2025-10-03T05:38:46.446Z*
*Last used: 2025-10-03T05:38:46.447Z*
