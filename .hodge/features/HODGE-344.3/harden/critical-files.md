# Critical Files for Review

**Generated**: 2025-10-14T19:11:41.627Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 15 files changed, top 10 selected for deep review

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
| 1 | 200 | src/lib/git-utils.ts | 5 warnings, medium change (122 lines), new file |
| 2 | 200 | src/types/review-engine.ts | 1 blocker issue, 1 warning, medium change (128 lines), new file |
| 3 | 100 | .hodge/features/HODGE-344.3/explore/exploration.md | large change (742 lines), new file |
| 4 | 100 | src/lib/review-engine-service.ts | large change (342 lines), new file |
| 5 | 99 | .hodge/features/HODGE-344.3/explore/test-intentions.md | new file |
| 6 | 78 | src/lib/toolchain-service.ts | 2 warnings |
| 7 | 75 | .hodge/features/HODGE-344.3/build/build-plan.md | medium change (132 lines), new file |
| 8 | 75 | src/lib/review-engine-service.smoke.test.ts | 1 warning, large change (472 lines), new file, test file (lower priority) |
| 9 | 66 | .hodge/features/HODGE-344.3/ship-record.json | new file |
| 10 | 63 | .hodge/project_management.md | new file |

## All Changed Files (15 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/git-utils.ts | 200 | ✅ Yes (Rank 1) |
| src/types/review-engine.ts | 200 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-344.3/explore/exploration.md | 100 | ✅ Yes (Rank 3) |
| src/lib/review-engine-service.ts | 100 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-344.3/explore/test-intentions.md | 99 | ✅ Yes (Rank 5) |
| src/lib/toolchain-service.ts | 78 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-344.3/build/build-plan.md | 75 | ✅ Yes (Rank 7) |
| src/lib/review-engine-service.smoke.test.ts | 75 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-344.3/ship-record.json | 66 | ✅ Yes (Rank 9) |
| .hodge/project_management.md | 63 | ✅ Yes (Rank 10) |
| .hodge/id-mappings.json | 54 | ❌ No |
| .hodge/features/HODGE-344.3/issue-id.txt | 51 | ❌ No |
| .hodge/HODGE.md | 19 | ❌ No |
| .hodge/.session | 10 | ❌ No |
| .hodge/context.json | 8 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
