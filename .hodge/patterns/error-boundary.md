# Error Boundary

**Category**: error-handling
**Frequency**: Used 12 times
**Confidence**: 100%

## Description
Consistent error handling with logging

## Examples

### scripts/sync-claude-commands.js
```typescript
try {
    // Check if commands directory exists
    if (!fs.existsSync(COMMANDS_DIR)) {
      console.error('❌ Commands directory not found:', COMMANDS_DIR);
      process.exit(1);
    }

    // Read 
```


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


## When to Use
- 
- 
- 

---
*First seen: 2025-10-03T15:21:59.884Z*
*Last used: 2025-10-03T15:21:59.893Z*
