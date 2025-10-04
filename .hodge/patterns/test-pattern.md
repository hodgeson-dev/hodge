# Test Patterns

## ⚠️ CRITICAL RULES

### 1. NO SUBPROCESS SPAWNING (HODGE-317.1 + HODGE-319.1)
**NEVER use `execSync()`, `spawn()`, or `exec()` in tests.**

**Why**: Creates zombie processes that hang indefinitely and require manual kill.

**Fixed In**:
- HODGE-317.1 (2025-09-30) - Eliminated from test-isolation tests
- HODGE-319.1 (2025-10-03) - Fixed commonjs-compatibility regression

❌ **BAD** (creates hung processes):
```typescript
const result = execSync('node dist/src/bin/hodge.js init', {
  encoding: 'utf-8',
  cwd: testDir,
});
```

✅ **GOOD** (verify artifacts):
```typescript
// Verify configuration
const packageJson = await fs.readJson('package.json');
expect(packageJson.type).toBe('module');

// Verify compiled output
const compiled = await fs.readFile('dist/src/bin/hodge.js', 'utf-8');
expect(compiled).toContain('import');
```

### 2. Test Isolation (HODGE-308)
**NEVER modify the project's `.hodge` directory in tests.**

Use `os.tmpdir()` for all file operations.

### 3. Service Class Extraction for CLI Commands (HODGE-321, HODGE-322)
**Extract testable business logic from AI-orchestrated CLI commands.**

**Why**: CLI commands called by Claude Code slash commands cannot be tested via subprocess spawning (creates hung processes). Extract business logic into Service classes that can be tested directly.

❌ **BAD** (untestable mixed logic):
```typescript
class HardenCommand {
  async execute() {
    // 300 lines mixing orchestration + business logic
    console.log('Running standards...');
    const standards = await runStandards(); // business logic
    console.log(standards); // orchestration
    // ...cannot test without subprocess spawning
  }
}
```

✅ **GOOD** (testable service + thin CLI):
```typescript
// Testable business logic in Service class
class HardenService {
  async validateStandards(): Promise<ValidationResults> {
    // Pure business logic, returns data
    return { passed: true, errors: [] };
  }

  async runQualityGates(): Promise<GateResults> {
    return { gates: ['lint', 'typecheck'], allPassed: true };
  }
}

// Thin orchestration wrapper (CLI command)
class HardenCommand {
  private service = new HardenService();

  async execute() {
    const results = await this.service.validateStandards();
    console.log(formatResults(results)); // just presentation
  }
}

// Test the service directly - no subprocess needed
smokeTest('validates standards correctly', async () => {
  const service = new HardenService();
  const results = await service.validateStandards();
  expect(results.passed).toBe(true);
});
```

**Real Example - ShipService (HODGE-322)**:
```typescript
// src/lib/ship-service.ts - Testable business logic
export class ShipService {
  async runQualityGates(options: { skipTests?: boolean }): Promise<QualityGateResults> {
    const results = {
      tests: false,
      coverage: false,
      docs: false,
      changelog: false,
      allPassed: false,
    };

    if (!options.skipTests) {
      try {
        await execAsync('npm test 2>&1');
        results.tests = true;
      } catch {
        results.tests = false;
      }
    } else {
      results.tests = true;
    }

    results.coverage = true;
    results.docs = existsSync('README.md');
    results.changelog = existsSync('CHANGELOG.md');
    results.allPassed = Object.values(results).every(v => v === true);

    return results;
  }

  generateShipRecord(params: ShipRecordParams): ShipRecordData {
    return {
      feature: params.feature,
      timestamp: new Date().toISOString(),
      issueId: params.issueId,
      pmTool: params.pmTool,
      validationPassed: params.validationPassed,
      shipChecks: params.shipChecks,
      commitMessage: params.commitMessage,
    };
  }

  generateReleaseNotes(params: ReleaseNotesParams): string {
    const { feature, issueId, shipChecks } = params;
    return `## ${feature}\n\n${issueId ? `**PM Issue**: ${issueId}\n` : ''}...`;
  }
}

// src/commands/ship.ts - Thin CLI orchestration
export class ShipCommand {
  private shipService = new ShipService();

  async execute(feature?: string, options: ShipOptions = {}): Promise<void> {
    // Delegate to service for business logic
    const qualityResults = await this.shipService.runQualityGates({
      skipTests: options.skipTests
    });

    const shipRecord = this.shipService.generateShipRecord({
      feature,
      issueId,
      pmTool: pmTool || null,
      validationPassed,
      shipChecks: {
        tests: qualityResults.tests,
        coverage: qualityResults.coverage,
        docs: qualityResults.docs,
        changelog: qualityResults.changelog,
      },
      commitMessage,
    });

    const releaseNotes = this.shipService.generateReleaseNotes({
      feature,
      issueId,
      shipChecks: shipRecord.shipChecks,
    });

    // CLI just presents results
    console.log(releaseNotes);
    await fs.writeFile('ship-record.json', JSON.stringify(shipRecord));
  }
}

// src/lib/ship-service.test.ts - Direct service testing with mocks
import { describe, expect, vi, beforeEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ShipService } from './ship-service.js';

vi.mock('fs', async () => ({
  ...await vi.importActual('fs'),
  existsSync: vi.fn(),
}));

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('ShipService - HODGE-322', () => {
  let service: ShipService;

  beforeEach(() => {
    service = new ShipService();
    vi.clearAllMocks();
  });

  smokeTest('should return all passed when quality gates pass', async () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const results = await service.runQualityGates({ skipTests: true });

    expect(results.tests).toBe(true);
    expect(results.coverage).toBe(true);
    expect(results.docs).toBe(true);
    expect(results.changelog).toBe(true);
    expect(results.allPassed).toBe(true);
  });

  smokeTest('should generate ship record with all required fields', () => {
    const record = service.generateShipRecord({
      feature: 'test-feature',
      issueId: 'TEST-123',
      pmTool: 'linear',
      validationPassed: true,
      shipChecks: { tests: true, coverage: true, docs: true, changelog: true },
      commitMessage: 'feat: test commit',
    });

    expect(record.feature).toBe('test-feature');
    expect(record.issueId).toBe('TEST-123');
    expect(record.timestamp).toBeDefined();
    expect(new Date(record.timestamp)).toBeInstanceOf(Date);
  });

  smokeTest('should generate release notes with PM issue', () => {
    const notes = service.generateReleaseNotes({
      feature: 'awesome-feature',
      issueId: 'PROJ-456',
      shipChecks: { tests: true, coverage: true, docs: true, changelog: true },
    });

    expect(notes).toContain('awesome-feature');
    expect(notes).toContain('PROJ-456');
    expect(notes).toContain('✅ Passing');
  });
});
```

**Benefits**:
- ✅ Fast tests (<100ms) - mock execAsync() and file I/O
- ✅ No subprocess spawning - test business logic directly
- ✅ Easy to test edge cases - control all inputs/outputs
- ✅ CLI stays thin - just orchestration and presentation

---

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