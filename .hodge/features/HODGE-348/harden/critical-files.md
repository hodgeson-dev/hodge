# Critical Files for Review

**Generated**: 2025-10-25T08:17:22.888Z
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
| 1 | 133 | .hodge/features/HODGE-348/decisions.md | 2 warnings, new file |
| 2 | 129 | .hodge/features/HODGE-348/build/build-plan.md | 2 warnings, new file |
| 3 | 125 | .hodge/features/HODGE-348/explore/exploration.md | 2 warnings, medium change (137 lines), new file |
| 4 | 125 | .hodge/features/HODGE-348/explore/test-intentions.md | 2 warnings, new file |
| 5 | 124 | .claude/commands/explore.md | 2 warnings, new file |
| 6 | 108 | .hodge/features/HODGE-348/ship-record.json | 2 warnings, new file |
| 7 | 107 | .hodge/project_management.md | 2 warnings, new file |
| 8 | 102 | .hodge/id-mappings.json | 2 warnings, new file |
| 9 | 101 | .hodge/features/HODGE-348/issue-id.txt | 2 warnings, new file |
| 10 | 64 | .hodge/HODGE.md | 2 warnings |

## All Changed Files (15 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-348/decisions.md | 133 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-348/build/build-plan.md | 129 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-348/explore/exploration.md | 125 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-348/explore/test-intentions.md | 125 | ✅ Yes (Rank 4) |
| .claude/commands/explore.md | 124 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-348/ship-record.json | 108 | ✅ Yes (Rank 6) |
| .hodge/project_management.md | 107 | ✅ Yes (Rank 7) |
| .hodge/id-mappings.json | 102 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-348/issue-id.txt | 101 | ✅ Yes (Rank 9) |
| .hodge/HODGE.md | 64 | ✅ Yes (Rank 10) |
| .hodge/.session | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .claude/commands/decide.md | 52 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |
| src/test/explore-template-what-vs-how.smoke.test.ts | 50 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
