# Critical Files for Review

**Generated**: 2025-10-26T18:08:26.821Z
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
| 1 | 150 | .hodge/features/HODGE-354/explore/exploration.md | 2 warnings, large change (417 lines), new file |
| 2 | 125 | .hodge/features/HODGE-354/build/build-plan.md | 2 warnings, medium change (142 lines), new file |
| 3 | 125 | .hodge/features/HODGE-354/explore/test-intentions.md | 2 warnings, new file |
| 4 | 125 | CONTRIBUTING.md | 2 warnings, medium change (159 lines), new file |
| 5 | 125 | scripts/lib/release-utils.js | 1 warning, large change (429 lines), new file |
| 6 | 108 | .hodge/features/HODGE-354/ship-record.json | 2 warnings, new file |
| 7 | 107 | .hodge/project_management.md | 2 warnings, new file |
| 8 | 102 | .hodge/id-mappings.json | 2 warnings, new file |
| 9 | 101 | .hodge/features/HODGE-354/issue-id.txt | 2 warnings, new file |
| 10 | 100 | scripts/release-check.js | 1 warning, medium change (116 lines), new file |

## All Changed Files (18 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-354/explore/exploration.md | 150 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-354/build/build-plan.md | 125 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-354/explore/test-intentions.md | 125 | ✅ Yes (Rank 3) |
| CONTRIBUTING.md | 125 | ✅ Yes (Rank 4) |
| scripts/lib/release-utils.js | 125 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-354/ship-record.json | 108 | ✅ Yes (Rank 6) |
| .hodge/project_management.md | 107 | ✅ Yes (Rank 7) |
| .hodge/id-mappings.json | 102 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-354/issue-id.txt | 101 | ✅ Yes (Rank 9) |
| scripts/release-check.js | 100 | ✅ Yes (Rank 10) |
| scripts/release-prepare.js | 100 | ❌ No |
| scripts/release-publish.js | 100 | ❌ No |
| src/test/hodge-354.smoke.test.ts | 75 | ❌ No |
| .hodge/HODGE.md | 63 | ❌ No |
| .hodge/.session | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| package.json | 53 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
