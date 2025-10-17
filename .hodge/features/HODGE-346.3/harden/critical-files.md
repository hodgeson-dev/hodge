# Critical Files for Review

**Generated**: 2025-10-17T11:10:25.563Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 32 files changed, top 10 selected for deep review

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
| 1 | 289 | .hodge/features/HODGE-346.3/harden/critical-files.md | 2 blocker issues, new file |
| 2 | 175 | report/jscpd-report.json | 1 blocker issue, 1 warning, large change (681 lines) |
| 3 | 150 | .hodge/features/HODGE-346.3/explore/exploration.md | 2 warnings, large change (395 lines), new file |
| 4 | 150 | .hodge/features/HODGE-346.3/harden/quality-checks.md | 2 warnings, large change (253 lines), new file |
| 5 | 125 | .hodge/features/HODGE-346.3/build/build-plan.md | 2 warnings, medium change (170 lines), new file |
| 6 | 125 | .hodge/features/HODGE-346.3/explore/test-intentions.md | 2 warnings, new file |
| 7 | 125 | .hodge/features/HODGE-346.3/harden/auto-fix-report.json | 2 warnings, new file |
| 8 | 125 | .hodge/features/HODGE-346.3/harden/review-manifest.yaml | 2 warnings, medium change (160 lines), new file |
| 9 | 108 | .hodge/features/HODGE-346.3/ship-record.json | 2 warnings, new file |
| 10 | 103 | .claude/commands/explore.md | 2 warnings, new file |

## All Changed Files (32 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-346.3/harden/critical-files.md | 289 | ✅ Yes (Rank 1) |
| report/jscpd-report.json | 175 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-346.3/explore/exploration.md | 150 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-346.3/harden/quality-checks.md | 150 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-346.3/build/build-plan.md | 125 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-346.3/explore/test-intentions.md | 125 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-346.3/harden/auto-fix-report.json | 125 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-346.3/harden/review-manifest.yaml | 125 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-346.3/ship-record.json | 108 | ✅ Yes (Rank 9) |
| .claude/commands/explore.md | 103 | ✅ Yes (Rank 10) |
| .claude/commands/hodge.md | 103 | ❌ No |
| .claude/commands/status.md | 103 | ❌ No |
| .hodge/id-mappings.json | 102 | ❌ No |
| .hodge/features/HODGE-346.3/issue-id.txt | 101 | ❌ No |
| .claude/commands/harden.md | 100 | ❌ No |
| .claude/commands/build.md | 83 | ❌ No |
| .hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml | 71 | ❌ No |
| .claude/commands/ship.md | 68 | ❌ No |
| .claude/commands/plan.md | 65 | ❌ No |
| .claude/commands/codify.md | 63 | ❌ No |
| .claude/commands/decide.md | 63 | ❌ No |
| .claude/commands/review.md | 63 | ❌ No |
| .hodge/HODGE.md | 62 | ❌ No |
| .hodge/.session | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/project_management.md | 53 | ❌ No |
| .prettierignore | 53 | ❌ No |
| .claude/commands/choice-formatting.smoke.test.ts | 50 | ❌ No |
| .claude/commands/visual-rendering.smoke.test.ts | 10 | ❌ No |
| .claude/commands/visual-patterns.smoke.test.ts | 0 | ❌ No |
| src/lib/claude-commands.smoke.test.ts | 0 | ❌ No |
| src/lib/hodge-319.3.smoke.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
