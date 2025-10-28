# Critical Files for Review

**Generated**: 2025-10-27T22:31:01.149Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 72 files changed, top 10 selected for deep review

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
| 1 | 727 | src/test/mocks.ts | 29 warnings |
| 2 | 402 | src/test/runners.ts | 16 warnings |
| 3 | 302 | src/lib/session-manager.ts | 12 warnings |
| 4 | 275 | .hodge/features/HODGE-357.7/harden/critical-files.md | 2 blocker issues, medium change (112 lines), new file |
| 5 | 225 | .hodge/features/HODGE-357.7/build/progress-checkpoint.md | 1 blocker issue, 1 warning, large change (203 lines), new file |
| 6 | 203 | src/lib/pm/github-adapter.ts | 8 warnings |
| 7 | 201 | src/lib/ship-service.ts | 8 warnings |
| 8 | 200 | .hodge/features/HODGE-357.6/explore/test-intentions.md | 1 blocker issue, 1 warning, new file |
| 9 | 200 | src/commands/init/init-interaction.ts | 4 warnings, large change (677 lines), new file |
| 10 | 200 | src/commands/init/init-pm-config.ts | 4 warnings, large change (275 lines), new file |

## All Changed Files (72 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/test/mocks.ts | 727 | ✅ Yes (Rank 1) |
| src/test/runners.ts | 402 | ✅ Yes (Rank 2) |
| src/lib/session-manager.ts | 302 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-357.7/harden/critical-files.md | 275 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-357.7/build/progress-checkpoint.md | 225 | ✅ Yes (Rank 5) |
| src/lib/pm/github-adapter.ts | 203 | ✅ Yes (Rank 6) |
| src/lib/ship-service.ts | 201 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-357.6/explore/test-intentions.md | 200 | ✅ Yes (Rank 8) |
| src/commands/init/init-interaction.ts | 200 | ✅ Yes (Rank 9) |
| src/commands/init/init-pm-config.ts | 200 | ✅ Yes (Rank 10) |
| src/commands/plan/plan-generator.ts | 200 | ❌ No |
| src/lib/explore-service.ts | 185 | ❌ No |
| src/commands/plan.ts | 175 | ❌ No |
| .hodge/features/HODGE-357.5/build/refactoring-complete.md | 150 | ❌ No |
| .hodge/features/HODGE-357.6/build/build-plan.md | 150 | ❌ No |
| .hodge/features/HODGE-357.6/explore/exploration.md | 150 | ❌ No |
| .hodge/features/HODGE-357.7/build/build-plan.md | 150 | ❌ No |
| .hodge/features/HODGE-357.7/explore/exploration.md | 150 | ❌ No |
| .hodge/features/HODGE-357.7/harden/quality-checks.md | 150 | ❌ No |
| .hodge/features/HODGE-357.7/harden/review-manifest.yaml | 150 | ❌ No |
| src/commands/init/init-detection.ts | 150 | ❌ No |
| src/commands/plan/plan-decision-analyzer.ts | 150 | ❌ No |
| src/lib/pm/pm-hooks.ts | 150 | ❌ No |
| .hodge/features/HODGE-357.7/harden/auto-fix-report.json | 148 | ❌ No |
| .hodge/features/HODGE-357.5/build/progress-checkpoint.md | 125 | ❌ No |
| .hodge/features/HODGE-357.5/explore/exploration.md | 125 | ❌ No |
| .hodge/features/HODGE-357.5/explore/test-intentions.md | 125 | ❌ No |
| .hodge/features/HODGE-357.7/explore/test-intentions.md | 125 | ❌ No |
| src/commands/decide.ts | 125 | ❌ No |
| src/commands/harden.ts | 125 | ❌ No |
| src/commands/harden/harden-report-generator.ts | 125 | ❌ No |
| src/commands/plan/plan-display.ts | 125 | ❌ No |
| src/lib/pm/pm-issue-creator-service.ts | 125 | ❌ No |
| .hodge/features/HODGE-357.5/build/build-plan.md | 123 | ❌ No |
| .hodge/project_management.md | 120 | ❌ No |
| .hodge/features/HODGE-357.7/ship-record.json | 106 | ❌ No |
| .hodge/id-mappings.json | 106 | ❌ No |
| .hodge/features/HODGE-357.5/ship-record.json | 105 | ❌ No |
| .hodge/features/HODGE-357.6/ship-record.json | 105 | ❌ No |
| .hodge/features/HODGE-357.5/issue-id.txt | 101 | ❌ No |
| .hodge/features/HODGE-357.6/issue-id.txt | 101 | ❌ No |
| .hodge/features/HODGE-357.7/issue-id.txt | 101 | ❌ No |
| report/jscpd-report.json | 100 | ❌ No |
| src/commands/harden/harden-review.ts | 100 | ❌ No |
| src/commands/init.ts | 100 | ❌ No |
| src/lib/hodge-md/hodge-md-context-gatherer.ts | 100 | ❌ No |
| src/lib/pm/pm-adapter-service.ts | 100 | ❌ No |
| .eslintrc.json | 97 | ❌ No |
| src/commands/harden/harden-auto-fix.ts | 85 | ❌ No |
| src/lib/structure-generator.ts | 81 | ❌ No |
| src/commands/harden/harden-validator.ts | 75 | ❌ No |
| src/lib/auto-detection-service.ts | 75 | ❌ No |
| src/lib/hodge-md/hodge-md-file-writer.ts | 75 | ❌ No |
| src/lib/hodge-md/hodge-md-formatter.ts | 75 | ❌ No |
| src/lib/prompts.ts | 75 | ❌ No |
| .hodge/HODGE.md | 66 | ❌ No |
| src/lib/hodge-md/types.ts | 62 | ❌ No |
| .hodge/.session | 57 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| src/lib/git-utils.ts | 54 | ❌ No |
| src/lib/todo-checker.ts | 54 | ❌ No |
| src/lib/feature-populator.ts | 50 | ❌ No |
| src/lib/hodge-md-generator.ts | 50 | ❌ No |
| src/test/hodge-357-6.smoke.test.ts | 50 | ❌ No |
| src/lib/profile-composition-service.ts | 45 | ❌ No |
| src/lib/pattern-learner.ts | 29 | ❌ No |
| src/lib/review-tier-classifier.ts | 29 | ❌ No |
| src/lib/pm/conventions.ts | 27 | ❌ No |
| src/lib/pm/comment-generator-service.ts | 26 | ❌ No |
| src/lib/diagnostics-service.ts | 2 | ❌ No |
| src/test/helpers.ts | 1 | ❌ No |
| src/commands/plan.smoke.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
