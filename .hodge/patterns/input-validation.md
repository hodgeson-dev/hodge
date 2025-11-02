# Input Validation

**Category**: security
**Frequency**: Used 4 times
**Confidence**: 80%

## Description
Input validation before processing

## Examples

### src/lib/pm/base-adapter.ts
```typescript
if (!targetState) {
      throw new Error
```


### src/lib/pm/github-adapter.ts
```typescript
if (!this.octokit) {
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
*First seen: 2025-11-02T16:44:25.808Z*
*Last used: 2025-11-02T16:44:25.810Z*
