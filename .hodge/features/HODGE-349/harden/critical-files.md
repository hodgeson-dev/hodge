# Critical Files for Review

**Generated**: 2025-10-25T20:01:13.232Z
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
| 1 | 917 | src/commands/plan.ts | 5 blocker issues, 15 warnings |
| 2 | 201 | CONTRIBUTING.md | 1 blocker issue, 1 warning, new file |
| 3 | 150 | .hodge/features/HODGE-349/explore/exploration.md | 2 warnings, large change (236 lines), new file |
| 4 | 150 | report/jscpd-report.json | 1 blocker issue, 1 warning, medium change (196 lines) |
| 5 | 125 | .hodge/features/HODGE-349/explore/test-intentions.md | 2 warnings, new file |
| 6 | 123 | .hodge/features/HODGE-349/build/build-plan.md | 2 warnings, new file |
| 7 | 108 | .hodge/features/HODGE-349/ship-record.json | 2 warnings, new file |
| 8 | 107 | src/lib/config-manager.ts | 3 warnings |
| 9 | 102 | .hodge/id-mappings.json | 2 warnings, new file |
| 10 | 101 | .hodge/features/HODGE-349/issue-id.txt | 2 warnings, new file |

## All Changed Files (19 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/commands/plan.ts | 917 | ✅ Yes (Rank 1) |
| CONTRIBUTING.md | 201 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-349/explore/exploration.md | 150 | ✅ Yes (Rank 3) |
| report/jscpd-report.json | 150 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-349/explore/test-intentions.md | 125 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-349/build/build-plan.md | 123 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-349/ship-record.json | 108 | ✅ Yes (Rank 7) |
| src/lib/config-manager.ts | 107 | ✅ Yes (Rank 8) |
| .hodge/id-mappings.json | 102 | ✅ Yes (Rank 9) |
| .hodge/features/HODGE-349/issue-id.txt | 101 | ✅ Yes (Rank 10) |
| .hodge/HODGE.md | 64 | ❌ No |
| .hodge/.session | 55 | ❌ No |
| .claude/commands/plan.md | 54 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |
| .hodge/project_management.md | 52 | ❌ No |
| src/test/file-consolidation.smoke.test.ts | 50 | ❌ No |
| src/commands/plan.test.ts | 0 | ❌ No |
| test/pm-integration.integration.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
