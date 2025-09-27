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


### src/lib/pm/linear-adapter.ts
```typescript
if (!state) {
        throw new Error
```


### src/lib/pm/local-pm-adapter.ts
```typescript
if (!match) {
      // Try fallback pattern for end of file
      const endPattern = new RegExp(`(### ${feature}[\\s\\S]*)$`, 'm');
      const endMatch = content.match(endPattern);
      if (endMatch
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-09-27T12:27:38.931Z*
*Last used: 2025-09-27T12:27:38.935Z*
