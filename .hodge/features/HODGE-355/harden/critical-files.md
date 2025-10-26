# Critical Files for Review

**Generated**: 2025-10-26T18:59:35.350Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 14 files changed, top 10 selected for deep review

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
| 1 | 125 | .hodge/features/HODGE-355/explore/exploration.md | 2 warnings, medium change (132 lines), new file |
| 2 | 125 | .hodge/features/HODGE-355/explore/test-intentions.md | 2 warnings, new file |
| 3 | 123 | .hodge/features/HODGE-355/build/build-plan.md | 2 warnings, new file |
| 4 | 108 | .hodge/features/HODGE-355/ship-record.json | 2 warnings, new file |
| 5 | 107 | .hodge/project_management.md | 2 warnings, new file |
| 6 | 102 | .hodge/id-mappings.json | 2 warnings, new file |
| 7 | 101 | .hodge/features/HODGE-355/issue-id.txt | 2 warnings, new file |
| 8 | 56 | .hodge/HODGE.md | 2 warnings |
| 9 | 55 | .hodge/.session | 2 warnings |
| 10 | 54 | .hodge/context.json | 2 warnings |

## All Changed Files (14 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-355/explore/exploration.md | 125 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-355/explore/test-intentions.md | 125 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-355/build/build-plan.md | 123 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-355/ship-record.json | 108 | ✅ Yes (Rank 4) |
| .hodge/project_management.md | 107 | ✅ Yes (Rank 5) |
| .hodge/id-mappings.json | 102 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-355/issue-id.txt | 101 | ✅ Yes (Rank 7) |
| .hodge/HODGE.md | 56 | ✅ Yes (Rank 8) |
| .hodge/.session | 55 | ✅ Yes (Rank 9) |
| .hodge/context.json | 54 | ✅ Yes (Rank 10) |
| .hodge/id-counter.json | 52 | ❌ No |
| src/test/hodge-354.smoke.test.ts | 50 | ❌ No |
| scripts/lib/release-utils.js | 46 | ❌ No |
| scripts/release-prepare.js | 41 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
