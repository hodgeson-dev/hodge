# Test Intentions for HODGE-303

## Purpose
Verify that the sync-claude-commands.js script generates properly formatted code that passes Prettier checks in both local and CI environments.

## Core Requirements
- [ ] Generated file should pass `npx prettier --check` locally
- [ ] Generated file should pass `npx prettier --check` in CI
- [ ] Sync script should complete within reasonable time (<500ms including prettier)
- [ ] Sync script should handle prettier failures gracefully

## Sync Script Behavior
- [ ] Should generate valid TypeScript with template literals
- [ ] Should escape backticks, backslashes, and ${} correctly
- [ ] Should run prettier on generated file automatically
- [ ] Should preserve all command content from .md files
- [ ] Should maintain consistent output across runs
- [ ] Should log prettier formatting step

## CI/Local Consistency
- [ ] Build → prettier check sequence should pass in CI
- [ ] Build → prettier check sequence should pass locally
- [ ] Generated file format should match .prettierrc rules
- [ ] No uncommitted changes after running build
- [ ] `npm run build && git status` should show clean working tree

## Error Handling
- [ ] Should handle prettier not installed (graceful degradation)
- [ ] Should provide clear error if prettier fails
- [ ] Should exit with appropriate code on failure
- [ ] Should log helpful error messages

## Integration Tests
- [ ] Should work with existing GitHub Actions workflow
- [ ] Should integrate with existing build pipeline
- [ ] Should not break npm scripts (build, sync:commands)
- [ ] Should emit appropriate console output

## Performance Criteria
- [ ] Sync script should complete in <500ms (including prettier)
- [ ] Should not significantly slow down build process
- [ ] Prettier formatting should be fast (<100ms)

## Edge Cases
- [ ] Should handle very large command files (>100KB)
- [ ] Should handle commands with complex markdown formatting
- [ ] Should handle special characters in command content
- [ ] Should work with different line ending configurations (LF/CRLF)
- [ ] Should handle missing .prettierrc (use defaults)

## Notes
- This fix addresses root cause: generated code formatting
- The issue manifests as CI failure but passes locally due to uncommitted changes
- Key insight: CI always regenerates, local may use stale generated files

---
*Generated during exploration phase. Convert to actual tests during build phase.*