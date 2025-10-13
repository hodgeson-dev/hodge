# Critical Files for Review

**Generated**: 2025-10-13T22:41:31.926Z
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
| 1 | 86 | .hodge/standards.md | new file |
| 2 | 52 | .hodge/id-mappings.json | new file |
| 3 | 50 | report/jscpd-report.json | large change (289 lines) |
| 4 | 11 | .hodge/HODGE.md | low risk |
| 5 | 10 | src/commands/review.smoke.test.ts | 1 warning, test file (lower priority) |
| 6 | 5 | .hodge/.session | low risk |
| 7 | 4 | .hodge/context.json | low risk |
| 8 | 2 | .hodge/id-counter.json | low risk |
| 9 | 1 | .hodge/project_management.md | low risk |
| 10 | 0 | src/commands/decide.smoke.test.ts | 1 warning, test file (lower priority) |

## All Changed Files (19 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| .hodge/standards.md | 86 | ✅ Yes (Rank 1) |
| .hodge/id-mappings.json | 52 | ✅ Yes (Rank 2) |
| report/jscpd-report.json | 50 | ✅ Yes (Rank 3) |
| .hodge/HODGE.md | 11 | ✅ Yes (Rank 4) |
| src/commands/review.smoke.test.ts | 10 | ✅ Yes (Rank 5) |
| .hodge/.session | 5 | ✅ Yes (Rank 6) |
| .hodge/context.json | 4 | ✅ Yes (Rank 7) |
| .hodge/id-counter.json | 2 | ✅ Yes (Rank 8) |
| .hodge/project_management.md | 1 | ✅ Yes (Rank 9) |
| src/commands/decide.smoke.test.ts | 0 | ✅ Yes (Rank 10) |
| src/commands/plan.test.ts | 0 | ❌ No |
| src/lib/__tests__/context-manager.test.ts | 0 | ❌ No |
| src/lib/claude-commands.smoke.test.ts | 0 | ❌ No |
| src/lib/id-manager.test.ts | 0 | ❌ No |
| src/lib/install-hodge-way.test.ts | 0 | ❌ No |
| src/lib/session-manager.test.ts | 0 | ❌ No |
| src/test/context-aware-commands.test.ts | 0 | ❌ No |
| src/test/test-isolation.integration.test.ts | 0 | ❌ No |
| src/test/test-isolation.smoke.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
