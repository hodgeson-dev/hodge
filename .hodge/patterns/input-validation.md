# Input Validation

**Category**: security
**Frequency**: Used 4 times
**Confidence**: 80%

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
*First seen: 2025-10-08T06:36:13.547Z*
*Last used: 2025-10-08T06:36:13.548Z*
