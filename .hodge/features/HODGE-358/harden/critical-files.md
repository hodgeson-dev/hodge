# Critical Files for Review

**Generated**: 2025-10-28T05:09:30.378Z
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
| 1 | 281 | .hodge/features/HODGE-358/harden/critical-files.md | 2 blocker issues, new file |
| 2 | 211 | src/commands/context.ts | 7 warnings |
| 3 | 150 | .claude/commands/checkpoint.md | 2 warnings, large change (422 lines), new file |
| 4 | 150 | .hodge/features/HODGE-358/harden/harden-report.md | 2 warnings, large change (254 lines), new file |
| 5 | 150 | .hodge/features/HODGE-358/harden/quality-checks.md | 2 warnings, large change (235 lines), new file |
| 6 | 142 | .hodge/features/HODGE-358/decisions.md | 2 warnings, new file |
| 7 | 137 | .hodge/features/HODGE-358/ship-record.json | 2 warnings, new file |
| 8 | 132 | .hodge/features/HODGE-358/harden/validation-results.json | 2 warnings, new file |
| 9 | 131 | .hodge/reviews/review-file-.claude-commands-checkpoint.md-2025-10-27-202759/review-manifest.yaml | 2 warnings, new file |
| 10 | 130 | .hodge/features/HODGE-358/harden/auto-fix-report.json | 2 warnings, new file |

## All Changed Files (32 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/features/HODGE-358/harden/critical-files.md | 281 | ✅ Yes (Rank 1) |
| src/commands/context.ts | 211 | ✅ Yes (Rank 2) |
| .claude/commands/checkpoint.md | 150 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-358/harden/harden-report.md | 150 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-358/harden/quality-checks.md | 150 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-358/decisions.md | 142 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-358/ship-record.json | 137 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-358/harden/validation-results.json | 132 | ✅ Yes (Rank 8) |
| .hodge/reviews/review-file-.claude-commands-checkpoint.md-2025-10-27-202759/review-manifest.yaml | 131 | ✅ Yes (Rank 9) |
| .hodge/features/HODGE-358/harden/auto-fix-report.json | 130 | ✅ Yes (Rank 10) |
| .hodge/features/HODGE-358/build/build-plan.md | 126 | ❌ No |
| .hodge/features/HODGE-358/explore/exploration.md | 125 | ❌ No |
| .hodge/features/HODGE-358/harden/review-manifest.yaml | 125 | ❌ No |
| .hodge/reviews/review-file-.claude-commands-checkpoint.md-2025-10-27-202759/quality-checks.md | 125 | ❌ No |
| src/lib/claude-commands.ts | 125 | ❌ No |
| .hodge/standards.md | 115 | ❌ No |
| .hodge/features/HODGE-358/explore/test-intentions.md | 114 | ❌ No |
| .hodge/project_management.md | 107 | ❌ No |
| src/commands/ship.ts | 103 | ❌ No |
| .hodge/id-mappings.json | 102 | ❌ No |
| report/jscpd-report.json | 100 | ❌ No |
| src/lib/quality-report-generator.ts | 100 | ❌ No |
| .claude/commands/ship.md | 75 | ❌ No |
| src/lib/ship-service.ts | 64 | ❌ No |
| .hodge/HODGE.md | 60 | ❌ No |
| .hodge/.session | 55 | ❌ No |
| .hodge/toolchain.yaml | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |
| src/commands/checkpoint.smoke.test.ts | 50 | ❌ No |
| src/commands/harden.ts | 32 | ❌ No |
| src/commands/harden/harden-review.ts | 2 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
