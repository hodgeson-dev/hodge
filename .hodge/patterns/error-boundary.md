# Error Boundary

**Category**: error-handling
**Frequency**: Used 3 times
**Confidence**: 60%

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


### src/commands/harden.ts
```typescript
try {
      // Validate inputs
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required and must be a string');
      }

      console.log(chalk.magenta('
```


### src/commands/save.ts
```typescript
try {
      // Generate save name if not provided (delegate to SaveService)
      const saveName = name || (await this.saveService.generateSaveName());

      // Determine save type based on options
 
```


## When to Use
- 
- 
- 

---
*First seen: 2025-10-03T20:19:31.296Z*
*Last used: 2025-10-03T20:19:31.298Z*
