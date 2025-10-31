# Caching Strategy

**Category**: performance
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Caching for performance optimization

## Examples

### src/lib/explore-service.ts
```typescript
memoize
```


### src/lib/pattern-learner.ts
```typescript
new Map();
  private standards: Map<string, CodingStandard> = new Map();
  private readonly basePath: string;
  private readonly patternsDir: string;

  constructor(basePath?: string) {
    this.baseP
```


### src/lib/pattern-learner.ts
```typescript
memoize
```


## When to Use
- When optimizing for speed
- 
- 

---
*First seen: 2025-10-31T09:39:59.412Z*
*Last used: 2025-10-31T09:39:59.413Z*
