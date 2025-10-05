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

### Test Isolation Requirement
**Enforcement: ALL PHASES (mandatory)**
**⚠️ CRITICAL**: Tests must NEVER modify the Hodge project's own `.hodge` directory.
- All tests must use temporary directories (`os.tmpdir()`) for file operations
- Use mocks or stubs instead of modifying actual project state
- Any test that needs a `.hodge` structure should create it in an isolated temp directory
- This prevents tests from corrupting project data or affecting other tests
- Violation of this rule can lead to data loss and unpredictable test behavior

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