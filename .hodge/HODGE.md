# HODGE.md

This file provides AI assistants with context about the current Hodge workflow state.

## Current Status
**Feature**: HODGE-348
**Mode**: explore
**PM Issue**: HODGE-348
**Last Updated**: 2025-10-25T07:45:38.470Z
## Current Session
**Resumed**: 39 minutes ago
**Progress**: Explored HODGE-348 - template ready for AI approach generation
**Working on**: HODGE-348 (explore mode)
## AI Context Restoration
You were helping with HODGE-348. Explored HODGE-348 - template ready for AI approach generation
Suggested next: Review exploration and decide with 'hodge decide'
## Recent Decisions

- **2025-09-22**: Implement Hybrid Progressive Enhancement for ship commit messages - Phase 1: Smart templates that analyze git diff, Phase 2: State persistence for edits, Phase 3: Interactive approval workflow
- **2025-09-21**: 1
- **2025-09-18**: Implement formal feature closure workflow: /close command or closure option in /ship to properly transition features to closed state with reasons
- **2025-09-18**: The /review command must provide dual awareness: 1) Current Claude Code conversation context (actual work in flight), 2) Filesystem persisted state, and 3) Identify any mismatches between them
- **2025-09-18**: Create HODGE-054: Update all workflow commands to be context-aware with optional feature override
- **2025-09-18**: Create HODGE-053: Implement discovery exploration mode for exploring topics without specific features
- **2025-09-18**: Create HODGE-052: Implement persistent current feature context in
- **2025-09-18**: Support dual-mode exploration: feature exploration for specific features, and discovery exploration for topics that result in feature creation
- **2025-09-18**: Implement context-aware commands with persistent current feature state in
- **2025-09-18**: The only hodge CLI command typically used by developers will be init
- **2025-09-18**: There will no longer be any effort given toward making hodge a tool intended for developers to use from the command line
- **2025-09-18**: All AI interactions and workflows for Claude Code slash commands will be in the
- **2025-09-18**: We are abandoning all effort to enable Hodge to integrate with any AI-assisted software development tool other than Claude Code
- **2025-09-16**: Implement cross-tool-compatibility using Hybrid approach with HODGE
- **2025-09-16**: TODO Comment Convention
- **2025-01-16**: Defer GitHub and Jira PM adapters until Linear adapter is fully tested
- **2025-01-16**: Implement actual tsconfig.json reading in standards validator
- **2025-01-16**: Document interaction state configuration as future enhancement
- **2025-09-16**: linting-standards-optimization
- **2025-09-15**: Use Progressive Enhancement approach for interactive ship commits with environment-specific optimizations

## Active Standards

### The Hodge Way
- - Test behavior, not implementation
- - Never test console.log calls or mock interactions
- - Tests evolve with code maturity
- - `any` is allowed in explore mode
- - Types tighten as code matures
- - TypeScript inference over explicit types
- - **Explore**: Rapid prototyping, no rules
- - **Build**: Basic standards, smoke tests
- - **Harden**: Strict standards, integration tests
- - **Ship**: Production ready, full coverage

### Core Standards
- TypeScript with strict mode
- ESLint rules enforced
- Prettier formatting

### Logging Standards (HODGE-330)
- Console output provides immediate user feedback
- Pino logs enable persistent debugging and troubleshooting
- Works for both user-executed commands (init, logs) and AI-orchestrated commands (explore, build, ship)
- Library operations are internal implementation details
- Console output from libraries creates noise without value
- All logging still captured in pino logs for debugging
- Test files (`*.test.ts`, `*.spec.ts`) - for test debugging
- Scripts directory (`scripts/**`) - for tooling output
- Logger implementation (`src/lib/logger.ts`) - implements the console wrapper
- `logger.info(message, context?)` - General information
- `logger.warn(message, context?)` - Warnings
- `logger.error(message, context?)` - Errors
- `logger.debug(message, context?)` - Debug info (only shown with DEBUG env var)
- Consistent with existing command patterns (logs.ts established the pattern)
- Proper encapsulation and testability
- Avoids static class proliferation
- Enables proper logger lifecycle management
- Preserves full error stack trace in pino JSON logs
- Enables better debugging and troubleshooting
- Maintains structured log format for analysis
- Error details searchable in log files
- **Warning level** during transition period (non-blocking)
- Automatically exempts test files, scripts, and logger.ts
- Will be upgraded to **error level** after migration completes

### CLI Architecture Standards
- **AI-Orchestrated** (explore, decide, build, harden, ship, save, load, plan, status, link): Called exclusively by Claude Code slash commands
- **User-Facing Exceptions** (init, logs): Interactive CLI tools called directly by developers
- AI-orchestrated commands MUST be non-interactive (no prompts, confirmations, or user input)
- All parameters must come from command arguments or environment variables
- Commands should make sensible default choices when decisions are needed
- Use exit codes and structured output to communicate state
- There is no possibility of user interaction when called from slash commands
- AI-orchestrated commands should extract testable business logic into Service classes
- CLI command classes remain thin orchestration wrappers (presentation layer)
- Test business outcomes through Service classes, not CLI orchestration
- User-facing commands (init, logs) may accept lower test coverage due to interactive nature
- **AI (via slash commands)** writes: exploration.md, decisions.md, lessons learned, review reports
- **hodge CLI** creates: directory structures, PM integration, status tracking
- **Never**: Service classes should NOT handle file writing for slash command workflows
- `/explore` → AI writes `exploration.md` using Write tool
- `/ship` → AI writes `.hodge/lessons/HODGE-XXX-slug.md` using Write tool
- `/review` → AI writes `.hodge/reviews/{filename}.md` using Write tool
- Maintains clean separation: CLI = orchestration, AI = content generation
- Avoids Service class proliferation for simple file operations
- Consistent with existing workflow patterns (explore, ship, decide)
- Write tool automatically handles parent directory creation
- **CLI Responsibility**: Structure discovery, validation, and manifest building
- - Detect patterns (e.g., HODGE-333.1 is sub-feature of HODGE-333)
- - Validate state (e.g., ship-record.json has validationPassed: true)
- - Identify relevant files (e.g., exploration.md exists, decisions.md exists)
- - Assign metadata (precedence, timestamps, types)
- - Return file manifest (paths + metadata, NO content reading)
- **AI Responsibility**: Content reading, interpretation, and synthesis
- - Read files based on CLI manifest
- - Extract relevant information for current context
- - Synthesize across multiple sources
- - Adapt to conversation needs
- - Reference naturally during interaction
- Maintains clean separation: CLI = structure discovery, AI = content interpretation
- Enables AI flexibility (dig deeper, skip irrelevant parts, adapt to conversation)
- Simplifies CLI logic (file existence checks, not content parsing)
- Testable with codified rules (validate patterns, not content interpretation)
- Aligns with "AI writes content, CLI creates structure" principle
- ✅ `/explore` sub-feature context: CLI identifies parent/sibling files, AI reads and synthesizes
- 🔄 `/review` (needs audit): Should follow same pattern
- 🔄 Future context-loading features: Must use file manifest approach

### Testing Requirements
- Test what users see, not how it works
- Focus on behavior and contracts
- Prefer integration tests over unit tests
- Use real dependencies when possible
- All tests must use temporary directories (`os.tmpdir()`) for file operations
- Use mocks or stubs instead of modifying actual project state
- Any test that needs a `.hodge` structure should create it in an isolated temp directory
- This prevents tests from corrupting project data or affecting other tests
- Violation of this rule can lead to data loss and unpredictable test behavior
- **REQUIRED**: Use `TempDirectoryFixture` from `src/test/temp-directory-fixture.ts` for all temporary directory operations
- **NEVER**: Use `Date.now()` or timestamps for directory naming (causes race conditions in parallel tests)
- **Pattern**: See `.hodge/patterns/temp-directory-fixture-pattern.md` for usage examples
- **Root Cause**: Subprocesses create orphaned zombie processes that hang indefinitely
- **Symptom**: Tests timeout, hung Node processes require manual kill in Activity Monitor
- **Solution**: Test behavior through direct assertions, not subprocess execution
- **Exceptions**: None - if you think you need subprocess spawning, you're testing the wrong thing
- HODGE-317.1 (2025-09-30) eliminated subprocess spawning from test-isolation tests
- HODGE-318 (2025-10-01) inadvertently reintroduced it in commonjs-compatibility tests
- HODGE-319.1 (2025-10-03) fixed regression and added this standard
- `.hodge/review-profiles/testing/general-test-standards.md` - Comprehensive test quality guidance
- `.hodge/patterns/test-pattern.md` - Test pattern examples

### File and Function Length Standards
- **Cognitive Load**: Files longer than 300 lines are harder to understand and navigate
- **Testability**: Large files often indicate too many responsibilities, making comprehensive testing difficult
- **Reviewability**: Code reviews become less effective when files exceed reviewable scope
- **Maintainability**: Changes to large files have higher risk of unintended side effects
- Extract service classes for business logic (move to `src/lib/`)
- Move shared utilities to common libraries
- Split by responsibility (Single Responsibility Principle)
- Consider if file is mixing orchestration with business logic
- Test files (`*.test.ts`, `*.spec.ts`) - automatically excluded
- Generated code - add to ESLint ignore patterns if needed
- **Single Responsibility**: Long functions often do too many things
- **Complexity Management**: Shorter functions are easier to reason about
- **Reusability**: Smaller functions are more likely to be reusable
- **Testing**: Functions under 50 lines are easier to test exhaustively
- Extract helper functions for repeated logic
- Move complex conditionals to well-named predicates
- Break sequential operations into pipeline steps
- Consider if function is mixing levels of abstraction
- Test files - automatically excluded (test cases may be longer for readability)
- **Build Phase**: Warnings shown, not blocking
- **Harden Phase**: Expected to be addressed, review required
- **Ship Phase**: Must be resolved or explicitly justified

### Code Comments and TODOs
- **TODO Convention**: Always use `// TODO:` comments for incomplete work
- - Format: `// TODO: [phase] description`
- - Examples:
- - `// TODO: Add error handling before ship`
- - `// TODO: Implement caching for performance`
- - `// TODO: Add tests in harden phase`
- **Phase Markers**: Include phase when relevant
- - `// TODO: [harden] Add integration tests`
- - `// TODO: [ship] Add proper error messages`
- **No Naked TODOs**: Always include what needs to be done
- **Review TODOs**: Check all TODOs before shipping

### Code Quality Gates
- No ESLint errors
- No TypeScript errors
- Test coverage >80% for shipped code
- Documentation for public APIs

### Performance Standards
- CLI commands respond within 500ms
- Build completes within 30s
- Tests complete within 30s

### Progressive Enforcement
- Standards are **suggestions only**
- Use `any` types freely
- Skip tests entirely
- Focus on proving concepts
- Standards **should** be followed
- Basic type safety
- Smoke tests required
- Error handling sketched
- Standards **must** be followed (warnings)
- Strict types required
- Integration tests required
- Comprehensive error handling
- Standards **strictly enforced** (blocking)
- All quality gates must pass
- Full test coverage required
- Performance benchmarks met

## Working Files

- `.hodge/features/HODGE-348/explore/exploration.md`
- `.hodge/features/HODGE-348/explore/test-intentions.md`

## Next Steps

1. Review exploration approaches
2. Make decision with `hodge decide`
3. Start building with `hodge build HODGE-348`


---
_Generated by Hodge for cross-tool AI compatibility_