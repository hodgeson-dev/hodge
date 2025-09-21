# Test Intentions for HODGE-180 - Test Isolation Review

## Purpose
Ensure all tests use proper isolation and never modify the actual project's .hodge directory.

## Core Requirements
- [ ] No test should write to the actual project's .hodge directory
- [ ] All tests should use temporary directories from os.tmpdir()
- [ ] Test cleanup should remove only test-generated content
- [ ] Tests should not interfere with each other when run in parallel

## Critical Bug Fixes
- [ ] session-manager.test.ts should not write directly to '.hodge'
- [ ] session-manager.test.ts should use tmpdir() instead of process.cwd()
- [ ] auto-save.test.ts should use tmpdir() instead of process.cwd()
- [ ] context-aware-commands.test.ts should use tmpdir() instead of process.cwd()
- [ ] context-manager.test.ts should use tmpdir() instead of process.cwd()

## Test Isolation Verification
- [ ] All test directories should be created in os.tmpdir()
- [ ] Test directories should have unique names (timestamp + random)
- [ ] afterEach hooks should clean up test directories
- [ ] Failed cleanup should not fail the test (log warning instead)
- [ ] No .test-* directories should remain after test runs

## Smoke Test Handling
- [ ] Smoke tests that read actual project files should be clearly documented
- [ ] Consider if smoke tests should use fixtures instead
- [ ] Ensure smoke tests are idempotent (read-only)

## Test Workspace Utility (if implemented)
- [ ] TestWorkspace should create isolated directory structure
- [ ] TestWorkspace should initialize .hodge structure correctly
- [ ] TestWorkspace cleanup should be reliable
- [ ] TestWorkspace should support custom initialization

## Validation Tests
- [ ] Running tests should not modify .hodge/saves/
- [ ] Running tests should not modify .hodge/context.json
- [ ] Running tests should not modify .hodge/.session
- [ ] Running tests should not create .test-* directories in project root
- [ ] Parallel test runs should not conflict

## Developer Experience
- [ ] Clear error messages when test isolation fails
- [ ] Contributing guide should document test isolation requirements
- [ ] Test helpers should make isolation easy to implement
- [ ] Pre-commit hook could warn about process.cwd() usage in tests

## Notes
Critical issues found during exploration:
- session-manager.test.ts lines 107 & 127 write directly to '.hodge'
- Multiple tests create directories in project root instead of tmpdir()
- Some smoke tests intentionally read actual project files (may be acceptable)

---
*Generated during exploration phase. Convert to actual tests during build phase.*