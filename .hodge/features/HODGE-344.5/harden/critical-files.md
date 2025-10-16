# Critical Files for Review

**Generated**: 2025-10-16T03:54:58.761Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 6 files changed, top 6 selected for deep review

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

## Top 6 Critical Files

| Rank | Score | File | Risk Factors |
|------|-------|------|-------------|
| 1 | 125 | src/commands/harden.ts | 4 warnings, medium change (179 lines) |
| 2 | 93 | src/commands/harden.smoke.test.ts | 2 warnings, new file, test file (lower priority) |
| 3 | 57 | .hodge/project_management.md | new file |
| 4 | 52 | .hodge/id-mappings.json | new file |
| 5 | 5 | .hodge/.session | low risk |
| 6 | 4 | .hodge/context.json | low risk |

## All Changed Files (6 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/commands/harden.ts | 125 | ✅ Yes (Rank 1) |
| src/commands/harden.smoke.test.ts | 93 | ✅ Yes (Rank 2) |
| .hodge/project_management.md | 57 | ✅ Yes (Rank 3) |
| .hodge/id-mappings.json | 52 | ✅ Yes (Rank 4) |
| .hodge/.session | 5 | ✅ Yes (Rank 5) |
| .hodge/context.json | 4 | ✅ Yes (Rank 6) |

---
**Note**: Focus your deep review on the Top 6 files. Other files should receive basic checks only.
