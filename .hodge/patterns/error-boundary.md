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
      // Validate inputs
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required and must be a string');
      }

      // Display immediate feedba
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


### src/commands/ship.ts
```typescript
try {
        const results = JSON.parse(await fs.readFile(validationFile, 'utf-8')) as Record<
          string,
          { passed: boolean }
        >;
        validationPassed = Object.values(resu
```


## When to Use
- 
- 
- 

---
*First seen: 2025-09-16T22:50:23.258Z*
*Last used: 2025-09-16T22:50:23.263Z*
