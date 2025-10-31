# Project Standards

⚠️ **THESE STANDARDS ARE MANDATORY**
All standards below are CRITICAL and MUST be followed.
Non-compliance will block shipping. Standards are automatically enforced by Hodge workflow commands.

## Quick Reference: Enforcement by Phase

| Standard Category | Explore | Build | Harden | Ship |
|------------------|---------|--------|---------|------|
| **Core Standards** | Optional | Suggested | Required | Mandatory |
| **CLI Architecture** | Mandatory | Mandatory | Mandatory | Mandatory |
| **Testing** | None | 1+ smoke test | Integration | Full suite |
| **Type Safety** | Any allowed | Basic | Strict | Strict |
| **Code Quality** | Optional | Should pass | Must pass | Blocking |
| **Performance** | Optional | Monitor | Measure | Enforce |
| **Documentation** | Optional | Comments | API docs | Complete |

## The Hodge Way
**Enforcement: Progressive (see table above)**

This project follows the Hodge development philosophy:
> "Freedom to explore, discipline to ship"

### Core Approach

1. **Progressive Testing** - "Vibe testing for vibe coding"
   - Test behavior, not implementation
   - Never test console.log calls or mock interactions
   - Tests evolve with code maturity

2. **Progressive Type Safety**
   - `any` is allowed in explore mode
   - Types tighten as code matures
   - TypeScript inference over explicit types

3. **Phase-Based Development**
   - **Explore**: Rapid prototyping, no rules
   - **Build**: Basic standards, smoke tests
   - **Harden**: Strict standards, integration tests
   - **Ship**: Production ready, full coverage

## Core Standards
**Enforcement: Build(suggested) → Harden(required) → Ship(mandatory)**

- TypeScript with strict mode
- ESLint rules enforced
- Prettier formatting

### Nullish Coalescing Operator Requirement
**Tool-Enforced**: ESLint (`@typescript-eslint/prefer-nullish-coalescing`)

**ALWAYS use nullish coalescing (`??`) instead of logical OR (`||`) for default values.**

**Correct Pattern**:
```typescript
// ✅ GOOD: Use ?? for default values
const value = userInput ?? 'default';
const config = options?.timeout ?? 5000;
const feature = session?.feature ?? 'general';
```

**Incorrect Pattern**:
```typescript
// ❌ BAD: || coalesces all falsy values (0, '', false, null, undefined)
const value = userInput || 'default';        // Wrong if userInput is ''
const config = options?.timeout || 5000;     // Wrong if timeout is 0
const feature = session?.feature || 'general'; // Wrong if feature is ''
```

**Why This Matters**:
- `||` treats ALL falsy values as "missing" (0, '', false, null, undefined)
- `??` only treats null/undefined as "missing", preserving valid falsy values
- Common bug source: `count || 0` evaluates to 0 when count is 0
- Explicit about intent: "use default only if null/undefined"

**Token Efficiency**:
Following this rule from the start avoids ESLint warnings and fix cycles, saving tokens and time.

## Logging Standards (HODGE-330)
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Hodge uses dual logging (console + pino) for commands and pino-only for libraries.

### Command Logging Pattern
**Applies to**: All files in `src/commands/**`

Commands must use dual logging (both console output and persistent pino logs):

```typescript
import { createCommandLogger } from '../lib/logger.js';

const logger = createCommandLogger('commandName', { enableConsole: true });

// Use logger methods (NOT console.log directly)
logger.info('Command started');
logger.warn('Warning message');
logger.error('Error occurred');
```

**Why dual logging for commands**:
- Console output provides immediate user feedback
- Pino logs enable persistent debugging and troubleshooting
- Works for both user-executed commands (init, logs) and AI-orchestrated commands (explore, build, ship)

### Library Logging Pattern
**Applies to**: All files in `src/lib/**`

Libraries must use pino-only logging (no console output):

```typescript
import { createCommandLogger } from './logger.js';

const logger = createCommandLogger('libName', { enableConsole: false });

// Or omit the flag (defaults to false)
const logger = createCommandLogger('libName');

// Use logger methods (NOT console.log)
logger.info('Library operation');
logger.debug('Debug info');
logger.error('Error in library');
```

**Why pino-only for libraries**:
- Library operations are internal implementation details
- Console output from libraries creates noise without value
- All logging still captured in pino logs for debugging

### Direct console Usage Rules

**NEVER use direct console.log/warn/error** in production code. Use logger methods instead.

**Exemptions** (where direct console is allowed):
- Test files (`*.test.ts`, `*.spec.ts`) - for test debugging
- Scripts directory (`scripts/**`) - for tooling output
- Logger implementation (`src/lib/logger.ts`) - implements the console wrapper

### Logger API

**Named exports** (TypeScript-friendly):
```typescript
import { logger, createCommandLogger, type CommandLoggerOptions } from './logger.js';
```

**Available methods**:
- `logger.info(message, context?)` - General information
- `logger.warn(message, context?)` - Warnings
- `logger.error(message, context?)` - Errors
- `logger.debug(message, context?)` - Debug info (only shown with DEBUG env var)

### Pattern Consistency (HODGE-330)

**All command classes MUST use instance logger, NOT static classes**:

```typescript
// ✅ CORRECT: Instance logger in command class
export class MyCommand {
  private logger = createCommandLogger('mycommand', { enableConsole: true });

  async execute(): Promise<void> {
    this.logger.info('Command started');
  }
}

// ❌ INCORRECT: Static logger class
class MyLogger {
  static info(message: string) {
    console.log(message);
  }
}
```

**Why instance logger pattern**:
- Consistent with existing command patterns (logs.ts established the pattern)
- Proper encapsulation and testability
- Avoids static class proliferation
- Enables proper logger lifecycle management

### Error Object Passing (HODGE-330)

**Errors MUST be passed as structured objects for pino logging**:

```typescript
// ✅ CORRECT: Pass error object to pino
try {
  await doSomething();
} catch (error) {
  this.logger.error('Operation failed', { error: error as Error });
}

// ❌ INCORRECT: Error only in message string
try {
  await doSomething();
} catch (error) {
  this.logger.error(`Operation failed: ${error}`); // Lost stack trace!
}
```

**Why structured error logging**:
- Preserves full error stack trace in pino JSON logs
- Enables better debugging and troubleshooting
- Maintains structured log format for analysis
- Error details searchable in log files

### Validation

The `validate-standards.js` script checks for direct console usage:
- **Warning level** during transition period (non-blocking)
- Automatically exempts test files, scripts, and logger.ts
- Will be upgraded to **error level** after migration completes

## CLI Architecture Standards
**Enforcement: ALL PHASES (mandatory)**

### AI-Orchestrated Commands (HODGE-321)
**⚠️ CRITICAL**: Hodge CLI commands are AI-orchestrated, not user-facing tools.

**Command Categories**:
- **AI-Orchestrated** (explore, decide, build, harden, ship, save, load, plan, status, link): Called exclusively by Claude Code slash commands
- **User-Facing Exceptions** (init, logs): Interactive CLI tools called directly by developers

**Design Principles**:
- AI-orchestrated commands MUST be non-interactive (no prompts, confirmations, or user input)
- All parameters must come from command arguments or environment variables
- Commands should make sensible default choices when decisions are needed
- Use exit codes and structured output to communicate state
- There is no possibility of user interaction when called from slash commands

**Testing Implications**:
- AI-orchestrated commands should extract testable business logic into Service classes
- CLI command classes remain thin orchestration wrappers (presentation layer)
- Test business outcomes through Service classes, not CLI orchestration
- User-facing commands (init, logs) may accept lower test coverage due to interactive nature

### Slash Command File Creation Pattern (HODGE-327.1)
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Slash command templates use the Write tool for file creation, NOT Service classes or CLI commands.

**File Creation Responsibility**:
- **AI (via slash commands)** writes: exploration.md, decisions.md, lessons learned, review reports
- **hodge CLI** creates: directory structures, PM integration, status tracking
- **Never**: Service classes should NOT handle file writing for slash command workflows

**Standard Pattern**:
```typescript
// ❌ BAD: Service class writing files for slash commands
class ReviewPersistenceService {
  saveReport(report: string): void {
    writeFileSync('.hodge/reviews/...', report);
  }
}

// ✅ GOOD: Slash command template using Write tool
// In .claude/commands/review.md:
// Use Write tool to save report with YAML frontmatter
```

**Examples**:
- `/explore` → AI writes `exploration.md` using Write tool
- `/ship` → AI writes `.hodge/lessons/HODGE-XXX-slug.md` using Write tool
- `/review` → AI writes `.hodge/reviews/{filename}.md` using Write tool

**Why This Matters**:
- Maintains clean separation: CLI = orchestration, AI = content generation
- Avoids Service class proliferation for simple file operations
- Consistent with existing workflow patterns (explore, ship, decide)
- Write tool automatically handles parent directory creation

### CLI/AI Separation of Concerns (HODGE-334)
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: CLI uses codified rules to identify resources; AI reads and interprets content.

**Separation Principle**:
- **CLI Responsibility**: Structure discovery, validation, and manifest building
  - Detect patterns (e.g., HODGE-333.1 is sub-feature of HODGE-333)
  - Validate state (e.g., ship-record.json has validationPassed: true)
  - Identify relevant files (e.g., exploration.md exists, decisions.md exists)
  - Assign metadata (precedence, timestamps, types)
  - Return file manifest (paths + metadata, NO content reading)

- **AI Responsibility**: Content reading, interpretation, and synthesis
  - Read files based on CLI manifest
  - Extract relevant information for current context
  - Synthesize across multiple sources
  - Adapt to conversation needs
  - Reference naturally during interaction

**File Manifest Pattern**:
```typescript
// ✅ CORRECT: CLI builds manifest with paths and metadata
interface FileManifest {
  items: Array<{
    path: string;           // Where to find it
    type: string;           // What kind it is
    metadata: object;       // Context-specific data
    precedence: number;     // Suggested reading order
  }>;
  suggestedAction: string;
}

// CLI outputs manifest to stdout
console.log('📚 Context Available');
console.log('Files:');
manifest.items.forEach(item => console.log(`  - ${item.path}`));

// ❌ INCORRECT: CLI reads and parses content
interface ContextSummary {
  problemStatement: string;   // Extracted from markdown
  decisions: string[];        // Parsed from file
  recommendations: string;    // Interpreted content
}
```

**Why This Matters**:
- Maintains clean separation: CLI = structure discovery, AI = content interpretation
- Enables AI flexibility (dig deeper, skip irrelevant parts, adapt to conversation)
- Simplifies CLI logic (file existence checks, not content parsing)
- Testable with codified rules (validate patterns, not content interpretation)
- Aligns with "AI writes content, CLI creates structure" principle

**Examples**:
- ✅ `/explore` sub-feature context: CLI identifies parent/sibling files, AI reads and synthesizes
- 🔄 `/review` (needs audit): Should follow same pattern
- 🔄 Future context-loading features: Must use file manifest approach

**Related Standard**: Slash Command File Creation Pattern (above) - AI writes, CLI structures

## Testing Requirements
**Enforcement: Progressive per phase (see table below)**

| Phase | Required | Time Limit |
|-------|----------|------------|
| **Build** | 1+ smoke test | <100ms each |
| **Harden** | Integration tests | <500ms each |
| **Ship** | All tests pass | <30s total |

### Testing Philosophy
**Enforcement: Build(encouraged) → Harden(expected) → Ship(required)**
- Test what users see, not how it works
- Focus on behavior and contracts
- Prefer integration tests over unit tests
- Use real dependencies when possible

### Test Organization and Naming
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Tests must be co-located with the code they test and named by functionality.

- **Correct Pattern**: Tests live next to the code they verify
  - `src/lib/toolchain-service.ts`
  - `src/lib/toolchain-service.smoke.test.ts`
  - `src/lib/toolchain-service.integration.test.ts`

- **Incorrect Pattern**: Feature-named tests (ANTI-PATTERN)
  - ❌ `src/lib/hodge-359-1.smoke.test.ts`
  - ❌ `src/test/feature-tests/hodge-400.test.ts`

**Why Feature-Named Tests Are Anti-Patterns**:
1. **Enable duplication**: Multiple features touching the same code create duplicate test files
2. **Undiscoverable**: Developers modifying `toolchain-service.ts` won't find `hodge-359-1.smoke.test.ts`
3. **Lose context**: Feature IDs become meaningless trivia after shipping
4. **Poor documentation**: Filename doesn't describe what's being tested

**Test File Naming Convention**:
- Format: `<module-name>.<test-type>.test.ts`
- Examples:
  - `toolchain-service.smoke.test.ts` - Smoke tests for ToolchainService
  - `harden-service.integration.test.ts` - Integration tests for HardenService
  - `id-manager.test.ts` - General tests for IdManager

**When Adding Tests**:
- ✅ Add to existing test file for the module
- ✅ Create new file if module has no tests yet
- ❌ Create feature-named test files
- ❌ Group tests by feature instead of functionality

### Test Isolation Requirement
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Tests must NEVER modify the Hodge project's own `.hodge` directory.
- All tests must use temporary directories (`os.tmpdir()`) for file operations
- Use mocks or stubs instead of modifying actual project state
- Any test that needs a `.hodge` structure should create it in an isolated temp directory
- This prevents tests from corrupting project data or affecting other tests
- Violation of this rule can lead to data loss and unpredictable test behavior

#### Temporary Directory Usage (HODGE-341.5)
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Use `TempDirectoryFixture` for all temporary directory operations.

- **REQUIRED**: Use `TempDirectoryFixture` from `src/test/temp-directory-fixture.ts` for all temporary directory operations
- **NEVER**: Use `Date.now()` or timestamps for directory naming (causes race conditions in parallel tests)
- **Pattern**: See `.hodge/patterns/temp-directory-fixture-pattern.md` for usage examples

**Anti-Pattern (Forbidden)**:
```typescript
// ❌ FORBIDDEN: Non-unique naming causes race conditions
beforeEach(async () => {
  tempDir = join(tmpdir(), `test-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
});
```

**Required Pattern**:
```typescript
// ✅ REQUIRED: UUID-based naming with retry logic
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
  // Helper creates parent directories automatically
});
```

**Rationale**: Eliminates timing bugs that caused persistent test flakiness (HODGE-341.5). Pattern includes UUID naming, retry logic, and operation verification.

#### Command and Service Instantiation in Tests (HODGE-370)
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: ALL Command and Service instantiations in tests MUST use TempDirectoryFixture.

**Required Pattern**:
```typescript
// ✅ CORRECT: Even for method-existence tests
smokeTest('PMHooks should have createPMIssue method', async () => {
  const fixture = new TempDirectoryFixture();
  const testDir = await fixture.setup();

  const pmHooks = new PMHooks(testDir);
  expect(pmHooks.createPMIssue).toBeDefined();

  await fixture.cleanup();
});
```

**Forbidden Pattern**:
```typescript
// ❌ FORBIDDEN: Using process.cwd() even for non-file operations
smokeTest('PMHooks should have createPMIssue method', () => {
  const pmHooks = new PMHooks(process.cwd());
  expect(pmHooks.createPMIssue).toBeDefined();
});
```

**Why This Matters**:
- **Future-proof**: If tests are modified later to add file operations, they're already isolated
- **Consistent**: Same pattern everywhere, no exceptions to remember
- **Safer**: Eliminates ANY possibility of project contamination
- **Prevents anti-pattern**: Avoids "this test is simple, we don't need isolation" thinking

**Rationale**: HODGE-370 discovered that even simple method-existence tests should use temp directories for consistency and future-proofing. This prevents the gradual erosion of test isolation standards.

### Subprocess Spawning Ban (HODGE-317.1 + HODGE-319.1)
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Tests must NEVER spawn subprocesses using `execSync()`, `spawn()`, or `exec()`.
- **Root Cause**: Subprocesses create orphaned zombie processes that hang indefinitely
- **Symptom**: Tests timeout, hung Node processes require manual kill in Activity Monitor
- **Solution**: Test behavior through direct assertions, not subprocess execution
- **Exceptions**: None - if you think you need subprocess spawning, you're testing the wrong thing

**Why This Matters**:
- HODGE-317.1 (2025-09-30) eliminated subprocess spawning from test-isolation tests
- HODGE-318 (2025-10-01) inadvertently reintroduced it in commonjs-compatibility tests
- HODGE-319.1 (2025-10-03) fixed regression and added this standard

**Correct Pattern** (verify artifacts, not runtime):
```typescript
// ✅ GOOD: Verify configuration files and build artifacts
const packageJson = await fs.readJson('package.json');
expect(packageJson.type).toBe('module');

const compiled = await fs.readFile('dist/src/bin/hodge.js', 'utf-8');
expect(compiled).toContain('import');
```

**Incorrect Pattern** (spawns subprocess):
```typescript
// ❌ BAD: Creates zombie processes that hang
const result = execSync('node dist/src/bin/hodge.js init', {
  encoding: 'utf-8',
  cwd: testDir,
});
```

**See Also**: `.hodge/patterns/test-pattern.md` for examples

### Toolchain Execution Ban (HODGE-357.1)
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Tests must NEVER execute real toolchain commands (eslint, jscpd, tsc, prettier, vitest, etc.)

- **Root Cause**: Toolchain execution spawns subprocesses that hang or take excessive time (jscpd scans entire codebase)
- **Symptom**: Hanging test processes, slow test runs (18s → 115s), zombie processes requiring manual kill
- **Solution**: Mock `runQualityChecks()` and `executeTool()` in all tests
- **Exceptions**: None - if you think you need to run real tools, you're testing the wrong thing

**Why This Matters**:
- HODGE-357.1 (2025-10-27) discovered tests spawning jscpd processes that scan entire codebase
- Same issue as subprocess spawning ban, but specific to ToolchainService
- Running real tools in tests creates unpredictable behavior and resource exhaustion

**Correct Pattern** (mock tool execution):
```typescript
// ✅ GOOD: Mock tool execution
smokeTest('should run quality checks', async () => {
  const service = new ToolchainService(tempDir);
  const mockResults = [{ type: 'linting', tool: 'eslint', success: true }];
  vi.spyOn(service, 'runQualityChecks').mockResolvedValue(mockResults);

  const results = await service.runQualityChecks('all');
  expect(results).toBeDefined();
});

// ✅ GOOD: Use config with no tools configured
await fixture.writeFile(
  '.hodge/toolchain.yaml',
  `version: "1.0"
quality_checks:
  duplication: []  # Don't run jscpd
  linting: []      # Don't run eslint
  type_checking: []`
);
```

**Incorrect Pattern** (executes real tools):
```typescript
// ❌ BAD: Spawns real jscpd, eslint, tsc processes
const service = new ToolchainService(tempDir);
const results = await service.runQualityChecks('all'); // Spawns jscpd!
```

**What to Test Instead**:
- ✅ Config loading and parsing
- ✅ Tool detection logic (file existence, package.json checks)
- ✅ Command template substitution (${files} replacement)
- ✅ Error handling for missing tools
- ❌ NOT actual tool execution (eslint, jscpd, tsc, etc.)

**See Also**: `.hodge/patterns/test-pattern.md` for examples

### Test Quality Anti-Patterns (HODGE-343)
**Enforcement: Build(encouraged) → Harden(expected) → Ship(required)**
**Reference**: `.hodge/review-profiles/testing/general-test-standards.md` for comprehensive guidance

#### Anti-Pattern 1: Method Existence Tests
**AVOID**: Tests that only verify a method exists - TypeScript already guarantees this.

```typescript
// ❌ BAD: TypeScript already validates this
it('should have required methods', () => {
  expect(manager.load).toBeDefined();
  expect(manager.save).toBeDefined();
  expect(manager.getFeature).toBeDefined();
});
```

**Why**: If the method doesn't exist, TypeScript compilation fails. These tests provide zero value and create maintenance burden.

**Alternative**: Test behavior instead:
```typescript
// ✅ GOOD: Test what the methods do
it('should persist and retrieve context', async () => {
  await manager.save({ feature: 'TEST-001' });
  const context = await manager.load();
  expect(context.feature).toBe('TEST-001');
});
```

#### Anti-Pattern 2: Implementation Detail Tests
**AVOID**: Tests that verify specific internal formats or mechanisms instead of behavior.

```typescript
// ❌ BAD: Tests internal ID format
it('should generate HODGE-001 format IDs', () => {
  const id = idManager.generateID();
  expect(id).toMatch(/^HODGE-\d{3}$/);
});
```

**Why**: This locks in implementation details. If we change to a different ID format, the test breaks even though behavior is correct.

**Alternative**: Test the contract/behavior:
```typescript
// ✅ GOOD: Tests uniqueness (the actual requirement)
it('should generate unique IDs', () => {
  const id1 = idManager.generateID();
  const id2 = idManager.generateID();
  expect(id1).not.toBe(id2);
});
```

#### Anti-Pattern 3: Vague Assertions
**AVOID**: Using `toBeDefined()`, `toBeTruthy()` when more specific matchers exist.

```typescript
// ❌ BAD: Vague assertion hides bugs
expect(config.port).toBeDefined(); // Could be 0, "", false
expect(data).toBeTruthy(); // What structure do we actually need?
```

**Alternative**: Use specific assertions:
```typescript
// ✅ GOOD: Specific assertions catch more bugs
expect(config.port).toBe(3000);
expect(data).toEqual({ id: 1, name: 'test' });
```

**See Also**:
- `.hodge/review-profiles/testing/general-test-standards.md` - Comprehensive test quality guidance
- `.hodge/patterns/test-pattern.md` - Test pattern examples

## File and Function Length Standards
**Enforcement: Build(suggested) → Harden(expected) → Ship(mandatory)**
**⚠️ CRITICAL**: Keep files and functions focused and maintainable through enforced size limits.

### Maximum File Length: 400 Lines
**Tool-Enforced**: ESLint (`max-lines`)

Files should not exceed 400 lines (excluding blank lines and comments).

**Rationale**:
- **Cognitive Load**: Files longer than 400 lines are harder to understand and navigate
- **Testability**: Large files often indicate too many responsibilities, making comprehensive testing difficult
- **Reviewability**: Code reviews become less effective when files exceed reviewable scope
- **Maintainability**: Changes to large files have higher risk of unintended side effects
- **Pragmatic Balance**: 400-line limit accommodates CLI orchestration patterns while still enforcing discipline

**Refactoring Guidance**:
- Extract service classes for business logic (move to `src/lib/`)
- Move shared utilities to common libraries
- Split by responsibility (Single Responsibility Principle)
- Consider if file is mixing orchestration with business logic

**Exemptions**:
- Test files (`*.test.ts`, `*.spec.ts`) - automatically excluded
- Generated code - add to ESLint ignore patterns if needed

### Maximum Function Length: 50 Lines
**Tool-Enforced**: ESLint (`max-lines-per-function`)

Functions should not exceed 50 lines (excluding blank lines and comments).

**Rationale**:
- **Single Responsibility**: Long functions often do too many things
- **Complexity Management**: Shorter functions are easier to reason about
- **Reusability**: Smaller functions are more likely to be reusable
- **Testing**: Functions under 50 lines are easier to test exhaustively

**Refactoring Guidance**:
- Extract helper functions for repeated logic
- Move complex conditionals to well-named predicates
- Break sequential operations into pipeline steps
- Consider if function is mixing levels of abstraction

**Exemptions**:
- Test files - automatically excluded (test cases may be longer for readability)

**Configuration**:
```json
// .eslintrc.json
"max-lines": ["warn", { "max": 400, "skipBlankLines": true, "skipComments": true }]
"max-lines-per-function": ["warn", { "max": 50, "skipBlankLines": true, "skipComments": true }]
```

**Progressive Enforcement**:
- **Build Phase**: Warnings shown, not blocking
- **Harden Phase**: Expected to be addressed, review required
- **Ship Phase**: Must be resolved or explicitly justified

## Code Comments and TODOs
**Enforcement: Build(suggested) → Harden(expected) → Ship(mandatory)**
- **TODO Convention**: Always use `// TODO:` comments for incomplete work
  - Format: `// TODO: [phase] description`
  - Examples:
    - `// TODO: Add error handling before ship`
    - `// TODO: Implement caching for performance`
    - `// TODO: Add tests in harden phase`
- **Phase Markers**: Include phase when relevant
  - `// TODO: [harden] Add integration tests`
  - `// TODO: [ship] Add proper error messages`
- **No Naked TODOs**: Always include what needs to be done
- **Review TODOs**: Check all TODOs before shipping

### Feature ID Comments for AI Development
**Enforcement: Build(suggested) → Harden(required) → Ship(mandatory)**

Use feature ID comments **strategically** to provide AI development context. AI lacks persistent memory between sessions, so comments serve as contextual breadcrumbs.

**DO use feature ID comments when:**
- ✅ Removing or deprecating functionality (explain what replaced it)
- ✅ Making architectural changes (connect to exploration/decisions)
- ✅ Implementing non-obvious patterns (reference pattern docs)
- ✅ The "why" is not clear from code alone

**DON'T use feature ID comments for:**
- ❌ New straightforward functions/methods
- ❌ Routine implementations following established patterns
- ❌ Every line touched during a feature
- ❌ Bug fixes (unless architectural)

**Format**:
```typescript
// HODGE-XXX: [Brief what/why - connects to exploration context]
```

**Examples**:

✅ **Good** - Explains removal and replacement:
```typescript
// HODGE-359.1: validation-results.json is now the source of truth
// quality-checks.md generation removed - AI reads structured JSON instead
```

✅ **Good** - Architectural change with context:
```typescript
// HODGE-341.2: Use registry-based detection for extensibility
// Replaces hardcoded tool list - see exploration.md for rationale
```

❌ **Bad** - Obvious from code:
```typescript
// HODGE-359.1: Added errorCount field
errorCount?: number;
```

❌ **Bad** - Routine implementation:
```typescript
// HODGE-XXX: Created new helper function
function formatDate(date: Date): string { ... }
```

**Why this differs from human development**:
- Humans have persistent memory of project context
- Git history provides temporal context for humans
- AI needs inline signposts to understand architectural evolution
- Comments help AI connect code to exploration documents

## Code Quality Gates
**Enforcement: Build(monitor) → Harden(warnings) → Ship(blocking)**
- No ESLint errors
- No TypeScript errors
- Test coverage >80% for shipped code
- Documentation for public APIs

## Performance Standards
**Enforcement: Build(monitor) → Harden(measure) → Ship(enforce)**
- CLI commands respond within 500ms
- Build completes within 30s
- Tests complete within 30s

## Progressive Enforcement

Standards are enforced progressively through the development phases:

### Explore Phase (Freedom)
- Standards are **suggestions only**
- Use `any` types freely
- Skip tests entirely
- Focus on proving concepts

### Build Phase (Structure Emerges)
- Standards **should** be followed
- Basic type safety
- Smoke tests required
- Error handling sketched

### Harden Phase (Discipline)
- Standards **must** be followed (warnings)
- Strict types required
- Integration tests required
- Comprehensive error handling

### Ship Phase (Production)
- Standards **strictly enforced** (blocking)
- All quality gates must pass
- Full test coverage required
- Performance benchmarks met

---
*Standards are enforced during harden and ship phases.*
*For implementation examples, see `.hodge/patterns/`*