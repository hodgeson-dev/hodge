# Hodge Test Strategy

## Philosophy: Vibe Testing for Vibe Coding

> "Test behavior, not implementation. Test progressively, not exhaustively."

## Core Principles

1. **Progressive Testing** - Tests evolve with code maturity
2. **Behavior-Focused** - Test what it does, not how it does it
3. **Minimal Mocking** - Mock boundaries, not internals
4. **Fast Feedback** - Quick tests run often, deep tests run when needed

## Test Progression Model

### 🔍 Explore Mode: Test Intentions (No Tests Required)
```typescript
// In exploration.md, document test intentions:
## Test Intentions
- [ ] Should handle invalid input gracefully
- [ ] Should integrate with existing auth system
- [ ] Should perform under 100ms for typical operations
```

### 🔨 Build Mode: Smoke Tests (Required)
```typescript
// One smoke test minimum - does it work at all?
describe('FeatureName (smoke)', () => {
  it('should execute without crashing', async () => {
    const result = await command.execute('test');
    expect(result).toBeDefined();
  });
});
```

### 🛡️ Harden Mode: Integration Tests (Required)
```typescript
// Test real behavior with minimal mocking
describe('FeatureName (integration)', () => {
  it('should complete the happy path', async () => {
    // Actually run the feature
    const result = await runCommand('hodge explore test-feature');
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Exploration created');
  });
});
```

### 🚀 Ship Mode: Full Test Suite (Required)
- All smoke tests passing
- All integration tests passing
- Unit tests for complex logic
- No test regressions from main branch

## Test Categories

### 1. Smoke Tests (`test:smoke`)
- **Purpose**: Ensure basic functionality works
- **Speed**: <100ms per test
- **Mocking**: Minimal - only external services
- **When to run**: Every build command
- **Example**:
```typescript
it('should not crash when executed', async () => {
  await expect(command.execute()).resolves.not.toThrow();
});
```

### 2. Integration Tests (`test:integration`)
- **Purpose**: Test feature behavior end-to-end
- **Speed**: <500ms per test
- **Mocking**: Only external APIs and network calls
- **When to run**: Every harden command
- **Example**:
```typescript
it('should create exploration structure', async () => {
  const testDir = await createTestWorkspace();
  await runInDir(testDir, 'hodge explore my-feature');
  expect(fs.existsSync(`${testDir}/.hodge/features/my-feature`)).toBe(true);
});
```

### 3. Unit Tests (`test:unit`)
- **Purpose**: Test specific logic and edge cases
- **Speed**: <50ms per test
- **Mocking**: As needed for isolation
- **When to run**: During development and ship
- **Example**:
```typescript
it('should detect singleton pattern', () => {
  const patterns = detectPatterns(codeString);
  expect(patterns).toContain('singleton');
});
```

### 4. Acceptance Tests (`test:acceptance`)
- **Purpose**: Verify user stories work
- **Speed**: Can be slower (1-2s)
- **Mocking**: None - test the real thing
- **When to run**: Before ship
- **Example**:
```typescript
it('should complete full explore->build->ship workflow', async () => {
  await runCommand('hodge explore feature');
  await runCommand('hodge build feature');
  await runCommand('hodge ship feature');
  // Verify git commit was created
  const log = await runCommand('git log -1');
  expect(log.output).toContain('feature');
});
```

## Test Utilities

### Mock Factories
```typescript
// src/test/mocks.ts
export const createMockFs = (options = {}) => ({
  existsSync: vi.fn(() => options.exists ?? false),
  promises: {
    readFile: vi.fn(() => options.content ?? ''),
    writeFile: vi.fn(),
    mkdir: vi.fn()
  }
});

export const createMockCache = () => ({
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn()
});
```

### Test Runners
```typescript
// src/test/runners.ts
export async function runCommand(cmd: string) {
  const [command, ...args] = cmd.split(' ');
  const result = await execa(command, args);
  return {
    exitCode: result.exitCode,
    output: result.stdout,
    error: result.stderr
  };
}

export async function runInDir(dir: string, cmd: string) {
  const cwd = process.cwd();
  process.chdir(dir);
  const result = await runCommand(cmd);
  process.chdir(cwd);
  return result;
}
```

### Test Workspaces
```typescript
// src/test/workspace.ts
export async function createTestWorkspace(name = 'test') {
  const dir = path.join(os.tmpdir(), `hodge-test-${name}-${Date.now()}`);
  await fs.mkdir(dir, { recursive: true });
  return {
    dir,
    cleanup: () => fs.rm(dir, { recursive: true, force: true })
  };
}
```

## Writing Good Tests

### ✅ DO
- Test behavior and outcomes
- Use descriptive test names
- Test one thing per test
- Use real implementations when fast enough
- Clean up after tests

### ❌ DON'T
- Test implementation details
- Mock everything
- Write brittle assertions
- Test private methods
- Leave test artifacts

## Example: Testing a New Feature

### 1. During Explore
```markdown
<!-- .hodge/features/auth-jwt/explore/exploration.md -->
## Test Intentions
- [ ] Should generate valid JWT tokens
- [ ] Should validate tokens correctly
- [ ] Should handle expired tokens
- [ ] Should integrate with existing user system
```

### 2. During Build
```typescript
// src/features/auth-jwt.smoke.test.ts
describe('JWT Auth (smoke)', () => {
  it('should load without errors', () => {
    expect(() => require('./auth-jwt')).not.toThrow();
  });

  it('should generate a token', () => {
    const token = generateToken({ userId: 1 });
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});
```

### 3. During Harden
```typescript
// src/features/auth-jwt.integration.test.ts
describe('JWT Auth (integration)', () => {
  it('should complete auth flow', async () => {
    const token = await login('user', 'pass');
    const user = await validateToken(token);
    expect(user.id).toBe(1);
  });

  it('should reject invalid tokens', async () => {
    await expect(validateToken('invalid')).rejects.toThrow('Invalid token');
  });
});
```

### 4. Before Ship
```typescript
// src/features/auth-jwt.test.ts
describe('JWT Auth (full suite)', () => {
  // All smoke tests
  // All integration tests
  // Plus edge cases:

  it('should handle token expiration', async () => {
    const token = generateToken({ userId: 1 }, { expiresIn: '1ms' });
    await sleep(10);
    await expect(validateToken(token)).rejects.toThrow('Token expired');
  });
});
```

## NPM Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:smoke": "vitest run --grep smoke",
    "test:integration": "vitest run --grep integration",
    "test:unit": "vitest run --grep unit",
    "test:acceptance": "vitest run --grep acceptance",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Command Integration

### Explore Command
- No tests required
- Creates `test-intentions.md` file
- Prompts: "What should we test when this is built?"

### Build Command
- Requires at least 1 smoke test
- Runs `npm run test:smoke` before proceeding
- Fails if no smoke tests exist

### Harden Command
- Runs progressive test suite:
  1. `npm run test:smoke` (must pass)
  2. `npm run test:integration` (must pass)
  3. `npm run test:unit` (warnings if fail)

### Ship Command
- Runs full test suite
- Compares against main branch
- Blocks if regression detected

## Migration Path

### Phase 1: Document Strategy (✅ Done)
- Create this document
- Share with team
- Get buy-in

### Phase 2: Create Utilities (Next)
- Build test utilities
- Create mock factories
- Add test runners

### Phase 3: Update Commands
- Modify explore to create test intentions
- Modify build to require smoke tests
- Modify harden to run progressive tests

### Phase 4: Refactor Existing Tests
- Categorize existing tests
- Convert implementation tests to behavior tests
- Reduce mocking where possible

### Phase 5: Enforce Standards
- Add pre-commit hooks
- Update CI/CD pipeline
- Monitor test execution times

## Metrics for Success

- **Test execution time**: <5s for smoke, <30s for integration
- **Test stability**: <1% flaky tests
- **Coverage**: Focus on behavior coverage, not line coverage
- **Developer satisfaction**: Tests help, not hinder

## FAQ

**Q: What if I need to mock everything for a unit test?**
A: Consider if it should be an integration test instead. Heavy mocking usually indicates testing implementation, not behavior.

**Q: How do I test UI components?**
A: Use snapshot tests for structure, integration tests for behavior.

**Q: What about TDD?**
A: Write test intentions during explore, implement tests during build. TDD is optional but encouraged for complex logic.

**Q: Should I test generated code?**
A: Test that generation works, not the generated output (unless it's complex logic).

## Anti-Patterns: What NOT to Test

Based on our experience removing 47 implementation tests, here are patterns to avoid:

### ❌ Console Output Testing
```typescript
// DON'T test console.log calls
it('should log the correct message', () => {
  const spy = vi.spyOn(console, 'log');
  myFunction();
  expect(spy).toHaveBeenCalledWith('specific message');
});
```
**Why it's bad**: Tests implementation, not behavior. Console output can change without breaking functionality.

### ❌ Mock Call Verification
```typescript
// DON'T verify mock was called with exact arguments
it('should call fs.writeFile with correct params', () => {
  myFunction();
  expect(mockFs.writeFile).toHaveBeenCalledWith(
    'exact/path.txt',
    'exact content',
    'utf8'
  );
});
```
**Why it's bad**: Tests how code works internally, not what it accomplishes.

### ❌ Internal State Testing
```typescript
// DON'T test private variables or internal cache
it('should update internal cache', () => {
  const instance = new MyClass();
  instance.doSomething();
  expect(instance['_privateCache']).toContain('value');
});
```
**Why it's bad**: Tests implementation details that users never see.

### ❌ Performance Micro-Benchmarks
```typescript
// DON'T test exact timing
it('should complete in under 100ms', async () => {
  const start = Date.now();
  await myFunction();
  expect(Date.now() - start).toBeLessThan(100);
});
```
**Why it's bad**: Flaky, environment-dependent, not a functional requirement.

### ✅ What to Test Instead

Focus on **observable behavior**:
- Return values
- Side effects (files created, data saved)
- Error handling
- User-facing output
- Integration between components

## Remember

> "A test that never fails is worse than no test at all. A test that always fails is just as bad. Write tests that fail when behavior breaks."

> "If you're testing HOW instead of WHAT, you're testing implementation, not behavior."

---

*Last updated: 2025-01-19*
*Version: 1.1.0*