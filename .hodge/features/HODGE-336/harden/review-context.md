# REVIEW CONTEXT - PRECEDENCE RULES

The following context is loaded for this review. **CRITICAL**: Project-specific
files (.hodge/standards.md, principles.md, decisions.md, patterns) take PRECEDENCE
over reusable profiles. If there is ANY conflict between project standards and
profile recommendations, the PROJECT STANDARD wins. Always defer to project standards.

⚠️ **MISSING PROFILES**:
- languages/javascript-es2020+.md (listed in review-config.md but file does not exist)
- languages/typescript-5.x.md (listed in review-config.md but file does not exist)
- testing/vitest-1.x.md (listed in review-config.md but file does not exist)

Continuing review with available profiles...

## Project Context (HIGHEST PRECEDENCE)

### Project Standards (.hodge/standards.md)

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

### Project Principles (.hodge/principles.md)

# Hodge Development Principles

These principles guide how we build software using the Hodge framework.

## Core Philosophy

> "Freedom to explore, discipline to ship"

Software development is a journey from uncertainty to confidence. Hodge provides a structured path that respects both creative exploration and production discipline.

## Standards Enforcement Guide

### Understanding Enforcement Notation

Standards in `.hodge/standards.md` use enforcement metadata headers to indicate when they apply:

- **`Build(suggested)`** - Nice to have, helps maintain consistency
- **`Harden(required)`** - Should be followed, warnings if not met
- **`Ship(mandatory)`** - Must be followed, blocks shipping if violated
- **`ALL PHASES (mandatory)`** - Critical standards that always apply

Examples:
- `**Enforcement: Build(suggested) → Harden(required) → Ship(mandatory)**` - Progressive
- `**Enforcement: ALL PHASES (mandatory)**` - Always required
- `**Enforcement: Ship(mandatory)**` - Only enforced when shipping

### AI Interpretation

When working in each phase, AI assistants should:

1. **Explore Phase**: Ignore most standards, focus on exploration
2. **Build Phase**: Consider standards marked as `Build(suggested)` or stronger
3. **Harden Phase**: Enforce standards marked as `Harden(required)` or stronger
4. **Ship Phase**: Block on any `Ship(mandatory)` violations

## The Five Principles

### 1. Progressive Enhancement 📈
**Standards tighten as code matures**

- Start loose, end tight
- Quality gates match development phase
- Technical debt is temporary, not permanent
- Refactoring is expected, not exceptional

*In practice:*
```typescript
// Explore: This is fine
function processData(data: any) {
  return data.items.map(x => x.value);
}

// Ship: This is required
function processData(data: ValidatedInput): ProcessedOutput[] {
  return data.items
    .filter(isValidItem)
    .map(transformItem)
    .filter(meetsBusinessRules);
}
```

### 2. Behavior-Focused Testing 🎯
**Test what users see, not how it works**

- Test the contract, not the implementation
- Mock boundaries, not internals
- Integration > Unit tests
- User stories drive test cases

*In practice:*
```typescript
// ❌ Implementation-focused
it('should set internal state to PROCESSING', () => {
  expect(service.state).toBe('PROCESSING');
});

// ✅ Behavior-focused
it('should process order and send confirmation email', async () => {
  const order = await service.processOrder(validOrder);
  expect(order.status).toBe('confirmed');
  expect(emailsSent).toContain(order.confirmationEmail);
});
```

### 3. Learn from Success 🎓
**Extract patterns from shipped code**

- Patterns emerge, they're not prescribed
- Success should be repeatable
- Failed experiments are learning opportunities
- Share what works, forget what doesn't

*In practice:*
- Ship a feature successfully
- Run `hodge learn` to extract patterns
- Reuse patterns in next feature
- Evolve patterns based on usage

### 4. Pragmatic Quality 🎚️
**Quality gates that make sense**

- Perfect is the enemy of shipped
- Quality is contextual, not absolute
- Measure what matters
- Automate what's repetitive

*Quality by Phase:*
| Phase | Quality Focus |
|-------|--------------|
| Explore | Does it work? |
| Build | Is it maintainable? |
| Harden | Is it reliable? |
| Ship | Is it production-ready? |

### 5. Transparent Progress 📊
**Make development state visible**

- Code's phase should be obvious
- Decisions should be documented
- Progress should be measurable
- Problems should surface early

*In practice:*
- Feature branches show phase: `explore/feature`, `build/feature`, etc.
- Comments mark temporary code: `// TODO: Harden this before ship`
- Dashboards show phase metrics
- Stand-ups discuss phase transitions

### 6. Structured Flexibility 🔄
**Balance framework structure with conversational discovery**

The framework balances structure with conversational discovery:

**Structure Provides**:
- Standards that define quality gates
- Progressive phases that build discipline
- Test requirements that ensure reliability
- Patterns that guide implementation

**Conversation Enables**:
- Discovery of missing requirements
- Course correction during implementation
- Natural iteration and refinement
- Flexible response to complexity

**The Balance**: Neither alone is sufficient. Structure without conversation becomes rigid and brittle. Conversation without structure becomes chaotic and inconsistent. Together they create "flexible discipline" - freedom to explore within guardrails that ensure quality.

**In Practice**: When implementing a feature:
- Start with the structured plan (exploration → decision → build → harden → ship)
- Allow conversation to discover gaps and opportunities
- Update the plan based on discoveries
- Maintain standards throughout

*This principle emerged from HODGE-333.4, where a clear 4-phase plan coexisted with conversational discovery of missing functionality (review report generation). The structure guided without constraining.*

## Hodge-Specific Architectural Principles

### 1. AI-Backend Separation
- **AI (Claude) Role**: Intellectual work - analysis, extraction, design, proposals
- **Backend (hodge) Role**: Operational work - file creation, PM updates, Git operations
- **Interface**: Clear command boundaries with well-defined inputs/outputs

### 2. Data Transfer Patterns
- **Simple Data**: CLI arguments for basic strings and flags
- **Complex Data**: File-based transfer through `.hodge/tmp/`
- **Structured Data**: YAML/JSON specifications for rich metadata
- **Preservation**: Spec files are historical artifacts, not temporary files

### 3. Template Abstraction
- **Principle**: Templates guide conversation flow, not implementation details
- **Good**: "Create the feature: `hodge explore feature --from-spec file.yaml`"
- **Bad**: "This will create directories X, Y, update file Z..."
- **Rule**: Treat hodge commands as black-box services

### 4. Context Preservation
- **Capture the Why**: Document rationale for decisions and groupings
- **Rich Metadata**: Preserve AI analysis (scope, dependencies, effort estimates)
- **Feature Specs**: Complete context from extraction to implementation

### 5. Progressive Development
- **Explore**: Freedom to experiment, minimal constraints
- **Build**: Balanced approach, should follow standards
- **Harden**: Strict enforcement, must meet quality gates
- **Ship**: Production ready, all requirements met

## Applied Principles

### For Individual Developers

1. **Start messy, finish clean**
   - Don't optimize prematurely
   - Refactor when patterns emerge
   - Clean up before shipping

2. **Test what matters**
   - Skip tests during exploration
   - Add tests when design stabilizes
   - Full coverage before production

3. **Learn continuously**
   - Extract patterns from your wins
   - Document your decisions
   - Share your discoveries

### For Teams

1. **Align on phase**
   - Agree on current phase
   - Set phase transition criteria
   - Review phase appropriateness

2. **Share patterns**
   - Extract team patterns regularly
   - Document pattern usage
   - Evolve patterns together

3. **Communicate progress**
   - Make phase visible in PRs
   - Discuss quality expectations
   - Celebrate phase transitions

### For Organizations

1. **Standardize progressively**
   - Organization standards for ship phase
   - Team standards for harden phase
   - Individual standards for explore/build

2. **Measure phase metrics**
   - Time in each phase
   - Defect rates by phase
   - Velocity by phase

3. **Invest in tooling**
   - Automate phase transitions
   - Generate phase reports
   - Alert on phase violations

## Implementation Patterns

### File-Based Feature Extraction
```yaml
# Spec file preserves all AI analysis
version: "1.0"
feature:
  name: "feature-name"
  description: "What and why"
  rationale: "Why these pieces belong together"
  scope:
    included: ["what's in"]
    excluded: ["what's out"]
```

### Command Interface Design
- **Single Purpose**: Each command does one thing well
- **Progressive Options**: Simple cases easy, complex cases possible
- **Backward Compatible**: New approaches don't break old workflows

## Living Principles

These principles evolve based on:
- Team feedback
- Project outcomes
- Technology changes
- Business needs

Review quarterly and adjust based on what you learn.

## Anti-Patterns to Avoid

### 🚫 Premature Optimization
Applying ship-phase standards during exploration

### 🚫 Test Theater
Writing tests that don't actually verify behavior

### 🚫 Pattern Prescription
Forcing patterns before they've proven valuable

### 🚫 Quality Gate Gaming
Manipulating metrics instead of improving quality

### 🚫 Phase Skipping
Jumping from explore to ship without building and hardening

### 🚫 Tight Coupling
Templates depending on implementation details

### 🚫 Context Loss
Generic templates instead of rich, specific content

### 🚫 Auto-Deletion
Removing audit trail and debugging information

### 🚫 Pattern Matching in Code
Trying to implement what AI does better

### 🚫 Exposing Internals
Documenting backend mechanics in user-facing templates

## Questions for Reflection

Ask yourself regularly:

1. **Am I in the right phase?**
   - Too much structure in explore?
   - Too little structure in harden?

2. **Am I testing effectively?**
   - Testing behavior or implementation?
   - Right amount for current phase?

3. **Am I learning from success?**
   - Extracting patterns from wins?
   - Sharing knowledge with team?

4. **Is quality appropriate?**
   - Over-engineering in explore?
   - Under-engineering in ship?

5. **Is progress visible?**
   - Team knows current phase?
   - Decisions are documented?

---

*Principles guide but don't dictate. Use judgment and adjust as needed.*

### Project Decisions (.hodge/decisions.md)

# Architecture Decisions

This file tracks key architectural and technical decisions made during development.

## Decision Template

### [Date] - Decision Title

**Status**: Proposed | Accepted | Deprecated | Superseded

**Context**: 
Describe the context and problem that led to this decision.

**Decision**: 
State the decision clearly.

**Rationale**: 
Explain why this decision was made, considering alternatives.

**Consequences**: 
List the positive and negative consequences of this decision.

---

## Decisions

<!-- Add your decisions below -->

### 2025-10-02 - Error if --feature directory doesn't exist - provides clear feedback to user, prevents typos in feature names, encourages proper workflow (run /explore before /decide), aligns with discipline principle

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Error if --feature directory doesn't exist - provides clear feedback to user, prevents typos in feature names, encourages proper workflow (run /explore before /decide), aligns with discipline principle

**Rationale**:
Recorded via `hodge decide` command at 10:40:22 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - No migration - leave existing decision

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
No migration - leave existing decision.md files as-is - keeps implementation simple, no risk to existing data, new decisions will use correct decisions.md filename going forward, minor naming inconsistency in old features is acceptable for internal tool

**Rationale**:
Recorded via `hodge decide` command at 10:38:58 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Append decisions to accumulate in one file - multiple decisions for same feature build up in decisions

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Append decisions to accumulate in one file - multiple decisions for same feature build up in decisions.md providing complete decision history and making it easy to review evolution, matches global decisions.md behavior

**Rationale**:
Recorded via `hodge decide` command at 10:35:29 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Use same template format as global decisions

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Use same template format as global decisions.md for feature decisions.md - provides consistent mental model across all decision files, makes them easy to review and parse, future-proof for any tooling that processes decisions

**Rationale**:
Recorded via `hodge decide` command at 10:34:44 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Structure PM issue description with Problem Statement above Decisions Made - extract problem statement from exploration

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Structure PM issue description with Problem Statement above Decisions Made - extract problem statement from exploration.md and place before decisions list in formatDecisionsForPM() to provide context before implementation details

**Rationale**:
Recorded via `hodge decide` command at 5:44:12 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Make Title field required for new explorations only - /explore template must generate Title field, existing features without Title continue using fallback patterns, no validation failure just ensures AI generates it for new explorations

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Make Title field required for new explorations only - /explore template must generate Title field, existing features without Title continue using fallback patterns, no validation failure just ensures AI generates it for new explorations

**Rationale**:
Recorded via `hodge decide` command at 5:41:14 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - AI-generated title field in exploration

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
AI-generated title field in exploration.md - enhance /explore template to generate 'Title: <short description>' field, CLI extracts title first then falls back to existing patterns, truncate at 100 chars with word boundary if needed

**Rationale**:
Recorded via `hodge decide` command at 5:39:41 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Use 'No description available' fallback only when genuinely no content exists - no exploration

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Use 'No description available' fallback only when genuinely no content exists - no exploration.md AND no decisions, or all extraction patterns fail with no decisions available

**Rationale**:
Recorded via `hodge decide` command at 5:33:19 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Fix exploration

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Fix exploration.md regex patterns to match both '## Problem Statement' heading format and '**Problem Statement:**' inline format, keep decisions as distant fallback only

**Rationale**:
Recorded via `hodge decide` command at 5:32:27 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Smart Description Extraction approach - enhance getFeatureDescription() to extract from decisions automatically when exploration

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Smart Description Extraction approach - enhance getFeatureDescription() to extract from decisions automatically when exploration.md doesn't exist, maintains workflow speed and leverages decision context

**Rationale**:
Recorded via `hodge decide` command at 5:27:21 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - No backward compatibility concerns - This is a bug fix not a feature change, no evidence of dependencies on incorrect behavior, proceed with fix directly

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
No backward compatibility concerns - This is a bug fix not a feature change, no evidence of dependencies on incorrect behavior, proceed with fix directly

**Rationale**:
Recorded via `hodge decide` command at 9:09:24 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Update /hodge template with clarification - Add note in

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Update /hodge template with clarification - Add note in .claude/commands/hodge.md explaining that /hodge shows last worked feature status, sets correct user expectations

**Rationale**:
Recorded via `hodge decide` command at 9:08:50 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Skip --project flag for now - Don't add hodge context --project flag in this fix, keeps scope minimal and focused on bug fix, can add later if users request it

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Skip --project flag for now - Don't add hodge context --project flag in this fix, keeps scope minimal and focused on bug fix, can add later if users request it

**Rationale**:
Recorded via `hodge decide` command at 9:08:05 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - No staleness check for sessions - Always use session feature for mode detection regardless of age, keeps implementation simple, user can manually start new work if needed

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
No staleness check for sessions - Always use session feature for mode detection regardless of age, keeps implementation simple, user can manually start new work if needed

**Rationale**:
Recorded via `hodge decide` command at 9:07:34 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Use session feature for mode detection - Load session first in loadDefaultContext(), use session

**Status**: Accepted

**Context**:
Feature: HODGE-313

**Decision**:
Use session feature for mode detection - Load session first in loadDefaultContext(), use session?.feature || 'general' for HodgeMDGenerator.saveToFile() instead of hardcoded 'general', fixes mode detection mismatch

**Rationale**:
Recorded via `hodge decide` command at 9:06:56 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Write feature decisions to feature-specific decision

**Status**: Accepted

**Context**:
Feature: HODGE-312

**Decision**:
Write feature decisions to feature-specific decision.md only (when --feature flag provided) - feature decisions belong in .hodge/features/{feature}/decision.md for context locality, global decisions.md reserved for project-wide architectural decisions, important feature insights promoted to global during /ship lessons analysis

**Rationale**:
Recorded via `hodge decide` command at 6:43:46 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Add 'Shipped' as separate progress line (6th checkbox) - provides clear progression through all stages: Exploration → Decision → Build → Harden → Production Ready → Shipped

**Status**: Accepted

**Context**:
Feature: HODGE-312

**Decision**:
Add 'Shipped' as separate progress line (6th checkbox) - provides clear progression through all stages: Exploration → Decision → Build → Harden → Production Ready → Shipped

**Rationale**:
Recorded via `hodge decide` command at 6:33:50 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Use ship-record

**Status**: Accepted

**Context**:
Feature: HODGE-312

**Decision**:
Use ship-record.json as completion marker - reliably created by hodge ship command, contains ship metadata, no external dependencies required

**Rationale**:
Recorded via `hodge decide` command at 6:32:48 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Check feature root for decision

**Status**: Accepted

**Context**:
Feature: HODGE-312

**Decision**:
Check feature root for decision.md - matches current file structure where decision.md is stored at features/{feature}/decision.md, not in explore/ subdirectory

**Rationale**:
Recorded via `hodge decide` command at 6:32:11 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Use 'shipped' as mode name for completed features - matches existing phase terminology and natural past tense of ship phase

**Status**: Accepted

**Context**:
Feature: HODGE-312

**Decision**:
Use 'shipped' as mode name for completed features - matches existing phase terminology and natural past tense of ship phase

**Rationale**:
Recorded via `hodge decide` command at 6:31:20 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Apply HODGE-311 logic to status command - port the exact same shipped-detection logic from hodge-md-generator

**Status**: Accepted

**Context**:
Feature: HODGE-312

**Decision**:
Apply HODGE-311 logic to status command - port the exact same shipped-detection logic from hodge-md-generator.ts into status.ts for consistent detection logic, fixes both bugs in one change with proven working code

**Rationale**:
Recorded via `hodge decide` command at 6:30:20 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Use ship/ship-record

**Status**: Accepted

**Context**:
Feature: HODGE-311

**Decision**:
Use ship/ship-record.json file presence as completion marker - reliably created by hodge ship command, contains ship metadata, no external dependencies required

**Rationale**:
Recorded via `hodge decide` command at 6:12:37 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Keep shipped features visible in HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-311

**Decision**:
Keep shipped features visible in HODGE.md with 'shipped' status - defer filtering logic to future issue, maintains minimal scope for HODGE-311 while preserving feature history

**Rationale**:
Recorded via `hodge decide` command at 6:11:28 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Next steps for shipped features: 'Feature completed

**Status**: Accepted

**Context**:
Feature: HODGE-311

**Decision**:
Next steps for shipped features: 'Feature completed. Start new work with hodge explore <feature>' - provides clear completion message and guides users to appropriate next action

**Rationale**:
Recorded via `hodge decide` command at 6:10:25 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-01 - Use 'shipped' as mode name for completed features - matches existing phase terminology and natural past tense of ship phase

**Status**: Accepted

**Context**:
Feature: HODGE-311

**Decision**:
Use 'shipped' as mode name for completed features - matches existing phase terminology and natural past tense of ship phase

**Rationale**:
Recorded via `hodge decide` command at 6:09:41 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Skip backward compatibility audit - only build

**Status**: Accepted

**Context**:
Feature: HODGE-309

**Decision**:
Skip backward compatibility audit - only build.md uses this pattern (confirmed via grep), pattern documentation will prevent future issues, focus on shipping the fix

**Rationale**:
Recorded via `hodge decide` command at 12:35:25 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Document PM mapping check pattern in

**Status**: Accepted

**Context**:
Feature: HODGE-309

**Decision**:
Document PM mapping check pattern in .hodge/patterns/ - create reusable pattern for checking externalID presence, helps future AI assistants and other slash commands maintain consistency

**Rationale**:
Recorded via `hodge decide` command at 12:34:38 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Add smoke test for bash command logic to verify grep pattern correctly identifies externalID presence/absence - tests command syntax in isolation, provides regression protection for template changes

**Status**: Accepted

**Context**:
Feature: HODGE-309

**Decision**:
Add smoke test for bash command logic to verify grep pattern correctly identifies externalID presence/absence - tests command syntax in isolation, provides regression protection for template changes

**Rationale**:
Recorded via `hodge decide` command at 12:34:03 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Use enhanced grep pattern for PM check: grep -A 2 "{{feature}}" | grep externalID - maintains template-only approach from HODGE-306, one-line fix in build

**Status**: Accepted

**Context**:
Feature: HODGE-309

**Decision**:
Use enhanced grep pattern for PM check: grep -A 2 "{{feature}}" | grep externalID - maintains template-only approach from HODGE-306, one-line fix in build.md

**Rationale**:
Recorded via `hodge decide` command at 12:30:57 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Move test file now during build phase to establish correct pattern immediately and prevent proliferation

**Status**: Accepted

**Context**:
Feature: HODGE-307

**Decision**:
Move test file now during build phase to establish correct pattern immediately and prevent proliferation

**Rationale**:
Recorded via `hodge decide` command at 12:09:26 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Defer testing other command templates to future work - focus HODGE-307 on migrating existing build

**Status**: Accepted

**Context**:
Feature: HODGE-307

**Decision**:
Defer testing other command templates to future work - focus HODGE-307 on migrating existing build.smoke.test.ts only to establish pattern

**Rationale**:
Recorded via `hodge decide` command at 12:08:47 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Name the test file claude-commands

**Status**: Accepted

**Context**:
Feature: HODGE-307

**Decision**:
Name the test file claude-commands.smoke.test.ts to match existing claude-commands.ts sync script and allow future expansion for other command template tests

**Rationale**:
Recorded via `hodge decide` command at 12:08:12 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Move build

**Status**: Accepted

**Context**:
Feature: HODGE-307

**Decision**:
Move build.smoke.test.ts to src/lib/claude-commands.smoke.test.ts for consistency with existing 23 smoke tests

**Rationale**:
Recorded via `hodge decide` command at 12:07:12 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Proceed with build anyway if user ignores PM creation prompt (non-blocking) - respects user agency, maintains 'freedom to explore' principle, never forces workflow interruption

**Status**: Accepted

**Context**:
Feature: HODGE-306

**Decision**:
Proceed with build anyway if user ignores PM creation prompt (non-blocking) - respects user agency, maintains 'freedom to explore' principle, never forces workflow interruption

**Rationale**:
Recorded via `hodge decide` command at 7:13:49 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Show PM creation prompt every time /build is called without PM mapping - ensures prompt isn't missed, respects user agency to change mind, simple non-blocking logic without state tracking

**Status**: Accepted

**Context**:
Feature: HODGE-306

**Decision**:
Show PM creation prompt every time /build is called without PM mapping - ensures prompt isn't missed, respects user agency to change mind, simple non-blocking logic without state tracking

**Rationale**:
Recorded via `hodge decide` command at 7:11:04 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Reuse /plan command for single-issue creation - AI generates minimal single-issue plan when user responds affirmatively to PM creation prompt, maintaining consistent command API without new flags

**Status**: Accepted

**Context**:
Feature: HODGE-306

**Decision**:
Reuse /plan command for single-issue creation - AI generates minimal single-issue plan when user responds affirmatively to PM creation prompt, maintaining consistent command API without new flags

**Rationale**:
Recorded via `hodge decide` command at 7:10:09 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Check for PM issue mapping before calling 'hodge build' CLI command - AI checks id-mappings

**Status**: Accepted

**Context**:
Feature: HODGE-306

**Decision**:
Check for PM issue mapping before calling 'hodge build' CLI command - AI checks id-mappings.json early in /build template execution, allowing user to create PM issue before work starts

**Rationale**:
Recorded via `hodge decide` command at 7:09:38 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Use Template-Based Prompt Enhancement approach - add AI guidance to

**Status**: Accepted

**Context**:
Feature: HODGE-306

**Decision**:
Use Template-Based Prompt Enhancement approach - add AI guidance to .claude/commands/build.md that instructs AI to check for PM issue mappings and offer to create one if missing, with zero code changes

**Rationale**:
Recorded via `hodge decide` command at 7:08:56 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Update both /hodge and /load commands with enhanced context loading - provides consistent experience and predictable behavior across the system

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Update both /hodge and /load commands with enhanced context loading - provides consistent experience and predictable behavior across the system

**Rationale**:
Recorded via `hodge decide` command at 9:30:09 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Load all

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Load all .md and .json files in current phase directory - supports custom files and flexible workflows while maintaining comprehensive context

**Rationale**:
Recorded via `hodge decide` command at 9:29:43 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Keep current pattern loading behavior - load only on explicit reference or user request, following AI-CONTEXT

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Keep current pattern loading behavior - load only on explicit reference or user request, following AI-CONTEXT.md design principles

**Rationale**:
Recorded via `hodge decide` command at 9:29:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Load id-mappings

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Load id-mappings.json only when feature has linked PM issue - provides contextual PM tracking without unnecessary overhead

**Rationale**:
Recorded via `hodge decide` command at 9:28:40 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Load recent 20 decisions instead of full 1100+ line history - balances context completeness with performance

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Load recent 20 decisions instead of full 1100+ line history - balances context completeness with performance

**Rationale**:
Recorded via `hodge decide` command at 9:27:53 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Extensive template documentation - Add vertical slice criteria, good/bad examples, and decision trees to

**Status**: Accepted

**Context**:
Feature: HODGE-301

**Decision**:
Extensive template documentation - Add vertical slice criteria, good/bad examples, and decision trees to .claude/commands/plan.md

**Rationale**:
Recorded via `hodge decide` command at 9:06:26 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - AI validation during plan generation only with mandatory user approval - AI warns during plan generation, but ALL plans require explicit user approval before hodge plan CLI is called (this is already enforced by /plan command architecture)

**Status**: Accepted

**Context**:
Feature: HODGE-301

**Decision**:
AI validation during plan generation only with mandatory user approval - AI warns during plan generation, but ALL plans require explicit user approval before hodge plan CLI is called (this is already enforced by /plan command architecture)

**Rationale**:
Recorded via `hodge decide` command at 9:06:26 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Auto-convert to single issue when vertical slicing fails - System automatically suggests single issue when stories cannot meet vertical slice criteria

**Status**: Accepted

**Context**:
Feature: HODGE-301

**Decision**:
Auto-convert to single issue when vertical slicing fails - System automatically suggests single issue when stories cannot meet vertical slice criteria

**Rationale**:
Recorded via `hodge decide` command at 9:06:26 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Moderate vertical slice criteria - Stories must provide value to stakeholder AND be independently testable

**Status**: Accepted

**Context**:
Feature: HODGE-301

**Decision**:
Moderate vertical slice criteria - Stories must provide value to stakeholder AND be independently testable

**Rationale**:
Recorded via `hodge decide` command at 9:06:26 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - Warn only validation strictness - Provide informational warnings about potential horizontal slicing without blocking plan generation

**Status**: Accepted

**Context**:
Feature: HODGE-301

**Decision**:
Warn only validation strictness - Provide informational warnings about potential horizontal slicing without blocking plan generation

**Rationale**:
Recorded via `hodge decide` command at 9:06:26 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-30 - AI-Driven Design Only - Enhance the /plan command template to explicitly guide AI through vertical slice design, with clear criteria and examples

**Status**: Accepted

**Context**:
Feature: HODGE-301

**Decision**:
AI-Driven Design Only - Enhance the /plan command template to explicitly guide AI through vertical slice design, with clear criteria and examples

**Rationale**:
Recorded via `hodge decide` command at 9:06:25 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Interactive prompt with session memory for skip mechanism - respects user choice while encouraging best practices

**Status**: Accepted

**Context**:
Feature: HODGE-299

**Decision**:
Interactive prompt with session memory for skip mechanism - respects user choice while encouraging best practices

**Rationale**:
Recorded via `hodge decide` command at 1:41:28 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Use {FEATURE}-{slug}

**Status**: Accepted

**Context**:
Feature: HODGE-299

**Decision**:
Use {FEATURE}-{slug}.md naming for finalized lessons (e.g., HODGE-299-lessons-workflow.md) - provides clear feature association and discoverability

**Rationale**:
Recorded via `hodge decide` command at 1:41:28 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Keep lessons-draft

**Status**: Accepted

**Context**:
Feature: HODGE-299

**Decision**:
Keep lessons-draft.md after finalization - preserve audit trail and enable comparison

**Rationale**:
Recorded via `hodge decide` command at 1:41:28 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Few questions (3-4) for lessons enhancement - balance insight gathering with low friction

**Status**: Accepted

**Context**:
Feature: HODGE-299

**Decision**:
Few questions (3-4) for lessons enhancement - balance insight gathering with low friction

**Rationale**:
Recorded via `hodge decide` command at 1:41:28 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Interactive AI Enhancement Flow - integrate lessons review into /ship command with AI-guided questions and skip option

**Status**: Accepted

**Context**:
Feature: HODGE-299

**Decision**:
Interactive AI Enhancement Flow - integrate lessons review into /ship command with AI-guided questions and skip option

**Rationale**:
Recorded via `hodge decide` command at 1:41:28 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Use HODGE-XXX

**Status**: Accepted

**Context**:
Feature: HODGE-298

**Decision**:
Use HODGE-XXX.Y: Description format for story titles - provides clear parent-child relationship and explicit hierarchy at a glance

**Rationale**:
Recorded via `hodge decide` command at 12:29:38 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Breaking change: require --create-pm flag for PM issue creation - safe by default, with understanding that hodge plan is only called from /plan slash command template, never by users directly

**Status**: Accepted

**Context**:
Feature: HODGE-298

**Decision**:
Breaking change: require --create-pm flag for PM issue creation - safe by default, with understanding that hodge plan is only called from /plan slash command template, never by users directly

**Rationale**:
Recorded via `hodge decide` command at 12:28:48 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - List decision titles only in PM issues - provides scannable overview while keeping full details in decisions

**Status**: Accepted

**Context**:
Feature: HODGE-298

**Decision**:
List decision titles only in PM issues - provides scannable overview while keeping full details in decisions.md for reference

**Rationale**:
Recorded via `hodge decide` command at 12:22:21 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Extract epic description from exploration

**Status**: Accepted

**Context**:
Feature: HODGE-298

**Decision**:
Extract epic description from exploration.md Problem Statement or Feature Overview - provides descriptive context in PM tool automatically

**Rationale**:
Recorded via `hodge decide` command at 12:21:42 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Interactive approval in /plan slash command - AI generates and refines plan with user, then calls 'hodge plan' CLI with --create-pm only after approval

**Status**: Accepted

**Context**:
Feature: HODGE-298

**Decision**:
Interactive approval in /plan slash command - AI generates and refines plan with user, then calls 'hodge plan' CLI with --create-pm only after approval

**Rationale**:
Recorded via `hodge decide` command at 12:21:05 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Update both /hodge and /load commands with enhanced context loading - provides consistent experience and predictable behavior across the system

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Update both /hodge and /load commands with enhanced context loading - provides consistent experience and predictable behavior across the system

**Rationale**:
Recorded via `hodge decide` command at 11:49:06 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Load all

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Load all .md and .json files in current phase directory - supports custom files and flexible workflows while maintaining comprehensive context

**Rationale**:
Recorded via `hodge decide` command at 11:48:18 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Keep current pattern loading behavior - load only on explicit reference or user request, following AI-CONTEXT

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Keep current pattern loading behavior - load only on explicit reference or user request, following AI-CONTEXT.md design principles

**Rationale**:
Recorded via `hodge decide` command at 11:47:50 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Load id-mappings

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Load id-mappings.json only when feature has linked PM issue - provides contextual PM tracking without unnecessary overhead

**Rationale**:
Recorded via `hodge decide` command at 11:42:36 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Load recent 20 decisions instead of full 1100+ line history - balances context completeness with performance

**Status**: Accepted

**Context**:
Feature: HODGE-297

**Decision**:
Load recent 20 decisions instead of full 1100+ line history - balances context completeness with performance

**Rationale**:
Recorded via `hodge decide` command at 11:41:34 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 7:49:19 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 7:48:52 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 7:48:11 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 7:48:04 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 7:45:47 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 7:45:31 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 7:26:30 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic for authentication

**Status**: Accepted

**Context**:
Feature: TEST-001

**Decision**:
Create epic for authentication

**Rationale**:
Recorded via `hodge decide` command at 1:11:33 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - HODGE-296 decisions complete: PM issues created after decide, with parent/child tracking and queued retry on failures

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
HODGE-296 decisions complete: PM issues created after decide, with parent/child tracking and queued retry on failures

**Rationale**:
Recorded via `hodge decide` command at 9:36:13 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Support flexible mapping when syncing existing Linear epics to adapt to various structures

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Support flexible mapping when syncing existing Linear epics to adapt to various structures

**Rationale**:
Recorded via `hodge decide` command at 9:36:06 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Rollback all on partial epic creation failure then queue entire epic for retry to maintain consistency

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Rollback all on partial epic creation failure then queue entire epic for retry to maintain consistency

**Rationale**:
Recorded via `hodge decide` command at 9:34:03 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Queue PM issue creation for later if service unavailable during decide phase to maintain workflow continuity

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Queue PM issue creation for later if service unavailable during decide phase to maintain workflow continuity

**Rationale**:
Recorded via `hodge decide` command at 9:33:14 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Add decisions to PM issues as comments, with initial creation including all decisions from decide phase

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Add decisions to PM issues as comments, with initial creation including all decisions from decide phase

**Rationale**:
Recorded via `hodge decide` command at 9:32:33 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Track parent/child relationships in enhanced id-mappings

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Track parent/child relationships in enhanced id-mappings.json with hierarchy structure for single source of truth

**Rationale**:
Recorded via `hodge decide` command at 9:31:24 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Never create PM issues for undecided features - only features that complete the decide phase get PM issues

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Never create PM issues for undecided features - only features that complete the decide phase get PM issues

**Rationale**:
Recorded via `hodge decide` command at 9:30:40 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create Linear issues after decide phase completes when full context and structure are known

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Create Linear issues after decide phase completes when full context and structure are known

**Rationale**:
Recorded via `hodge decide` command at 9:27:47 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Atomic epic creation must gracefully degrade for PM tools that don't support it - create what's possible and track locally

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Atomic epic creation must gracefully degrade for PM tools that don't support it - create what's possible and track locally

**Rationale**:
Recorded via `hodge decide` command at 9:27:18 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Use HODGE-XXX

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Use HODGE-XXX.Y format for sub-issues (e.g., HODGE-300.1) to maintain clear parent-child hierarchy

**Rationale**:
Recorded via `hodge decide` command at 9:27:11 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Create epic and all sub-issues atomically to ensure consistent state and prevent partial failures

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Create epic and all sub-issues atomically to ensure consistent state and prevent partial failures

**Rationale**:
Recorded via `hodge decide` command at 9:24:48 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Determine epic vs single issue during decide phase based on actual decisions made

**Status**: Accepted

**Context**:
Feature: HODGE-296

**Decision**:
Determine epic vs single issue during decide phase based on actual decisions made

**Rationale**:
Recorded via `hodge decide` command at 9:24:16 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Performance threshold: 5 seconds maximum - reasonable wait time allowing thorough checks with balanced user experience

**Status**: Accepted

**Context**:
Feature: HODGE-295

**Decision**:
Performance threshold: 5 seconds maximum - reasonable wait time allowing thorough checks with balanced user experience

**Rationale**:
Recorded via `hodge decide` command at 6:14:21 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Prettier scope: check all files - ensures consistent formatting across entire codebase matching CI behavior

**Status**: Accepted

**Context**:
Feature: HODGE-295

**Decision**:
Prettier scope: check all files - ensures consistent formatting across entire codebase matching CI behavior

**Rationale**:
Recorded via `hodge decide` command at 6:14:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Override mechanism: respect standard --no-verify flag - familiar to developers and follows Git conventions

**Status**: Accepted

**Context**:
Feature: HODGE-295

**Decision**:
Override mechanism: respect standard --no-verify flag - familiar to developers and follows Git conventions

**Rationale**:
Recorded via `hodge decide` command at 6:14:09 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - npm audit cache duration: 24 hours - daily freshness with good performance balance

**Status**: Accepted

**Context**:
Feature: HODGE-295

**Decision**:
npm audit cache duration: 24 hours - daily freshness with good performance balance

**Rationale**:
Recorded via `hodge decide` command at 6:14:03 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Audit level: moderate - matching GitHub Actions for consistency between local and CI checks

**Status**: Accepted

**Context**:
Feature: HODGE-295

**Decision**:
Audit level: moderate - matching GitHub Actions for consistency between local and CI checks

**Rationale**:
Recorded via `hodge decide` command at 6:13:58 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Protected branches for strict checks: main, develop, release/*, hotfix/* - comprehensive coverage of production-bound branches

**Status**: Accepted

**Context**:
Feature: HODGE-295

**Decision**:
Protected branches for strict checks: main, develop, release/*, hotfix/* - comprehensive coverage of production-bound branches

**Rationale**:
Recorded via `hodge decide` command at 6:13:53 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-29 - Smart Selective Checks approach for pre-push hooks - intelligent checks based on context with caching for performance

**Status**: Accepted

**Context**:
Feature: HODGE-295

**Decision**:
Smart Selective Checks approach for pre-push hooks - intelligent checks based on context with caching for performance

**Rationale**:
Recorded via `hodge decide` command at 6:08:59 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-27 - Console output only for init command - preserves user feedback for interactive initialization while keeping other commands silent for Claude Code execution

**Status**: Accepted

**Context**:
Feature: HODGE-291

**Decision**:
Console output only for init command - preserves user feedback for interactive initialization while keeping other commands silent for Claude Code execution

**Rationale**:
Recorded via `hodge decide` command at 7:45:51 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-27 - Default log level set to INFO - captures command flow and important events without excessive noise, configurable via LOG_LEVEL environment variable

**Status**: Accepted

**Context**:
Feature: HODGE-291

**Decision**:
Default log level set to INFO - captures command flow and important events without excessive noise, configurable via LOG_LEVEL environment variable

**Rationale**:
Recorded via `hodge decide` command at 7:44:50 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-27 - JSON log format with pino-pretty tool for development - provides structured data for production debugging with human-readable output for local development

**Status**: Accepted

**Context**:
Feature: HODGE-291

**Decision**:
JSON log format with pino-pretty tool for development - provides structured data for production debugging with human-readable output for local development

**Rationale**:
Recorded via `hodge decide` command at 7:40:24 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-27 - Hybrid log rotation strategy with both size (10MB) and time (daily) limits - ensures predictable disk usage while maintaining temporal organization

**Status**: Accepted

**Context**:
Feature: HODGE-291

**Decision**:
Hybrid log rotation strategy with both size (10MB) and time (daily) limits - ensures predictable disk usage while maintaining temporal organization

**Rationale**:
Recorded via `hodge decide` command at 7:38:56 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-27 - Use Pino high-performance logger for persistent logging - 10-20x faster than Winston, minimal overhead, production-proven with child logger support

**Status**: Accepted

**Context**:
Feature: HODGE-291

**Decision**:
Use Pino high-performance logger for persistent logging - 10-20x faster than Winston, minimal overhead, production-proven with child logger support

**Rationale**:
Recorded via `hodge decide` command at 7:37:34 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-24 - Implement core unification only in this feature - focused scope for faster delivery, defer advanced features like caching optimization to future work

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
Implement core unification only in this feature - focused scope for faster delivery, defer advanced features like caching optimization to future work

**Rationale**:
Recorded via `hodge decide` command at 10:05:22 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-24 - Preserve LocalPMAdapter special behaviors through constructor-based handling - maintains always-on guarantee while allowing unified architecture

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
Preserve LocalPMAdapter special behaviors through constructor-based handling - maintains always-on guarantee while allowing unified architecture

**Rationale**:
Recorded via `hodge decide` command at 10:05:16 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-24 - LocalPMAdapter should extend BasePMAdapter for unified architecture - provides code reuse, better testability, and consistent interfaces while preserving special behaviors

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
LocalPMAdapter should extend BasePMAdapter for unified architecture - provides code reuse, better testability, and consistent interfaces while preserving special behaviors

**Rationale**:
Recorded via `hodge decide` command at 10:05:11 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-24 - Smart issue ID mapping with fallback strategy: try exact match first, then title search, maintain mapping cache in

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
Smart issue ID mapping with fallback strategy: try exact match first, then title search, maintain mapping cache in .hodge/pm-mappings.json

**Rationale**:
Recorded via `hodge decide` command at 7:03:18 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-24 - Configurable PM comment verbosity with three levels: minimal (status only), essential (commit, files, tests), and rich (full metrics, patterns, coverage)

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
Configurable PM comment verbosity with three levels: minimal (status only), essential (commit, files, tests), and rich (full metrics, patterns, coverage)

**Rationale**:
Recorded via `hodge decide` command at 7:01:54 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-24 - Implement both GitHub and Linear PM integrations - GitHub for OSS projects, Linear for enterprise teams

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
Implement both GitHub and Linear PM integrations - GitHub for OSS projects, Linear for enterprise teams

**Rationale**:
Recorded via `hodge decide` command at 6:59:07 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-23 - Use pure adapter approach for PM integration - remove scripts directory and implement all PM logic in TypeScript adapters for type safety and consistency

**Status**: Accepted

**Context**:
Feature: HODGE-288

**Decision**:
Use pure adapter approach for PM integration - remove scripts directory and implement all PM logic in TypeScript adapters for type safety and consistency

**Rationale**:
Recorded via `hodge decide` command at 11:45:20 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-23 - Prioritize GitHub Issues as next PM tool after Linear - maximum developer reach and GitHub integration

**Status**: Accepted

**Context**:
Feature: HODGE-288

**Decision**:
Prioritize GitHub Issues as next PM tool after Linear - maximum developer reach and GitHub integration

**Rationale**:
Recorded via `hodge decide` command at 11:31:53 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-23 - Use simple status mapping in hodge

**Status**: Accepted

**Context**:
Feature: HODGE-288

**Decision**:
Use simple status mapping in hodge.json for PM workflow configuration - clear and easy to understand

**Rationale**:
Recorded via `hodge decide` command at 11:30:52 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-23 - Handle PM API failures with silent failure and logging - commands never blocked by PM issues

**Status**: Accepted

**Context**:
Feature: HODGE-288

**Decision**:
Handle PM API failures with silent failure and logging - commands never blocked by PM issues

**Rationale**:
Recorded via `hodge decide` command at 11:29:44 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-23 - Implement PM hooks for critical workflow commands only (explore, build, harden, ship) - focused effort on main workflow

**Status**: Accepted

**Context**:
Feature: HODGE-288

**Decision**:
Implement PM hooks for critical workflow commands only (explore, build, harden, ship) - focused effort on main workflow

**Rationale**:
Recorded via `hodge decide` command at 11:25:40 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Implement state persistence for critical workflow commands first: /explore, /build, /harden, /ship - focused effort on highest impact commands

**Status**: Accepted

**Context**:
Feature: HODGE-287

**Decision**:
Implement state persistence for critical workflow commands first: /explore, /build, /harden, /ship - focused effort on highest impact commands

**Rationale**:
Recorded via `hodge decide` command at 9:01:12 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Prompt user before resuming from saved command state - provides explicit control and awareness of resumed context

**Status**: Accepted

**Context**:
Feature: HODGE-287

**Decision**:
Prompt user before resuming from saved command state - provides explicit control and awareness of resumed context

**Rationale**:
Recorded via `hodge decide` command at 9:00:01 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Clear command state after 30 minutes with age check on load - if no automatic cleanup trigger available, fall back to clear on next command execution

**Status**: Accepted

**Context**:
Feature: HODGE-287

**Decision**:
Clear command state after 30 minutes with age check on load - if no automatic cleanup trigger available, fall back to clear on next command execution

**Rationale**:
Recorded via `hodge decide` command at 8:55:17 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Use JSON with versioning for command state storage - provides human-readable debugging, version migration support, and follows existing InteractionStateManager pattern

**Status**: Accepted

**Context**:
Feature: HODGE-287

**Decision**:
Use JSON with versioning for command state storage - provides human-readable debugging, version migration support, and follows existing InteractionStateManager pattern

**Rationale**:
Recorded via `hodge decide` command at 8:53:07 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Manual verification through slash commands - Test actual user experience by running /explore and verifying 2-3 approaches are generated by AI, not by CLI code

**Status**: Accepted

**Context**:
Feature: HODGE-285

**Decision**:
Manual verification through slash commands - Test actual user experience by running /explore and verifying 2-3 approaches are generated by AI, not by CLI code

**Rationale**:
Recorded via `hodge decide` command at 6:25:49 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Template-driven generation in slash command - AI generates 2-3 approaches after CLI creates blank exploration structure

**Status**: Accepted

**Context**:
Feature: HODGE-285

**Decision**:
Template-driven generation in slash command - AI generates 2-3 approaches after CLI creates blank exploration structure. Update explore.md template to generate approaches post-CLI execution

**Rationale**:
Recorded via `hodge decide` command at 6:25:12 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Full scope - Remove all approach generation from hodge CLI code and update slash command to handle it

**Status**: Accepted

**Context**:
Feature: HODGE-285

**Decision**:
Full scope - Remove all approach generation from hodge CLI code and update slash command to handle it. CLI should only create structure/files, AI generates all approaches and recommendations. Update both to reflect proper separation

**Rationale**:
Recorded via `hodge decide` command at 6:24:02 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Enhanced CLI Generation with clear AI/CLI boundary - CLI should NOT generate approaches, it should only create the structure for AI to fill

**Status**: Accepted

**Context**:
Feature: HODGE-285

**Decision**:
Enhanced CLI Generation with clear AI/CLI boundary - CLI should NOT generate approaches, it should only create the structure for AI to fill. The explore slash command (AI) is responsible for generating 2-3 approaches, not the hodge CLI code

**Rationale**:
Recorded via `hodge decide` command at 6:20:43 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Each decision presented in /decide must have one clearly marked recommended option to guide user choice

**Status**: Accepted

**Context**:
Feature: HODGE-284

**Decision**:
Each decision presented in /decide must have one clearly marked recommended option to guide user choice

**Rationale**:
Recorded via `hodge decide` command at 5:58:51 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Minimal fix for /decide command - Update decide

**Status**: Accepted

**Context**:
Feature: HODGE-284

**Decision**:
Minimal fix for /decide command - Update decide.md template only, with potential exploration.md tracking of decisions needed from current exploration

**Rationale**:
Recorded via `hodge decide` command at 5:52:44 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Add protected branch patterns configuration to

**Status**: Accepted

**Context**:
Feature: HODGE-284

**Decision**:
Add protected branch patterns configuration to .hodge/config.json - Make protected branch patterns configurable through centralized config file for consistency with other settings and version control

**Rationale**:
Recorded via `hodge decide` command at 11:39:19 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Implement Decision Categories Framework for /decide command - Define specific decision categories (Implementation Approach, Scope, Technical Choices, Naming, Testing Strategy, TODO Resolution) that should always be checked to ensure comprehensive decision coverage

**Status**: Accepted

**Context**:
Feature: HODGE-284

**Decision**:
Implement Decision Categories Framework for /decide command - Define specific decision categories (Implementation Approach, Scope, Technical Choices, Naming, Testing Strategy, TODO Resolution) that should always be checked to ensure comprehensive decision coverage

**Rationale**:
Recorded via `hodge decide` command at 11:36:33 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Implement Enhanced Header Metadata for standards enforcement clarity - Add enforcement metadata to section headers in standards

**Status**: Accepted

**Context**:
Feature: HODGE-283

**Decision**:
Implement Enhanced Header Metadata for standards enforcement clarity - Add enforcement metadata to section headers in standards.md showing progression (e.g., Build(suggested) → Harden(required) → Ship(mandatory)) to provide clear AI guidance while maintaining readability and backward compatibility

**Rationale**:
Recorded via `hodge decide` command at 11:07:22 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Smart State Detection with complete removal of ship interactivity - Ship command will check for pre-approved messages in state

**Status**: Accepted

**Context**:
Feature: HODGE-282

**Decision**:
Smart State Detection with complete removal of ship interactivity - Ship command will check for pre-approved messages in state.json and ALL interactive prompts will be removed (lines 439-471, 714-747) since hodge commands are only called by slash commands

**Rationale**:
Recorded via `hodge decide` command at 10:30:38 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Immediate Complete Fix for Non-Interactive CLI Commands - Remove ALL interactive prompts and status file updates, ensure explore/build/harden/ship/context properly update HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-281

**Decision**:
Immediate Complete Fix for Non-Interactive CLI Commands - Remove ALL interactive prompts and status file updates, ensure explore/build/harden/ship/context properly update HODGE.md. Keep hodge context command as it's used by /hodge and /load slash commands.

**Rationale**:
Recorded via `hodge decide` command at 7:31:34 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-22 - Implement Hybrid Progressive Enhancement for ship commit messages - Phase 1: Smart templates that analyze git diff, Phase 2: State persistence for edits, Phase 3: Interactive approval workflow

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Implement Hybrid Progressive Enhancement for ship commit messages - Phase 1: Smart templates that analyze git diff, Phase 2: State persistence for edits, Phase 3: Interactive approval workflow. This aligns with Progressive Enhancement principle, starting simple and adding sophistication progressively.

**Rationale**:
Recorded via `hodge decide` command at 5:22:36 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-21 - 1

**Status**: Accepted

**Context**:
General project decision

**Decision**:
1

**Rationale**:
Recorded via `hodge decide` command at 4:41:08 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-21 - Pre-Commit All Updates with rollback on failure - Move all file updates (autoSave, HODGE

**Status**: Accepted

**Context**:
Feature: HODGE-220

**Decision**:
Pre-Commit All Updates with rollback on failure - Move all file updates (autoSave, HODGE.md, PM tracking) BEFORE git commit, with state rollback if commit fails to prevent inconsistent state

**Rationale**:
Recorded via `hodge decide` command at 2:43:19 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-21 - Implement Hybrid Progressive Enhancement for test isolation - fix critical bugs immediately (session-manager

**Status**: Accepted

**Context**:
Feature: HODGE-180

**Decision**:
Implement Hybrid Progressive Enhancement for test isolation - fix critical bugs immediately (session-manager.test.ts direct .hodge writes), then gradually migrate tests to use tmpdir() and eventually add TestWorkspace utility for consistent isolation patterns

**Rationale**:
Recorded via `hodge decide` command at 7:32:41 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-21 - Implement Hybrid Progressive Enhancement for save/load optimization with clear AI/CLI separation - slash commands handle user interaction, context presentation, and intelligent orchestration (what AI does best), while CLI commands handle file operations, git integration, and data processing (what code does best)

**Status**: Accepted

**Context**:
Feature: HODGE-168

**Decision**:
Implement Hybrid Progressive Enhancement for save/load optimization with clear AI/CLI separation - slash commands handle user interaction, context presentation, and intelligent orchestration (what AI does best), while CLI commands handle file operations, git integration, and data processing (what code does best)

**Rationale**:
Recorded via `hodge decide` command at 10:23:54 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Tests must NEVER modify the Hodge project's own

**Status**: Accepted

**Context**:
Feature: HODGE-143

**Decision**:
Tests must NEVER modify the Hodge project's own .hodge directory - all tests should use temporary directories or mocks to avoid altering project state

**Rationale**:
Recorded via `hodge decide` command at 1:50:20 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Implement PM Adapter Hooks using Command-Level Integration with phase-appropriate timing: explore/build/harden update PM at START of phase (marking entry), ship updates PM only on SUCCESS (marking completion)

**Status**: Accepted

**Context**:
Feature: HODGE-143

**Decision**:
Implement PM Adapter Hooks using Command-Level Integration with phase-appropriate timing: explore/build/harden update PM at START of phase (marking entry), ship updates PM only on SUCCESS (marking completion). This ensures PM accurately reflects work state - 'in progress' for active phases, 'done' only for successful completion.

**Rationale**:
Recorded via `hodge decide` command at 1:38:07 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Use AI-Based Standards Enforcement - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Status**: Accepted

**Context**:
Feature: HODGE-131-standards-enforcement

**Decision**:
Use AI-Based Standards Enforcement - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Rationale**:
Recorded via `hodge decide` command at 11:52:47 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-20 - Use AI-Based Standards Enforcement approach - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Status**: Accepted

**Context**:
Feature: HODGE-131-standards-enforcement

**Decision**:
Use AI-Based Standards Enforcement approach - leverage Claude Code's natural language understanding to review standards compliance during /harden and /ship commands, allowing standards to be written in any format

**Rationale**:
Recorded via `hodge decide` command at 11:50:13 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement Context-Aware Workflow Commands using Implicit Context Reading approach - commands will automatically read from context

**Status**: Accepted

**Context**:
Feature: HODGE-054

**Decision**:
Implement Context-Aware Workflow Commands using Implicit Context Reading approach - commands will automatically read from context.json when no feature argument is provided, maintaining backward compatibility while providing seamless workflow progression

**Rationale**:
Recorded via `hodge decide` command at 10:58:30 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Use Implicit Context Reading approach for context-aware workflow commands - commands will read from context

**Status**: Accepted

**Context**:
Feature: HODGE-054

**Decision**:
Use Implicit Context Reading approach for context-aware workflow commands - commands will read from context.json by default with optional feature override

**Rationale**:
Recorded via `hodge decide` command at 10:53:42 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement Event-Based Auto-Save approach for HODGE-052: auto-save context through command interceptor pattern that wraps feature commands, providing transparent auto-save with minimal code changes

**Status**: Accepted

**Context**:
Feature: HODGE-052

**Decision**:
Implement Event-Based Auto-Save approach for HODGE-052: auto-save context through command interceptor pattern that wraps feature commands, providing transparent auto-save with minimal code changes

**Rationale**:
Recorded via `hodge decide` command at 10:15:55 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - HODGE-003 is production-ready despite project-wide lint issues - the feature extraction code itself has no lint errors, all tests pass, and the functionality is complete

**Status**: Accepted

**Context**:
Feature: HODGE-003

**Decision**:
HODGE-003 is production-ready despite project-wide lint issues - the feature extraction code itself has no lint errors, all tests pass, and the functionality is complete

**Rationale**:
Recorded via `hodge decide` command at 9:16:37 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement formal feature closure workflow: /close command or closure option in /ship to properly transition features to closed state with reasons

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Implement formal feature closure workflow: /close command or closure option in /ship to properly transition features to closed state with reasons

**Rationale**:
Recorded via `hodge decide` command at 8:55:32 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Auto-save current context when switching features with notification to user - provides seamless workflow without data loss

**Status**: Accepted

**Context**:
Feature: HODGE-052

**Decision**:
Auto-save current context when switching features with notification to user - provides seamless workflow without data loss

**Rationale**:
Recorded via `hodge decide` command at 8:55:27 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Use combined detection for feature vs topic: strict pattern (CAPS-123) indicates feature, quotes indicate topic, natural language indicates topic - provides maximum flexibility

**Status**: Accepted

**Context**:
Feature: HODGE-053

**Decision**:
Use combined detection for feature vs topic: strict pattern (CAPS-123) indicates feature, quotes indicate topic, natural language indicates topic - provides maximum flexibility

**Rationale**:
Recorded via `hodge decide` command at 8:55:22 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Use simple format for

**Status**: Accepted

**Context**:
Feature: HODGE-052

**Decision**:
Use simple format for .hodge/context.json initially: { currentFeature, mode, timestamp } - can evolve to richer context as needed

**Rationale**:
Recorded via `hodge decide` command at 8:55:17 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - The /review command must provide dual awareness: 1) Current Claude Code conversation context (actual work in flight), 2) Filesystem persisted state, and 3) Identify any mismatches between them

**Status**: Accepted

**Context**:
General project decision

**Decision**:
The /review command must provide dual awareness: 1) Current Claude Code conversation context (actual work in flight), 2) Filesystem persisted state, and 3) Identify any mismatches between them. This ensures review accuracy.

**Rationale**:
Recorded via `hodge decide` command at 8:52:48 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Switch focus to HODGE-003 (Feature Extraction) - This addresses the core problem of context loss when extracting features from decisions

**Status**: Accepted

**Context**:
Feature: HODGE-003

**Decision**:
Switch focus to HODGE-003 (Feature Extraction) - This addresses the core problem of context loss when extracting features from decisions. Will implement proper feature extraction workflow.

**Rationale**:
Recorded via `hodge decide` command at 8:52:05 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Close HODGE-051 (AI-Executable Commands) - Original multi-tool approach abandoned due to architectural pivot to Claude Code only

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Close HODGE-051 (AI-Executable Commands) - Original multi-tool approach abandoned due to architectural pivot to Claude Code only. Core functionality (context management) implemented via /hodge command. Remaining declarative command work deferred.

**Rationale**:
Recorded via `hodge decide` command at 8:51:59 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Create HODGE-054: Update all workflow commands to be context-aware with optional feature override

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Create HODGE-054: Update all workflow commands to be context-aware with optional feature override

**Rationale**:
Recorded via `hodge decide` command at 8:04:52 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Create HODGE-053: Implement discovery exploration mode for exploring topics without specific features

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Create HODGE-053: Implement discovery exploration mode for exploring topics without specific features

**Rationale**:
Recorded via `hodge decide` command at 8:04:47 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Create HODGE-052: Implement persistent current feature context in

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Create HODGE-052: Implement persistent current feature context in .hodge/context.json with feature switching via /hodge command

**Rationale**:
Recorded via `hodge decide` command at 8:04:44 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Support dual-mode exploration: feature exploration for specific features, and discovery exploration for topics that result in feature creation

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Support dual-mode exploration: feature exploration for specific features, and discovery exploration for topics that result in feature creation

**Rationale**:
Recorded via `hodge decide` command at 8:04:34 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement context-aware commands with persistent current feature state in

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Implement context-aware commands with persistent current feature state in .hodge/context.json - commands operate on current feature by default, with optional explicit feature override

**Rationale**:
Recorded via `hodge decide` command at 8:04:29 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Include core principles from

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Include core principles from .hodge/principles.md in generated HODGE.md for AI context

**Rationale**:
Recorded via `hodge decide` command at 8:04:24 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - Implement /hodge command as primary session and context manager - replaces /context, provides session discovery, feature switching, and context loading

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Implement /hodge command as primary session and context manager - replaces /context, provides session discovery, feature switching, and context loading

**Rationale**:
Recorded via `hodge decide` command at 8:04:19 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - The only hodge CLI command typically used by developers will be init

**Status**: Accepted

**Context**:
General project decision

**Decision**:
The only hodge CLI command typically used by developers will be init.

**Rationale**:
Recorded via `hodge decide` command at 11:07:32 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - There will no longer be any effort given toward making hodge a tool intended for developers to use from the command line

**Status**: Accepted

**Context**:
General project decision

**Decision**:
There will no longer be any effort given toward making hodge a tool intended for developers to use from the command line. Instead, it provides functionality accessed by the Claude Code slash commands to support their workflows.

**Rationale**:
Recorded via `hodge decide` command at 11:06:14 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - All AI interactions and workflows for Claude Code slash commands will be in the

**Status**: Accepted

**Context**:
General project decision

**Decision**:
All AI interactions and workflows for Claude Code slash commands will be in the .claude/commands markdown files. These markdown files will make calls to hodge for those things where coded solutions shine: writing features, decisions, standards, patterns, etc. to files, making calls to PM software, executing Git commands and accessing GitHub, and so on.

**Rationale**:
Recorded via `hodge decide` command at 11:03:15 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-18 - We are abandoning all effort to enable Hodge to integrate with any AI-assisted software development tool other than Claude Code

**Status**: Accepted

**Context**:
General project decision

**Decision**:
We are abandoning all effort to enable Hodge to integrate with any AI-assisted software development tool other than Claude Code. We may revisit interoperability once we have it working well for Claude Code.

**Rationale**:
Recorded via `hodge decide` command at 10:57:50 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-17 - Implement AI-Executable Slash Commands using Command Orchestration Protocol

**Status**: Accepted

**Context**:
Feature: HODGE-051

**Decision**:
Implement AI-Executable Slash Commands using Command Orchestration Protocol

**Rationale**:
Recorded via `hodge decide` command at 5:43:37 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-17 - Implement PM auto-update using Local-First with Sync approach

**Status**: Accepted

**Context**:
Feature: HODGE-045

**Decision**:
Implement PM auto-update using Local-First with Sync approach

**Rationale**:
Recorded via `hodge decide` command at 5:13:23 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-17 - Implement session-management using Hybrid with HODGE

**Status**: Accepted

**Context**:
Feature: session-management

**Decision**:
Implement session-management using Hybrid with HODGE.md Enhancement approach

**Rationale**:
Recorded via `hodge decide` command at 5:12:54 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-16 - Implement cross-tool-compatibility using Hybrid approach with HODGE

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Implement cross-tool-compatibility using Hybrid approach with HODGE.md Primary + Tool-Specific Enhancements

**Rationale**:
Recorded via `hodge decide` command at 1:17:05 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-16 - TODO Comment Convention

**Status**: Accepted

**Context**:
During development, we often need to mark code that needs future work. Without a consistent convention, these markers get lost or forgotten, leading to technical debt and missed requirements. We need a searchable, consistent way to track incomplete work directly in the codebase.

**Decision**:
Adopt a consistent `// TODO:` comment format for marking incomplete work. Include phase information when relevant (e.g., `// TODO: [harden] Add error handling`). All TODOs must be reviewed before shipping.

**Rationale**:
- Provides consistent, searchable markers for incomplete work
- Phase information helps prioritize when to address each TODO
- Visible directly in code where the work needs to be done
- Can be easily searched across the entire codebase
- Aligns with Hodge's phase-based development model

**Consequences**:
- Positive: Consistent tracking of incomplete work
- Positive: Phase markers help with prioritization
- Positive: Easy to search and audit before shipping
- Positive: Reduces risk of shipping incomplete features
- Negative: Requires discipline to review before shipping
- Negative: Can accumulate if not regularly addressed

---

### 2025-01-16 - Defer GitHub and Jira PM adapters until Linear adapter is fully tested

**Status**: Accepted

**Context**:
PM adapter implementation strategy

**Decision**:
Focus on completing and testing Linear adapter before implementing GitHub and Jira adapters

**Rationale**:
- Ensures one adapter works fully before expanding
- Reduces complexity during initial PM integration
- Can learn from Linear implementation before building others

**Consequences**:
- Positive: More focused development effort
- Positive: Better testing of adapter pattern
- Negative: Limits PM tool options initially

---

### 2025-01-16 - Implement actual tsconfig.json reading in standards validator

**Status**: Accepted

**Context**:
TypeScript configuration validation accuracy

**Decision**:
Replace mock data with actual tsconfig.json file reading in standards-validator.ts

**Rationale**:
- Provides accurate validation based on real project configuration
- Ensures standards validation reflects actual TypeScript settings
- Better long-term maintainability

**Consequences**:
- Positive: More accurate standards validation
- Positive: Real configuration awareness
- Negative: Adds file I/O complexity
- Negative: Need error handling for missing/invalid tsconfig

---

### 2025-01-16 - Document interaction state configuration as future enhancement

**Status**: Accepted

**Context**:
Interaction state configuration approach

**Decision**:
Keep interaction state hardcoded for now, document configuration via .hodge/config.json as future enhancement

**Rationale**:
- Reduces initial complexity
- Clear roadmap item for future releases
- Can gather user feedback before implementing

**Consequences**:
- Positive: Simpler initial implementation
- Positive: Clear enhancement path
- Negative: Less flexibility initially
- Negative: May need refactoring later

---

### 2025-09-16 - linting-standards-optimization

**Status**: Accepted

**Context**:
General project decision

**Decision**:
linting-standards-optimization

**Rationale**:
Recorded via `hodge decide` command at 6:45:49 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-09-15 - Use Progressive Enhancement approach for interactive ship commits with environment-specific optimizations

**Status**: Accepted

**Context**:
General project decision

**Decision**:
Use Progressive Enhancement approach for interactive ship commits with environment-specific optimizations

**Rationale**:
Recorded via `hodge decide` command at 8:50:42 PM

**Consequences**:
To be determined based on implementation.

---

### 2025-01-15 - Git Push Integration for Ship Command

**Status**: Accepted

**Context**:
The ship command currently creates commits but doesn't push to remote. Users need to manually push after shipping, which breaks the flow and risks forgetting to push important changes. We need to integrate push functionality while supporting different environments and workflows.

**Decision**:
Adopt a hybrid approach with ship hooks - extend the ship command with optional push functionality that can be enabled via flags or configuration, while maintaining backwards compatibility.

**Rationale**:
- Provides flexibility without breaking existing workflows
- Progressive Enhancement allows optimal UX per environment (Claude Code, Terminal, CI)
- Branch-aware intelligence prevents dangerous operations (pushing to main)
- Maintains context from ship to push operations
- Can be disabled easily with `--no-push` flag

**Consequences**:
- **Positive**: Complete ship workflow in one command, safety checks prevent mistakes, works across all environments
- **Negative**: Increased complexity in ship command, requires careful configuration management
- **Implementation**: Phase 1 (basic push), Phase 2 (Progressive Enhancement), Phase 3 (PR creation)

---

### 2025-09-13 - PM Tool Selection During Init

**Status**: Accepted

**Context**: 
The hodge init command was not asking users about PM tool selection when none was detected, making it difficult for users to configure their preferred PM integration.

**Decision**: 
Ask for PM tool selection only when not detected during initialization.

**Rationale**: 
This provides a smart balance - minimal questions for users while ensuring PM configuration when needed. Users who already have PM tools configured via environment variables won't be asked unnecessarily.

**Consequences**: 
- Positive: Better PM tool discovery and configuration during setup
- Positive: Maintains minimal interaction philosophy
- Negative: Users wanting a different PM tool than detected need to use post-init config

---

### 2025-09-13 - PM Scripts Distribution

**Status**: Accepted

**Context**: 
Users need PM management scripts (create issues, update status, etc.) to integrate Hodge with their project management tools, but we need an efficient distribution method.

**Decision**: 
Deploy PM scripts to .hodge/pm-scripts/ during initialization when a PM tool is selected.

**Rationale**: 
Immediate availability is important for user experience. Having scripts locally allows customization for team-specific workflows. The size increase is minimal compared to the value provided.

**Consequences**: 
- Positive: Scripts immediately available after init
- Positive: Can be customized for specific team needs
- Positive: Works offline once installed
- Negative: Increases initial project size
- Negative: Scripts may become outdated over time

---

### 2025-09-13 - Pattern Learning During Init

**Status**: Accepted (Revised)

**Context**:
For existing codebases, Hodge could learn established patterns and standards, but we need to decide when and how to offer this capability.

**Decision**:
Ask about pattern learning only in interactive mode (`hodge init --interactive`). The default `hodge init` remains quick with minimal prompts.

**Rationale**:
Keeping quick mode as default maintains the original "one-question setup" philosophy while providing an interactive option for users who want comprehensive setup with PM tool selection and pattern learning.

**Consequences**:
- Positive: Maintains simple default experience
- Positive: Interactive mode available for those who want it
- Positive: No breaking change from current behavior
- Negative: Users might not discover interactive features
- Negative: Need to educate about --interactive flag

---

### 2025-01-15 - Hodgeson Branding Strategy

**Status**: Accepted

**Context**:
The project needs a cohesive branding strategy. Proposed naming: "Hodgeson" as project name, "hodge" as CLI command, and ".podge" as portable archive extension. Need to determine NPM package name, GitHub repository, web domain, and visual identity.

**Decision**:
Adopt Hybrid Practical Naming with Compass Rose logo:
- NPM Package: `hodge-cli`
- GitHub: `hodgeson/hodge-cli`
- Domain: `hodgeson.com`
- Logo: Compass rose with three colored points (explore/build/ship)

**Rationale**:
- `hodge-cli` likely available on NPM and SEO-friendly
- Clear hierarchy: Hodgeson (project) → hodge (CLI) → .podge (archives)
- Compass rose perfectly captures exploration theme
- Three logo points map directly to three modes
- Professional, scalable visual identity

**Consequences**:
- Positive: Clear brand identity and naming hierarchy
- Positive: Room for ecosystem growth (hodge-patterns, hodge-podge)
- Positive: Memorable visual identity that reinforces core concepts
- Negative: Need to migrate from current "hodge" naming
- Negative: Requires coordinated rebranding effort

---

### 2025-01-19 - Core Mode Commands Implementation Pattern

**Status**: Accepted

**Context**:
HOD-20 requires implementing explore/build/harden commands. After exploring three approaches (Stateful Mode Manager, Lightweight Command Pattern, Plugin-Based Architecture), we need to choose an implementation strategy that balances simplicity, consistency, and future extensibility.

**Decision**:
Implement core mode commands using the Lightweight Command Pattern, following the exact pattern established by the init command.

**Rationale**:
- Consistency: Matches the existing init command pattern perfectly, maintaining codebase uniformity
- Simplicity: Minimal abstraction makes the code easy to understand and maintain
- Speed: Fastest to implement and ship, aligning with "ship fast, iterate often" philosophy
- Pragmatic: Solves the immediate need without over-engineering
- Evolutionary: Can be refactored to a more complex architecture later if needed

**Consequences**:
- Positive: Maintains consistent codebase patterns
- Positive: Quick to implement and test
- Positive: Easy for future developers to understand
- Positive: Leverages existing test infrastructure
- Negative: Some code duplication across commands (acceptable trade-off)
- Negative: Less flexible for complex future requirements (can evolve later)

---

### 2025-01-19 - Delete All Skipped Implementation Tests

**Status**: Accepted

**Context**:
After implementing our progressive testing strategy, we have 47 tests marked as skipped because they test implementation details (console output, mock calls, internal state) rather than behavior. These tests clutter the codebase and may confuse developers about our testing philosophy.

**Decision**:
Delete all 47 skipped tests completely from the codebase.

**Rationale**:
- Aligns with our "test behavior, not implementation" philosophy
- Reduces cognitive load and prevents confusion about what kinds of tests are valuable
- Git history preserves the tests if ever needed for reference
- Our 265 behavioral tests provide comprehensive coverage
- Keeping skipped tests sends mixed signals about testing standards

**Consequences**:
- Positive: Cleaner, more focused test suite
- Positive: Clear demonstration of testing philosophy
- Positive: Reduced maintenance burden and file size
- Positive: No ambiguity about what should be tested
- Negative: Cannot easily reference old test patterns (mitigated by git history)
- Negative: Lose examples of what NOT to test (mitigated by documentation)

---

### 2025-09-16 - Progressive Type Safety for Linting Standards

**Status**: Accepted

**Context**:
We regularly encounter two types of ESLint errors during the `/harden` phase that create friction:
- `@typescript-eslint/no-explicit-any`: Use of `any` type
- `@typescript-eslint/explicit-function-return-type`: Missing explicit return types

After deep analysis, we determined:
- `no-explicit-any` is CRITICAL for type safety (prevents runtime errors, refactoring hazards)
- `explicit-function-return-type` has LOW-MEDIUM importance (TypeScript inference is sufficient 95%+ of the time)

**Decision**:
Implement Progressive Type Safety approach that aligns linting strictness with Hodge's explore → build → harden → ship philosophy.

**Implementation**:
1. Disable `explicit-function-return-type` entirely (rely on TypeScript inference)
2. Keep `no-explicit-any` as error in production code
3. Allow `any` as warning in test files and exploration code
4. Add `no-unsafe-return` and `no-unsafe-assignment` as errors for additional safety

**Rationale**:
- Aligns perfectly with Hodge philosophy: "Freedom to explore, discipline to ship"
- Reduces friction during development while maintaining production safety
- Pragmatic acknowledgment that 100% type coverage isn't always valuable
- TypeScript's inference is excellent and explicit return types add verbosity without safety benefit
- Progressive enforcement allows fast prototyping with gradual type improvement

**Consequences**:
- Positive: No more late-stage type fixing during harden phase
- Positive: Faster exploration and prototyping
- Positive: Production code remains fully type-safe
- Positive: Warnings guide learning without blocking progress
- Negative: Risk of technical debt accumulation in explore phase (mitigated by warnings)
- Negative: Need to track which mode code is in (acceptable trade-off)


### 2025-09-19 - Abandoning cross-tool compatibility, focusing on Claude Code only

**Status**: Accepted

**Decision**:
Focus exclusively on Claude Code integration for now. Cross-tool compatibility (HODGE.md generation, tool-agnostic formats) will be revisited in a future version.

**Rationale**:
- Simplifies implementation significantly
- Allows faster iteration on Claude-specific features
- Can always add cross-tool support later
- Most users are using Claude Code anyway

**Impact**:
- No need for HODGE.md generation in features
- Can use Claude-specific optimizations
- Simpler architecture overall

# Feature Decisions: HODGE-314

This file tracks decisions specific to HODGE-314.

## Decisions

<!-- Add your decisions below -->

### 2025-10-02 - User can manually provide direction or request restart for error handling - preserves user control during conversation, allows natural course correction when AI goes off track, simple implementation without complex state management, user can guide AI or ask to restart exploration if needed

**Status**: Accepted

**Context**:
Feature: HODGE-314

**Decision**:
User can manually provide direction or request restart for error handling - preserves user control during conversation, allows natural course correction when AI goes off track, simple implementation without complex state management, user can guide AI or ask to restart exploration if needed

**Rationale**:
Recorded via `hodge decide` command at 12:23:36 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Store conversation in exploration

**Status**: Accepted

**Context**:
Feature: HODGE-314

**Decision**:
Store conversation in exploration.md only as synthesized prose - provides clean professional documentation with single source of truth, easier to read and review, keeps exploration.md focused, conversation synthesis captures key points without raw Q&A duplication

**Rationale**:
Recorded via `hodge decide` command at 12:22:51 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Keep HODGE-314 scoped to /explore only, defer other commands to future work - validates conversational pattern in one place before scaling, allows gathering lessons from real usage, reduces risk and scope, future features can apply pattern to /build, /decide, /ship after validation

**Status**: Accepted

**Context**:
Feature: HODGE-314

**Decision**:
Keep HODGE-314 scoped to /explore only, defer other commands to future work - validates conversational pattern in one place before scaling, allows gathering lessons from real usage, reduces risk and scope, future features can apply pattern to /build, /decide, /ship after validation

**Rationale**:
Recorded via `hodge decide` command at 12:22:03 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Summary with key sections highlighted for preview format - provides concise review of exploration

**Status**: Accepted

**Context**:
Feature: HODGE-314

**Decision**:
Summary with key sections highlighted for preview format - provides concise review of exploration.md with important parts (Title, Problem Statement, Recommended Approach, Test Intentions count, Decisions count) highlighted for efficient approval, balances thoroughness with user time

**Rationale**:
Recorded via `hodge decide` command at 12:20:47 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Define required coverage areas for conversation quality - AI must cover what/why/gotchas/tests during exploration to ensure comprehensive understanding, provides measurable quality criteria while allowing flexibility in how each area is explored

**Status**: Accepted

**Context**:
Feature: HODGE-314

**Decision**:
Define required coverage areas for conversation quality - AI must cover what/why/gotchas/tests during exploration to ensure comprehensive understanding, provides measurable quality criteria while allowing flexibility in how each area is explored

**Rationale**:
Recorded via `hodge decide` command at 12:18:55 AM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Mix of required steps and flexible guidance for template structure - required steps ensure quality baseline (conversation flow, context loading, preview approval) while flexible guidance allows AI to adapt question depth and style to feature complexity

**Status**: Accepted

**Context**:
Feature: HODGE-314

**Decision**:
Mix of required steps and flexible guidance for template structure - required steps ensure quality baseline (conversation flow, context loading, preview approval) while flexible guidance allows AI to adapt question depth and style to feature complexity

**Rationale**:
Recorded via `hodge decide` command at 12:17:48 AM

**Consequences**:
To be determined based on implementation.

---


# Feature Decisions: HODGE-315

This file tracks decisions specific to HODGE-315.

## Decisions

<!-- Add your decisions below -->

### 2025-10-02 - Track decision source internally but don't expose in PM issues - maintain clean PM issue output for stakeholders while preserving source tracking in logs and internal data structures for debugging purposes, with option to expose later if needed

**Status**: Accepted

**Context**:
Feature: HODGE-315

**Decision**:
Track decision source internally but don't expose in PM issues - maintain clean PM issue output for stakeholders while preserving source tracking in logs and internal data structures for debugging purposes, with option to expose later if needed

**Rationale**:
Recorded via `hodge decide` command at 1:02:34 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Show interactive prompt for uncovered decisions - when 'Decisions Needed' contains items not covered by 'Recommendation', ask the user how they would like to resolve those decisions, get user response, and proceed with their guidance

**Status**: Accepted

**Context**:
Feature: HODGE-315

**Decision**:
Show interactive prompt for uncovered decisions - when 'Decisions Needed' contains items not covered by 'Recommendation', ask the user how they would like to resolve those decisions, get user response, and proceed with their guidance

**Rationale**:
Recorded via `hodge decide` command at 1:01:51 PM

**Consequences**:
To be determined based on implementation.

---


### 2025-10-02 - Use Cascading File Checker with Smart Extraction approach - refactor analyzeDecisions() to check multiple sources in priority order: (1) feature-specific decisions

**Status**: Accepted

**Context**:
Feature: HODGE-315

**Decision**:
Use Cascading File Checker with Smart Extraction approach - refactor analyzeDecisions() to check multiple sources in priority order: (1) feature-specific decisions.md, (2) exploration.md (extract Recommendation + Decisions Needed sections), (3) global decisions.md, with markdown parsing logic and user prompting for uncovered decisions

**Rationale**:
Recorded via `hodge decide` command at 12:58:54 PM

**Consequences**:
To be determined based on implementation.

---




### Project Patterns (.hodge/patterns/)

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

# AI Template Extraction Pattern

## Overview

This pattern documents when and how to use AI-based extraction in slash command templates versus CLI regex extraction. The key insight: **AI template extraction is superior for user-facing workflows** because it preserves context, handles edge cases, and enables interactive prompting.

## Pattern Decision Tree

### Use AI Template Extraction When:
- ✅ **User needs to see full context** - Show complete recommendation text, not just titles
- ✅ **Interactive prompting required** - Need to ask user for decisions/approval
- ✅ **Edge cases matter** - Multiple recommendations, malformed content, missing sections
- ✅ **Flexible parsing needed** - Format variations should be handled gracefully
- ✅ **User-facing workflow** - Slash commands that guide users through decisions

### Use CLI Regex Extraction When:
- ✅ **Internal analysis only** - Just need decision titles for logic/routing
- ✅ **No user interaction** - CLI runs non-interactively from slash commands
- ✅ **Structured data** - Working with well-defined formats that rarely change
- ✅ **Performance critical** - Regex faster than AI parsing for simple cases

## Implementation Examples

### Example 1: /build Template (AI Extraction) ✅

**Use Case**: When /decide is skipped, extract Recommendation from exploration.md and present to user

**Why AI Template**:
- Shows full recommendation text (not just title)
- Handles 4 fallback cases (single rec, multiple recs, no rec, missing file)
- Prompts user interactively for next action
- Flexible parsing (works with format variations)

**Implementation** (`.claude/commands/build.md`):
```markdown
### Step 3: Extract from exploration.md
cat .hodge/features/{{feature}}/explore/exploration.md 2>/dev/null

**If exploration.md exists**, parse for:
- **Recommendation section**: Look for `## Recommendation` followed by text
- **Decisions Needed section**: Look for `## Decisions Needed` entries

### Step 4: Handle Extraction Results

**Case A: Single Recommendation Found**
Display to user:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full verbatim text of Recommendation section]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What would you like to do?
  a) ✅ Use this recommendation and proceed
  b) 🔄 Go to /decide to formalize decisions first
  c) ⏭️  Skip and build without guidance
```

**What AI Gets** (via cat command):
```markdown
## Recommendation

**Use Approach 2: Incremental Optimization**

This approach is recommended because:
1. Quick value delivery - users see fixes within days
2. Risk mitigation - small changes easier to validate
3. Production system - can't afford big bang breakage
```

**What User Sees**:
Full context with rationale, then prompted for decision.

---

### Example 2: /plan CLI (Regex Extraction) ✅

**Use Case**: Analyze decisions to determine if feature needs epic/story breakdown

**Why CLI Regex**:
- Just needs decision titles for counting/logic
- No user interaction (runs from slash command)
- Decision.md format is well-defined
- Speed matters for internal analysis

**Implementation** (`src/commands/plan.ts`):
```typescript
private async extractFromExploration(feature: string): Promise<string[]> {
  const content = await fs.readFile(explorationFile, 'utf-8');
  const decisions: string[] = [];

  // Extract Recommendation (just title)
  const recommendationMatch = content.match(/## Recommendation\s*\n\n\*\*(.+?)\*\*/);
  if (recommendationMatch && recommendationMatch[1]) {
    decisions.push(recommendationMatch[1].trim());
  }

  // Extract Decision titles
  const decisionTitles = decisionsNeededMatch[1].match(/### Decision \d+: (.+)/g);
  if (decisionTitles) {
    decisionTitles.forEach((title) => {
      const match = title.match(/### Decision \d+: (.+)/);
      if (match && match[1]) decisions.push(match[1].trim());
    });
  }

  return decisions; // ["Use Approach 2", "Decision title 1", "Decision title 2"]
}
```

**What CLI Gets**:
`["Use Approach 2: Incremental Optimization", "Confirm simplified scope", "Update parent decisions"]`

**What Happens**:
CLI counts decisions (3), determines feature needs epic breakdown, returns to slash command which presents plan to user.

---

## Key Differences Comparison

| Aspect | AI Template Extraction | CLI Regex Extraction |
|--------|----------------------|---------------------|
| **Context Preservation** | ✅ Full text with rationale | ❌ Titles only |
| **User Interaction** | ✅ Can prompt/ask questions | ❌ No interaction capability |
| **Edge Case Handling** | ✅ Multiple recs, malformed content | ❌ Fails silently or errors |
| **Format Flexibility** | ✅ Understands variations | ❌ Brittle pattern matching |
| **Use Case** | User-facing workflows | Internal analysis |
| **Examples** | /build, /ship | /plan (internal) |

## Anti-Pattern: Moving /build Extraction to CLI ❌

**Why This Would Be Wrong**:

1. **Loses Context**:
   - Regex: `["Use Approach 2: Incremental Optimization"]`
   - User needs: Full recommendation text with "why" explanation

2. **No Interaction**:
   - CLI can't prompt user from within slash command execution
   - Would need to pass data back to template anyway

3. **Worse Maintainability**:
   - Template: AI understands "show user the recommendation"
   - CLI: Complex regex + edge case handling + data serialization

4. **Downgrades UX**:
   - Current: User sees full context, makes informed decision
   - CLI approach: Strip context, show title, user confused

## Pattern Guidelines

### When Designing Slash Commands:

**Step 1**: Identify if workflow is user-facing or internal
- User-facing → AI template extraction
- Internal analysis → CLI regex extraction

**Step 2**: Ask "What does user need to see?"
- Full context → AI template
- Just facts → CLI regex

**Step 3**: Ask "Do I need to prompt user?"
- Yes → MUST use AI template
- No → Can use CLI regex

**Step 4**: Document extraction in template
```markdown
### Extraction Logic

**What to extract**: [Describe sections/data]
**How to extract**: [AI parsing instructions or bash commands]
**What to show user**: [Full text vs summary]
**User interaction**: [Prompt options and handling]
```

## Related Patterns

- **Cascading Extraction**: Check primary → secondary → tertiary sources
- **Graceful Degradation**: Handle missing files/sections with clear fallbacks
- **User Agency**: Always offer choices (use extracted data / refine / skip)

## Historical Context

- **HODGE-315**: Introduced cascading extraction in /plan (CLI regex)
- **HODGE-319.3**: Added smart extraction to /build (AI template)
- **HODGE-319.4**: Decided NOT to create WorkflowDataExtractor utility (would downgrade UX by moving template logic to CLI)

## Decision Record

**Question**: Should we create reusable WorkflowDataExtractor to centralize extraction in CLI?

**Answer**: No. Analysis revealed AI template extraction is objectively superior for user-facing workflows because:
- Preserves full context (vs regex title extraction)
- Enables interactive prompting (CLI can't prompt)
- Handles edge cases gracefully (vs brittle regex)
- Flexible format parsing (vs strict pattern matching)

Moving extraction to CLI would downgrade UX. Keep pattern in templates, document well.

---

*Pattern established: 2025-10-03*
*Decision: HODGE-319.4*


# Async Parallel Operations

**Category**: performance
**Frequency**: Used 4 times
**Confidence**: 80%

## Description
Parallel execution for better performance

## Examples

### src/commands/explore.ts
```typescript
Promise.all(
```


### src/commands/explore.ts
```typescript
await Promise.all
```


### src/lib/auto-detection-service.ts
```typescript
Promise.all(
```


## When to Use
- When optimizing for speed
- 
- 

---
*First seen: 2025-10-08T06:36:13.542Z*
*Last used: 2025-10-08T06:36:13.546Z*


# Caching Strategy

**Category**: performance
**Frequency**: Used 6 times
**Confidence**: 100%

## Description
Caching for performance optimization

## Examples

### src/commands/explore.ts
```typescript
memoize
```


### src/lib/auto-save.ts
```typescript
new Map();
  private FULL_SAVE_INTERVAL = 30 * 60 * 1000; // Full save every 30 minutes

  constructor(basePath: string = '.') {
    this.basePath = basePath;
    this.contextPath = path.join(basePath
```


### src/lib/cache-manager.ts
```typescript
cache.get(
```


## When to Use
- When optimizing for speed
- 
- 

---
*First seen: 2025-10-05T06:33:49.962Z*
*Last used: 2025-10-05T06:33:49.978Z*


# Error Boundary

**Category**: error-handling
**Frequency**: Used 5 times
**Confidence**: 100%

## Description
Consistent error handling with logging

## Examples

### scripts/validate-standards.js
```typescript
try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

    if (!tsconfig.compilerOptions?.strict) {
      log('TypeScript strict mode is not enabled', 'error');
      return
```


### scripts/validate-standards.js
```typescript
.catch((error) => {
  console.error
```


### src/commands/explore.ts
```typescript
.catch(() => {
          // Silently handle PM update failures
        });
      } else if (!featureID) {
        // It looks like an ID but we couldn't find it
        // Create a new feature and lin
```


## When to Use
- 
- 
- 

---
*First seen: 2025-10-05T06:33:49.958Z*
*Last used: 2025-10-05T06:33:49.979Z*


# Input Validation

**Category**: security
**Frequency**: Used 4 times
**Confidence**: 80%

## Description
Input validation before processing

## Examples

### src/lib/frontmatter-parser.ts
```typescript
if (!data.frontmatter_version) {
    throw new Error
```


### src/lib/frontmatter-parser.ts
```typescript
function validateFrontmatter
```


### src/lib/id-manager.ts
```typescript
if (!feature) {
      throw new Error
```


## When to Use
- 
- When handling user input
- 

---
*First seen: 2025-10-08T06:36:13.547Z*
*Last used: 2025-10-08T06:36:13.548Z*


# Interactive Next Steps Pattern

## Context
At the end of workflow commands, provide lettered options for quick selection rather than requiring users to type full commands.

## Pattern
```markdown
### Next Steps
Choose your next action:
a) [Action 1] → `[command if needed]`
b) [Action 2]
c) [Action 3]
...
h) Done for now

Enter your choice (a-h):
```

## Benefits
- Works across different AI tools (Claude, Cursor, etc.)
- Reduces typing and cognitive load
- Provides clear guidance on available actions
- Maintains workflow momentum

## Implementation
- Use lowercase letters (a, b, c, etc.)
- Include command hints where helpful with → arrow
- Always include "Done for now" as final option
- Keep options relevant to current context
- Limit to 6-8 options for clarity

## Examples

### After Exploration
```
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build {{feature}}`
```

### After Build
```
a) Add tests for this feature
b) Proceed to hardening → `/harden {{feature}}`
c) Review changes → `/review`
```

### After Ship
```
a) Monitor production metrics
b) Start exploring next feature → `/explore`
c) Review project status → `/status`
```

## When to Use
- At the end of all workflow commands (/explore, /decide, /build, /harden, /ship)
- After completing significant tasks
- When multiple logical next steps exist
- To guide users through the Hodge workflow

## When NOT to Use
- In error messages (provide specific recovery actions instead)
- For simple yes/no questions
- When only one logical next step exists

# Learned Patterns Summary

## Statistics
- Total patterns detected: 2
- High confidence patterns: 0
- Most frequent category: error-handling

## Patterns by Category


### Error-handling
- **Error Boundary** (1x, 20% confidence)


### Security
- **Input Validation** (1x, 20% confidence)


## Recommendations
- Use Promise.all for parallel operations when possible

---
*Generated: 2025-10-08T18:35:27.565Z*


# PM Mapping Check Pattern

**Category**: template-validation
**Frequency**: Used in slash commands
**Confidence**: 95%

## Description
Pattern for checking if a feature has a PM issue with actual external ID mapping. This pattern correctly distinguishes between:
- Features with PM issues created (has `externalID` field)
- Features with local ID only (no PM issue created yet)

## The Problem
Simple grep for feature ID returns false positives:
```bash
# ❌ WRONG: Returns true even without externalID
cat .hodge/id-mappings.json | grep "HODGE-298"
```

This matches entries like:
```json
"HODGE-298": {
  "localID": "HODGE-298",
  "created": "2025-09-29T19:09:56.299Z"
  // NO externalID - PM issue NOT created
}
```

## The Solution
Enhanced grep pattern that checks for `externalID` field:
```bash
# ✅ CORRECT: Only returns true if externalID exists
cat .hodge/id-mappings.json | grep -A 2 "\"{{feature}}\"" | grep "externalID"
```

## How It Works
1. `grep -A 2 "\"{{feature}}\""` - Find the feature ID and include 2 lines after it
2. `| grep "externalID"` - Check if those lines contain externalID field
3. Exit code 0 = externalID found (PM issue exists)
4. Exit code 1 = externalID not found (no PM issue)

## Examples

### Example 1: Entry WITH externalID (mapped)
```json
"HODGE-297": {
  "localID": "HODGE-297",
  "created": "2025-09-29T18:34:46.744Z",
  "externalID": "4aa0eecf-5b2b-4c0f-ba16-d89fed8cb98d",
  "pmTool": "linear"
}
```
Result: grep exits 0 (found)

### Example 2: Entry WITHOUT externalID (unmapped)
```json
"HODGE-298": {
  "localID": "HODGE-298",
  "created": "2025-09-29T19:09:56.299Z"
}
```
Result: grep exits 1 (not found)

### Example 3: Sub-story IDs (HODGE-297.1)
```json
"HODGE-297.1": {
  "localID": "HODGE-297.1",
  "created": "2025-09-29T18:49:50.922Z",
  "externalID": "136191a8-5027-41d6-acea-4ee179a4bbaf",
  "pmTool": "linear"
}
```
Result: Pattern handles dots correctly

## When to Use
- Slash command templates that need to check PM issue status
- Before prompting user to create PM issues
- When deciding whether to update PM issue status
- Any template that branches based on PM tracking

## Testing
See `src/lib/claude-commands.smoke.test.ts` for smoke tests that verify:
- Detects entries WITH externalID as mapped
- Detects entries WITHOUT externalID as unmapped
- Handles feature IDs with dots (HODGE-XXX.Y format)

## Related Patterns
- `input-validation.md` - Validate before processing
- `error-boundary.md` - Handle missing files gracefully

## History
- **2025-09-30**: Created for HODGE-309 (fix false positive in HODGE-306)
- **Issue**: build.md was showing mapped when externalID missing
- **Fix**: Enhanced grep pattern to check for externalID field

---
*First seen: 2025-09-30T19:40:00.000Z*
*Pattern type: Bash command in AI template*


# Pattern: Progressive Enhancement for Multi-Environment Commands

## Pattern Overview
Commands should detect their execution environment and provide the best possible UX for that environment, with graceful fallbacks ensuring universal compatibility.

## Core Principles

### 1. Environment Detection Hierarchy
```typescript
// Detection order (most specific to least)
1. Claude Code (.claude/ directory)
2. Aider (AIDER_CHAT_HISTORY_FILE)
3. Continue.dev (CONTINUE_WORKSPACE)
4. Cursor (CURSOR_WORKSPACE)
5. Warp (TERM_PROGRAM=WarpTerminal)
6. TTY Terminal (process.stdin.isTTY)
7. Non-interactive fallback
```

### 2. Progressive Enhancement Levels

#### Level 0: Base Functionality (Always Works)
- File-based interaction
- Clear console output
- Command flags for automation
- JSON state persistence

#### Level 1: Interactive Terminal (TTY)
- Readline prompts
- Colored output
- Progress indicators
- Inline editing

#### Level 2: Environment-Specific Features
- **Claude Code**: Rich markdown UI
- **Warp**: Workflow integration
- **Aider**: Git cooperation
- **Cursor**: AI enhancement
- **Continue**: VS Code hints

#### Level 3: Premium Features
- AI-powered suggestions
- Visual diffs
- Multi-step wizards
- Context persistence

## Implementation Pattern

### 1. Command Structure
```typescript
class ProgressiveCommand {
  private env: Environment;
  private capabilities: Capabilities;

  constructor() {
    this.env = new EnvironmentDetector().detect();
    this.capabilities = this.env.capabilities;
  }

  async execute(args: CommandArgs): Promise<void> {
    // Level 0: Always prepare state files
    await this.prepareStateFiles(args);

    // Level 1-3: Progressive enhancement
    if (this.env.isClaudeCode) {
      return this.executeClaudeMode(args);
    } else if (this.capabilities.interactive) {
      return this.executeInteractiveMode(args);
    } else {
      return this.executeFileMode(args);
    }
  }
}
```

### 2. State Management Protocol
```
.hodge/temp/<command>-interaction/
├── state.json         # Current state and metadata
├── input.txt          # User input/selections
├── output.txt         # Generated content
├── context.json       # Additional context
└── history.jsonl      # Interaction history
```

### 3. Claude Code Markdown Integration
```markdown
# Enhanced Command Pattern

1. Portable command generates state files
2. Markdown reads and displays rich UI
3. User interacts through markdown
4. Markdown calls portable command with flags
5. Portable command reads state and executes

Key: The markdown IS the UI, not just a launcher
```

## Environment-Specific Strategies

### Claude Code
- **Strategy**: Rich markdown UI
- **Implementation**:
  - Generate state files
  - Markdown provides interactive UI
  - File-based communication
- **Advantages**: Best documentation, all options visible, persistent context

### Warp
- **Strategy**: Native features + workflows
- **Implementation**:
  - Use readline for prompts
  - Support workflow YAML
  - Leverage Warp AI
- **Advantages**: Reusable workflows, fast iteration

### Aider
- **Strategy**: Cooperative integration
- **Implementation**:
  - Detect Aider environment
  - Offer cooperation modes
  - Respect Aider's git flow
- **Advantages**: No conflicts, enhanced messages

### Continue.dev
- **Strategy**: File-based with hints
- **Implementation**:
  - Use file-based interaction
  - Provide VS Code tips
  - Future: VS Code extension
- **Advantages**: Works despite limitations

### Cursor
- **Strategy**: AI enhancement
- **Implementation**:
  - Full interactive mode
  - Offer AI improvements
  - Leverage Cursor features
- **Advantages**: Best-in-class AI assistance

## Universal Flags Pattern

All commands should support:
```bash
--no-interactive    # Skip all prompts
--yes, -y           # Accept all defaults
--edit              # Force editor mode
--dry-run           # Preview without executing
--format <format>   # Output format (json, text, markdown)
--quiet, -q         # Minimal output
--verbose, -v       # Detailed output
--debug             # Show environment detection
```

## Testing Strategy

### 1. Environment Simulation
```typescript
// Test with mocked environments
process.env.CLAUDE_WORKSPACE = 'true';
process.stdin.isTTY = false;
```

### 2. Capability Matrix Testing
Test each combination:
- Environment × Capability × Flag

### 3. Fallback Chain Testing
Ensure graceful degradation when features unavailable

## Documentation Pattern

Each command should document:
1. Default behavior per environment
2. Available flags
3. Environment-specific features
4. Fallback behaviors
5. Configuration options

## Configuration Schema
```json
{
  "commands": {
    "<command>": {
      "interactive": "always" | "never" | "auto",
      "environment": "detect" | "force:<env>",
      "features": {
        "ai": boolean,
        "workflows": boolean,
        "markdown": boolean
      }
    }
  }
}
```

## Success Metrics

1. **Universal Compatibility**: Works in 100% of environments
2. **Optimal UX**: Each environment uses its best features
3. **Graceful Degradation**: Never breaks, always has fallback
4. **User Control**: Flags override automatic detection
5. **Future-Proof**: New environments easy to add

## Anti-Patterns to Avoid

❌ **Don't**:
- Assume TTY availability
- Hard-code environment checks
- Break on unknown environments
- Ignore user preferences
- Create environment-specific commands

✅ **Do**:
- Always have file-based fallback
- Detect capabilities, not just environment
- Respect user configuration
- Document environment differences
- Test all fallback paths

## Migration Guide for Existing Commands

1. Add environment detection
2. Identify interactive elements
3. Create file-based alternative
4. Add progressive enhancement
5. Test across environments
6. Document behaviors

## Related Patterns
- [Interactive Claude Markdown Commands](./interactive-claude-markdown.md)
- [File-Based State Protocol](./file-state-protocol.md)
- [Universal Command Flags](./universal-flags.md)

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

### Project Lessons (.hodge/lessons/)

# Lessons Learned: HODGE-003 Feature Extraction

## Feature: AI-Driven Feature Extraction from Decisions

### The Problem
We needed to extract coherent features from project decisions, preserving the AI's analysis of why certain decisions belong together.

### Initial Approach (Wrong)
Tried to implement pattern matching in code (`FeatureExtractor` class) to identify features from decision text.

**Why it failed**: Feature extraction is intellectual work that requires understanding context and relationships - this is AI's strength, not pattern matching.

### Final Solution
1. **AI analyzes decisions** and identifies coherent features
2. **AI generates YAML spec** with full context
3. **Backend creates feature** from specification

### Key Learnings

#### 1. Context Loss Problem
**Discovery**: Initial `--pre-populate` approach only passed decision text, losing:
- Why these decisions form a coherent unit
- Scope boundaries (in/out)
- Dependencies identified by AI
- Effort estimates
- Specific exploration questions

**Solution**: Rich YAML specifications that preserve all AI analysis.

#### 2. CLI Argument Limitations
**Discovery**: Complex structured data doesn't fit in CLI arguments.

**Solution**: File-based transfer through `.hodge/tmp/feature-extraction/`
```bash
# Instead of complex escaping:
hodge explore "feature" --decisions "..." --scope "..." --deps "..."

# Clean file reference:
hodge explore "feature" --from-spec .hodge/tmp/feature-extraction/spec.yaml
```

#### 3. Template Coupling
**Discovery**: decide.md was documenting hodge's internal behavior.

**Bad Pattern**:
```markdown
This will:
- Create directory X
- Update file Y
- Generate file Z
```

**Good Pattern**:
```markdown
The feature is now created and ready for exploration.
```

#### 4. Spec Files as Documentation
**Discovery**: We initially planned to auto-delete spec files after processing.

**Insight**: These files are valuable historical artifacts that document:
- Why features were created
- AI's reasoning and analysis
- Complete context for debugging
- Audit trail of decisions

**Decision**: Preserve spec files, provide cleanup utilities for old files.

### Code Examples

#### The FeatureSpecLoader Pattern
```typescript
// Clean separation: Loader validates and converts
class FeatureSpecLoader {
  async loadSpec(filePath: string): Promise<FeatureSpec> {
    const content = await fs.readFile(filePath, 'utf-8');
    const spec = yaml.load(content) as FeatureSpec;
    this.validateSpec(spec);
    return spec;
  }

  // Convert to format needed by existing code
  toPopulatorMetadata(spec: FeatureSpec) {
    return {
      description: spec.feature.description,
      scope: spec.feature.scope,
      dependencies: spec.feature.dependencies,
      rationale: spec.feature.rationale,
      explorationAreas: spec.feature.exploration_areas,
    };
  }
}
```

#### The Enhanced FeaturePopulator
```typescript
// Now accepts rich metadata
async populateFromDecisions(
  featureName: string,
  decisions: string[] = [],
  metadata?: {  // Optional rich context
    description?: string;
    scope?: { included?: string[]; excluded?: string[] };
    dependencies?: string[];
    effort?: string;
    rationale?: string;
    explorationAreas?: Array<{
      area: string;
      questions: string[];
    }>;
  }
): Promise<void>
```

### Impact

This architectural pattern enables:
1. **Full context preservation** from AI analysis to implementation
2. **Clean separation** between AI work and backend work
3. **Debugging capability** through preserved spec files
4. **Loose coupling** between templates and implementation

### Related Decisions
- "Feature extraction specs are preserved as audit trail"
- "Slash command templates abstract backend implementation"
- "Complex data transfer uses file-based approach"

---
_Documented: 2025-01-18_

# Lessons Learned: HODGE-297 - Enhanced Context Loading

## Feature: Context Loading Verification and Enhancement

**Shipped**: 2025-09-30
**Status**: ✅ Production

### The Problem

The `/hodge` and `/load` commands were loading only minimal context:
- Basic session state (HODGE.md)
- Complete standards (standards.md)
- **All 1100+ lines** of decisions.md
- Pattern file list only (not content)

This created two issues:
1. **Too much of the wrong thing**: Loading 1100+ lines of decision history overwhelmed context windows
2. **Missing critical files**: Principles.md, AI-CONTEXT.md, phase-specific files, and PM tracking were not loaded

AI assistants lacked the context needed to provide informed suggestions while being burdened with outdated historical decisions.

### Approach Taken

Implemented **Smart Selective Context Loading** through 5 architectural decisions:

#### Decision 1: Limit Decision History
Changed from loading all 1100+ lines to loading **recent 20 decisions**. This provides relevant recent context while dramatically reducing context window usage.

**Implementation**: Added `loadRecentDecisions(limit)` method that:
- Parses decisions.md to find decision headers
- Extracts the most recent N decisions
- Adds truncation note when limited
- Gracefully handles missing files

#### Decision 2: Conditional PM Tracking
PM tracking files (id-mappings.json, 28KB) only load when a feature has a linked PM issue.

**Implementation**: Added `hasLinkedPMIssue(feature)` method that checks for `issue-id.txt` file existence before loading PM data.

#### Decision 3: Maintain On-Demand Pattern Loading
Kept existing pattern loading behavior (no changes needed). Patterns load only when explicitly referenced or requested, following AI-CONTEXT.md design.

#### Decision 4: Phase-Aware File Discovery
Load **all .md and .json files** from the current phase directory, supporting both standard files and custom user-created files.

**Implementation**: Added `loadPhaseFiles(feature, phase)` method that:
- Detects current phase (explore/build/harden/ship)
- Discovers all .md and .json files in that directory
- Filters by extension to avoid loading irrelevant files

#### Decision 5: Consistent Command Behavior
Updated both `/hodge` and `/load` commands to use the same enhanced context loading, ensuring predictable behavior.

### Key Learnings

#### 1. Testability Through Constructor Injection

**Discovery**: Following established patterns pays off. `PlanCommand` and `DecideCommand` already used optional `basePath` constructor parameters.

**Solution**: Added `basePath` parameter to `ContextCommand`:
```typescript
constructor(basePath?: string) {
  this.basePath = basePath || process.cwd();
}
```

**Impact**: Enabled isolated testing without `process.chdir()`, which doesn't work in Vitest workers.

#### 2. Progressive Enhancement Pattern

**Discovery**: The project already had a clear philosophy: "Load what you need, when you need it."

**Solution**: Followed the existing AI-CONTEXT.md guidance rather than creating a new approach. Added conditional loading based on context (PM tracking only when needed, phase files based on current phase).

**Impact**: Implementation aligned with existing architecture, making it easier to maintain and understand.

#### 3. Test Isolation is Critical

**Discovery**: Project standards mandate that tests must NEVER modify the project's `.hodge` directory.

**Solution**: All 5 smoke tests use `os.tmpdir()` for temporary directories:
```typescript
const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-context-test-'));
const command = new ContextCommand(tmpDir);
// ... test logic ...
await fs.rm(tmpDir, { recursive: true, force: true });
```

**Impact**: Tests run in complete isolation, preventing data corruption and ensuring parallel execution safety.

#### 4. Balance Completeness with Performance

**Discovery**: Loading everything is simple but wasteful. Loading nothing is fast but useless.

**Solution**: Smart selective loading based on actual needs:
- Recent 20 decisions (not all 130+)
- PM tracking only when linked
- Phase files only from current phase
- Core files always (principles, AI-CONTEXT)

**Impact**:
- Reduced context from ~1500 lines to ~700-1100 lines
- AI still has all relevant information
- Better performance, better relevance

### Code Examples

#### Recent Decisions Loading Pattern
```typescript
async loadRecentDecisions(limit: number = 20): Promise<string> {
  // Parse markdown to find decision headers
  const decisionIndices: number[] = [];
  lines.forEach((line, index) => {
    if (line.match(/^###\s+\d{4}-\d{2}-\d{2}\s+-\s+/)) {
      decisionIndices.push(index);
    }
  });

  // Take first N (most recent at top)
  const limitedIndices = decisionIndices.slice(0, limit);

  // Add truncation note
  const truncationNote = decisionIndices.length > limit
    ? `\n\n---\n*Showing ${limit} most recent decisions of ${decisionIndices.length} total*\n`
    : '';
}
```

#### Conditional Loading Pattern
```typescript
async hasLinkedPMIssue(feature: string): Promise<boolean> {
  const issueIdPath = path.join(this.basePath, '.hodge', 'features', feature, 'issue-id.txt');
  return this.fileExists(issueIdPath);
}

// In usage:
if (await hasLinkedPMIssue(feature)) {
  // Load id-mappings.json
}
```

#### Phase-Aware Discovery Pattern
```typescript
async detectPhase(feature: string): Promise<'explore' | 'build' | 'harden' | 'ship' | null> {
  // Check in reverse order (most advanced first)
  const phases = ['ship', 'harden', 'build', 'explore'];
  for (const phase of phases) {
    if (await this.fileExists(path.join(featurePath, phase))) {
      return phase;
    }
  }
  return null;
}
```

### Impact

**Performance**:
- Context size reduced from 1100+ lines to ~700-1100 lines
- Smart loading prevents unnecessary file reads
- Conditional PM tracking saves 28KB when not needed

**AI Quality**:
- Now loads principles.md (core philosophy)
- Now loads AI-CONTEXT.md (loading strategy guide)
- Phase-specific files provide relevant context
- Recent decisions more relevant than historical ones

**Maintainability**:
- Follows established constructor injection pattern
- Clear separation of concerns (each method does one thing)
- Comprehensive documentation with decision references
- 5 smoke tests ensure behavior stays correct

**Developer Experience**:
- Testable commands (basePath parameter)
- Consistent behavior (/hodge and /load work the same)
- Extensible (easy to add more conditional loading)

### Related Decisions

From `.hodge/decisions.md`:
1. Load recent 20 decisions instead of full 1100+ line history - balances context completeness with performance
2. Load id-mappings.json only when feature has linked PM issue - provides contextual PM tracking without unnecessary overhead
3. Keep current pattern loading behavior - load only on explicit reference or user request, following AI-CONTEXT.md design principles
4. Load all .md and .json files in current phase directory - supports custom files and flexible workflows while maintaining comprehensive context
5. Update both /hodge and /load commands with enhanced context loading - provides consistent experience and predictable behavior across the system

### Metrics

- **Files Changed**: 3 (2 modified, 1 added)
- **Lines Added**: 265 (126 in context.ts, 4 in hodge-md-generator.ts, 138 in tests)
- **Tests Added**: 5 smoke tests
- **Test Coverage**: All tests passing (207 total, no regressions)
- **Patterns Applied**: Error Boundary (graceful fallbacks), Constructor Injection (testability)

---

_Documented: 2025-09-30_
_Feature: HODGE-297_
_Phase: Shipped_

# Lessons Learned: HODGE-301 - Vertical Slice Validation

## Feature: Vertical Slice Validation for /plan Command

### The Problem

The `/plan` command was creating epics and stories without enforcing that each story is a **vertical slice** - a complete, testable, shippable unit of value. This led to three critical issues:

1. **Horizontal slicing**: Stories split by technical layer (e.g., "Backend API" + "Frontend UI") rather than by complete features
2. **Incomplete stories**: Work items that couldn't be independently tested or shipped
3. **Unclear value**: Stories that didn't clearly benefit any stakeholder

The user requirement was explicit: Each story MUST be a vertical slice providing complete value, or the feature should be created as a single issue instead.

### Approach Taken

After exploring three implementation approaches during the `/decide` phase, we chose **Approach 2: AI-Driven Vertical Slice Design** (the pure template guidance approach) over hybrid validation or programmatic enforcement.

**Key decisions made:**
1. **AI-driven design only** - No programmatic validation code
2. **Warn-only validation** - Informational guidance, no blocking
3. **Moderate criteria** - Stories must provide stakeholder value AND be independently testable
4. **Auto-convert fallback** - Suggest single issue when vertical slicing isn't feasible
5. **Extensive documentation** - Comprehensive template with criteria, examples, and decision trees

### Implementation Details

**What was delivered:**
- Enhanced `.claude/commands/plan.md` with 145 lines of guidance:
  - "What is a Vertical Slice?" definition section
  - Moderate vertical slice criteria (stakeholder value + independently testable)
  - Good vs bad story examples (vertical vs horizontal slicing)
  - 4-step vertical slice decision tree
  - Updated AI workflow with validation reminders
  - Enhanced Important Notes section

- Added smoke tests (45 lines) to verify template content exists
- Zero runtime code changes (pure documentation enhancement)

### Key Learnings

#### 1. AI-Driven Validation for Complex Analysis

**Discovery**: When validation requires nuanced understanding and context (like determining if a story provides "complete value"), AI-driven approaches through template guidance can be more effective than rigid programmatic rules.

**User Insight**: "AI-driven validation when complex analysis is required. It's not perfect, but should be good enough for the current context."

**Why This Works**:
- AI can understand the semantic meaning of story descriptions
- Template provides examples and decision trees for consistent evaluation
- Avoids false positives from pattern-matching approaches
- Educational rather than punitive (teaches principles)
- More flexible than hard-coded validation rules

**Trade-offs**:
- Relies on AI following instructions (not guaranteed)
- No programmatic enforcement safety net
- Effectiveness depends on template quality
- Behavior may vary between AI sessions/models

**When to Use This Pattern**:
- Validation requires semantic understanding, not just syntax
- Context and nuance matter more than strict rules
- Educational guidance is more valuable than enforcement
- The cost of false positives exceeds false negatives
- Iterative improvement through examples is feasible

#### 2. Documentation-Only Features Can Have Significant Impact

**Discovery**: Sometimes the most effective solution is comprehensive documentation rather than code changes.

**Evidence**:
- Zero runtime code changes
- 145 lines of template guidance
- 2 smoke tests verify documentation exists
- All 207 tests passing (no regression risk)

**Impact**:
- Guides future AI behavior without code complexity
- Easy to iterate and improve based on real usage
- No performance overhead
- No maintenance burden from validation logic

#### 3. Template Compliance Testing

**Discovery**: For documentation-only features, smoke tests should verify the *existence* and *correctness* of template content, not runtime behavior.

**Implementation**:
```typescript
smokeTest('plan.md template includes vertical slice guidance', async () => {
  const template = await fs.readFile(templatePath, 'utf-8');

  expect(template).toContain('Vertical Slice Requirement');
  expect(template).toContain('What is a Vertical Slice?');
  expect(template).toContain('Good vs Bad Story Examples');
  expect(template).toContain('Vertical Slice Decision Tree');
});
```

**Why This Matters**:
- Prevents accidental removal of guidance
- Documents expected template structure
- Quick verification (no integration complexity)
- Clear signal if template is incomplete

### Related Decisions

From `.hodge/decisions.md`:

1. **AI-Driven Design Only** (2025-09-30)
   - Enhance template with guidance vs programmatic validation
   - Trust AI to apply principles over enforcing rules

2. **Warn-only validation strictness** (2025-09-30)
   - Informational warnings, no blocking behavior
   - Balances education with flexibility

3. **Moderate vertical slice criteria** (2025-09-30)
   - Stories must provide value to stakeholder AND be independently testable
   - Captures intent without over-constraining

4. **Auto-convert to single issue fallback** (2025-09-30)
   - System suggests single issue when stories can't meet criteria
   - Provides sensible default for edge cases

5. **AI validation during plan generation with mandatory user approval** (2025-09-30)
   - Validation happens during AI-guided plan creation
   - All plans require explicit user approval before CLI execution

6. **Extensive template documentation** (2025-09-30)
   - Add criteria, examples, and decision trees
   - One-time investment for long-term educational value

### Impact

**Immediate Benefits**:
- AI now has clear guidance for creating vertical slices
- Users see examples of good vs bad story breakdowns
- Decision tree helps validate stories during plan generation
- Fallback mechanism when vertical slicing isn't feasible

**Long-term Value**:
- Educational approach improves plan quality over time
- Template can be iteratively improved based on usage
- No code complexity or maintenance burden
- Zero regression risk (documentation-only change)

**Metrics**:
- 207 tests passing (205 existing + 2 new)
- Zero runtime performance impact
- 145 lines of comprehensive guidance
- 3 files modified (template + tests + sync)

### When to Apply This Pattern

Use AI-driven validation through template guidance when:

✅ **Good fit**:
- Validation requires semantic understanding
- Context and nuance are critical
- Educational value is important
- Iterative refinement is expected
- False positives would be frustrating

❌ **Not a good fit**:
- Strict enforcement is required
- Binary yes/no validation is sufficient
- Programmatic checks are simple and reliable
- Compliance must be guaranteed
- No AI is involved in the workflow

### Example: The Vertical Slice Decision Tree

```markdown
When generating stories, ask:

1. Can this story be tested independently?
   - No → Merge with dependent stories to create complete slice
   - Yes → Continue to question 2

2. Does this story provide value to a stakeholder?
   - No → Include as part of a value-delivering story
   - Yes → Continue to question 3

3. Could this story ship to production?
   - No → Expand to include all needed pieces
   - Yes → This is a valid vertical slice ✅

4. Are all stories in the epic vertical slices?
   - No → Revise the breakdown
   - Yes → Continue to dependencies
```

This decision tree provides clear, actionable steps for AI to follow during plan generation.

### Conclusion

This feature demonstrates that **AI-driven validation through comprehensive template guidance** can be an effective alternative to programmatic validation when:
- The validation requires nuanced understanding
- Educational value matters
- Flexibility is more important than rigid enforcement

The key is providing clear criteria, concrete examples, and decision trees that guide AI behavior consistently. While not perfect, this approach is "good enough for the current context" and can be iteratively improved based on real-world usage.

---
_Documented: 2025-09-30_
_Feature shipped in commit: 130939ebe06103b5948ab6d573c6805ac8671449_

# Lessons Learned: HODGE-308 - Test Isolation via basePath Pattern

## Feature: Fix Test Isolation Violations in SaveManager and AutoSave

**Shipped**: 2025-09-30
**Impact**: Critical CI fix - enabled reliable parallel test execution

---

## The Problem

GitHub Actions "Quality Checks" workflow was consistently failing because tests were violating test isolation requirements. Specifically:

1. **SaveManager** was writing save files to the project's `.hodge/saves/` directory during test runs
2. **AutoSave** was creating auto-save files in the project directory when tests executed
3. Test isolation integration tests detected these violations and failed

The symptoms were deceptive - tests passed individually but failed when run in the full suite, suggesting environmental contamination rather than logical errors.

---

## The Journey: Symptom → Root Cause → Solution

### Initial Investigation
When `context.smoke.test.ts` called `command.execute({})`, it triggered:
1. `loadDefaultContext()` → `hodgeMDGenerator.saveToFile('general')`
2. Writing to `.hodge/HODGE.md` triggered auto-save hooks
3. Auto-save created files in project's `.hodge/saves/` directory
4. Test isolation validator detected unexpected files → FAIL

### The Misleading First Solution
**Initial thinking**: "Disable auto-save during tests"
- This was treating the symptom, not the cause
- Would reduce test coverage and confidence
- Violated the principle of "use real dependencies when possible"

### The Critical Realization
**Key insight from implementation**: *"The core issue was that basePath wasn't being used even when passed to the constructor."*

Both `SaveManager` and `AutoSave` accepted `basePath` parameters but then:
- **SaveManager**: Had 8 hardcoded `process.cwd()` calls instead of using `this.basePath`
- **AutoSave**: Used the singleton `saveManager` instead of creating an instance-specific `SaveManager` with the correct basePath

---

## Approach Evolution

### What Didn't Work
**Approach**: Disable auto-save during tests
- **Why it failed**: Band-aid solution that masked the real problem
- **Lesson**: When you have to disable functionality to make tests pass, you're probably treating symptoms

### What Worked
**Approach**: Make basePath actually work throughout the call chain
- **SaveManager changes**:
  - Added constructor parameter: `constructor(basePath?: string)`
  - Added lazy evaluation: `private get basePath(): string { return this.basePathOverride ?? process.cwd(); }`
  - Replaced 8 hardcoded `process.cwd()` calls with `this.basePath`

- **AutoSave changes**:
  - Stopped using singleton `saveManager`
  - Created instance-specific SaveManager: `this.saveManager = new SaveManager(basePath)`
  - Enhanced test detection to properly disable when needed

---

## Key Learnings

### 1. **Constructor Parameters Must Be Used Consistently**
**Discovery**: A constructor parameter is meaningless if you don't actually use it everywhere.

**The Problem Pattern**:
```typescript
class SaveManager {
  private basePathOverride?: string;

  constructor(basePath?: string) {
    this.basePathOverride = basePath;  // ✅ Stored
  }

  private get saveDir(): string {
    return path.join(process.cwd(), '.hodge', 'saves');  // ❌ Ignored!
  }
}
```

**The Solution Pattern**:
```typescript
class SaveManager {
  private basePathOverride?: string;

  constructor(basePath?: string) {
    this.basePathOverride = basePath;
  }

  private get basePath(): string {
    return this.basePathOverride ?? process.cwd();  // Lazy evaluation
  }

  private get saveDir(): string {
    return path.join(this.basePath, '.hodge', 'saves');  // ✅ Consistent
  }
}
```

**Architectural Rule**: If a class accepts `basePath` for testability, ALL file operations must use `this.basePath`, not `process.cwd()`.

---

### 2. **Singleton vs. Instance: Know When to Use Each**
**Discovery**: Singletons break test isolation when they need per-test configuration.

**The Problem**:
```typescript
// auto-save.ts
import { saveManager } from './save-manager.js';  // ❌ Singleton

class AutoSave {
  constructor(basePath: string) {
    this.basePath = basePath;  // ✅ Instance has basePath
  }

  async save() {
    await saveManager.save(...);  // ❌ Singleton uses project path!
  }
}
```

**The Solution**:
```typescript
// auto-save.ts
import { SaveManager } from './save-manager.js';  // ✅ Class import

class AutoSave {
  private saveManager: SaveManager;  // ✅ Instance-specific

  constructor(basePath: string) {
    this.basePath = basePath;
    this.saveManager = new SaveManager(basePath);  // ✅ Matching basePath
  }

  async save() {
    await this.saveManager.save(...);  // ✅ Uses correct basePath
  }
}
```

**Decision Rule**:
- Use singleton when all instances should share the same behavior
- Use instance-specific dependencies when behavior needs to vary per instance (especially for tests)

---

### 3. **Lazy Evaluation Enables Test Mocking**
**Discovery**: Storing basePath at construction time prevents mocking `process.cwd()` in tests.

**The Problem**:
```typescript
class SaveManager {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();  // ❌ Evaluated at construction
  }
}
```

If tests mock `process.cwd()` after constructing the instance, it's too late.

**The Solution**:
```typescript
class SaveManager {
  private basePathOverride?: string;

  constructor(basePath?: string) {
    this.basePathOverride = basePath;  // ✅ Store the override
  }

  private get basePath(): string {
    return this.basePathOverride ?? process.cwd();  // ✅ Evaluated on use
  }
}
```

This allows tests to:
1. Mock `process.cwd()`
2. Create instance without explicit basePath
3. Have the mock respected when basePath is actually used

---

### 4. **Test Isolation Tests Are Worth Their Weight in Gold**
**Discovery**: Without explicit test isolation validation, these bugs hide in plain sight.

The `test-isolation.integration.test.ts` caught:
- Unexpected save files being created
- Tests modifying project directories
- Parallel execution conflicts
- Environment contamination between tests

**Lesson**: For any system that modifies the filesystem, explicit isolation tests are not optional - they're essential for CI reliability.

---

## Pattern: Testable File Operations via basePath

This feature established a reusable pattern:

### Pattern Components
1. **Constructor Parameter**: Accept optional `basePath` for test isolation
2. **Lazy Evaluation**: Use getter to respect mocked `process.cwd()`
3. **Consistent Usage**: Replace ALL `process.cwd()` with `this.basePath`
4. **Instance Dependencies**: Create instance-specific dependencies with matching basePath

### Code Example
```typescript
export class FileOperationClass {
  private basePathOverride?: string;

  constructor(basePath?: string) {
    this.basePathOverride = basePath;
  }

  private get basePath(): string {
    // Use override if provided, otherwise use current working directory
    // This allows tests to mock process.cwd() and have it work correctly
    return this.basePathOverride ?? process.cwd();
  }

  private get targetFile(): string {
    return path.join(this.basePath, '.hodge', 'file.json');
  }

  async operation(): Promise<void> {
    // ALL file operations use this.basePath, never process.cwd()
    const data = await fs.readFile(
      path.join(this.basePath, '.hodge', 'data.json'),
      'utf-8'
    );
  }
}
```

### Applying the Pattern
When creating or modifying any class that performs file operations:
1. Add `basePath?: string` constructor parameter
2. Store as `private basePathOverride?: string`
3. Create `private get basePath()` with lazy evaluation
4. Search for `process.cwd()` and replace with `this.basePath`
5. Verify all file paths use `path.join(this.basePath, ...)`
6. If the class uses other file-operation classes, pass basePath to them

---

## Impact

### Immediate
- ✅ All 621 tests passing (99.85% success rate)
- ✅ CI "Quality Checks" workflow reliability restored
- ✅ Test isolation integration tests passing (4/4)
- ✅ Parallel test execution stable

### Long-term
- 📐 **Architectural Pattern**: Established basePath pattern for test isolation
- 🔧 **Maintainability**: Tests now reliably catch isolation violations
- 🚀 **CI Confidence**: Can trust test results in CI environment
- 📚 **Knowledge Transfer**: Clear pattern for future file-operation classes

---

## Related Standards

From `.hodge/standards.md`:
> **Test Isolation Requirement**: All tests must use temporary directories (`os.tmpdir()`) for file operations. Any test that needs a `.hodge` structure should create it in an isolated temp directory. This prevents tests from corrupting project data or affecting other tests.

This feature fixed violations of this critical standard.

---

## Recommendations

### For New Code
1. **Always** include `basePath` parameter in classes that perform file operations
2. **Always** use lazy evaluation pattern for basePath
3. **Always** audit for `process.cwd()` before shipping
4. **Always** create instance-specific dependencies when configuration varies

### For Code Review
When reviewing changes to file-operation classes, check:
- [ ] Does constructor accept `basePath?: string`?
- [ ] Is basePath stored and lazily evaluated?
- [ ] Are ALL `process.cwd()` calls replaced with `this.basePath`?
- [ ] Are dependent classes instantiated with the same basePath?
- [ ] Do tests actually use isolated directories?

---

## Files Modified

**Core Changes** (5 files):
- `src/lib/save-manager.ts` - Added basePath support with lazy evaluation
- `src/lib/auto-save.ts` - Instance-specific SaveManager with matching basePath
- `src/lib/hodge-md-generator.ts` - Added basePath parameter
- `src/test/helpers.ts` - Added timeout support for integration tests
- `src/test/test-isolation.integration.test.ts` - Fixed Vitest 3.x compatibility

**Test Fixes** (3 files):
- Removed invalid `--reporter=silent` flags (Vitest 3.x)
- Increased timeout for parallel execution test (5s → 15s)
- Added random suffixes to prevent race conditions

---

*Documented: 2025-09-30*
*Related: Test Isolation Standards, SaveManager Architecture, AutoSave Patterns*


# Lessons Learned: HODGE-317.1

## Feature: Eliminate Hung Node Processes in Test Isolation Tests

### The Problem

Integration tests in `src/test/test-isolation.integration.test.ts` were spawning vitest subprocesses via `execSync('npx vitest run ...')` to verify test isolation. When vitest hung in these subprocesses, they became orphaned zombie processes requiring manual termination in Activity Monitor, blocking both local development and CI pipelines.

**User Impact**: "Node processes get hung and I have to go into Activity Monitor and kill them manually."

**Root Cause**: Architectural flaw - using `execSync('npx vitest run ...')` to verify test isolation created dependency on vitest subprocess stability. When any subprocess hung (during config load, test execution, or teardown), it:
- Never completed, blocking the parent test indefinitely
- Created zombie processes that accumulated over time
- Required manual process termination (Activity Monitor on macOS, Task Manager on Windows)
- Blocked CI pipelines with timeouts
- Made local test runs painful and slow (10-15 seconds when working, hung forever when broken)

### Approach Taken

**Conversational Exploration Process** (New Pattern for Hodge):
- Used `/explore` with conversational mode (HODGE-314 feature)
- AI asked clarifying questions about symptoms vs root cause
- Discussed three implementation approaches with tradeoffs
- User feedback: "Node processes get hung and I have to go into Activity Monitor and kill them manually"
- Identified separate CI issue (ERR_REQUIRE_ESM) and created HODGE-318 to track it
- Result: Clear architectural decision before writing any code

**Implementation Decision**: Redesign tests without subprocess spawning
- Eliminate all `execSync('npx vitest run ...')` calls
- Use direct filesystem assertions instead
- Follow HODGE-308 basePath pattern for test isolation
- Leverage vitest's built-in parallel execution

### Key Learnings

#### 1. Conversational Exploration Prevents Implementation Thrash

**Discovery**: Traditional exploration might have jumped to "add timeouts" solution. Conversational exploration revealed subprocess spawning was the root cause, not timeouts.

**What Worked Well**:
- AI asked: "Is this a timeout issue or hung process issue?"
- User clarified: Manual process killing required, not just slow tests
- Conversation identified three approaches with clear tradeoffs
- Decision made BEFORE coding: Approach 1 (redesign) over Approach 2 (timeouts)

**Pattern Established**: When symptoms are unclear, use conversational exploration to:
1. Ask clarifying questions about user experience
2. Distinguish symptoms from root cause
3. Explore multiple approaches with tradeoffs
4. Make architectural decision before implementation

**Code Impact**: Zero wasted implementation time. Went straight to correct solution.

#### 2. Testing Test Isolation Without Subprocess Spawning

**Discovery**: You don't need to spawn test processes to verify test isolation. Direct filesystem assertions are faster, more reliable, and easier to debug.

**Before (Fragile)**:
```typescript
// Test 1: Spawned 3 separate vitest subprocesses
const testCommands = [
  'npx vitest run src/lib/session-manager.test.ts',
  'npx vitest run src/lib/__tests__/auto-save.test.ts',
  'npx vitest run src/lib/__tests__/context-manager.test.ts',
];

const results = await Promise.all(
  testCommands.map((cmd) =>
    new Promise<boolean>((resolve) => {
      try {
        execSync(cmd, { stdio: 'pipe', encoding: 'utf8', env: { ...process.env, NODE_ENV: 'test' } });
        resolve(true);
      } catch {
        resolve(true); // Even failures are okay, we're checking for conflicts
      }
    })
  )
);
// Problem: If any subprocess hangs, entire test blocks forever
// Creates zombie processes that must be manually killed
```

**After (Reliable)**:
```typescript
// Test 1: Direct filesystem state verification
// Verify test isolation using vitest's built-in parallel execution
const initialHodgeFiles = existsSync('.hodge') ? readdirSync('.hodge') : [];

// Verify no test directories in project root (before test)
const hasTestDirsBefore =
  existsSync('.test-hodge') || existsSync('.test-session') ||
  existsSync('.test-workflow') || existsSync('.test-context');
expect(hasTestDirsBefore).toBe(false);

// Verify .hodge directory wasn't modified by this test
const finalHodgeFiles = existsSync('.hodge') ? readdirSync('.hodge') : [];
expect(finalHodgeFiles).toEqual(initialHodgeFiles);

// Note: Actual parallel execution happens when running full test suite
// with multiple workers. This test verifies the outcome.
// No subprocesses = no hung processes = no manual cleanup
```

**Key Insight**: Test the **outcome** (filesystem state unchanged), not the **mechanism** (subprocess execution). This is faster, more reliable, and aligns with "test behavior, not implementation" philosophy.

#### 3. Cleanup Pattern: Try/Finally Without Subprocess Spawning

**Before (Complex)**:
```typescript
// Test 2: Created temp file, spawned node subprocess to test cleanup
const testFile = join(testDir, 'failing-test.js');
writeFileSync(testFile, `
  const { mkdirSync, rmSync } = require('fs');
  const testDir = join(tmpdir(), 'test-cleanup-' + Date.now());
  mkdirSync(testDir, { recursive: true });
  try {
    throw new Error('Intentional test failure');
  } finally {
    rmSync(testDir, { recursive: true, force: true });
  }
`);
execSync(`node ${testFile}`, { stdio: 'pipe' }); // Could hang
```

**After (Simple)**:
```typescript
// Test 2: Direct cleanup test with try/finally pattern
const testDir = join(tmpdir(), `cleanup-test-${Date.now()}-${randomBytes(4).toString('hex')}`);
try {
  mkdirSync(testDir, { recursive: true });
  try {
    throw new Error('Intentional test failure');
  } finally {
    // Cleanup should happen in finally block (HODGE-308 pattern)
    rmSync(testDir, { recursive: true, force: true });
  }
} catch (error) {
  // Test failed as expected
}
expect(existsSync(testDir)).toBe(false); // Verify cleanup happened
```

**Key Insight**: Test cleanup behavior directly. No need to spawn subprocess - just execute the cleanup pattern and verify the result.

#### 4. Loop-Based Verification for Repeated Test Runs

**Discovery**: Checking filesystem state across loop iterations is more reliable than spawning subprocesses N times.

**After**:
```typescript
// Test 3: Isolation between runs
const beforeSaves = existsSync('.hodge/saves') ? readdirSync('.hodge/saves') : [];
const beforeHodgeFiles = existsSync('.hodge') ? readdirSync('.hodge') : [];

for (let i = 0; i < runs; i++) {
  // Verify saves directory hasn't changed across runs
  const afterSaves = existsSync('.hodge/saves') ? readdirSync('.hodge/saves') : [];
  expect(afterSaves.length).toBe(beforeSaves.length);

  // Verify no test-prefixed files were added to .hodge
  const currentHodgeFiles = existsSync('.hodge') ? readdirSync('.hodge') : [];
  const newTestFiles = currentHodgeFiles.filter(
    (file) => (file.startsWith('.test-') || file.startsWith('test-')) &&
              !beforeHodgeFiles.includes(file)
  );
  expect(newTestFiles).toEqual([]);
}
```

**Key Insight**: Capture initial state BEFORE the loop, then check for NEW test-prefixed files in each iteration. This catches state pollution without subprocess overhead.

#### 5. Performance Gains From Architectural Simplification

**Metrics**:
- **Before**: 10-15 seconds (when working), infinite (when hung)
- **After**: 13ms consistently
- **Improvement**: ~1000x faster when working, infinite improvement when previously hung
- **Reliability**: 100% pass rate, zero manual process cleanup needed

**Key Insight**: Sometimes the best performance optimization is eliminating the slow operation entirely. Subprocess spawning had ~500ms startup overhead per spawn × 10 spawns = 5+ seconds baseline. Direct filesystem assertions eliminate this entirely.

### Code Examples

#### Pattern: Direct Filesystem Assertion for Test Isolation

```typescript
// Generic pattern for verifying test isolation without subprocess spawning
describe('Test Isolation Verification', () => {
  integrationTest('should not modify project state', async () => {
    // 1. Capture initial state
    const initialFiles = existsSync('.hodge') ? readdirSync('.hodge') : [];

    // 2. Run test behavior (directly, not via subprocess)
    // ... test logic here ...

    // 3. Verify state unchanged
    const finalFiles = existsSync('.hodge') ? readdirSync('.hodge') : [];
    expect(finalFiles).toEqual(initialFiles);

    // 4. Verify no test artifacts leaked
    const hasTestArtifacts = finalFiles.some(
      (file) => file.startsWith('.test-') || file.startsWith('test-')
    );
    expect(hasTestArtifacts).toBe(false);
  });
});
```

**When to use**:
- Verifying test isolation without subprocess overhead
- Checking for filesystem leakage between tests
- Testing cleanup behavior directly

**When NOT to use**:
- Testing CLI-specific behavior (use smoke tests instead)
- Testing subprocess communication (use actual subprocesses)

### Impact

**Developer Experience**:
- ✅ **Zero manual cleanup**: No more Activity Monitor/Task Manager process hunting
- ✅ **100x faster**: 13ms vs 10-15 seconds (or hung forever)
- ✅ **Reliable CI**: No more timeout failures in GitHub Actions
- ✅ **Better debugging**: Can step through test execution, see what's happening

**Code Quality**:
- ✅ **Test isolation compliant**: All tests verify `.hodge` unchanged (HODGE-308 pattern)
- ✅ **TypeScript strict mode**: Zero errors
- ✅ **Production ready**: No ESLint errors, comprehensive error handling

**Architecture**:
- ✅ **Eliminated fragility**: No dependency on subprocess stability
- ✅ **Follows established patterns**: HODGE-308 basePath pattern for test isolation
- ✅ **Proven approach**: Direct filesystem assertions over subprocess spawning

### Related Decisions

**From HODGE-317 Exploration**:
- **Decision**: Use Approach 1 (redesign without subprocess spawning) over Approach 2 (add timeouts) or Approach 3 (hybrid)
- **Rationale**: Eliminates root cause rather than working around it. Proven pattern from HODGE-308.

**Epic/Story Structure**:
- **HODGE-317** (Epic): Fix hung Node processes in test-isolation tests
- **HODGE-317.1** (Story - SHIPPED): Redesign tests without subprocess spawning
- **HODGE-317.2** (Story - Future): Timeout configuration for remaining edge cases
- **HODGE-318** (Separate): Fix CI ERR_REQUIRE_ESM in Node 18.x

### Related Patterns

**HODGE-308**: Established basePath pattern for test isolation
- Tests use `os.tmpdir()` for all file operations
- Project `.hodge` directory never modified by tests
- Same pattern applied here: verify `.hodge` unchanged via assertions

**HODGE-314**: Conversational exploration template
- Used for first time with HODGE-317
- AI asked clarifying questions to understand root cause
- Explored multiple approaches before deciding
- Result: No wasted implementation time

### Lessons for Future Work

1. **When tests are slow/flaky, question the testing mechanism itself**
   - Don't just add timeouts or retries
   - Ask: "Is there a simpler way to verify this behavior?"

2. **Subprocess spawning in tests is usually a smell**
   - Indicates testing the mechanism rather than the outcome
   - Consider: Can you test the behavior directly?

3. **Conversational exploration shines for unclear problems**
   - When symptoms don't clearly indicate root cause
   - When multiple approaches seem viable
   - Invest 15 minutes in conversation to save hours of implementation

4. **Performance often comes from elimination, not optimization**
   - 100x speedup came from removing subprocess overhead entirely
   - Not from "optimizing" subprocess spawning
   - Ask: "Do we need this operation at all?"

---

**Documented**: 2025-10-02
**Developer**: Michael Kelly
**AI Assistant**: Claude Code (Claude Sonnet 4.5)
**Workflow**: Explore → Decide → Build → Harden → Ship (Hodge progressive development)


# Lessons Learned: HODGE-319.2

## Feature: Invisible Temp File Creation - Replace Bash Heredoc with Write Tool

### The Problem
The `/plan` and `/ship` slash commands used bash heredoc commands (`cat > file << 'EOF'`) to create temporary interaction files for passing data from AI to CLI. These bash commands were visible to users and required approval, creating UX friction where users had to review technical implementation details instead of focusing on actual content (plan structure or commit messages).

Additionally, the templates included `mkdir -p` commands to create parent directories, adding another unnecessary user approval step.

This violated the core principle that AI handles user interaction while CLI is pure backend - users should never see implementation details of data transfer between components.

### Approach Taken
**Template-Only Refactoring** - Zero CLI code changes, pure markdown template updates:

1. **Replaced bash heredoc with Write tool**:
   - `.claude/commands/plan.md`: Replaced `cat > plan.json << 'EOF'` with Write tool instructions
   - `.claude/commands/ship.md`: Replaced heredoc at 3 locations (ui.md, state.json, lessons file)

2. **Eliminated mkdir commands**:
   - Discovered Write tool auto-creates parent directories
   - Removed all `mkdir -p .hodge/temp/...` commands
   - Reduced user approval friction by one step

3. **Maintained identical behavior**:
   - Same file paths (`.hodge/temp/plan-interaction/` and `.hodge/temp/ship-interaction/`)
   - Same JSON/markdown structure
   - Same CLI reading logic (no backend changes)

4. **Comprehensive testing strategy**:
   - 10 smoke tests validating template correctness
   - Manual validation (since slash commands run in Claude Code, not test suite)
   - Existing CLI tests already covered file reading behavior

### Key Learnings

#### 1. Write Tool Auto-Creates Directories
**Discovery**: The Write tool automatically creates parent directories when writing files - no need for explicit `mkdir -p` commands in slash command templates.

**Solution**: Removed all `mkdir` commands from templates, eliminating unnecessary user approval steps.

**Impact**: Cleaner UX with one less approval required per workflow execution.

#### 2. Template-Only Changes Have Unique Testing Constraints
**Challenge**: Slash commands execute in Claude Code environment, not in our test suite, making runtime validation impossible through automated tests.

**Solution**:
- Smoke tests verify template structure (no heredoc, Write tool present, correct paths)
- Manual smoke test confirms runtime behavior
- Trust existing CLI tests for file reading logic

**Pattern**: For template-only refactoring, focus on structural validation rather than runtime testing.

#### 3. Pre-Existing Flaky Tests Can Block Shipping
**Gotcha**: The explore-timing-fix integration test intermittently failed during harden, blocking ship even though it was unrelated to template changes.

**Workaround**: Re-ran harden to get clean validation report.

**Lesson**: Template-only changes should not be blocked by unrelated test flakiness. Need better test isolation or flaky test handling strategy.

### Code Examples

**Before (Bash Heredoc with mkdir):**
```bash
# Old pattern - visible to users, requires multiple approvals
mkdir -p .hodge/temp/plan-interaction/{{feature}}

cat > .hodge/temp/plan-interaction/{{feature}}/plan.json << 'EOF'
{
  "feature": "{{feature}}",
  "type": "epic",
  ...
}
EOF
```

**After (Write Tool - Invisible):**
```markdown
Use the Write tool to create the plan file:

**Write to:** `.hodge/temp/plan-interaction/{{feature}}/plan.json`

Content (replace all {{placeholders}} with actual values):
{
  "feature": "{{feature}}",
  "type": "epic",
  ...
}
```

**Key difference**: Write tool creates directories automatically and executes invisibly - no user approvals required.

### Impact
- ✅ **UX Improvement**: Temp file creation now completely invisible to users
- ✅ **Reduced Friction**: Eliminated both bash heredoc approval AND mkdir approval
- ✅ **Zero Breaking Changes**: File creation behavior identical, just cleaner method
- ✅ **Better Maintainability**: Write tool pattern simpler than bash heredoc
- ✅ **Well-Tested**: 10 smoke tests verify template correctness
- ✅ **All Tests Passing**: 689/689 tests (excluding 1 pre-existing flaky test)

### Reusable Pattern: Write Tool for Slash Command File Creation

**When to use**: Any time a slash command needs to create files for CLI consumption

**Pattern**:
1. Use Write tool instead of bash `cat` or `echo` commands
2. Don't include `mkdir` - Write tool handles directory creation
3. Provide clear placeholder replacement instructions
4. Test with smoke tests (template validation) + manual verification

**Benefits**:
- Invisible to users (no approval friction)
- Auto-creates parent directories
- Cleaner template code
- Easier to maintain

### Related Decisions
- Template-only refactoring pattern (HODGE-306 precedent)
- Zero CLI code changes for UX-only improvements
- Trust Write tool for directory creation
- Accept manual validation for slash command runtime behavior

### Recommendations for Future Work
1. **Fix flaky timing tests** - explore-timing-fix should not block unrelated features
2. **Document Write tool pattern** - Add to .hodge/patterns/ for template developers
3. **Audit other templates** - Check if /decide or /harden have similar bash heredoc patterns
4. **Consider template linting** - Automated check for bash heredoc in slash commands

---
_Documented: 2025-10-03_
_Lessons enhanced with AI analysis and user insights_


# Lessons Learned: HODGE-320

## Feature: Fix Flaky Timing Tests and Eliminate Remaining Hung Process Sources

### The Problem

Despite HODGE-317.1 successfully eliminating subprocess spawning from test-isolation tests, **15 additional test files** still used subprocess spawning through the `withTestWorkspace()` helper. This created two critical issues:

1. **Flaky Timing Tests**: The `explore-timing-fix.integration.test.ts` test would pass at 5.5s but fail at 6.1s based on system load, creating non-deterministic test failures
2. **Hung Node Processes**: Orphaned subprocesses from `execAsync()` would hang indefinitely, requiring manual termination in Activity Monitor

**Key Surprise**: The team thought subprocess spawning was fully resolved with HODGE-317.1, but the issue persisted in 15 other files that used the same underlying pattern through different test helpers. This highlights how indirect subprocess spawning (through helpers like `workspace.hodge()`) can hide the same root cause.

### Approach Taken

**Phase 1 (HODGE-320)**: Systematic Direct Function Call Migration

Applied the proven HODGE-317.1 pattern to the 4 highest-priority test files:

1. **Replace subprocess spawning** with direct command instantiation
2. **Remove timing assertions** (inherently flaky due to system load variability)
3. **Use process.chdir() pattern** to run commands in test workspace
4. **Verify through filesystem state** instead of subprocess exit codes

**What Worked Well**: Using direct function calls instead of subprocess spawning. This eliminated the root cause entirely rather than trying to mitigate symptoms with timeouts or retries.

### Key Learnings

#### 1. Subprocess Spawning Can Hide in Test Helpers

**Discovery**: HODGE-317.1 eliminated direct `execSync()` calls, but subprocess spawning persisted through test helpers:

```typescript
// Looks innocent, but spawns subprocess under the hood!
await workspace.hodge('explore test-feature');

// Actually calls:
workspace.hodge() → runHodge() → runCommand() → execAsync()
```

**Solution**: Search for ALL uses of subprocess-spawning helpers, not just direct exec calls:

```bash
# Find all subprocess spawning (direct and indirect)
grep -r "workspace.hodge\|runCommand\|execSync\|exec(" src/
```

**Impact**: Found 15 files that looked safe but actually spawned subprocesses.

#### 2. Timing Assertions Are Inherently Flaky

**Discovery**: Tests that assert on elapsed time (`expect(elapsed).toBeLessThan(6000)`) fail non-deterministically:

- Pass on unloaded system: 5.5 seconds ✅
- Fail on loaded system: 6.1 seconds ❌
- Same code, different result = flaky test

**Solution**: Remove timing assertions, rely on test framework timeout:

```typescript
// ❌ FLAKY: Timing assertion
const start = Date.now();
await command.execute();
expect(Date.now() - start).toBeLessThan(6000); // Flaky!

// ✅ RELIABLE: Let vitest timeout handle hangs
await command.execute(); // Vitest default 5s timeout catches hangs
expect(await workspace.exists('result-file')).toBe(true);
```

**Impact**: Zero flaky test failures after removing timing assertions.

#### 3. Direct Function Calls Are 273x Faster

**Discovery**: Eliminating subprocess spawn overhead dramatically improved test performance:

```typescript
// Before: Subprocess spawning
await workspace.hodge('explore test-feature'); // 6000ms timeout

// After: Direct function call
const command = new ExploreCommand();
await command.execute('test-feature'); // 22ms actual runtime

// Performance: 273x faster!
```

**Why This Matters**:
- Faster test feedback loop
- No subprocess cleanup needed
- No orphaned processes
- Better error messages (stack traces from actual code, not subprocess wrapper)

#### 4. The process.chdir() Pattern for Test Isolation

**Discovery**: Commands can run in any directory using `process.chdir()` without spawning subprocess:

```typescript
// Pattern: Change directory, execute, restore
const command = new ExploreCommand();
const originalCwd = process.cwd();
try {
  process.chdir(workspace.getPath()); // Run in test workspace
  await command.execute('test-feature');

  // Verify through filesystem
  expect(await workspace.exists('.hodge/features/...')).toBe(true);
} finally {
  process.chdir(originalCwd); // ALWAYS restore
}
```

**Critical**: The `finally` block ensures directory restoration even if test fails.

### Code Examples

#### Before: Subprocess Spawning (Flaky)

```typescript
integrationTest('multiple explores complete within time limit', async () => {
  await withTestWorkspace('multi-timing-test', async (workspace) => {
    const start = Date.now();
    const result1 = await workspace.hodge('explore feature-1'); // Subprocess!
    const result2 = await workspace.hodge('explore feature-2'); // Subprocess!
    const elapsed = Date.now() - start;

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(elapsed).toBeLessThan(6000); // Flaky timing assertion!
  });
});
```

**Problems**:
- Spawns 2 subprocesses (can hang)
- Timing assertion depends on system load (flaky)
- 10+ second timeout if subprocess hangs

#### After: Direct Function Calls (Reliable)

```typescript
integrationTest('multiple explores complete successfully', async () => {
  const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-test-'));

  try {
    const hodgeDir = path.join(testDir, '.hodge');
    await fs.mkdir(hodgeDir, { recursive: true });
    await fs.mkdir(path.join(hodgeDir, 'features'), { recursive: true });

    const command = new ExploreCommand();
    const originalCwd = process.cwd();

    try {
      process.chdir(testDir);

      // Direct calls - no subprocess
      await command.execute('feature-1', { skipIdManagement: true });
      await command.execute('feature-2', { skipIdManagement: true });

      // Verify through filesystem state
      expect(existsSync(path.join(hodgeDir, 'features/feature-1/explore'))).toBe(true);
      expect(existsSync(path.join(hodgeDir, 'features/feature-2/explore'))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  } finally {
    await fs.rm(testDir, { recursive: true, force: true });
  }
});
```

**Benefits**:
- Zero subprocess spawning (no hangs)
- No timing assertions (deterministic)
- 273x faster (22ms vs 6000ms timeout)
- Better error messages (direct stack traces)

### Impact

**Immediate Results**:
- ✅ Zero flaky tests (timing assertions eliminated)
- ✅ Zero hung processes (subprocess spawning eliminated)
- ✅ 273x faster test execution (22ms vs 6000ms)
- ✅ 100% reliable CI (deterministic test outcomes)
- ✅ All 667 tests passing (zero regressions)

**Long-term Value**:
- Developer confidence in test suite restored
- No more manual process termination
- CI becomes reliable signal (green = code is good)
- Foundation for fixing remaining 11 test files (Phase 2)

### Related Decisions

From `.hodge/features/HODGE-320/explore/exploration.md`:

1. **Use direct function calls instead of subprocess** - Eliminates hung process risk entirely
2. **Remove timing assertions** - Timing varies with system load (inherently flaky)
3. **Rely on vitest timeout** - Let vitest's 5s default timeout catch hangs instead of explicit timing checks
4. **Use process.chdir() pattern** - Commands operate in temp directory, always restore in finally block
5. **Verify through filesystem state** - Test outcomes (files created) not mechanisms (subprocess exit codes)

### Pattern for Future Reference

**When to use direct function calls instead of subprocess in tests**:

1. ✅ Testing command logic and behavior
2. ✅ Verifying file creation and modifications
3. ✅ Integration testing between components
4. ✅ Workflow testing (explore → build → ship)

**When subprocess might be necessary** (exceptions are rare):

1. ⚠️ Testing Node.js ESM module loading behavior
2. ⚠️ Testing system-level integration with external tools
3. ⚠️ Testing CLI argument parsing (even this can often be tested directly)

**Rule of thumb**: If you think you need subprocess spawning in a test, you're probably testing the wrong thing. Test the behavior, not the execution mechanism.

---

_Documented: 2025-10-03_
_Pattern: Direct Function Calls for Test Reliability_
_Reference: HODGE-317.1 (original subprocess elimination), HODGE-320 (Phase 1 expansion)_


# Lessons Learned: HODGE-324

## Feature: Fix Lessons Learned Generation Timing in /ship Command

### The Problem

The `/ship` command was generating lessons learned **after** the git commit executed, which meant lessons were never committed with the feature work that generated them. This violated the principle of keeping project knowledge in version control and created orphaned lesson files that existed only in the working directory.

**Root Cause**: Split responsibility between CLI and slash command template:
- CLI generated `lessons-draft.md` POST-commit (src/commands/ship.ts:301)
- Slash command template enhanced lessons in Step 5 (AFTER Step 4 ship execution)
- Result: Lessons created locally but never staged/committed

### Approach Taken

**Template Reordering Strategy** - Restructure workflow to capture lessons BEFORE commit:

1. **Move lessons enhancement**: Step 5 → Step 3.5 (between commit approval and ship execution)
2. **Remove CLI draft generation**: Delete `generateLessonsDraft()` method (~98 lines)
3. **Direct finalized lesson creation**: Skip draft, create `.hodge/lessons/{feature}-{slug}.md` directly
4. **Leverage existing staging**: `git add -A` in ship command stages lessons automatically

### Key Learnings

#### 1. Timing is Critical for Documentation Artifacts

**Discovery**: Documentation generated after commit operations becomes orphaned

**Solution**: Restructure workflow to capture documentation BEFORE commits, ensuring it's included in version control automatically. The existing `git add -A` in the ship command handles staging without additional logic.

**Pattern**: When documentation is tied to feature work, generate it before the commit operation, not after.

#### 2. Clean Separation of Concerns (AI vs CLI)

**Discovery**: Split responsibilities between CLI and slash command created redundancy and bugs

**Solution**:
- **Slash command (AI-driven)**: Owns entire interactive lessons workflow
- **CLI command (non-interactive)**: Focuses only on git commit mechanics
- **Result**: Clear boundaries, no duplicate logic

**Architecture Principle**: AI-orchestrated commands (called from slash commands) should be non-interactive. All interactive workflows belong in slash command templates.

#### 3. Optional Workflows Need Explicit Skip Handling

**Discovery**: Draft files were created even when users didn't want lessons documented

**Solution**:
- Ask upfront: "Want to document lessons? (y/n)"
- If no: Skip entirely, create NO files
- If yes: Create finalized lesson directly
- **Result**: Clean workspace, no orphaned drafts

**Pattern**: For optional workflows, provide early exit points and ensure skip path creates zero artifacts.

#### 4. Template Changes Can Replace Code

**Discovery**: Major workflow fix achieved primarily through template restructuring (minimal CLI changes)

**Solution**:
- Template changes: Reordered steps, updated instructions (~87 lines modified)
- CLI changes: Removed obsolete code (~109 lines deleted)
- Net result: -190 lines, better architecture

**Insight**: Slash command templates are powerful—workflow improvements often require template changes, not code changes.

### Implementation Details

#### New Flow Architecture

**Before** (Broken):
```
Step 3: Approve commit message
Step 4: Run `hodge ship`
  → CLI commits code
  → CLI generates lessons-draft.md (AFTER commit)
Step 5: AI enhances draft → finalized lesson (AFTER commit)

Result: Lessons orphaned 🚫
```

**After** (Fixed):
```
Step 3: Approve commit message
Step 3.5: Optional lessons (NEW)
  → Ask "Want to document lessons? (y/n)"
  → If yes: Create finalized lesson at .hodge/lessons/
  → If no: Skip (no files created)
Step 4: Run `hodge ship`
  → `git add -A` stages everything (including lessons)
  → CLI commits all staged files

Result: Lessons committed with feature ✅
```

#### Files Changed

**Core Changes** (2 files, -109 lines):
- `.claude/commands/ship.md`: Restructured workflow (Step 5 → Step 3.5)
- `src/commands/ship.ts`: Removed `generateLessonsDraft()` method

**Test Updates** (2 files, -58 lines):
- Deleted: `src/test/ship-lessons.smoke.test.ts` (obsolete draft tests)
- Updated: `src/test/documentation-hierarchy.smoke.test.ts`

**New Tests** (1 file):
- `src/commands/hodge-324.smoke.test.ts`: 14 smoke tests validating the fix

### Impact

✅ **Bug Fixed**: Lessons now committed with feature work automatically
✅ **Cleaner Workspace**: No orphaned draft files
✅ **Better Architecture**: Clean separation—slash command (AI) handles interaction, CLI handles mechanics
✅ **Version Control**: Project knowledge stays in git history
✅ **Code Reduction**: -190 lines of unnecessary code removed
✅ **Test Coverage**: 14 new smoke tests validate the fix
✅ **User Experience**: Simple linear flow with optional lessons

### Related Decisions

1. **Timing**: Lessons captured between Step 3 and Step 4 (before commit)
2. **What to commit**: Only finalized lesson (`.hodge/lessons/{feature}-{slug}.md`)
3. **User choice**: Keep lessons optional (respect workflow preferences)
4. **CLI responsibility**: Remove `generateLessonsDraft` entirely
5. **Skip handling**: No draft created if user skips
6. **Staging**: Existing `git add -A` handles it automatically
7. **Template flow**: Ask upfront y/n, then proceed

### Reusable Patterns

**Pattern 1: Pre-Commit Documentation**
- Generate documentation artifacts BEFORE commit operations
- Leverage existing staging commands (`git add -A`)
- Ensures documentation is versioned with code

**Pattern 2: Template-First Workflow Fixes**
- Consider template restructuring before code changes
- Slash command templates control workflow sequence
- CLI should execute discrete operations, not orchestrate complex flows

**Pattern 3: Optional Workflow Design**
- Ask upfront with clear y/n decision
- Skip path creates zero artifacts
- Proceed path creates only finalized output (no intermediate drafts)

---
_Documented: 2025-10-04_


# Lessons Learned: HODGE-327.1

## Feature: Core Review Engine with Profile System and Layered Quality Criteria

### The Problem

The existing `/review` command was outdated and referenced non-existent `hodge learn` functionality. Investigation into git history (HODGE-317.1 through HODGE-322) revealed a pattern proliferation issue: subprocess spawning patterns spread across the codebase despite being a known anti-pattern. ESLint and TypeScript cannot catch architectural smells like:

- Coupling violations and SRP breaches
- Pattern proliferation across files
- Inconsistent implementation of similar features
- Violations of project-specific lessons learned

We needed AI-driven architectural review that could detect these quality issues while respecting project-specific conventions and lessons.

### Approach Taken

Built a layered review system with three architectural priorities:

**Layer 1 (Highest Priority)**: Project-specific context
- `.hodge/standards.md` - Enforceable rules (overrides everything)
- `.hodge/principles.md` - Project philosophy and values
- `.hodge/patterns/` - Expected solutions and patterns
- `.hodge/lessons/` - Past mistakes to avoid (violations are blockers)

**Layer 2**: Profile domain defaults
- YAML profiles for specific domains (react-components.yml, api-design.yml)
- Provide best practices but can be overridden by Layer 1

**Layer 3**: Universal baseline
- `default.yml` - Language-agnostic code quality (coupling, SRP, DRY, complexity)

**Key Architectural Decision**: Automatic context merging. Standards, principles, patterns, and lessons are ALWAYS loaded regardless of which profile is used. This ensures project conventions always take precedence over generic recommendations.

### Key Learnings

#### 1. The Hodge Workflow Scales Well for Larger Features

**Discovery**: HODGE-327 was an epic with 6 stories. The `/explore` → `/decide` → `/plan` workflow handled this multi-story feature elegantly.

**What Worked**:
- Conversational exploration clarified scope and architectural decisions before coding
- Epic planning broke complex work into shippable vertical slices
- Each story (327.1 through 327.6) delivered independent value
- Story 327.1 focused on core infrastructure, enabling parallel future work

**Impact**: The workflow proved it can handle both small features and large epics without modification. The key is thorough exploration and proper story decomposition.

#### 2. Simple String Patterns Leverage AI Better Than Rigid Rules

**Discovery**: Initial consideration was structured rules (regex patterns, AST queries). We chose simple string patterns that AI interprets freely.

**Solution**:
```yaml
criteria:
  - name: "Lessons Learned Violations"
    severity: blocker
    patterns:
      - "Check for subprocess spawning in tests"
      - "Avoid duplicated validation logic"
      - "Ensure proper test isolation"
```

This approach:
- Keeps profiles human-readable
- Leverages AI's natural language understanding
- Allows nuanced interpretation (context-aware detection)
- Easier to maintain than complex regex/AST rules

#### 3. Layered Architecture Prevents Profile/Standards Conflicts

**Discovery**: Review profiles could recommend practices that conflict with project-specific decisions.

**Solution**: Automatic context merging with clear priority hierarchy. Example conflict resolution:

If `react-components.yml` says "Use functional components" but `.hodge/standards.md` says "This project uses class components for legacy compatibility," the standard overrides the profile. AI uses Layer 1 context to interpret Layer 2 recommendations.

**Impact**: Teams can use generic profiles while maintaining project-specific conventions.

#### 4. Test Isolation Prevented Harden Phase Bugs

**Discovery**: All tests used `os.tmpdir()` for file operations, never touching project `.hodge` directory.

**Why This Mattered**: During harden phase, we ran tests, lint, typecheck, and build in parallel. If tests had modified project state, we would have had race conditions or corrupted tracking files.

**Validation**: 13 tests (8 smoke + 5 integration) all passed consistently, with zero flakiness.

### Code Examples

**Profile Validation with Clear Error Messages**:
```typescript
// src/lib/profile-loader.ts
private validateProfile(profile: ReviewProfile, profileName: string): void {
  const missing: string[] = [];
  if (!profile.name) missing.push('name');
  if (!profile.description) missing.push('description');
  if (!profile.applies_to) missing.push('applies_to');
  if (!profile.criteria) missing.push('criteria');

  if (missing.length > 0) {
    throw new Error(
      `Profile ${profileName} is missing required fields: ${missing.join(', ')}`
    );
  }
}
```

**Graceful Handling of Missing Context Files**:
```typescript
// src/lib/context-aggregator.ts
private loadStandards(): string {
  const standardsPath = join(this.basePath, '.hodge', 'standards.md');
  if (!existsSync(standardsPath)) {
    console.warn('⚠️  Warning: .hodge/standards.md not found');
    return '';
  }
  return readFileSync(standardsPath, 'utf-8');
}
```

### Impact

**Workflow Validation**:
- Epic with 6 stories successfully planned using `/explore` → `/decide` → `/plan`
- Story 327.1 delivered complete, testable infrastructure
- Workflow scales from single features to complex multi-story epics

**Code Quality Infrastructure**:
- AI can now detect architectural issues ESLint misses
- Project-specific lessons automatically enforced
- 3-level severity (blocker/warning/suggestion) guides priorities
- Zero dependencies on external review services

**Extensibility**:
- Profile system supports 6+ languages (TypeScript, JavaScript, Kotlin, Python, Java, Go)
- Custom instructions enable domain-specific analysis
- Layered architecture prevents profile/standards conflicts

**Testing Rigor**:
- 13 tests validate end-to-end flow (profile loading, context aggregation, file analysis)
- Test isolation prevented race conditions during parallel harden validation
- All tests passing in both build and harden phases

### Related Decisions

From `.hodge/features/HODGE-327/decisions.md`:
1. **Custom AI Instructions** - Enables sophisticated project-specific reviews beyond pattern matching
2. **3 Severity Levels** - blocker/warning/suggestion provides clear mental model
3. **No Auto-Fix Mode** - Recommendations only, maintains user control
4. **Medium Verbosity** - Grouped findings balance detail with readability
5. **Manual Triage** - User decides which findings to address with suggested `/explore` commands

### Validation

**Harden Phase Results**:
- ✅ All 13 tests passing (8 smoke + 5 integration)
- ✅ Zero ESLint errors (255 warnings from existing code)
- ✅ Zero TypeScript errors
- ✅ Build successful
- ✅ 87 total test files passing (project-wide)

**Files Created**:
- 6 new implementation files (838 net lines)
- 2 new test files (352 net lines)
- 1 YAML profile (default.yml, 8 criteria)
- 1 slash command template (review.md)

---
_Documented: October 4, 2025_


# Lessons Learned: HODGE-327.1

## Feature: Review Report Persistence with Write Tool Pattern

### The Problem

The `/review` command displayed valuable architectural analysis reports but they vanished after the user responded to the menu. Users needed persistent storage in `.hodge/reviews/` with metadata (timestamp, scope, profile, feature context, finding counts) to reference findings when fixing issues.

During implementation, we initially attempted to create a `ReviewPersistenceService` class to handle file writing, but this violated the established Hodge pattern where AI writes content files using the Write tool, not Service classes.

### Approach Taken

**Initial Approach (Wrong)**:
Started building `ReviewPersistenceService` class with methods for:
- `generateFilename()` - Convert file paths to slugs
- `extractMetadata()` - Parse reports for finding counts
- `detectFeatureContext()` - Git blame analysis
- `saveReport()` - Write files with YAML frontmatter

This approach seemed logical based on HODGE-322's Service pattern guidance, which advocates extracting testable business logic into Service classes.

**Corrected Approach (Right)**:
After user intervention, pivoted to Pure Template Implementation:
- Enhanced `.claude/commands/review.md` template with save/discard prompt
- Embedded bash logic for filename generation and metadata extraction
- Used Write tool to save reports (consistent with `/explore` and `/ship`)
- Documented new "Slash Command File Creation Pattern" in standards.md

### Key Learnings

#### 1. Service Classes Are NOT For Slash Command File Operations

**Discovery**: The project already had a consistent pattern where AI writes content files using the Write tool:
- `/explore` → AI writes `exploration.md`
- `/ship` → AI writes `.hodge/lessons/HODGE-XXX-slug.md`
- `/decide` → AI writes decisions

But this pattern wasn't explicitly documented, leading to the wrong assumption that Service classes should handle file writing.

**What Went Wrong**:
Started implementing `ReviewPersistenceService` because:
- HODGE-322 lesson advocates Service classes for testable business logic
- Seemed like "proper" architecture to separate concerns
- Filename generation and metadata extraction felt like business logic

**What Actually Matters**:
- **CLI creates structure** (directories, tracking files, PM integration)
- **AI creates content** (markdown files with user-facing content)
- Service classes are for CLI business logic, NOT slash command file operations

**Solution Applied**:
1. Deleted `ReviewPersistenceService.ts`
2. Moved all logic to `.claude/commands/review.md` template
3. Used bash for simple operations (sed, grep, awk)
4. Used Write tool for file creation
5. **Documented pattern in standards.md** to prevent future violations

#### 2. Standards Documentation Prevents Pattern Drift

**Discovery**: Without explicit documentation, good patterns can be violated even with the best intentions.

**What Worked Well**:
Added new "Slash Command File Creation Pattern" section to standards.md with:
- Clear responsibility breakdown (AI vs CLI)
- Code examples showing ❌ BAD vs ✅ GOOD patterns
- Concrete examples from existing commands
- Explanation of why the pattern matters

**Code Example from Standards**:
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

**Impact**:
- Future contributors can reference standards before implementation
- AI can check standards during pre-ship reviews
- Pattern is now enforceable in code reviews
- Reduces architectural thrash and rework

#### 3. User Intervention Catches What AI Might Miss

**Discovery**: The user asked a critical question: "Are you sure the persistence should go through `hodge`? How is the writing of explorations.md, decisions.md, and lessons learned handled?"

This question triggered investigation that revealed:
- `/explore` template writes exploration.md using Write tool
- `/ship` template writes lessons using Write tool
- Pattern was consistent but undocumented

**What This Reveals**:
- AI can miss existing patterns when they're not explicitly documented
- User domain knowledge is invaluable for catching architectural misalignments
- Quick questions can save hours of implementation thrash

**Pattern Established**:
When implementing new slash command features, ALWAYS check:
1. How do existing slash commands handle similar operations?
2. Is there an established pattern in the codebase?
3. Should this pattern be documented in standards.md?

#### 4. Template-Based Logic Is Acceptable For Simple Operations

**Discovery**: Not everything needs TypeScript. Simple bash operations in templates are fine for:
- Filename generation (sed, awk)
- Metadata extraction (grep with regex)
- Feature detection (git blame parsing)

**Why This Works**:
- Bash is fast and well-suited for text manipulation
- Template logic is visible and easily understood
- Write tool handles file I/O reliably
- No need for Service class boilerplate

**When To Use Templates vs Service Classes**:
- **Templates (slash commands)**: Content generation, user interaction, file writing
- **Service Classes (CLI)**: Business logic, data processing, PM integration, testable operations

### Code Examples

**Before (Wrong Approach)**:
```typescript
// src/lib/review-persistence-service.ts
export class ReviewPersistenceService {
  generateFilename(scope: string, target: string): string {
    const targetSlug = target.replace(/\//g, '-').replace(/[^a-zA-Z0-9-_.]/g, '-');
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    return `${targetSlug}-${timestamp}.md`;
  }

  saveReport(report: string, metadata: ReviewMetadata): string {
    const filename = this.generateFilename(metadata.scope, metadata.target);
    const filepath = join('.hodge', 'reviews', filename);
    const frontmatter = `---\nreviewed_at: ${metadata.reviewed_at}\n...---\n`;
    writeFileSync(filepath, frontmatter + report, 'utf-8');
    return filepath;
  }
}
```

**After (Correct Approach)**:
```markdown
<!-- .claude/commands/review.md -->
## Step 6: Save Review Report (Optional)

### If user chooses 's' (Save):

1. **Generate filename** from file path and timestamp:
```bash
FILE_SLUG=$(echo "{{file_path}}" | sed 's|^\./||' | sed 's|/|-|g' | sed 's|[^a-zA-Z0-9._-]|-|g')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")
FILENAME="${FILE_SLUG}-${TIMESTAMP}.md"
```

2. **Use Write tool to save report** with YAML frontmatter:

Create the full report content with metadata header, then use the Write tool:

**File path**: `.hodge/reviews/{{filename}}`
**Content structure**:
```markdown
---
reviewed_at: {{iso_timestamp}}
scope: file
target: {{file_path}}
---

{{full_report_content}}
```
```

### Impact

**Development Efficiency**:
- ✅ Caught architectural mismatch before shipping
- ✅ Deleted ~150 lines of unnecessary Service class code
- ✅ Pivoted to correct pattern in < 30 minutes
- ✅ Documented pattern to prevent future violations

**Code Quality**:
- ✅ Follows established Hodge workflow patterns
- ✅ Standards.md now documents Write tool usage
- ✅ All harden validations passed (tests, lint, typecheck, build)
- ✅ Template-only changes (no TypeScript code to test)

**Architecture**:
- ✅ Clean separation: CLI = orchestration, AI = content generation
- ✅ Prevented Service class proliferation
- ✅ Consistent with explore/ship/decide workflows
- ✅ Future-proof for scope expansion (directory/pattern/recent/all)

### Related Decisions

From `.hodge/features/HODGE-327.1/build/build-plan.md`:

**Architectural Pivot**: Use Pure Template Implementation (Approach 2) instead of Service-Based Persistence (Approach 1)
- Discovered that AI writes exploration.md, decisions.md, and lessons via Write tool
- Service class approach violated this established pattern
- CLI only creates directory structures, not content files

**Write Tool Standardization**: Document Write tool as the standard pattern for slash command file creation
- Consistent with explore, ship, decide workflows
- Maintains clean separation: CLI = orchestration, AI = content generation
- Write tool handles parent directory creation automatically

### Validation

**Harden Phase Results**:
- ✅ All tests passed (existing tests continue working)
- ✅ Zero ESLint errors
- ✅ Zero TypeScript errors
- ✅ Build successful
- ✅ Total validation time: 35.2 seconds

**Files Changed**:
- 1 template file enhanced (review.md, +98 lines)
- 1 auto-generated sync (claude-commands.ts, +98 lines)
- 1 standards update (standards.md, +34 lines)
- 1 Service class deleted (review-persistence-service.ts, -150 lines)

### Lessons for Future Work

1. **Check existing patterns before implementing**
   - Grep for similar file operations in templates
   - Review how explore/ship/decide handle file writing
   - Ask: "Is there already a pattern for this?"

2. **Document patterns proactively**
   - If you discover an undocumented pattern, document it immediately
   - Update standards.md with examples (❌ BAD vs ✅ GOOD)
   - Save future developers from making the same mistakes

3. **Service classes are for CLI business logic, not slash command file operations**
   - Slash commands use Write tool for file creation
   - Service classes handle data processing, PM integration, testable operations
   - Don't conflate the two responsibilities

4. **User questions are architectural guardrails**
   - When a user asks "Are you sure?", investigate thoroughly
   - Domain knowledge catches what documentation might miss
   - Quick clarifications prevent hours of rework

5. **Bash in templates is perfectly acceptable**
   - Not everything needs TypeScript
   - Simple text manipulation is well-suited for bash
   - Focus on readability and maintainability

---

**Documented**: October 4, 2025
**Developer**: Michael Kelly
**AI Assistant**: Claude Code (Claude Sonnet 4.5)
**Workflow**: Explore → Build → Pivot → Harden → Ship (Hodge progressive development)


# Lessons Learned: HODGE-333.4

## Feature: Profile Composition System and Harden Integration for AI Code Review

### The Problem

After HODGE-333.1-333.3 shipped the review profile infrastructure (frontmatter format, auto-detection during init, and 39 comprehensive profiles), the system had all the pieces but was missing the integration layer. Developers had profiles but no way to use them together, and the `/harden` command ran validation tests without any code review step. The gap: **no composition system to load multiple profiles with project context, and no integration into the development workflow.**

### Approach Taken

We followed **Approach 1: Service-First with Incremental Integration**, breaking the feature into 4 sequential phases:

1. **Phase 1**: Built ProfileCompositionService as a separate service (not extending ContextAggregator)
   - Loads profiles from `.hodge/review-config.md` with fallback to defaults
   - Concatenates project context (standards, principles, decisions, patterns) + profiles
   - Implements precedence rules via explicit instruction blocks
   - 5 smoke tests validating core composition logic

2. **Phase 2**: Updated `/review file` command to use ProfileCompositionService
   - Replaced hardcoded `general-coding-standards` with full composition
   - Proved the composition system worked end-to-end
   - Fixed 8 smoke tests to match new output format

3. **Phase 3**: Integrated review into `/harden` workflow
   - Added `--review` flag to load context before validation
   - Implemented `handleReviewMode()` to get changed files and compose context
   - Added Step 5 to `.claude/commands/harden.md` for AI to generate review-report.md
   - Creates persistent review reports documenting AI findings

4. **Phase 4**: Expanded review scopes beyond single files
   - `/review directory <path>` - recursive file scanning with .gitignore filtering
   - `/review recent --last N` - reviews files from last N commits
   - Registered review command in CLI with proper options

**Key Architectural Decision**: Created ProfileCompositionService as a **separate service** from ContextAggregator to follow Single Responsibility Principle. ContextAggregator loads project context, ProfileCompositionService loads and composes profiles - clean separation of concerns.

### Key Learnings

#### 1. Conversational Flexibility Within Structured Frameworks

**Discovery**: The feature started with a clear plan (4 phases, specific deliverables), but during implementation we discovered missing functionality through natural conversation. For example:
- During harden testing, we realized review-report.md generation was specified but not implemented
- Through dialogue, we added Step 5 to harden.md template for AI to generate the report
- This "back and forth" felt natural and productive, not like a deviation from the plan

**User Insight**: *"It's nice that what we're building is a structure with standards and procedural components, but that we can still just have a conversation and get things done that way."*

**Solution**: The framework provides structure (standards.md, progressive phases, test requirements) while allowing conversational flexibility for discovery and iteration. The structure guides without constraining.

**Pattern**: Structure + Conversation = Flexible Discipline
- Structure provides guardrails (standards, phases, test gates)
- Conversation enables discovery and course correction
- Neither alone is sufficient - you need both

#### 2. CLI/AI Separation Requires Constant Vigilance

**Discovery**: We encountered CLI/AI boundary confusion **again** during this feature. Initially considered having HardenCommand generate review-report.md, but this violated the established pattern:
- CLI discovers structure and provides manifests (paths to files)
- AI reads content and generates reports (interpretation and synthesis)

**User Insight**: *"We once again struggled with being clear about the core concern of the CLI vs AI. We had to go another round on that."*

**Solution**: Reinforced the pattern in `.claude/commands/harden.md` - the CLI runs `hodge harden --review` to prepare context files, then the AI reads those files and generates review-report.md using the Write tool. The CLI never writes content that requires interpretation.

**Recurring Pattern**: This is the **third time** we've had to clarify this boundary:
1. HODGE-327.1: Established that AI writes exploration.md, decisions.md, and review reports
2. HODGE-334: Added explicit standard about CLI/AI separation of concerns
3. HODGE-333.4: Applied pattern again but still needed discussion to get it right

**Why This Keeps Happening**: The boundary is conceptually clear but practically fuzzy. When implementing a new feature, it's tempting to add "just one more file write" to the CLI because it feels simpler. The discipline requires actively resisting that temptation.

**Mitigation**: Updated standards.md with HODGE-334 principle - CLI provides file manifests, AI interprets content. Every new feature that involves file creation should reference this standard explicitly.

#### 3. Test Maintenance Is Feature Work

**Discovery**: Each phase required updating existing tests to match new behavior:
- Phase 2: Fixed review.integration.test.ts (3 tests) for new output format
- Phase 2: Updated review.smoke.test.ts (2 tests) for ProfileCompositionService
- Phase 3: Fixed standards-enforcement.smoke.test.ts for new harden.md template
- Phase 3: Added harden.md template content validation

**Learning**: Tests are not "set and forget" - they evolve with the codebase. Updating tests is not rework, it's an essential part of feature delivery. The tests validate behavior, and when behavior changes (even improvements), tests must change too.

**Time Impact**: Test updates took approximately 20% of total implementation time. This is normal and expected, not a sign of poor initial testing.

#### 4. Phased Delivery Validates Architecture Early

**Discovery**: By building ProfileCompositionService first (Phase 1) and proving it with `/review file` (Phase 2), we validated the architecture before tackling the complex `/harden` integration (Phase 3).

**Benefit**: When Phase 3 encountered challenges (like the CLI/AI boundary confusion), we knew the composition layer was solid. The problem space was isolated - we weren't debugging composition AND integration simultaneously.

**Contrast**: If we had used "Feature-Complete Big Bang" (Approach 2), discovering the CLI/AI boundary issue would have required untangling composition logic, review integration, and harden workflow all at once.

### Code Examples

#### ProfileCompositionService API

```typescript
// Clean separation: service composes, commands orchestrate
const compositionService = new ProfileCompositionService();
const result = compositionService.composeReviewContext();

// Result includes metadata for CLI to report
console.log(`Loaded ${result.profilesLoaded.length} profiles`);
console.log(`Missing: ${result.profilesMissing.join(', ')}`);

// Content ready for AI to use
const reviewContext = result.content; // Markdown with precedence rules
```

#### Harden Review Integration Pattern

```typescript
// CLI prepares context (--review mode)
if (options.review) {
  const changedFiles = await this.getChangedFiles();
  const compositionResult = compositionService.composeReviewContext();

  // Save files for AI to read
  await fs.writeFile(path.join(hardenDir, 'review-context.md'),
                     compositionResult.content);
  await fs.writeFile(path.join(hardenDir, 'changed-files.txt'),
                     changedFiles.join('\n'));

  // CLI stops here - AI takes over
  return;
}
```

#### AI Generates Review Report (Write Tool Pattern)

```markdown
# In .claude/commands/harden.md Step 5:
Use the Write tool to create `.hodge/features/{{feature}}/harden/review-report.md`

# AI reads context, analyzes files, generates structured report:
- 🚫 Blockers (must fix)
- ⚠️ Warnings (should address)
- 💡 Suggestions (optional)
```

### Impact

**Developer Experience**:
- `/harden` now runs AI code review before validation tests
- Review reports persist findings for future reference
- Multi-scope review support (file, directory, recent commits)

**Architecture Quality**:
- Clean separation: ProfileCompositionService vs ContextAggregator (SRP)
- CLI/AI boundary maintained (CLI = structure, AI = interpretation)
- 18 total tests across 3 test types (smoke, integration, command)

**Framework Evolution**:
- Completed HODGE-333 epic (4 sub-features shipped)
- Established reusable composition pattern for future profile-based features
- Demonstrated phased delivery approach works for complex integrations

### Related Decisions

From exploration.md:
1. Create ProfileCompositionService separate from ContextAggregator
2. Explicit instruction blocks for precedence (project context > profiles)
3. Fail fast on missing project files, warn on missing profiles
4. `/review directory` reviews recursively with .gitignore filtering
5. `/review recent --last N` uses git diff for changed files
6. `/harden` runs review before tests, blocks on BLOCKER severity
7. Structured review report format (Blocker/Warning/Suggestion)

From standards.md (added during feature):
- CLI/AI Separation of Concerns (HODGE-334): CLI provides file manifests, AI interprets content

### Takeaways for Future Features

1. **Embrace Conversational Discovery**: Don't treat deviation from the plan as failure - it's how we discover missing requirements. The plan guides, conversation refines.

2. **CLI/AI Boundary Needs Active Defense**: Every file-writing decision should explicitly ask: "Is this structure (CLI) or interpretation (AI)?" Default to AI for content that requires judgment.

3. **Budget for Test Maintenance**: When estimating features, include time for updating existing tests. It's 15-25% of implementation time for features that touch established commands.

4. **Phased Delivery Isolates Risk**: Build foundation first, prove it works, then integrate. When issues arise (and they will), the problem space is smaller.

5. **Lessons Are for Patterns, Not Just History**: This lesson itself follows a pattern - it will inform future lessons. The meta-lesson: document not just what happened, but **why patterns emerge and how to recognize them earlier next time.**

---
_Documented: 2025-10-08_
_Changes: 14 files modified, 562 additions, 183 deletions_
_Tests: 913 passing, 41 skipped_
_Phases: 4 (all completed)_


# Lessons Learned: HODGE-334

## Feature: Auto-Load Parent and Sibling Context for Sub-Feature Exploration

### The Problem

When exploring sub-features (e.g., HODGE-333.3), developers had to manually load parent context with `/hodge HODGE-333`, and even then, they missed valuable insights from shipped sibling features (HODGE-333.1, HODGE-333.2). This created:
- Duplicated effort across sub-features
- Missed patterns and architectural decisions from siblings
- Incomplete context for making informed implementation choices

The solution needed to automatically detect sub-features, load parent and sibling context, and present it intelligently to the AI for synthesis during exploration.

### The Wrong Path: CLI Content Synthesis

**Initial Approach**: Build a service that reads files, parses markdown, extracts sections (problem statements, decisions, recommendations), and returns pre-digested content summaries to the AI.

**Implementation Started**:
```typescript
class SubFeatureContextService {
  loadParentContext(parent: string): ParentContext {
    const exploration = readFileSync(explorationPath, 'utf-8');

    // Extract Problem Statement
    const problemMatch = exploration.match(/## Problem Statement\s+([\s\S]*?)(?=\n## |$)/);
    context.problemStatement = problemMatch[1].trim();

    // Extract Recommendation
    const recommendationMatch = exploration.match(/## Recommendation\s*\n+([\s\S]*?)(?=\n## |$)/);
    context.recommendation = recommendationMatch[1].trim();

    // Extract decisions...
    // Extract lessons...

    return context; // Pre-digested summary
  }
}
```

**The CLI output**:
```
📚 Sub-Feature Context for HODGE-333.3

Parent: HODGE-333
Problem Statement: Need consistent review profile format across the codebase.
Recommendation: Use unified markdown approach with gray-matter frontmatter parsing.

Shipped Siblings:
  HODGE-333.1:
    Decisions: Simplified approach - no AST parsing
    Infrastructure: frontmatter-parser.ts, markdown-utils.ts
    Lessons: Gray-matter is much simpler than AST parsing
```

**Why This Was Wrong**:
1. **CLI doing AI work**: The CLI was interpreting content (deciding what's important, how to summarize)
2. **Rigid extraction**: Regex patterns couldn't adapt to conversation context or user needs
3. **Lost flexibility**: AI couldn't dig deeper into specific sections or ask follow-up questions about the content
4. **Violated architecture principle**: "AI writes content, CLI creates structure" from standards.md

### The Right Path: CLI Identifies, AI Interprets

**Critical Realization**: The user asked "Ultrathink about what you just said, the CLI gathers context but doesn't return the context to the AI. The AI must then re-gather the context. Is that right? If so, why did the CLI gather the context in the first place?"

This exposed the fundamental flaw: **The CLI should identify WHAT to read, not WHAT it says**.

**Corrected Approach**: CLI uses codified rules to build a file manifest with metadata, returns paths and precedence, lets AI read and synthesize naturally.

**Implementation**:
```typescript
interface FileManifest {
  parent?: {
    feature: string;
    files: FileManifestEntry[];  // Just paths + metadata
  };
  siblings: Array<{
    feature: string;
    shippedAt: string;
    files: FileManifestEntry[];  // Just paths + metadata
  }>;
  suggestedReadingOrder: string;
}

interface FileManifestEntry {
  path: string;                    // File location
  type: 'exploration' | 'decisions' | 'ship-record' | 'lessons';
  feature: string;
  precedence: number;              // 1=read first, 4=read last
  timestamp?: string;
}

class SubFeatureContextService {
  buildFileManifest(parent: string, exclude: string[]): FileManifest | null {
    // CLI identifies which files exist and are relevant
    // CLI assigns reading precedence
    // CLI validates ship records (codified rule: validationPassed: true)
    // CLI returns structured manifest
    // NO reading, NO parsing, NO content interpretation
  }
}
```

**CLI Output (File Manifest)**:
```
📚 Sub-Feature Context Available
Feature: HODGE-333.3 (child of HODGE-333)

Parent: HODGE-333
  - .hodge/features/HODGE-333/explore/exploration.md
  - .hodge/features/HODGE-333/decisions.md

Shipped Siblings (2):
  HODGE-333.1 (shipped 2025-10-05):
    - .hodge/features/HODGE-333.1/ship/ship-record.json
    - .hodge/lessons/HODGE-333.1-frontmatter-parsing.md

  HODGE-333.2 (shipped 2025-10-06):
    - .hodge/features/HODGE-333.2/ship/ship-record.json

Suggested reading order: parent exploration → parent decisions → sibling ship records → sibling lessons
```

**Template Instructions to AI** (`.claude/commands/explore.md`):
```markdown
### 1. Sub-Feature Context (Auto-Loaded)
**IMPORTANT**: If the CLI output shows "📚 Sub-Feature Context Available", you MUST:

1. **Read all listed files** in the suggested order:
   - Parent exploration.md (understand the epic)
   - Parent decisions.md (know what was decided)
   - Sibling ship records (see what worked)
   - Sibling lessons (learn from experience)

2. **Synthesize context naturally** during exploration conversation:
   - Reference parent problem statement when discussing requirements
   - Mention sibling decisions when exploring approaches
   - Cite lessons learned when identifying gotchas
   - Leverage infrastructure created by siblings
```

**AI Then Reads and Synthesizes**:
- AI uses Read tool to access files
- AI extracts what's relevant to the conversation
- AI adapts depth based on user questions
- AI references context naturally: "Since HODGE-333.1 used gray-matter for frontmatter parsing, we could extend that approach..."

### Key Learnings

#### 1. Separation of Concerns: CLI vs AI

**Discovery**: We started building content extraction logic (regex parsing, section extraction, summarization) in the CLI service before realizing this violated the core architecture principle.

**The Principle**:
- **CLI Responsibility**: Structure discovery using codified rules
  - Detect patterns (HODGE-333.1 is sub-feature of HODGE-333)
  - Validate state (ship-record.json has validationPassed: true)
  - Identify relevant files (exploration.md exists, decisions.md exists)
  - Assign metadata (precedence, timestamps, types)
  - Return structured manifest (paths + metadata)

- **AI Responsibility**: Content interpretation and synthesis
  - Read files based on manifest
  - Extract relevant information for current context
  - Synthesize across multiple sources
  - Adapt to conversation needs
  - Reference naturally during exploration

**Why This Matters**:
- **Flexibility**: AI can dig deeper, skip irrelevant parts, adapt to user questions
- **Simplicity**: CLI logic stays focused on detection and validation
- **Testability**: Test CLI with file existence checks, not content parsing
- **Maintainability**: Content changes don't require CLI updates
- **Evolution**: Easy to add new file types without changing extraction logic

**Code Example - The Right Way**:
```typescript
// CLI: Just paths and metadata, no content reading
buildFileManifest(parent: string): FileManifest {
  const files: FileManifestEntry[] = [];

  // Check existence (codified rule)
  const explorationPath = join(parentDir, 'explore', 'exploration.md');
  if (existsSync(explorationPath)) {
    files.push({
      path: explorationPath,
      type: 'exploration',
      feature: parent,
      precedence: 1,  // Read first
    });
  }

  // Validate ship record (codified rule)
  const shipRecord = this.loadShipRecord(sibling);
  if (shipRecord?.validationPassed) {
    files.push({
      path: shipRecordPath,
      type: 'ship-record',
      precedence: 3,
      timestamp: shipRecord.timestamp,
    });
  }

  return { parent, files, suggestedReadingOrder: "..." };
}

// AI (in template): Reads and interprets
Read(manifestEntry.path) → extracts what's needed for conversation
```

#### 2. Codified Rules Enable Reliable Detection

**What Worked**: Clear, testable rules for sub-feature detection:
- Pattern: `/^(HODGE-\d+)\.(\d+)$/` (numeric only, one level deep)
- Validation: `shipRecord.validationPassed === true`
- Exclusion: User input parsed as `['333.1', 'HODGE-333.1']`

**Why**: These rules are deterministic, testable, and don't require content interpretation.

**Tests Validate Rules**:
```typescript
smokeTest('detects sub-feature pattern correctly', () => {
  expect(service.detectSubFeature('HODGE-333.1')).toEqual({
    isSubFeature: true,
    parent: 'HODGE-333',
  });
});

smokeTest('validates ship records correctly', () => {
  // Only includes siblings with validationPassed: true
  expect(manifest.siblings).toHaveLength(1);
  expect(manifest.siblings[0].feature).toBe('HODGE-333.1');
});
```

#### 3. Precedence Guides Without Constraining

**Solution**: Assign precedence numbers to guide AI reading order:
1. Parent exploration (understand the epic)
2. Parent decisions (know constraints)
3. Sibling ship records (see what was built)
4. Sibling lessons (learn from experience)

**Why This Works**:
- AI knows where to start
- AI can deviate if conversation needs it
- User sees suggested order but isn't forced
- New file types can slot into precedence scheme

#### 4. Template Instructions Bridge CLI and AI

**Pattern**: CLI outputs manifest → Template translates to AI instructions → AI executes

**Template Layer**:
```markdown
### 1. Sub-Feature Context (Auto-Loaded)
If CLI shows "📚 Sub-Feature Context Available":
1. Read files in suggested order
2. Synthesize during conversation
3. Ask user about exclusions
```

**Why Effective**:
- Template is the "translation layer" between CLI data and AI behavior
- AI gets clear instructions without CLI needing to understand AI capabilities
- Easy to update AI behavior without touching CLI code

### Impact

**Before This Feature**:
- Developers manually ran `/hodge HODGE-333` to load parent
- Sibling context completely missed
- Duplicated work across sub-features
- Inconsistent awareness of architectural decisions

**After This Feature**:
- Automatic parent and sibling context detection
- File manifest presented to AI for intelligent synthesis
- 18 tests validating detection and manifest building
- Clean separation: CLI identifies, AI interprets

**Before This Lesson**:
- Started building content extraction in CLI
- Regex parsing for markdown sections
- Pre-digested summaries returned to AI
- Violating "AI writes content, CLI creates structure" principle

**After This Lesson**:
- CLI only identifies files and validates state
- File manifest with paths and metadata
- AI reads and synthesizes naturally
- Architecture principle followed correctly

### Related Decisions

From `.hodge/features/HODGE-334/explore/exploration.md`:
1. **Sub-feature pattern scope**: Only numeric patterns (HODGE-333.1) one level deep
2. **Shipped status check**: Use ship/ship-record.json with validationPassed: true
3. **Implementation approach**: Backend service (Approach 2) for testability and reusability
4. **Context presentation style**: Hybrid - file manifest + AI synthesis (not CLI summaries)

### Pattern Potential: CLI/AI Separation Architecture

**Reusable Pattern for Future Features**:

When building features that involve context loading, document analysis, or content synthesis:

1. **Define Codified Rules** (CLI domain):
   - What patterns to detect (regex, file paths, naming conventions)
   - What state to validate (flags, checksums, timestamps)
   - What files to include/exclude
   - What precedence to assign

2. **Build File Manifest** (CLI output):
   ```typescript
   interface Manifest {
     items: Array<{
       path: string;           // Where to find it
       type: string;           // What kind of thing it is
       metadata: object;       // Context-specific data
       precedence: number;     // Suggested reading order
     }>;
     suggestedAction: string;  // What to do with it
   }
   ```

3. **Provide AI Instructions** (Template):
   - What to read
   - In what order
   - How to synthesize
   - When to reference

4. **Let AI Interpret** (AI execution):
   - Read files using manifest
   - Extract relevant content
   - Synthesize across sources
   - Adapt to conversation

**This Pattern Applies To**:
- ✅ `/explore` sub-feature context (HODGE-334)
- 🔄 `/review` profile loading (needs audit - mentioned in lesson)
- 🔄 `/build` context loading (future enhancement)
- 🔄 `/decide` decision context (future enhancement)

### Action Item: Audit /review Command

**User Insight**: "We need to take another look at our initial implementation of the /review process to ensure that it follows the same pattern."

**Current Implementation to Audit**:
- Does `/review` CLI parse review profile content or just identify files?
- Does it return file paths or pre-digested profile data?
- Does AI read markdown files directly or receive summaries?

**Expected Pattern**:
```typescript
// CLI should:
interface ReviewManifest {
  profiles: Array<{
    path: string;              // .hodge/review-profiles/security.md
    name: string;              // 'security'
    type: 'review-profile';
    precedence: number;
  }>;
  scope: {
    files: string[];           // Files to review
    type: 'file' | 'directory' | 'recent';
  };
}

// AI should:
// 1. Read profile markdown files
// 2. Extract review criteria
// 3. Apply to code review
// 4. Generate report
```

**If audit finds violations**, create follow-up feature to refactor `/review` to match this pattern.

---

_Documented: 2025-10-07_
_Stats: 507 lines service code, 248 lines smoke tests, 274 lines integration tests, 18 tests total_


---

## Reusable Review Profiles (LOWER PRECEDENCE)

**Remember**: If any profile guidance conflicts with project standards above, follow the project standards.
