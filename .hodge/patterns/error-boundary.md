# Error Boundary

**Category**: error-handling
**Frequency**: Used 4 times
**Confidence**: 80%

## Description
Consistent error handling with logging

## Examples

### src/commands/explore.ts
```typescript
.catch(() => {
          // Silently handle PM update failures
        });
      } else if (!featureID) {
        // It looks like an ID but we couldn't find it
        // Create a new feature and lin
```


### src/lib/config-manager.ts
```typescript
try {
      const content = await fs.readFile(this.userConfigPath, 'utf-8');
      this.userConfig = JSON.parse(content) as HodgeConfig;

      // Validate no secrets in user config
      this.validat
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

const logDir 
```


## When to Use
- 
- 
- 

---
*First seen: 2025-09-29T00:30:02.305Z*
*Last used: 2025-09-29T00:30:02.310Z*
