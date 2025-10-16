# Input Validation

**Category**: security
**Frequency**: Used 4 times
**Confidence**: 80%

## Description
Input validation before processing

## Examples

### src/commands/harden.ts
```typescript
if (!resolvedFeature) {
      throw new Error
```


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


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-10-16T14:08:40.414Z*
*Last used: 2025-10-16T14:08:40.418Z*
