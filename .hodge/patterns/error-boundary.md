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


### src/commands/harden.ts
```typescript
try {
      // Validate inputs
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required and must be a string');
      }

      console.log(chalk.magenta('
```


### src/commands/init.ts
```typescript
try {
      this.detector = new ProjectDetector(rootPath);
      this.generator = new StructureGenerator(rootPath);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof
```


## When to Use
- 
- 
- 

---
*First seen: 2025-09-24T15:06:23.188Z*
*Last used: 2025-09-24T15:06:23.193Z*
