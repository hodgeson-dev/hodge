# Input Validation

**Category**: security
**Frequency**: Used 4 times
**Confidence**: 80%

## Description
Input validation before processing

## Examples

### src/lib/config-manager.ts
```typescript
if (!this.configLoaded) {
      await this.loadUserConfig();
      await this.loadGeneratedConfig();
      this.configLoaded = true;
    }

    // Merge all config sources with proper priority
    ret
```


### src/lib/id-manager.ts
```typescript
if (!feature) {
      throw new Error
```


### src/lib/pm/github-adapter.ts
```typescript
if (!this.octokitLoaded) {
      try {
        // Dynamic import to avoid loading at module level
        const { Octokit } = await import('@octokit/rest');
        // Cast to our interface - we know 
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-09-29T20:23:48.718Z*
*Last used: 2025-09-29T20:23:48.720Z*
