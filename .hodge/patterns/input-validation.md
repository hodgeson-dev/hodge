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
*First seen: 2025-11-04T03:42:08.978Z*
*Last used: 2025-11-04T03:42:08.983Z*
