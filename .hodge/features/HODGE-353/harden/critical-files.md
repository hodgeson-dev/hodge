# Critical Files for Review

**Generated**: 2025-10-26T17:11:05.255Z
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
| 1 | 200 | .github/workflows/validate-release.yml | 1 blocker issue, 1 warning, medium change (144 lines), new file |
| 2 | 134 | .hodge/features/HODGE-353/build/build-plan.md | 2 warnings, new file |
| 3 | 125 | .hodge/features/HODGE-353/explore/exploration.md | 2 warnings, medium change (172 lines), new file |
| 4 | 125 | .hodge/features/HODGE-353/explore/test-intentions.md | 2 warnings, new file |
| 5 | 108 | .hodge/features/HODGE-353/ship-record.json | 2 warnings, new file |
| 6 | 107 | .hodge/project_management.md | 2 warnings, new file |
| 7 | 102 | .hodge/id-mappings.json | 2 warnings, new file |
| 8 | 101 | .hodge/features/HODGE-353/issue-id.txt | 2 warnings, new file |
| 9 | 100 | CONTRIBUTING.md | 2 warnings, large change (229 lines) |
| 10 | 56 | .hodge/HODGE.md | 2 warnings |

## All Changed Files (16 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .github/workflows/validate-release.yml | 200 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-353/build/build-plan.md | 134 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-353/explore/exploration.md | 125 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-353/explore/test-intentions.md | 125 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-353/ship-record.json | 108 | ✅ Yes (Rank 5) |
| .hodge/project_management.md | 107 | ✅ Yes (Rank 6) |
| .hodge/id-mappings.json | 102 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-353/issue-id.txt | 101 | ✅ Yes (Rank 8) |
| CONTRIBUTING.md | 100 | ✅ Yes (Rank 9) |
| .hodge/HODGE.md | 56 | ✅ Yes (Rank 10) |
| .hodge/.session | 55 | ❌ No |
| index.ts | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |
| src/test/hodge-353.smoke.test.ts | 50 | ❌ No |
| tsconfig.json | 26 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
