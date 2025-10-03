# Error Boundary

**Category**: error-handling
**Frequency**: Used 4 times
**Confidence**: 80%

## Description
Consistent error handling with logging

## Examples

### src/commands/build.ts
```typescript
try {
      // Validate inputs (redundant but keeping for safety)
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required and must be a string');
      }
```


### src/commands/explore.ts
```typescript
.catch(() => {
          // Silently handle PM update failures
        });
      } else if (!featureID) {
        // It looks like an ID but we couldn't find it
        // Create a new feature and lin
```


### src/commands/harden.ts
```typescript
try {
      // Validate inputs
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required and must be a string');
      }

      console.log(chalk.magenta('
```


## When to Use
- 
- 
- 

---
*First seen: 2025-10-03T15:54:32.368Z*
*Last used: 2025-10-03T15:54:32.371Z*
