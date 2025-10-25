# Critical Files for Review

**Generated**: 2025-10-25T05:56:49.215Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 20 files changed, top 10 selected for deep review

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
| 1 | 1201 | src/lib/pm/local-pm-adapter.ts | 10 blocker issues, 8 warnings |
| 2 | 175 | report/jscpd-report.json | 1 blocker issue, 1 warning, large change (607 lines) |
| 3 | 150 | src/lib/logger.ts | 1 blocker issue, 1 warning |
| 4 | 127 | .hodge/features/HODGE-347/build/build-plan.md | 2 warnings, new file |
| 5 | 125 | .hodge/features/HODGE-347/explore/exploration.md | 2 warnings, medium change (152 lines), new file |
| 6 | 125 | .hodge/features/HODGE-347/explore/test-intentions.md | 2 warnings, new file |
| 7 | 108 | .hodge/features/HODGE-347/ship-record.json | 2 warnings, new file |
| 8 | 107 | .hodge/project_management.md | 2 warnings, new file |
| 9 | 107 | src/lib/pm/index.ts | 4 warnings |
| 10 | 106 | .hodge/.session | 2 warnings, new file |

## All Changed Files (20 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/pm/local-pm-adapter.ts | 1201 | ✅ Yes (Rank 1) |
| report/jscpd-report.json | 175 | ✅ Yes (Rank 2) |
| src/lib/logger.ts | 150 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-347/build/build-plan.md | 127 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-347/explore/exploration.md | 125 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-347/explore/test-intentions.md | 125 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-347/ship-record.json | 108 | ✅ Yes (Rank 7) |
| .hodge/project_management.md | 107 | ✅ Yes (Rank 8) |
| src/lib/pm/index.ts | 107 | ✅ Yes (Rank 9) |
| .hodge/.session | 106 | ✅ Yes (Rank 10) |
| .hodge/id-mappings.json | 102 | ❌ No |
| .hodge/features/HODGE-347/issue-id.txt | 101 | ❌ No |
| .hodge/HODGE.md | 83 | ❌ No |
| src/lib/pm/base-adapter.ts | 77 | ❌ No |
| src/lib/harden-service.ts | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/id-counter.json | 53 | ❌ No |
| src/lib/logger.smoke.test.ts | 48 | ❌ No |
| src/lib/pm/base-adapter.test.ts | 0 | ❌ No |
| src/lib/pm/index.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
