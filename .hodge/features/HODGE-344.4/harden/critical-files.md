# Critical Files for Review

**Generated**: 2025-10-15T05:23:17.671Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 9 files changed, top 9 selected for deep review

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

## Top 9 Critical Files

| Rank | Score | File | Risk Factors |
|------|-------|------|-------------|
| 1 | 2425 | src/commands/review.ts | 23 blocker issues, 3 warnings, large change (868 lines) |
| 2 | 100 | .hodge/features/HODGE-344.4/build/build-plan.md | large change (202 lines), new file |
| 3 | 68 | src/bin/hodge.ts | 2 warnings |
| 4 | 57 | .hodge/project_management.md | new file |
| 5 | 52 | .hodge/id-mappings.json | new file |
| 6 | 50 | .claude/commands/review.md | large change (954 lines) |
| 7 | 25 | src/commands/review.smoke.test.ts | 1 warning, large change (668 lines), test file (lower priority) |
| 8 | 5 | .hodge/.session | low risk |
| 9 | 4 | .hodge/context.json | low risk |

## All Changed Files (9 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/commands/review.ts | 2425 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-344.4/build/build-plan.md | 100 | ✅ Yes (Rank 2) |
| src/bin/hodge.ts | 68 | ✅ Yes (Rank 3) |
| .hodge/project_management.md | 57 | ✅ Yes (Rank 4) |
| .hodge/id-mappings.json | 52 | ✅ Yes (Rank 5) |
| .claude/commands/review.md | 50 | ✅ Yes (Rank 6) |
| src/commands/review.smoke.test.ts | 25 | ✅ Yes (Rank 7) |
| .hodge/.session | 5 | ✅ Yes (Rank 8) |
| .hodge/context.json | 4 | ✅ Yes (Rank 9) |

---
**Note**: Focus your deep review on the Top 9 files. Other files should receive basic checks only.
