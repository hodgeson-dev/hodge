# Critical Files for Review

**Generated**: 2025-10-25T23:23:55.058Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 17 files changed, top 10 selected for deep review

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
| 1 | 150 | .hodge/features/HODGE-351/explore/exploration.md | 2 warnings, large change (281 lines), new file |
| 2 | 150 | report/jscpd-report.json | 1 blocker issue, 1 warning, medium change (170 lines) |
| 3 | 147 | .hodge/features/HODGE-351/explore/test-intentions.md | 2 warnings, new file |
| 4 | 133 | .hodge/features/HODGE-351/decisions.md | 2 warnings, new file |
| 5 | 125 | .hodge/features/HODGE-351/build/build-plan.md | 2 warnings, medium change (149 lines), new file |
| 6 | 108 | .hodge/features/HODGE-351/ship-record.json | 2 warnings, new file |
| 7 | 102 | .hodge/id-mappings.json | 2 warnings, new file |
| 8 | 101 | .hodge/features/HODGE-351/issue-id.txt | 2 warnings, new file |
| 9 | 100 | src/lib/toolchain-service.smoke.test.ts | 1 blocker issue, 1 warning, medium change (131 lines), test file (lower priority) |
| 10 | 64 | .hodge/HODGE.md | 2 warnings |

## All Changed Files (17 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-351/explore/exploration.md | 150 | ✅ Yes (Rank 1) |
| report/jscpd-report.json | 150 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-351/explore/test-intentions.md | 147 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-351/decisions.md | 133 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-351/build/build-plan.md | 125 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-351/ship-record.json | 108 | ✅ Yes (Rank 6) |
| .hodge/id-mappings.json | 102 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-351/issue-id.txt | 101 | ✅ Yes (Rank 8) |
| src/lib/toolchain-service.smoke.test.ts | 100 | ✅ Yes (Rank 9) |
| .hodge/HODGE.md | 64 | ✅ Yes (Rank 10) |
| .hodge/.session | 55 | ❌ No |
| src/test/hodge-351.smoke.test.ts | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| vitest.config.ts | 54 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |
| .hodge/project_management.md | 51 | ❌ No |
| src/lib/toolchain-service-registry.smoke.test.ts | 21 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
