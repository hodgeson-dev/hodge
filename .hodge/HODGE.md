# HODGE.md

This file provides AI assistants with context about the current Hodge workflow state.

## Current Status
**Feature**: HODGE-321
**Mode**: shipped
**PM Issue**: HODGE-321
**Last Updated**: 2025-10-03T20:20:39.383Z
## Current Session
**Resumed**: 1 hours ago
**Progress**: Explored HODGE-321 - template ready for AI approach generation
**Working on**: HODGE-321 (explore mode)
## AI Context Restoration
You were helping with HODGE-321. Explored HODGE-321 - template ready for AI approach generation
Suggested next: Review exploration and decide with 'hodge decide'
## Recent Decisions

- **2025-10-02**: Error if --feature directory doesn't exist - provides clear feedback to user, prevents typos in feature names, encourages proper workflow (run /explore before /decide), aligns with discipline principle
- **2025-10-02**: No migration - leave existing decision
- **2025-10-02**: Append decisions to accumulate in one file - multiple decisions for same feature build up in decisions
- **2025-10-02**: Use same template format as global decisions
- **2025-10-01**: Structure PM issue description with Problem Statement above Decisions Made - extract problem statement from exploration
- **2025-10-01**: Make Title field required for new explorations only - /explore template must generate Title field, existing features without Title continue using fallback patterns, no validation failure just ensures AI generates it for new explorations
- **2025-10-01**: AI-generated title field in exploration
- **2025-10-01**: Use 'No description available' fallback only when genuinely no content exists - no exploration
- **2025-10-01**: Fix exploration
- **2025-10-01**: Smart Description Extraction approach - enhance getFeatureDescription() to extract from decisions automatically when exploration
- **2025-10-01**: No backward compatibility concerns - This is a bug fix not a feature change, no evidence of dependencies on incorrect behavior, proceed with fix directly
- **2025-10-01**: Update /hodge template with clarification - Add note in
- **2025-10-01**: Skip --project flag for now - Don't add hodge context --project flag in this fix, keeps scope minimal and focused on bug fix, can add later if users request it
- **2025-10-01**: No staleness check for sessions - Always use session feature for mode detection regardless of age, keeps implementation simple, user can manually start new work if needed
- **2025-10-01**: Use session feature for mode detection - Load session first in loadDefaultContext(), use session
- **2025-10-01**: Write feature decisions to feature-specific decision
- **2025-10-01**: Add 'Shipped' as separate progress line (6th checkbox) - provides clear progression through all stages: Exploration → Decision → Build → Harden → Production Ready → Shipped
- **2025-10-01**: Use ship-record
- **2025-10-01**: Check feature root for decision
- **2025-10-01**: Use 'shipped' as mode name for completed features - matches existing phase terminology and natural past tense of ship phase

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
- **Root Cause**: Subprocesses create orphaned zombie processes that hang indefinitely
- **Symptom**: Tests timeout, hung Node processes require manual kill in Activity Monitor
- **Solution**: Test behavior through direct assertions, not subprocess execution
- **Exceptions**: None - if you think you need subprocess spawning, you're testing the wrong thing
- HODGE-317.1 (2025-09-30) eliminated subprocess spawning from test-isolation tests
- HODGE-318 (2025-10-01) inadvertently reintroduced it in commonjs-compatibility tests
- HODGE-319.1 (2025-10-03) fixed regression and added this standard

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

- `.hodge/features/HODGE-321/explore/exploration.md`
- `.hodge/features/HODGE-321/explore/test-intentions.md`
- `.hodge/features/HODGE-321/build/build-plan.md`
- `.hodge/features/HODGE-321/ship/lessons-draft.md`
- `.hodge/features/HODGE-321/ship/release-notes.md`
- `.hodge/features/HODGE-321/ship/ship-record.json`

## Next Steps

1. Feature completed. Start new work with `hodge explore <feature>`


---
_Generated by Hodge for cross-tool AI compatibility_