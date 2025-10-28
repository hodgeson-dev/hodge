# Input Validation

**Category**: security
**Frequency**: Used 3 times
**Confidence**: 60%

## Description
Input validation before processing

## Examples

### src/commands/context.ts
```typescript
if (!feature) {
        this.logger.error(chalk.red('No feature specified and no active session found'));
        this.logger.info('Usage: hodge context --todos [--feature HODGE-XXX]');
        throw 
```


### src/commands/harden.ts
```typescript
if (!resolvedFeature) {
      throw new Error
```


### src/commands/ship.ts
```typescript
if (!resolvedFeature) {
      throw new Error
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-10-28T05:12:11.594Z*
*Last used: 2025-10-28T05:12:11.596Z*
