# Test Intentions: Complete Remaining 67 ESLint Errors from HODGE-356

**Feature**: HODGE-357
**Created**: 2025-10-26

## Overview

These test intentions validate the refactoring work to eliminate 407 ESLint issues (69 errors, 338 warnings). Each intention focuses on behavior preservation during complexity reduction.

## Test Philosophy

**"Vibe testing for vibe coding"** - We test behavior, not implementation:
- ✅ Test that ship.ts still ships features correctly
- ✅ Test that toolchain detection still works
- ✅ Test that caching still improves performance
- ❌ Don't test internal method calls
- ❌ Don't test specific complexity scores
- ❌ Don't test how code is organized

---

## TI-1: Ship Workflow End-to-End Validation

**Priority**: Critical (P0)
**Phase**: Phase 1
**Affected**: `src/commands/ship.ts`

### What We're Testing

After extracting ship.ts into service methods, the shipping workflow must still work identically from a user's perspective.

### Test Scenarios

#### TI-1.1: Successful Ship with Hardening
```typescript
describe('Ship Command - Complete Workflow', () => {
  it('should ship a fully validated feature', async () => {
    // Setup: Create feature with completed hardening
    await createFeatureWithHardening('TEST-001');

    // Execute: Ship the feature
    const shipCmd = new ShipCommand();
    await shipCmd.execute('TEST-001', { skipTests: false });

    // Verify: Ship artifacts created correctly
    expect(shipRecordExists('TEST-001')).toBe(true);
    expect(commitCreated('TEST-001')).toBe(true);
    expect(pmIssueUpdated('TEST-001')).toBe(true);
  });
});
```

#### TI-1.2: Ship Without Hardening (Warning Flow)
```typescript
it('should warn and require --skip-tests without hardening', async () => {
  // Setup: Feature with build but no harden
  await createFeatureWithBuildOnly('TEST-002');

  // Execute: Attempt ship without --skip-tests
  const shipCmd = new ShipCommand();
  await shipCmd.execute('TEST-002', { skipTests: false });

  // Verify: Exits early with warning (no ship record)
  expect(shipRecordExists('TEST-002')).toBe(false);
  expect(warningLogged()).toContain('not been hardened');
});
```

#### TI-1.3: Ship Quality Gates Failure
```typescript
it('should prevent ship when quality gates fail', async () => {
  // Setup: Feature with failing tests
  await createFeatureWithFailingTests('TEST-003');

  // Execute: Attempt ship
  const shipCmd = new ShipCommand();

  // Verify: Throws error, no ship record
  await expect(shipCmd.execute('TEST-003')).rejects.toThrow();
  expect(shipRecordExists('TEST-003')).toBe(false);
});
```

### Success Criteria
- ✅ All existing ship.ts integration tests still pass
- ✅ Ship workflow produces identical outputs before/after refactoring
- ✅ Error messages unchanged from user perspective
- ✅ PM integration still works (Linear issue updates)

---

## TI-2: Complexity Reduction Behavioral Equivalence

**Priority**: High (P1)
**Phase**: Phases 1-3
**Affected**: All refactored functions

### What We're Testing

After reducing cognitive complexity, each function must produce identical outputs for identical inputs.

### Test Scenarios

#### TI-2.1: Toolchain Generator Output Unchanged
```typescript
describe('Toolchain Generator - Behavioral Equivalence', () => {
  it('should generate identical toolchain.yaml after refactoring', async () => {
    // Setup: Same detected tools
    const detectedTools = [
      { name: 'eslint', version: '8.0.0' },
      { name: 'prettier', version: '2.0.0' },
      { name: 'typescript', version: '5.0.0' },
    ];

    // Execute: Generate toolchain
    const generator = new ToolchainGenerator();
    await generator.generate(detectedTools, 'toolchain.yaml');

    // Verify: Output matches expected structure
    const toolchain = await fs.readFile('toolchain.yaml', 'utf-8');
    expect(toolchain).toContain('linting:');
    expect(toolchain).toContain('- eslint');
    expect(toolchain).toContain('formatting:');
    expect(toolchain).toContain('- prettier');
  });
});
```

#### TI-2.2: Cache Manager Performance Maintained
```typescript
describe('Cache Manager - Performance Equivalence', () => {
  it('should maintain cache hit performance after refactoring', async () => {
    const cache = CacheManager.getInstance();
    const loader = vi.fn(async () => 'expensive-data');

    // First call: Cache miss
    await cache.getOrLoad('key', loader, { ttl: 5000 });
    expect(loader).toHaveBeenCalledTimes(1);

    // Second call: Cache hit (no loader call)
    await cache.getOrLoad('key', loader, { ttl: 5000 });
    expect(loader).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it('should validate checksums correctly after refactoring', async () => {
    const cache = CacheManager.getInstance();

    // Cache file with checksum
    await cache.getOrLoad('file:/test.txt',
      async () => 'content',
      { checksum: true }
    );

    // Modify file (checksum changes)
    await fs.writeFile('/test.txt', 'new-content');

    // Verify: Cache invalidated, loader called again
    const loader = vi.fn(async () => 'new-content');
    await cache.getOrLoad('file:/test.txt', loader, { checksum: true });
    expect(loader).toHaveBeenCalled();
  });
});
```

#### TI-2.3: PM Hooks Comment Generation Unchanged
```typescript
describe('PM Hooks - Comment Generation', () => {
  it('should generate minimal verbosity comments correctly', async () => {
    const context: ShipContext = {
      feature: 'TEST-001',
      commitHash: 'abc123def',
    };

    const hooks = new PMHooks();
    const comment = await hooks['generateRichComment'](context);

    // Verify: Minimal format maintained
    expect(comment).toContain('Feature TEST-001 has been shipped');
    expect(comment).toContain('abc123d'); // Short hash
  });

  it('should generate rich verbosity comments with all sections', async () => {
    const context: ShipContext = {
      feature: 'TEST-002',
      commitHash: 'abc123def',
      filesChanged: 5,
      linesAdded: 100,
      linesRemoved: 50,
      testsResults: { passed: 10, total: 10 },
      coverage: 85,
      patterns: ['Service Extraction'],
    };

    const comment = await hooks['generateRichComment'](context);

    // Verify: Rich format includes all sections
    expect(comment).toContain('📊 Changes');
    expect(comment).toContain('✅ Tests');
    expect(comment).toContain('📈 Coverage');
    expect(comment).toContain('🎯 Patterns Applied');
  });
});
```

### Success Criteria
- ✅ All refactored functions produce identical outputs for same inputs
- ✅ No behavioral regressions detected
- ✅ Existing unit tests still pass without modification
- ✅ Integration tests validate end-to-end workflows

---

## TI-3: Error Handling and Empty Catch Blocks

**Priority**: Medium (P2)
**Phase**: Phase 3
**Affected**: 11 empty catch blocks across codebase

### What We're Testing

After adding proper error handling to empty catch blocks, errors must be logged and handled appropriately.

### Test Scenarios

#### TI-3.1: Detection Errors Logged and Continue
```typescript
describe('Detection - Error Handling', () => {
  it('should log package.json read errors and continue', async () => {
    // Setup: Make package.json unreadable
    await fs.chmod('package.json', 0o000);

    const detector = new AutoDetectionService();

    // Execute: Attempt detection
    const profiles = await detector.detectProfiles();

    // Verify: Error logged, but detection continues
    expect(loggedWarnings()).toContain('package.json');
    expect(profiles).toBeDefined(); // Still returns result
  });
});
```

#### TI-3.2: File System Errors Handled Gracefully
```typescript
describe('File Operations - Error Handling', () => {
  it('should handle missing files gracefully with logging', async () => {
    const cache = CacheManager.getInstance();

    // Execute: Try to load non-existent file
    const result = await cache.getOrLoad(
      'file:/nonexistent.txt',
      async () => { throw new Error('File not found'); },
      { checksum: true }
    );

    // Verify: Error logged, loader executed
    expect(loggedErrors()).toContain('Cache validation failed');
  });
});
```

#### TI-3.3: PM Integration Errors Don't Block Workflow
```typescript
describe('PM Integration - Error Recovery', () => {
  it('should continue ship even if PM update fails', async () => {
    // Setup: PM API unavailable
    mockLinearAPI.mockRejectedValue(new Error('Network error'));

    const shipCmd = new ShipCommand();

    // Execute: Ship with PM failure
    await shipCmd.execute('TEST-001', { skipTests: true });

    // Verify: Ship completes, error logged
    expect(shipRecordExists('TEST-001')).toBe(true);
    expect(loggedErrors()).toContain('PM update failed');
  });
});
```

### Success Criteria
- ✅ All errors logged with sufficient context
- ✅ No silent failures (empty catch blocks eliminated)
- ✅ Errors logged to pino with structured data
- ✅ Workflows continue when appropriate (recoverable errors)

---

## TI-4: Security Vulnerability Fixes

**Priority**: High (P1)
**Phase**: Phase 3
**Affected**: Slow regex (4) + PATH injection (5)

### What We're Testing

After fixing security vulnerabilities, regex patterns and PATH operations must still work correctly while being secure.

### Test Scenarios

#### TI-4.1: Regex Patterns Still Parse Correctly
```typescript
describe('Security - Regex Fixes', () => {
  it('should parse environment variables correctly after regex fix', () => {
    // Setup: Various .env file formats
    const inputs = [
      'API_KEY=abc123',
      'DATABASE_URL = postgres://localhost',
      'DEBUG=true',
    ];

    // Execute: Parse with fixed regex
    const results = inputs.map(line => parseEnvLine(line));

    // Verify: Correct parsing maintained
    expect(results[0]).toEqual({ key: 'API_KEY', value: 'abc123' });
    expect(results[1]).toEqual({ key: 'DATABASE_URL', value: 'postgres://localhost' });
    expect(results[2]).toEqual({ key: 'DEBUG', value: 'true' });
  });

  it('should reject excessively long input to prevent DoS', () => {
    // Setup: Malicious input (10MB string)
    const maliciousInput = 'A'.repeat(10_000_000) + '=' + 'B'.repeat(10_000_000);

    // Execute & Verify: Throws error before regex processing
    expect(() => parseEnvLine(maliciousInput))
      .toThrow('Input too long');
  });
});
```

#### TI-4.2: PATH Operations Validate Input
```typescript
describe('Security - PATH Validation', () => {
  it('should detect tools correctly after PATH validation', async () => {
    const detector = new AutoDetectionService();

    // Execute: Detect valid tools
    const hasNode = await detector.hasCommand('node');
    const hasNpm = await detector.hasCommand('npm');

    // Verify: Valid tools detected
    expect(hasNode).toBe(true);
    expect(hasNpm).toBe(true);
  });

  it('should reject tool names with path traversal', async () => {
    const detector = new AutoDetectionService();

    // Execute: Attempt injection
    // Verify: Throws error before shell execution
    await expect(detector.hasCommand('../../../etc/passwd'))
      .rejects.toThrow('Invalid tool name');

    await expect(detector.hasCommand('node && rm -rf /'))
      .rejects.toThrow('Invalid tool name');
  });

  it('should reject tool names with shell metacharacters', async () => {
    const detector = new AutoDetectionService();

    // Invalid characters: ; | & $ ` ( ) < > \n
    const maliciousInputs = [
      'node; cat /etc/passwd',
      'node | grep',
      'node && malicious',
      'node`whoami`',
    ];

    for (const input of maliciousInputs) {
      await expect(detector.hasCommand(input))
        .rejects.toThrow('Invalid tool name');
    }
  });
});
```

#### TI-4.3: Absolute Paths Work Correctly
```typescript
describe('Security - Absolute Path Fallback', () => {
  it('should find tools in standard locations without PATH', async () => {
    // Setup: Mock environment without PATH
    delete process.env.PATH;

    const detector = new AutoDetectionService();

    // Execute: Detect tools using absolute paths
    const nodeLocation = await detector.findToolPath('node');

    // Verify: Found in standard location
    expect(nodeLocation).toMatch(/^\/(usr\/local\/bin|usr\/bin)\/node$/);
  });
});
```

### Success Criteria
- ✅ All regex patterns parse valid input correctly
- ✅ Regex DoS attacks prevented (input length validation)
- ✅ PATH injection blocked (input validation)
- ✅ Tool detection still works for valid tools
- ✅ Absolute path fallback works when PATH unavailable

---

## TI-5: File Splitting Maintains Functionality

**Priority**: Medium (P2)
**Phase**: Phase 3-4
**Affected**: 8 oversized files

### What We're Testing

After splitting large files, all functionality must remain intact with no import errors or circular dependencies.

### Test Scenarios

#### TI-5.1: Init Command Still Works After Split
```typescript
describe('Init Command - File Split Validation', () => {
  it('should complete initialization after command split', async () => {
    // Setup: Fresh directory
    const tempDir = await createTempDir();
    process.chdir(tempDir);

    // Execute: Run init command (now split across files)
    const initCmd = new InitCommand();
    await initCmd.execute({ interactive: false });

    // Verify: All initialization artifacts created
    expect(existsSync('.hodge')).toBe(true);
    expect(existsSync('.hodge/standards.md')).toBe(true);
    expect(existsSync('.hodge/decisions.md')).toBe(true);
  });
});
```

#### TI-5.2: Explore Command Still Works After Split
```typescript
describe('Explore Command - File Split Validation', () => {
  it('should create exploration artifacts after split', async () => {
    // Execute: Explore new feature
    const exploreCmd = new ExploreCommand();
    await exploreCmd.execute('TEST-FEATURE');

    // Verify: Exploration directory and files created
    expect(existsSync('.hodge/features/TEST-FEATURE/explore')).toBe(true);
    expect(existsSync('.hodge/features/TEST-FEATURE/explore/exploration.md')).toBe(true);
  });
});
```

#### TI-5.3: No Circular Dependencies After Split
```typescript
describe('Build - Circular Dependency Check', () => {
  it('should compile TypeScript without circular dependency errors', async () => {
    // Execute: TypeScript compilation
    const { exitCode, stderr } = await execAsync('npx tsc --noEmit');

    // Verify: No circular dependency warnings
    expect(exitCode).toBe(0);
    expect(stderr).not.toContain('circular');
  });
});
```

### Success Criteria
- ✅ TypeScript compiles without errors
- ✅ No circular dependency warnings
- ✅ All command workflows function identically
- ✅ Import paths updated correctly
- ✅ Existing tests pass without modification

---

## TI-6: Automated Fix Validation (Nullish Coalescing)

**Priority**: Low (P4)
**Phase**: Phase 4
**Affected**: 89 || → ?? conversions

### What We're Testing

After automated ESLint fixes, behavior must be unchanged (|| and ?? differ for falsy values).

### Test Scenarios

#### TI-6.1: Nullish Coalescing Preserves Behavior
```typescript
describe('Automated Fixes - Nullish Coalescing', () => {
  it('should handle undefined values correctly', () => {
    // Before: const value = input || 'default';
    // After: const value = input ?? 'default';

    expect(getValue(undefined)).toBe('default');
    expect(getValue(null)).toBe('default');
    expect(getValue('')).toBe(''); // Different from ||!
    expect(getValue(0)).toBe(0);   // Different from ||!
    expect(getValue(false)).toBe(false); // Different from ||!
  });
});
```

#### TI-6.2: Review All Boolean Conversions
```typescript
describe('Automated Fixes - Boolean Edge Cases', () => {
  it('should not change behavior for boolean flags', () => {
    // Verify || wasn't converted where boolean logic needed
    const config = { enabled: false };

    // This should be false, not 'default'
    expect(config.enabled || 'default').toBe('default');

    // After fix, if changed to ??:
    expect(config.enabled ?? 'default').toBe(false); // DIFFERENT!
  });
});
```

### Success Criteria
- ✅ All tests pass after automated fixes
- ✅ Manual review of any boolean/number || conversions
- ✅ Behavior unchanged for null/undefined checks
- ✅ Regression tests catch any behavioral changes

---

## TI-7: Integration Test Suite Validation

**Priority**: Critical (P0)
**Phase**: All phases
**Affected**: Entire codebase

### What We're Testing

The complete Hodge workflow (explore → build → harden → ship) must work end-to-end after all refactoring.

### Test Scenarios

#### TI-7.1: Complete Feature Lifecycle
```typescript
describe('Hodge Workflow - Complete Lifecycle', () => {
  it('should complete full workflow after all refactoring', async () => {
    // Phase 1: Explore
    const exploreCmd = new ExploreCommand();
    await exploreCmd.execute('E2E-TEST');
    expect(existsSync('.hodge/features/E2E-TEST/explore/exploration.md')).toBe(true);

    // Phase 2: Build
    const buildCmd = new BuildCommand();
    await buildCmd.execute('E2E-TEST');
    expect(existsSync('.hodge/features/E2E-TEST/build/build-plan.md')).toBe(true);

    // Phase 3: Harden
    const hardenCmd = new HardenCommand();
    await hardenCmd.execute('E2E-TEST');
    expect(existsSync('.hodge/features/E2E-TEST/harden/validation-results.json')).toBe(true);

    // Phase 4: Ship
    const shipCmd = new ShipCommand();
    await shipCmd.execute('E2E-TEST', { skipTests: true });
    expect(existsSync('.hodge/features/E2E-TEST/ship-record.json')).toBe(true);
  });
});
```

### Success Criteria
- ✅ All 1300+ existing tests pass
- ✅ No new test failures introduced
- ✅ Coverage maintained >80%
- ✅ E2E workflow tests pass
- ✅ CI pipeline green

---

## Regression Prevention Strategy

### Before Starting Refactoring

```bash
# Capture baseline
npm test > baseline-tests.txt
npm run test:coverage > baseline-coverage.txt
npm run lint > baseline-lint.txt
```

### After Each Phase

```bash
# Compare against baseline
npm test
npm run test:coverage
npm run lint

# Verify:
# - Test count unchanged or increased
# - Coverage maintained or improved
# - Lint errors reduced
```

### Final Validation

```bash
# Complete validation suite
npm run quality  # Runs all checks
npm test         # All tests
npm run build    # TypeScript compilation
npm run lint     # Zero errors
```

---

## Test Success Summary

| Test Intention | Priority | Phase | Success Metric |
|----------------|----------|-------|----------------|
| TI-1: Ship Workflow | P0 | 1 | Ship E2E tests pass |
| TI-2: Behavioral Equivalence | P1 | 1-3 | All unit tests pass |
| TI-3: Error Handling | P2 | 3 | No empty catch blocks |
| TI-4: Security Fixes | P1 | 3 | Security tests pass |
| TI-5: File Splitting | P2 | 3-4 | No circular deps |
| TI-6: Automated Fixes | P4 | 4 | No behavioral changes |
| TI-7: Integration Suite | P0 | All | 1300+ tests pass |

**Overall Success**: All 7 test intentions validated ✅
