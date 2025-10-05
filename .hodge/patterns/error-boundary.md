# Error Boundary

**Category**: error-handling
**Frequency**: Used 5 times
**Confidence**: 100%

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
*First seen: 2025-10-05T05:58:26.880Z*
*Last used: 2025-10-05T05:58:26.903Z*
