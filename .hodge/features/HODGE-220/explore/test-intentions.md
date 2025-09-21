# Test Intentions for HODGE-220 - Fix Uncommitted Files After Ship

## Purpose
Ensure the ship command leaves a clean working tree with no uncommitted files after successful completion.

## Core Requirements
- [ ] Ship command should complete successfully
- [ ] After ship completes, `git status --porcelain` should return empty
- [ ] All metadata updates should be included in the commit
- [ ] The commit should contain all expected files

## Ship Workflow Tests
- [ ] Should update feature HODGE.md BEFORE creating commit
- [ ] Should update PM tracking BEFORE creating commit
- [ ] Should run autoSave BEFORE creating commit
- [ ] Should NOT modify any files AFTER creating commit
- [ ] Should stage ALL changes with `git add -A` before commit

## File Modification Tests
- [ ] `.hodge/.session` should be committed with ship
- [ ] `.hodge/context.json` should be committed with ship
- [ ] `.hodge/id-counter.json` should be committed with ship
- [ ] `.hodge/id-mappings.json` should be committed with ship
- [ ] `.hodge/features/*/HODGE.md` should be committed with ship
- [ ] `.hodge/project_management.md` should be committed with ship

## Error Handling Tests
- [ ] If metadata update fails, should not create partial commit
- [ ] If git commit fails, should provide clear error message
- [ ] Should handle uncommitted changes gracefully
- [ ] Should handle merge conflicts appropriately

## Integration Tests
- [ ] Should work with auto-save enabled
- [ ] Should work with PM tracking enabled
- [ ] Should work with pattern learning enabled
- [ ] Should work when shipping from different phases

## Regression Tests
- [ ] Should still create proper commit message
- [ ] Should still update Linear/GitHub issues
- [ ] Should still learn patterns from shipped code
- [ ] Should still support --no-commit flag
- [ ] Should still support --push flag

## User Experience
- [ ] Should clearly indicate all files are committed
- [ ] Should not require manual cleanup after ship
- [ ] Should maintain single atomic operation feel
- [ ] Working tree should be clean after successful ship

## Notes
Edge cases discovered during exploration:
- AutoSave creates new feature directories (HODGE-218, HODGE-219) during ship
- Feature HODGE.md regeneration happens after commit (line 578)
- PM tracking updates can happen at multiple points

---
*Generated during exploration phase. Convert to actual tests during build phase.*