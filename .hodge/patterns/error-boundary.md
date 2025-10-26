# Error Boundary

**Category**: error-handling
**Frequency**: Used 5 times
**Confidence**: 100%

## Description
Consistent error handling with logging

## Examples

### scripts/release-check.js
```typescript
.catch((error) => {
  console.error
```


### scripts/release-prepare.js
```typescript
try {
      execSync(`${editor} ${changelogPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('   (Editor closed)');
    }

    console.log('\n✓ CHANGELOG.md updated');
    console
```


### scripts/release-prepare.js
```typescript
.catch((error) => {
  console.error
```


## When to Use
- 
- 
- 

---
*First seen: 2025-10-26T19:18:43.086Z*
*Last used: 2025-10-26T19:18:43.087Z*
