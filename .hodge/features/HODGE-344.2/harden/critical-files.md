# Critical Files for Review

**Generated**: 2025-10-14T06:08:53.664Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 16 files changed, top 10 selected for deep review

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
| 1 | 100 | .hodge/features/HODGE-344.2/explore/exploration.md | large change (512 lines), new file |
| 2 | 100 | src/lib/review-report-saver.ts | large change (310 lines), new file |
| 3 | 99 | .hodge/features/HODGE-344.2/explore/test-intentions.md | new file |
| 4 | 75 | .hodge/features/HODGE-344.2/build/build-plan.md | medium change (138 lines), new file |
| 5 | 75 | src/lib/review-manifest-generator.smoke.test.ts | 1 warning, large change (222 lines), new file, test file (lower priority) |
| 6 | 75 | src/lib/review-report-saver.smoke.test.ts | 1 warning, large change (328 lines), new file, test file (lower priority) |
| 7 | 67 | src/types/review-manifest.ts | new file |
| 8 | 66 | .hodge/features/HODGE-344.2/ship-record.json | new file |
| 9 | 52 | .hodge/id-mappings.json | new file |
| 10 | 51 | .hodge/features/HODGE-344.2/issue-id.txt | new file |

## All Changed Files (16 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-344.2/explore/exploration.md | 100 | ✅ Yes (Rank 1) |
| src/lib/review-report-saver.ts | 100 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-344.2/explore/test-intentions.md | 99 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-344.2/build/build-plan.md | 75 | ✅ Yes (Rank 4) |
| src/lib/review-manifest-generator.smoke.test.ts | 75 | ✅ Yes (Rank 5) |
| src/lib/review-report-saver.smoke.test.ts | 75 | ✅ Yes (Rank 6) |
| src/types/review-manifest.ts | 67 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-344.2/ship-record.json | 66 | ✅ Yes (Rank 8) |
| .hodge/id-mappings.json | 52 | ✅ Yes (Rank 9) |
| .hodge/features/HODGE-344.2/issue-id.txt | 51 | ✅ Yes (Rank 10) |
| src/lib/review-manifest-generator.ts | 30 | ❌ No |
| report/jscpd-report.json | 25 | ❌ No |
| .hodge/HODGE.md | 10 | ❌ No |
| .hodge/.session | 5 | ❌ No |
| .hodge/context.json | 4 | ❌ No |
| .hodge/project_management.md | 2 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
