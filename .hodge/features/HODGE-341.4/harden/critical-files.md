# Critical Files for Review

**Generated**: 2025-10-12T12:27:44.799Z
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
| 1 | 175 | src/lib/claude-commands.ts | 3 warnings, large change (394 lines), new file |
| 2 | 175 | src/lib/review-manifest-generator.ts | 5 warnings, large change (232 lines) |
| 3 | 140 | src/commands/harden.ts | 4 warnings |
| 4 | 100 | src/lib/sub-feature-context-service.ts | 2 warnings, large change (411 lines) |
| 5 | 84 | src/lib/install-hodge-way.test.ts | 1 blocker issue, 1 warning, test file (lower priority) |
| 6 | 84 | src/types/toolchain.ts | 1 warning, new file |
| 7 | 61 | .hodge/toolchain.yaml | new file |
| 8 | 50 | package-lock.json | large change (218 lines) |
| 9 | 25 | report/jscpd-report.json | medium change (143 lines) |
| 10 | 10 | .hodge/HODGE.md | low risk |

## All Changed Files (19 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/claude-commands.ts | 175 | ✅ Yes (Rank 1) |
| src/lib/review-manifest-generator.ts | 175 | ✅ Yes (Rank 2) |
| src/commands/harden.ts | 140 | ✅ Yes (Rank 3) |
| src/lib/sub-feature-context-service.ts | 100 | ✅ Yes (Rank 4) |
| src/lib/install-hodge-way.test.ts | 84 | ✅ Yes (Rank 5) |
| src/types/toolchain.ts | 84 | ✅ Yes (Rank 6) |
| .hodge/toolchain.yaml | 61 | ✅ Yes (Rank 7) |
| package-lock.json | 50 | ✅ Yes (Rank 8) |
| report/jscpd-report.json | 25 | ✅ Yes (Rank 9) |
| .hodge/HODGE.md | 10 | ✅ Yes (Rank 10) |
| CLAUDE.md | 10 | ❌ No |
| .hodge/.session | 6 | ❌ No |
| .hodge/context.json | 4 | ❌ No |
| .hodge/id-mappings.json | 4 | ❌ No |
| .hodge/project_management.md | 1 | ❌ No |
| package.json | 1 | ❌ No |
| src/lib/review-manifest-generator.smoke.test.ts | 0 | ❌ No |
| src/lib/sub-feature-context-service.integration.test.ts | 0 | ❌ No |
| test/pm-integration.integration.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
