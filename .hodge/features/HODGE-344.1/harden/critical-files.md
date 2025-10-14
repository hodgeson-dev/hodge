# Critical Files for Review

**Generated**: 2025-10-14T05:14:07.645Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 18 files changed, top 10 selected for deep review

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
| 1 | 225 | src/lib/git-utils.ts | 5 warnings, large change (256 lines), new file |
| 2 | 100 | .hodge/features/HODGE-344.1/explore/exploration.md | large change (544 lines), new file |
| 3 | 100 | .hodge/features/HODGE-344/explore/exploration.md | large change (468 lines), new file |
| 4 | 99 | .hodge/features/HODGE-344.1/explore/test-intentions.md | new file |
| 5 | 99 | .hodge/features/HODGE-344/explore/test-intentions.md | new file |
| 6 | 76 | .hodge/project_management.md | new file |
| 7 | 75 | .hodge/features/HODGE-344.1/build/build-plan.md | medium change (158 lines), new file |
| 8 | 75 | .hodge/features/HODGE-344/plan.json | medium change (124 lines), new file |
| 9 | 75 | .hodge/temp/plan-interaction/HODGE-344/plan.json | medium change (124 lines), new file |
| 10 | 66 | .hodge/features/HODGE-344.1/ship-record.json | new file |

## All Changed Files (18 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/git-utils.ts | 225 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-344.1/explore/exploration.md | 100 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-344/explore/exploration.md | 100 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-344.1/explore/test-intentions.md | 99 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-344/explore/test-intentions.md | 99 | ✅ Yes (Rank 5) |
| .hodge/project_management.md | 76 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-344.1/build/build-plan.md | 75 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-344/plan.json | 75 | ✅ Yes (Rank 8) |
| .hodge/temp/plan-interaction/HODGE-344/plan.json | 75 | ✅ Yes (Rank 9) |
| .hodge/features/HODGE-344.1/ship-record.json | 66 | ✅ Yes (Rank 10) |
| .hodge/id-mappings.json | 58 | ❌ No |
| .hodge/features/HODGE-344.1/issue-id.txt | 51 | ❌ No |
| .hodge/features/HODGE-344/issue-id.txt | 51 | ❌ No |
| src/lib/git-file-scoping.smoke.test.ts | 50 | ❌ No |
| .hodge/development-plan.json | 25 | ❌ No |
| .hodge/.session | 12 | ❌ No |
| .hodge/context.json | 8 | ❌ No |
| .hodge/id-counter.json | 4 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
