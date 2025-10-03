# Error Boundary

**Category**: error-handling
**Frequency**: Used 8 times
**Confidence**: 100%

## Description
Consistent error handling with logging

## Examples

### scripts/sync-claude-commands.js
```typescript
try {
    // Check if commands directory exists
    if (!fs.existsSync(COMMANDS_DIR)) {
      console.error('❌ Commands directory not found:', COMMANDS_DIR);
      process.exit(1);
    }

    // Read 
```


### src/commands/init.ts
```typescript
try {
      this.detector = new ProjectDetector(rootPath);
      this.generator = new StructureGenerator(rootPath);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof
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
*First seen: 2025-10-03T05:38:46.441Z*
*Last used: 2025-10-03T05:38:46.447Z*
