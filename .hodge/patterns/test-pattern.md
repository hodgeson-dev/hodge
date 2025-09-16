# Test Patterns

## Quick Reference
```typescript
import { smokeTest, integrationTest, unitTest, acceptanceTest } from '../test/helpers';
import { withTestWorkspace } from '../test/runners';
import { createMockFs, createMockCache } from '../test/mocks';
```

## Core Patterns

### 1. Smoke Test Pattern
Quick sanity checks that ensure basic functionality works.

```typescript
import { smokeTest } from '../test/helpers';

smokeTest('should not crash', async () => {
  await expect(command.execute()).resolves.not.toThrow();
});

smokeTest('should handle basic input', async () => {
  const result = await myFunction('input');
  expect(result).toBeDefined();
});
```

### 2. Integration Test Pattern
End-to-end behavior verification with real dependencies.

```typescript
import { integrationTest } from '../test/helpers';
import { withTestWorkspace } from '../test/runners';

integrationTest('should create expected structure', async () => {
  await withTestWorkspace('test-project', async (workspace) => {
    // Run the actual command
    await workspace.hodge('explore my-feature');

    // Verify behavior
    expect(await workspace.exists('.hodge/features/my-feature')).toBe(true);
    expect(await workspace.read('.hodge/features/my-feature/exploration.md'))
      .toContain('# Exploration: my-feature');
  });
});
```

### 3. Unit Test Pattern
Logic validation with minimal dependencies.

```typescript
import { unitTest } from '../test/helpers';

unitTest('should calculate correctly', () => {
  expect(calculateTotal([10, 20, 30])).toBe(60);
});

unitTest('should handle edge cases', () => {
  expect(calculateTotal([])).toBe(0);
  expect(calculateTotal(null)).toBe(0);
});
```

### 4. Acceptance Test Pattern
User story validation - does it meet requirements?

```typescript
import { acceptanceTest } from '../test/helpers';

acceptanceTest('user can complete full workflow', async () => {
  await withTestWorkspace('acceptance', async (workspace) => {
    // User explores a feature
    await workspace.hodge('explore auth');

    // User builds the feature
    await workspace.hodge('build auth');

    // User hardens for production
    await workspace.hodge('harden auth');

    // Verify complete workflow succeeded
    const report = await workspace.read('.hodge/features/auth/harden/report.md');
    expect(report).toContain('✅ All checks passed');
  });
});
```

## Test Utilities Pattern

### Mock Factory Pattern
Create consistent, reusable mocks:

```typescript
import { createMockFs, createMockCache } from '../test/mocks';

const mockFs = createMockFs({
  exists: true,
  content: 'file content',
  files: ['file1.ts', 'file2.ts']
});

const mockCache = createMockCache({
  'key1': 'value1',
  'key2': { nested: 'data' }
});
```

### Test Workspace Pattern
Isolated environments for integration testing:

```typescript
const workspace = new TestWorkspace('my-test');
await workspace.setup();

try {
  await workspace.run('npm install');
  await workspace.hodge('init');

  const exists = await workspace.exists('.hodge/standards.md');
  expect(exists).toBe(true);
} finally {
  await workspace.cleanup();
}
```

## Common Patterns

### Workspace Testing
```typescript
await withTestWorkspace('my-test', async (workspace) => {
  await workspace.hodge('init');
  expect(await workspace.exists('.hodge/standards.md')).toBe(true);
});
```

### Mock Creation
```typescript
const mockFs = createMockFs({ exists: true, content: 'data' });
const mockCache = createMockCache({ 'key': 'value' });
```

### Async Command Testing
```typescript
smokeTest('handles async operations', async () => {
  const result = await command.execute();
  expect(result.status).toBe('success');
});
```

## Test Intention Pattern

During exploration, write test intentions as behavior checklists:

```markdown
## Test Intentions for Feature X

### Core Functionality
- [ ] Should initialize without errors
- [ ] Should handle valid input correctly
- [ ] Should reject invalid input gracefully

### Performance
- [ ] Should complete within 500ms for typical input
- [ ] Should handle large datasets without memory issues

### Integration
- [ ] Should work with existing authentication
- [ ] Should update cache appropriately
- [ ] Should emit proper events

### Error Handling
- [ ] Should provide helpful error messages
- [ ] Should not corrupt state on failure
- [ ] Should support recovery/retry
```

## Arrange-Act-Assert Pattern
```typescript
it('should calculate correctly', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 50 }];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(150);
});
```

## Error Testing Pattern
```typescript
unitTest('should throw on invalid input', () => {
  expect(() => parseConfig('invalid')).toThrow(ValidationError);
  expect(() => parseConfig(null)).toThrow('Config is required');
});
```

## Fixture Pattern
```typescript
const fixtures = {
  validUser: { id: 1, name: 'Test User', email: 'test@example.com' },
  invalidUser: { id: 'invalid', name: '', email: 'not-an-email' }
};

unitTest('validates user data', () => {
  expect(validateUser(fixtures.validUser)).toBe(true);
  expect(validateUser(fixtures.invalidUser)).toBe(false);
});
```

---
*For testing philosophy, see TEST-STRATEGY.md*
*For requirements, see .hodge/standards.md*