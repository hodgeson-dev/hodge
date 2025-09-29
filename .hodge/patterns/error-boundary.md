# Error Boundary

**Category**: error-handling
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Consistent error handling with logging

## Examples

### src/commands/explore.ts
```typescript
.catch(() => {
          // Silently handle PM update failures
        });
      } else if (!featureID) {
        // It looks like an ID but we couldn't find it
        // Create a new feature and lin
```


### src/lib/logger.ts
```typescript
try {
    fs.ensureDirSync(projectLogDir, { mode: 0o755 });
    return projectLogDir;
  } catch {
    fs.ensureDirSync(fallbackLogDir, { mode: 0o755 });
    return fallbackLogDir;
  }
}

const logDir 
```


### src/lib/logger.ts
```typescript
.catch((error: unknown) => {
  logger.error
```


## When to Use
- 
- 
- 

---
*First seen: 2025-09-29T01:56:40.289Z*
*Last used: 2025-09-29T01:56:40.292Z*
