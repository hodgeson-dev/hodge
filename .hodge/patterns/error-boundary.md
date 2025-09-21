# Error Boundary

**Category**: error-handling
**Frequency**: Used 6 times
**Confidence**: 100%

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
      const saveName = name || await this.generateSaveName();

      // Determine save type based on options
      const saveOptions: SaveOptions = {

```


## When to Use
- 
- 
- 

---
*First seen: 2025-09-21T21:35:15.299Z*
*Last used: 2025-09-21T21:35:15.302Z*
