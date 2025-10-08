# Input Validation

**Category**: security
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Input validation before processing

## Examples

### src/lib/frontmatter-parser.ts
```typescript
if (!data.frontmatter_version) {
    throw new Error
```


### src/lib/frontmatter-parser.ts
```typescript
function validateFrontmatter
```


### src/lib/id-manager.ts
```typescript
if (!feature) {
      throw new Error
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-10-08T04:46:31.630Z*
*Last used: 2025-10-08T04:46:31.631Z*
