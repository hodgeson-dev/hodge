# Temp Directory Fixture Pattern

**Context**: Test infrastructure for temporary directory management

**Problem**: Tests using `Date.now()` for temp directory naming experience race conditions in parallel execution, leading to:
- Non-unique directory names
- `ENOENT` errors from mkdir collisions
- Cleanup failures leaving orphaned directories
- Flaky tests that fail randomly

**Solution**: `TempDirectoryFixture` class with UUID-based naming, retry logic, and operation verification

## Usage

### Basic Setup

```typescript
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('MyService - Tests', () => {
  let fixture: TempDirectoryFixture;
  let service: MyService;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();
    service = new MyService(tempDir);
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  it('should work with temp files', async () => {
    await fixture.writeFile('config.json', '{"setting": true}');

    const result = await service.loadConfig();

    expect(result.setting).toBe(true);
  });
});
```

### Helper Methods

```typescript
// Write file (automatically creates parent directories)
await fixture.writeFile('path/to/file.txt', 'content');

// Read file
const content = await fixture.readFile('file.txt');

// Check if file exists
const exists = await fixture.fileExists('file.txt');

// List files in directory
const files = await fixture.listFiles();
const nested = await fixture.listFiles('subdir');

// Get temp directory path (for passing to services)
const dir = fixture.getPath();
```

### Multiple Temp Directories

```typescript
import { withTempDirectories } from '../test/temp-directory-fixture.js';

it('should work with multiple directories', async () => {
  await withTempDirectories(3, async ([dir1, dir2, dir3]) => {
    // Use directories
    // Cleanup happens automatically
  });
});
```

### Custom Options

```typescript
const fixture = new TempDirectoryFixture({
  prefix: 'my-test',           // Default: 'hodge-test'
  maxRetries: 10,              // Default: 5
  retryDelay: 100,             // Default: 50ms
  verifyCreation: true,        // Default: true
});
```

## Anti-Patterns

### ❌ Don't Use Date.now()

```typescript
// ❌ BAD: Non-unique in parallel tests
beforeEach(async () => {
  tempDir = join(tmpdir(), `test-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
});
```

### ❌ Don't Use Manual File Operations

```typescript
// ❌ BAD: No verification, manual path construction
await fs.writeFile(join(tempDir, 'nested/file.txt'), 'content');
// Parent directory might not exist!
```

### ❌ Don't Skip Cleanup Verification

```typescript
// ❌ BAD: No verification cleanup succeeded
afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  // Directory might still exist due to timing
});
```

## Why This Works

1. **UUID Naming**: `randomUUID()` guarantees unique names even in parallel execution
2. **Retry Logic**: Up to 5 retries with exponential backoff for transient failures
3. **Verification**: Checks that operations actually completed before proceeding
4. **Auto-Cleanup**: Even if test fails, cleanup still runs with retries
5. **Helper Methods**: Reduces boilerplate and ensures consistent patterns

## Benefits

- ✅ **No more race conditions** - UUID naming prevents collisions
- ✅ **Reliable cleanup** - Retry logic handles transient failures
- ✅ **Less boilerplate** - Helper methods reduce code
- ✅ **Better debugging** - Warnings logged, not thrown
- ✅ **Parallel safe** - Works correctly in Vitest parallel mode

## When to Use

- ✅ All tests that create temporary directories
- ✅ Tests that write/read files
- ✅ Tests that need isolated file systems
- ✅ Tests that run in parallel

## Migration Example

**Before:**
```typescript
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

let tempDir: string;

beforeEach(async () => {
  tempDir = join(tmpdir(), `test-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

it('test', async () => {
  await fs.writeFile(join(tempDir, 'file.txt'), 'content', 'utf-8');
  // ...
});
```

**After:**
```typescript
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

let fixture: TempDirectoryFixture;

beforeEach(async () => {
  fixture = new TempDirectoryFixture();
  await fixture.setup();
});

afterEach(async () => {
  await fixture.cleanup();
});

it('test', async () => {
  await fixture.writeFile('file.txt', 'content');
  // ...
});
```

## Related

- `src/test/temp-directory-fixture.ts` - Implementation
- `.hodge/standards.md` - Test isolation requirements
- `.hodge/patterns/test-pattern.md` - General test patterns

## History

- **HODGE-341.5 (2025-10-13)**: Created to fix persistent test timing issues
  - Eliminated `Date.now()` race conditions
  - Fixed 1/4 test failures in multi-language detector tests
  - Established pattern for all future temporary directory usage
