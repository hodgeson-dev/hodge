# Error Boundary

**Category**: error-handling
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Consistent error handling with logging

## Examples

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
*First seen: 2025-10-04T00:43:01.151Z*
*Last used: 2025-10-04T00:43:01.153Z*
