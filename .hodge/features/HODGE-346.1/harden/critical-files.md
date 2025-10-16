# Critical Files for Review

**Generated**: 2025-10-16T13:47:28.871Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 24 files changed, top 10 selected for deep review

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
| 1 | 201 | .hodge/features/HODGE-346/issue-id.txt | 1 blocker issue, 2 warnings, new file |
| 2 | 175 | report/jscpd-report.json | 1 blocker issue, 1 warning, large change (631 lines) |
| 3 | 150 | .hodge/features/HODGE-346/explore/exploration.md | 2 warnings, large change (745 lines), new file |
| 4 | 150 | .hodge/review-profiles/ux-patterns/claude-code-slash-commands.md | 2 warnings, large change (512 lines), new file |
| 5 | 150 | src/lib/ux-profile-validation.smoke.test.ts | 1 blocker issue, 1 warning, medium change (145 lines), new file, test file (lower priority) |
| 6 | 148 | .hodge/features/HODGE-346.1/build/build-plan.md | 2 warnings, new file |
| 7 | 131 | .hodge/features/HODGE-346/plan.json | 2 warnings, new file |
| 8 | 130 | .hodge/temp/plan-interaction/HODGE-346/plan.json | 2 warnings, new file |
| 9 | 127 | src/lib/git-utils.ts | 5 warnings |
| 10 | 126 | package.json | 1 blocker issue, 1 warning |

## All Changed Files (24 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-346/issue-id.txt | 201 | ✅ Yes (Rank 1) |
| report/jscpd-report.json | 175 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-346/explore/exploration.md | 150 | ✅ Yes (Rank 3) |
| .hodge/review-profiles/ux-patterns/claude-code-slash-commands.md | 150 | ✅ Yes (Rank 4) |
| src/lib/ux-profile-validation.smoke.test.ts | 150 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-346.1/build/build-plan.md | 148 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-346/plan.json | 131 | ✅ Yes (Rank 7) |
| .hodge/temp/plan-interaction/HODGE-346/plan.json | 130 | ✅ Yes (Rank 8) |
| src/lib/git-utils.ts | 127 | ✅ Yes (Rank 9) |
| package.json | 126 | ✅ Yes (Rank 10) |
| .hodge/features/HODGE-346/explore/context.json | 125 | ❌ No |
| .hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml | 125 | ❌ No |
| .hodge/features/HODGE-346/explore/test-intentions.md | 124 | ❌ No |
| .hodge/features/HODGE-346.1/ship-record.json | 108 | ❌ No |
| .hodge/id-mappings.json | 104 | ❌ No |
| .hodge/development-plan.json | 78 | ❌ No |
| src/lib/toolchain-service.ts | 74 | ❌ No |
| .hodge/HODGE.md | 61 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/id-counter.json | 53 | ❌ No |
| .hodge/project_management.md | 51 | ❌ No |
| src/lib/review-engine-service.ts | 26 | ❌ No |
| src/lib/git-diff-analyzer.ts | 14 | ❌ No |
| src/test/profile-loading.smoke.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
