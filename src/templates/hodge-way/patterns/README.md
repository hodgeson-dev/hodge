# Hodge Patterns Library

This directory contains reusable patterns extracted from your codebase.

## What are Patterns?

Patterns are proven solutions to recurring problems. Hodge automatically learns patterns from your shipped code and stores them here for reuse.

## Pattern Categories

### 📁 Starter Patterns

These patterns come with Hodge and represent common best practices:

#### test-behavior-pattern
Focus on testing user-visible behavior rather than implementation details.

```typescript
// ❌ Bad: Testing implementation
it('should call logger.info', () => {
  service.process(data);
  expect(logger.info).toHaveBeenCalledWith('Processing');
});

// ✅ Good: Testing behavior
it('should process data and return result', () => {
  const result = service.process(data);
  expect(result.status).toBe('completed');
  expect(result.items).toHaveLength(3);
});
```

#### progressive-validation-pattern
Validation that scales with development phase.

```typescript
// In explore mode
function quickValidate(data: any) {
  return data != null;
}

// In build mode
function basicValidate(data: unknown) {
  return typeof data === 'object' && 'id' in data;
}

// In harden/ship mode
function strictValidate(data: unknown): data is ValidData {
  if (!isObject(data)) throw new ValidationError('Invalid data type');
  if (!hasRequiredFields(data)) throw new ValidationError('Missing fields');
  if (!meetsBusinessRules(data)) throw new ValidationError('Invalid data');
  return true;
}
```

#### error-context-pattern
Rich error messages with actionable context.

```typescript
// ❌ Bad: Generic errors
throw new Error('Invalid input');

// ✅ Good: Contextual errors
throw new ValidationError('Invalid user ID format', {
  provided: userId,
  expected: 'UUID v4 format',
  example: '123e4567-e89b-12d3-a456-426614174000',
  documentation: 'https://docs.example.com/api/users#id-format'
});
```

#### async-resource-pattern
Consistent async resource handling.

```typescript
async function withResource<T>(
  acquire: () => Promise<T>,
  use: (resource: T) => Promise<void>,
  release: (resource: T) => Promise<void>
): Promise<void> {
  const resource = await acquire();
  try {
    await use(resource);
  } finally {
    await release(resource);
  }
}

// Usage
await withResource(
  () => db.connect(),
  async (conn) => {
    await conn.query('SELECT * FROM users');
  },
  (conn) => conn.close()
);
```

### 📚 Your Patterns

As you ship features, Hodge will extract and add patterns here. Each pattern includes:
- Problem it solves
- Implementation example
- When to use it
- Performance considerations

## Using Patterns

### In Explore Mode
Browse patterns for inspiration, but don't feel constrained by them.

### In Build Mode
Use patterns as templates, adapting them to your specific needs.

### In Harden Mode
Ensure your implementation follows established patterns consistently.

### In Ship Mode
Document any new patterns you've discovered for future use.

## Pattern Evolution

Patterns aren't static. They evolve based on:
- New requirements
- Performance improvements
- Team feedback
- Technology updates

## Contributing New Patterns

To add a new pattern:

1. **Identify** - Notice recurring solutions in shipped code
2. **Extract** - Generalize the solution
3. **Document** - Explain problem, solution, and usage
4. **Test** - Verify pattern works in multiple contexts
5. **Share** - Add to this library

### Pattern Template

```markdown
# Pattern: [Name]

## Problem
What problem does this pattern solve?

## Solution
How does this pattern solve it?

## Implementation
\```language
// Code example
\```

## When to Use
- Scenario 1
- Scenario 2

## When NOT to Use
- Exception 1
- Exception 2

## Performance Notes
Any performance considerations

## Examples in Codebase
- `src/file1.ts:123` - Usage example
- `src/file2.ts:456` - Another example
```

## Learn More

- Run `hodge learn` to extract patterns from recent code
- Run `hodge patterns` to list all available patterns
- Run `hodge patterns --apply <pattern>` to use a pattern

---

*Patterns are discovered, not invented. Let them emerge from your code.*