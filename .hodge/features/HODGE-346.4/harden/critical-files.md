# Critical Files for Review

**Generated**: 2025-10-25T00:32:04.952Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 23 files changed, top 10 selected for deep review

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
| 1 | 232 | .hodge/features/HODGE-346.4/harden/critical-files.md | 2 blocker issues |
| 2 | 175 | report/jscpd-report.json | 1 blocker issue, 1 warning, large change (426 lines) |
| 3 | 110 | .claude/commands/codify.md | 2 warnings, new file |
| 4 | 109 | .claude/commands/review.md | 2 warnings, new file |
| 5 | 103 | src/commands/hodge-324.smoke.test.ts | 1 blocker issue, 2 warnings, test file (lower priority) |
| 6 | 100 | .hodge/features/HODGE-346.4/harden/quality-checks.md | 2 warnings, large change (287 lines) |
| 7 | 100 | .hodge/features/HODGE-346.4/harden/review-manifest.yaml | 2 warnings |
| 8 | 91 | .claude/commands/hodge.md | 2 warnings |
| 9 | 76 | .claude/commands/explore.md | 2 warnings |
| 10 | 75 | .claude/commands/build.md | 2 warnings, medium change (102 lines) |

## All Changed Files (23 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-346.4/harden/critical-files.md | 232 | ✅ Yes (Rank 1) |
| report/jscpd-report.json | 175 | ✅ Yes (Rank 2) |
| .claude/commands/codify.md | 110 | ✅ Yes (Rank 3) |
| .claude/commands/review.md | 109 | ✅ Yes (Rank 4) |
| src/commands/hodge-324.smoke.test.ts | 103 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-346.4/harden/quality-checks.md | 100 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-346.4/harden/review-manifest.yaml | 100 | ✅ Yes (Rank 7) |
| .claude/commands/hodge.md | 91 | ✅ Yes (Rank 8) |
| .claude/commands/explore.md | 76 | ✅ Yes (Rank 9) |
| .claude/commands/build.md | 75 | ✅ Yes (Rank 10) |
| .claude/commands/harden.md | 75 | ❌ No |
| .claude/commands/ship.md | 75 | ❌ No |
| .hodge/features/HODGE-346.4/harden/auto-fix-report.json | 75 | ❌ No |
| src/commands/visual-patterns.smoke.test.ts | 75 | ❌ No |
| src/commands/visual-rendering.smoke.test.ts | 75 | ❌ No |
| .claude/commands/status.md | 72 | ❌ No |
| .claude/commands/plan.md | 70 | ❌ No |
| .claude/commands/decide.md | 69 | ❌ No |
| .hodge/HODGE.md | 60 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/features/HODGE-346.4/ship-record.json | 52 | ❌ No |
| .hodge/project_management.md | 51 | ❌ No |
| src/commands/choice-formatting.smoke.test.ts | 50 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
