# Critical Files for Review

**Generated**: 2025-10-24T09:20:09.447Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 20 files changed, top 10 selected for deep review

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
| 1 | 550 | src/commands/status.ts | 3 blocker issues, 8 warnings, large change (306 lines) |
| 2 | 417 | src/commands/context.ts | 15 warnings |
| 3 | 200 | src/commands/lessons.ts | 1 blocker issue, large change (335 lines), new file |
| 4 | 175 | report/jscpd-report.json | 1 blocker issue, 1 warning, large change (257 lines) |
| 5 | 150 | .hodge/features/HODGE-346.4/build/build-plan.md | 2 warnings, large change (538 lines), new file |
| 6 | 150 | .hodge/features/HODGE-346.4/explore/exploration.md | 2 warnings, large change (755 lines), new file |
| 7 | 125 | .hodge/features/HODGE-346.4/explore/test-intentions.md | 2 warnings, new file |
| 8 | 108 | .hodge/features/HODGE-346.4/ship-record.json | 2 warnings, new file |
| 9 | 104 | .hodge/lessons/HODGE-341.5-test-infrastructure-fix.md | 2 warnings, new file |
| 10 | 102 | .hodge/id-mappings.json | 2 warnings, new file |

## All Changed Files (20 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/commands/status.ts | 550 | ✅ Yes (Rank 1) |
| src/commands/context.ts | 417 | ✅ Yes (Rank 2) |
| src/commands/lessons.ts | 200 | ✅ Yes (Rank 3) |
| report/jscpd-report.json | 175 | ✅ Yes (Rank 4) |
| .hodge/features/HODGE-346.4/build/build-plan.md | 150 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-346.4/explore/exploration.md | 150 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-346.4/explore/test-intentions.md | 125 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-346.4/ship-record.json | 108 | ✅ Yes (Rank 8) |
| .hodge/lessons/HODGE-341.5-test-infrastructure-fix.md | 104 | ✅ Yes (Rank 9) |
| .hodge/id-mappings.json | 102 | ✅ Yes (Rank 10) |
| .hodge/features/HODGE-346.4/issue-id.txt | 101 | ❌ No |
| .hodge/lessons/HODGE-317.1-eliminate-hung-test-processes.md | 79 | ❌ No |
| src/bin/hodge.ts | 65 | ❌ No |
| .hodge/HODGE.md | 61 | ❌ No |
| .hodge/.session | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/project_management.md | 53 | ❌ No |
| src/commands/lessons.smoke.test.ts | 50 | ❌ No |
| src/commands/status.smoke.test.ts | 50 | ❌ No |
| src/commands/context.smoke.test.ts | 16 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
