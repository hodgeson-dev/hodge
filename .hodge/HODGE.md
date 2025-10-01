# HODGE.md

This file provides AI assistants with context about the current Hodge workflow state.

## Current Status
**Feature**: HODGE-312
**Mode**: shipped
**PM Issue**: HODGE-312
**Last Updated**: 2025-10-01T05:06:28.906Z
## Current Session
**Resumed**: 3 hours ago
**Progress**: Explored HODGE-312 - template ready for AI approach generation
**Working on**: HODGE-312 (explore mode)
## AI Context Restoration
You were helping with HODGE-312. Explored HODGE-312 - template ready for AI approach generation
Suggested next: Review exploration and decide with 'hodge decide'
## Recent Decisions

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
- **2025-10-01**: Apply HODGE-311 logic to status command - port the exact same shipped-detection logic from hodge-md-generator
- **2025-10-01**: Use ship/ship-record
- **2025-10-01**: Keep shipped features visible in HODGE
- **2025-10-01**: Next steps for shipped features: 'Feature completed
- **2025-10-01**: Use 'shipped' as mode name for completed features - matches existing phase terminology and natural past tense of ship phase
- **2025-09-30**: Skip backward compatibility audit - only build
- **2025-09-30**: Document PM mapping check pattern in
- **2025-09-30**: Add smoke test for bash command logic to verify grep pattern correctly identifies externalID presence/absence - tests command syntax in isolation, provides regression protection for template changes
- **2025-09-30**: Use enhanced grep pattern for PM check: grep -A 2 "{{feature}}" | grep externalID - maintains template-only approach from HODGE-306, one-line fix in build
- **2025-09-30**: Move test file now during build phase to establish correct pattern immediately and prevent proliferation

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

## Working Files

- `.hodge/features/HODGE-312/explore/context.json`
- `.hodge/features/HODGE-312/explore/exploration.md`
- `.hodge/features/HODGE-312/explore/test-intentions.md`
- `.hodge/features/HODGE-312/build/build-plan.md`
- `.hodge/features/HODGE-312/build/context.json`
- `.hodge/features/HODGE-312/ship/release-notes.md`
- `.hodge/features/HODGE-312/ship/ship-record.json`

## Next Steps

1. Feature completed. Start new work with `hodge explore <feature>`


---
_Generated by Hodge for cross-tool AI compatibility_