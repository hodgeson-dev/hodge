# Critical Files for Review

**Generated**: 2025-10-14T03:26:31.090Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 19 files changed, top 10 selected for deep review

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
| 1 | 684 | src/lib/git-utils.ts | 5 blocker issues, 4 warnings, new file |
| 2 | 675 | src/lib/auto-fix-service.ts | 4 blocker issues, 7 warnings, large change (720 lines), new file |
| 3 | 275 | src/commands/harden.ts | 1 blocker issue, 4 warnings, medium change (120 lines), new file |
| 4 | 100 | .hodge/features/HODGE-341.6/explore/exploration.md | large change (1722 lines), new file |
| 5 | 99 | .hodge/features/HODGE-341.6/explore/test-intentions.md | new file |
| 6 | 77 | src/bin/hodge.ts | 3 warnings |
| 7 | 76 | src/lib/claude-commands.ts | 2 warnings |
| 8 | 75 | .hodge/features/HODGE-341.6/build/build-plan.md | medium change (174 lines), new file |
| 9 | 66 | .hodge/features/HODGE-341.6/ship-record.json | new file |
| 10 | 62 | src/bundled-config/tool-registry.yaml | new file |

## All Changed Files (19 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/git-utils.ts | 684 | ✅ Yes (Rank 1) |
| src/lib/auto-fix-service.ts | 675 | ✅ Yes (Rank 2) |
| src/commands/harden.ts | 275 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-341.6/explore/exploration.md | 100 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-341.6/explore/test-intentions.md | 99 | ✅ Yes (Rank 5) |
| src/bin/hodge.ts | 77 | ✅ Yes (Rank 6) |
| src/lib/claude-commands.ts | 76 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-341.6/build/build-plan.md | 75 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-341.6/ship-record.json | 66 | ✅ Yes (Rank 9) |
| src/bundled-config/tool-registry.yaml | 62 | ✅ Yes (Rank 10) |
| .hodge/id-mappings.json | 54 | ❌ No |
| .hodge/toolchain.yaml | 54 | ❌ No |
| .hodge/features/HODGE-341.6/issue-id.txt | 51 | ❌ No |
| report/jscpd-report.json | 50 | ❌ No |
| .claude/commands/harden.md | 25 | ❌ No |
| .hodge/HODGE.md | 20 | ❌ No |
| .hodge/.session | 10 | ❌ No |
| .hodge/context.json | 8 | ❌ No |
| .hodge/project_management.md | 6 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
