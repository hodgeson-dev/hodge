# HODGE.md

This file provides AI assistants with context about the current Hodge workflow state.

## Current Status
**Feature**: general
**Mode**: explore
**Last Updated**: 2025-09-30T15:09:55.930Z
## Current Session
**Resumed**: 6 minutes ago
**Progress**: Explored HODGE-307 - template ready for AI approach generation
**Working on**: HODGE-307 (explore mode)
## AI Context Restoration
You were helping with HODGE-307. Explored HODGE-307 - template ready for AI approach generation
Suggested next: Review exploration and decide with 'hodge decide'
## Recent Decisions

- **2025-09-30**: Proceed with build anyway if user ignores PM creation prompt (non-blocking) - respects user agency, maintains 'freedom to explore' principle, never forces workflow interruption
- **2025-09-30**: Show PM creation prompt every time /build is called without PM mapping - ensures prompt isn't missed, respects user agency to change mind, simple non-blocking logic without state tracking
- **2025-09-30**: Reuse /plan command for single-issue creation - AI generates minimal single-issue plan when user responds affirmatively to PM creation prompt, maintaining consistent command API without new flags
- **2025-09-30**: Check for PM issue mapping before calling 'hodge build' CLI command - AI checks id-mappings
- **2025-09-30**: Use Template-Based Prompt Enhancement approach - add AI guidance to
- **2025-09-30**: Update both /hodge and /load commands with enhanced context loading - provides consistent experience and predictable behavior across the system
- **2025-09-30**: Load all
- **2025-09-30**: Keep current pattern loading behavior - load only on explicit reference or user request, following AI-CONTEXT
- **2025-09-30**: Load id-mappings
- **2025-09-30**: Load recent 20 decisions instead of full 1100+ line history - balances context completeness with performance
- **2025-09-30**: Extensive template documentation - Add vertical slice criteria, good/bad examples, and decision trees to
- **2025-09-30**: AI validation during plan generation only with mandatory user approval - AI warns during plan generation, but ALL plans require explicit user approval before hodge plan CLI is called (this is already enforced by /plan command architecture)
- **2025-09-30**: Auto-convert to single issue when vertical slicing fails - System automatically suggests single issue when stories cannot meet vertical slice criteria
- **2025-09-30**: Moderate vertical slice criteria - Stories must provide value to stakeholder AND be independently testable
- **2025-09-30**: Warn only validation strictness - Provide informational warnings about potential horizontal slicing without blocking plan generation
- **2025-09-30**: AI-Driven Design Only - Enhance the /plan command template to explicitly guide AI through vertical slice design, with clear criteria and examples
- **2025-09-29**: Interactive prompt with session memory for skip mechanism - respects user choice while encouraging best practices
- **2025-09-29**: Use {FEATURE}-{slug}
- **2025-09-29**: Keep lessons-draft
- **2025-09-29**: Few questions (3-4) for lessons enhancement - balance insight gathering with low friction

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
- Commands are called by Claude Code slash commands, never directly by developers
- There is no possibility of user interaction when called from slash commands
- NO prompts, confirmations, or user input of any kind
- All parameters must come from command arguments or environment variables
- If a decision is needed, the command should make a sensible default choice
- Use exit codes and structured output to communicate state

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

## Next Steps

1. Review exploration approaches
2. Make decision with `hodge decide`
3. Start building with `hodge build general`


---
_Generated by Hodge for cross-tool AI compatibility_