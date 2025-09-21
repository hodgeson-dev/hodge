# Error Boundary

**Category**: error-handling
**Frequency**: Used 5 times
**Confidence**: 100%

## Description
Consistent error handling with logging

## Examples

### src/commands/load.ts
```typescript
try {
      // Handle list option
      if (options.list) {
        await this.listSaves();
        return;
      }

      // Handle recent option or find most recent
      let saveName = name;
      
```


### src/commands/save.ts
```typescript
try {
      // Generate save name if not provided
      const saveName = name || (await this.generateSaveName());

      // Determine save type based on options
      const saveOptions: SaveOptions = 
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
*First seen: 2025-09-21T23:36:22.895Z*
*Last used: 2025-09-21T23:36:22.903Z*
