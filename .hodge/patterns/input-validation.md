# Input Validation

**Category**: security
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Input validation before processing

## Examples

### src/lib/git-utils.ts
```typescript
if (!trackedFiles) {
      throw new FileScopingError(
        `No files to review. File not found or not git-tracked: ${filePath}`
      );
    }

    return [filePath];
  } catch (error) {
    // Re
```


### src/lib/git-utils.ts
```typescript
function validateFile
```


### src/lib/toolchain-service.ts
```typescript
if (!feature) {
          throw new Error
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-10-16T21:24:11.943Z*
*Last used: 2025-10-16T21:24:11.968Z*
