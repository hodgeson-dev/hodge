# Input Validation

**Category**: security
**Frequency**: Used 5 times
**Confidence**: 100%

## Description
Input validation before processing

## Examples

### src/commands/ship.ts
```typescript
if (!resolvedFeature) {
      throw new Error
```


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


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-11-03T04:11:09.215Z*
*Last used: 2025-11-03T04:11:09.219Z*
