# Error Boundary

**Category**: error-handling
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Consistent error handling with logging

## Examples

### scripts/validate-standards.js
```typescript
try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

    if (!tsconfig.compilerOptions?.strict) {
      log('TypeScript strict mode is not enabled', 'error');
      return
```


### scripts/validate-standards.js
```typescript
.catch((error) => {
  console.error
```


### src/lib/ship-service.ts
```typescript
try {
      const content = await fs.readFile(shipRecordPath, 'utf-8');
      return JSON.parse(content) as ShipRecordData;
    } catch {
      return null;
    }
  }

  /**
   * Write or update ship-
```


## When to Use
- 
- 
- 

---
*First seen: 2025-10-28T05:12:11.593Z*
*Last used: 2025-10-28T05:12:11.601Z*
