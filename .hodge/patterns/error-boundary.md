# Error Boundary

**Category**: error-handling
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Consistent error handling with logging

## Examples

### src/commands/init.ts
```typescript
try {
      this.detector = new ProjectDetector(rootPath);
      this.generator = new StructureGenerator(rootPath);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof
```


### src/lib/config-manager.ts
```typescript
try {
      const content = await fs.readFile(this.userConfigPath, 'utf-8');
      this.userConfig = JSON.parse(content) as HodgeConfig;

      // Validate no secrets in user config
      this.validat
```


### src/lib/detection.ts
```typescript
try {
      const stat = fs.statSync(this.rootPath);
      if (!stat.isDirectory()) {
        throw new ValidationError(`Path is not a directory: ${this.rootPath}`, 'rootPath');
      }
    } catch (e
```


## When to Use
- 
- 
- 

---
*First seen: 2025-09-27T12:27:38.821Z*
*Last used: 2025-09-27T12:27:38.932Z*
