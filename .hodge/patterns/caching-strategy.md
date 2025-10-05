# Caching Strategy

**Category**: performance
**Frequency**: Used 6 times
**Confidence**: 100%

## Description
Caching for performance optimization

## Examples

### src/commands/explore.ts
```typescript
memoize
```


### src/lib/auto-save.ts
```typescript
new Map();
  private FULL_SAVE_INTERVAL = 30 * 60 * 1000; // Full save every 30 minutes

  constructor(basePath: string = '.') {
    this.basePath = basePath;
    this.contextPath = path.join(basePath
```


### src/lib/cache-manager.ts
```typescript
cache.get(
```


## When to Use
- When optimizing for speed
- 
- 

---
*First seen: 2025-10-05T05:58:26.885Z*
*Last used: 2025-10-05T05:58:26.902Z*
