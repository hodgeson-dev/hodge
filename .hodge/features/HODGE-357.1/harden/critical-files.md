# Critical Files for Review

**Generated**: 2025-10-27T02:24:11.978Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 64 files changed, top 10 selected for deep review

## Scoring Factors

- Blocker issues: +100 points each
- Critical issues: +75 points each
- Warning issues: +25 points each
- Import fan-in: +2 points per import (high impact files)
- Lines changed: +0.5 points per line, bonus for large changes (>100 lines)
- New files: +50 points
- Critical path match: +50 points
- Test files: -50 points (lower priority)

## Critical Path Analysis

**Inferred Critical Paths**: None (no files with >20 imports)

**Configured Critical Paths**: None (add to .hodge/toolchain.yaml if needed)

## Top 10 Critical Files

| Rank | Score | File | Risk Factors |
|------|-------|------|-------------|
| 1 | 1226 | src/lib/detection.ts | 7 blocker issues, 21 warnings |
| 2 | 1000 | src/commands/init.ts | 5 blocker issues, 19 warnings |
| 3 | 956 | src/lib/pm/pm-hooks.ts | 6 blocker issues, 14 warnings |
| 4 | 791 | src/lib/tool-category-mapper.ts | 7 blocker issues, new file |
| 5 | 675 | src/lib/ship-service.ts | 4 blocker issues, 9 warnings, large change (405 lines) |
| 6 | 553 | src/lib/feature-populator.ts | 5 blocker issues, 2 warnings |
| 7 | 529 | src/lib/pm/github-adapter.ts | 3 blocker issues, 9 warnings |
| 8 | 477 | src/lib/prompts.ts | 4 blocker issues, 3 warnings |
| 9 | 475 | src/commands/harden.ts | 1 blocker issue, 14 warnings, medium change (137 lines) |
| 10 | 426 | src/lib/profile-composition-service.ts | 4 blocker issues, 1 warning |

## All Changed Files (64 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/detection.ts | 1226 | ✅ Yes (Rank 1) |
| src/commands/init.ts | 1000 | ✅ Yes (Rank 2) |
| src/lib/pm/pm-hooks.ts | 956 | ✅ Yes (Rank 3) |
| src/lib/tool-category-mapper.ts | 791 | ✅ Yes (Rank 4) |
| src/lib/ship-service.ts | 675 | ✅ Yes (Rank 5) |
| src/lib/feature-populator.ts | 553 | ✅ Yes (Rank 6) |
| src/lib/pm/github-adapter.ts | 529 | ✅ Yes (Rank 7) |
| src/lib/prompts.ts | 477 | ✅ Yes (Rank 8) |
| src/commands/harden.ts | 475 | ✅ Yes (Rank 9) |
| src/lib/profile-composition-service.ts | 426 | ✅ Yes (Rank 10) |
| src/commands/explore.ts | 401 | ❌ No |
| src/lib/pattern-learner.ts | 352 | ❌ No |
| src/lib/id-manager.ts | 332 | ❌ No |
| src/lib/todo-checker.ts | 251 | ❌ No |
| .hodge/features/HODGE-357/explore/exploration.md | 225 | ❌ No |
| src/commands/decide.ts | 201 | ❌ No |
| .hodge/features/HODGE-357.1/build/progress-checkpoint.md | 200 | ❌ No |
| src/lib/cache-manager.ts | 175 | ❌ No |
| src/lib/pm/linear-adapter.ts | 151 | ❌ No |
| .hodge/features/HODGE-356/explore/exploration.md | 150 | ❌ No |
| .hodge/features/HODGE-357.1/build/build-plan.md | 150 | ❌ No |
| .hodge/features/HODGE-357.1/explore/exploration.md | 150 | ❌ No |
| .hodge/features/HODGE-357/explore/test-intentions.md | 150 | ❌ No |
| src/lib/interaction-state.ts | 129 | ❌ No |
| .hodge/standards.md | 127 | ❌ No |
| .hodge/features/HODGE-356/build/refactoring-complete.md | 125 | ❌ No |
| .hodge/features/HODGE-356/explore/test-intentions.md | 125 | ❌ No |
| .hodge/features/HODGE-357.1/build/refactoring-complete.md | 125 | ❌ No |
| .hodge/features/HODGE-357.1/explore/test-intentions.md | 125 | ❌ No |
| .hodge/features/HODGE-357/plan.json | 125 | ❌ No |
| .hodge/features/HODGE-356/build/build-plan.md | 123 | ❌ No |
| .hodge/features/HODGE-357/build/build-plan.md | 123 | ❌ No |
| .hodge/features/HODGE-357/decisions.md | 114 | ❌ No |
| .hodge/features/HODGE-356/ship-record.json | 108 | ❌ No |
| .hodge/features/HODGE-357.1/ship-record.json | 106 | ❌ No |
| .hodge/id-mappings.json | 106 | ❌ No |
| src/lib/toolchain-generator.ts | 106 | ❌ No |
| .hodge/features/HODGE-357/ship-record.json | 105 | ❌ No |
| .hodge/features/HODGE-356/issue-id.txt | 101 | ❌ No |
| .hodge/features/HODGE-357.1/issue-id.txt | 101 | ❌ No |
| .hodge/features/HODGE-357/issue-id.txt | 101 | ❌ No |
| src/lib/review-tier-classifier.ts | 101 | ❌ No |
| report/jscpd-report.json | 100 | ❌ No |
| src/commands/ship.ts | 100 | ❌ No |
| src/lib/harden-service.ts | 100 | ❌ No |
| src/test/hodge-356.smoke.test.ts | 75 | ❌ No |
| .hodge/patterns/test-pattern.md | 69 | ❌ No |
| .hodge/HODGE.md | 64 | ❌ No |
| .hodge/.session | 57 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/project_management.md | 53 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |
| src/lib/ship-service.test.ts | 11 | ❌ No |
| src/lib/harden-service.test.ts | 8 | ❌ No |
| src/lib/pr-manager.ts | 2 | ❌ No |
| src/commands/harden.smoke.test.ts | 0 | ❌ No |
| src/commands/hodge-319.1.smoke.test.ts | 0 | ❌ No |
| src/commands/hodge-324.smoke.test.ts | 0 | ❌ No |
| src/commands/ship-clean-tree.integration.test.ts | 0 | ❌ No |
| src/commands/ship-clean-tree.smoke.test.ts | 0 | ❌ No |
| src/commands/ship.integration.test.ts | 0 | ❌ No |
| src/lib/toolchain-service-registry.integration.test.ts | 0 | ❌ No |
| src/lib/toolchain-service-registry.smoke.test.ts | 0 | ❌ No |
| src/lib/toolchain-service.smoke.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
