# Critical Files for Review

**Generated**: 2025-10-16T21:09:46.895Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 35 files changed, top 10 selected for deep review

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
| 1 | 286 | .hodge/features/HODGE-346.2/harden/critical-files.md | 2 blocker issues, new file |
| 2 | 201 | .hodge/features/HODGE-346.2/issue-id.txt | 1 blocker issue, 2 warnings, new file |
| 3 | 175 | report/jscpd-report.json | 1 blocker issue, 1 warning, large change (393 lines) |
| 4 | 155 | .hodge/.session | 1 blocker issue, 2 warnings |
| 5 | 150 | .hodge/features/HODGE-346.2/build/ai-diff-analysis.md | 2 warnings, large change (315 lines), new file |
| 6 | 150 | .hodge/features/HODGE-346.2/explore/exploration.md | 2 warnings, large change (364 lines), new file |
| 7 | 150 | .hodge/features/HODGE-346.2/harden/quality-checks.md | 2 warnings, large change (1126 lines), new file |
| 8 | 150 | .hodge/patterns/slash-command-verification-pattern.md | 2 warnings, large change (417 lines), new file |
| 9 | 128 | .hodge/features/HODGE-346.2/harden/auto-fix-report.json | 2 warnings, new file |
| 10 | 125 | .hodge/features/HODGE-346.2/build/build-plan.md | 2 warnings, medium change (126 lines), new file |

## All Changed Files (35 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-346.2/harden/critical-files.md | 286 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-346.2/issue-id.txt | 201 | ✅ Yes (Rank 2) |
| report/jscpd-report.json | 175 | ✅ Yes (Rank 3) |
| .hodge/.session | 155 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-346.2/build/ai-diff-analysis.md | 150 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-346.2/explore/exploration.md | 150 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-346.2/harden/quality-checks.md | 150 | ✅ Yes (Rank 7) |
| .hodge/patterns/slash-command-verification-pattern.md | 150 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-346.2/harden/auto-fix-report.json | 128 | ✅ Yes (Rank 9) |
| .hodge/features/HODGE-346.2/build/build-plan.md | 125 | ✅ Yes (Rank 10) |
| .hodge/features/HODGE-346.2/explore/test-intentions.md | 125 | ❌ No |
| .hodge/features/HODGE-346.2/harden/review-manifest.yaml | 125 | ❌ No |
| src/lib/claude-commands.ts | 125 | ❌ No |
| .hodge/features/HODGE-346/decisions.md | 122 | ❌ No |
| .hodge/features/HODGE-346.2/ship-record.json | 108 | ❌ No |
| .hodge/id-mappings.json | 102 | ❌ No |
| .claude/commands/build.md | 94 | ❌ No |
| src/lib/hodge-md-generator.ts | 85 | ❌ No |
| .claude/commands/visual-patterns.smoke.test.ts | 75 | ❌ No |
| .claude/commands/visual-rendering.smoke.test.ts | 75 | ❌ No |
| .claude/commands/plan.md | 71 | ❌ No |
| .claude/commands/decide.md | 68 | ❌ No |
| .claude/commands/harden.md | 65 | ❌ No |
| .claude/commands/status.md | 64 | ❌ No |
| .hodge/HODGE.md | 64 | ❌ No |
| .claude/commands/codify.md | 60 | ❌ No |
| .claude/commands/ship.md | 59 | ❌ No |
| .claude/commands/review.md | 57 | ❌ No |
| .claude/commands/hodge.md | 55 | ❌ No |
| .claude/commands/explore.md | 54 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/project_management.md | 51 | ❌ No |
| src/lib/claude-commands.smoke.test.ts | 0 | ❌ No |
| src/lib/hodge-319.3.smoke.test.ts | 0 | ❌ No |
| src/lib/hodge-md-generator.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
