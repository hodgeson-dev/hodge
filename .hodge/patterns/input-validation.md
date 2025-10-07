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


### src/lib/review-profile-loader.ts
```typescript
if (!data.description) {
      throw new Error
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-10-07T16:10:18.285Z*
*Last used: 2025-10-07T16:10:18.286Z*
