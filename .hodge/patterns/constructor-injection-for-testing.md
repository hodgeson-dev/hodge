# Constructor Injection Pattern for Test Isolation

## Problem

Classes that interact with file system paths (especially `.hodge/` directories) risk violating test isolation when instantiated in tests. Without a safe way to override paths, tests can:
- Corrupt real project data
- Delete production logs
- Create race conditions in parallel tests
- Produce non-deterministic results

## Pattern: Optional Path Injection

Make file paths injectable via constructor parameter with sensible defaults for production use.

### Basic Structure

```typescript
export class MyCommand {
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath ?? this.getDefaultProjectPath();
  }

  private getDefaultProjectPath(): string {
    return path.join(process.cwd(), '.hodge');
  }

  async execute(): Promise<void> {
    // Use this.projectPath instead of hardcoded paths
    const configPath = path.join(this.projectPath, 'config.json');
    // ...
  }
}
```

### Production Usage

```typescript
// Normal usage - uses real project paths
const cmd = new MyCommand();
await cmd.execute();
```

### Test Usage

```typescript
// Tests - uses isolated temp directory
const testDir = path.join(os.tmpdir(), 'test-123');
const cmd = new MyCommand(testDir);
await cmd.execute();
```

## Benefits

✅ **Impossible to violate isolation** - Tests must explicitly provide a path
✅ **No mocking needed** - Clean constructor API, no `(cmd as any)` casts
✅ **Production code unchanged** - Default parameter preserves normal behavior
✅ **Future-proof** - New tests automatically get this safety mechanism
✅ **Self-documenting** - Constructor signature shows what's configurable

## Real-World Example: LogsCommand (HODGE-350)

### Before (Dangerous)

```typescript
export class LogsCommand {
  private getLogPath(): string {
    return path.join(process.cwd(), '.hodge', 'logs', 'hodge.log');
  }

  async execute(options: LogsOptions): Promise<void> {
    const logPath = this.getLogPath();
    if (options.clear) {
      await fs.remove(logPath); // ❌ Deletes real project logs in tests!
    }
  }
}

// Test - requires hacky mocking
const cmd = new LogsCommand();
(cmd as any).getLogPath = () => '/tmp/test.log'; // ❌ Type cast, brittle
```

### After (Safe)

```typescript
export class LogsCommand {
  private logPath: string;

  constructor(logPath?: string) {
    this.logPath = logPath ?? this.getDefaultLogPath();
  }

  private getDefaultLogPath(): string {
    const projectLogPath = path.join(process.cwd(), '.hodge', 'logs', 'hodge.log');
    if (fs.existsSync(projectLogPath)) return projectLogPath;

    return path.join(process.env.HOME ?? '', '.hodge', 'logs', 'hodge.log');
  }

  async execute(options: LogsOptions): Promise<void> {
    if (options.clear) {
      await fs.remove(this.logPath); // ✅ Safe - uses injected test path
    }
  }
}

// Test - clean, type-safe
const testPath = path.join(os.tmpdir(), 'test.log');
const cmd = new LogsCommand(testPath); // ✅ Clean API, no mocking
```

## When to Apply This Pattern

**Use constructor injection when**:
- Class reads/writes to `.hodge/` directories
- Class interacts with project-specific file paths
- Class accesses user home directory
- Tests need to isolate file system operations

**Examples**:
- `LogsCommand` - log file paths
- `ContextCommand` - context file paths
- `ShipCommand` - ship record paths
- Any service reading/writing project state

**Don't use when**:
- Class has no file system interaction
- Paths are always user-provided (already parameterized)
- Using `TempDirectoryFixture` for test setup (different pattern)

## Related Patterns

- **TempDirectoryFixture** (`.hodge/patterns/temp-directory-fixture-pattern.md`) - For creating isolated test environments
- **Service Class Extraction** (`.hodge/patterns/test-pattern.md#service-class-extraction`) - For separating business logic from CLI orchestration

## Gotchas

1. **Remember to use the injected path** - Easy to accidentally use `process.cwd()` elsewhere in the class
2. **Validate paths in tests** - Ensure test paths are actually in temp directories
3. **Don't make everything injectable** - Only inject what needs isolation

## Testing Checklist

When applying this pattern:
- [ ] Constructor accepts optional path parameter
- [ ] Default behavior unchanged (backward compatible)
- [ ] All file operations use injected path
- [ ] No hardcoded `process.cwd()` or `.hodge/` references in methods
- [ ] Tests use temp directories with this pattern
- [ ] Integration tests verify both production and test paths

---

**Pattern established**: HODGE-350 (2025-10-25)
**Related**: Test Isolation Standard (`.hodge/standards.md`)
