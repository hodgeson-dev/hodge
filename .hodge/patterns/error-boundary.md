# Error Boundary

**Category**: error-handling
**Frequency**: Used 4 times
**Confidence**: 80%

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


### src/lib/logger.ts
```typescript
try {
    fs.ensureDirSync(projectLogDir, { mode: 0o755 });
    return projectLogDir;
  } catch {
    fs.ensureDirSync(fallbackLogDir, { mode: 0o755 });
    return fallbackLogDir;
  }
}

// Detect if 
```


## When to Use
- 
- 
- 

---
*First seen: 2025-10-05T01:01:26.549Z*
*Last used: 2025-10-05T01:01:26.596Z*
