# Critical Files for Review

**Generated**: 2025-10-26T16:05:01.304Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 26 files changed, top 10 selected for deep review

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
| 1 | 450 | README.md | 3 blocker issues, 5 warnings, medium change (110 lines) |
| 2 | 225 | docs/basic-usage.md | 1 blocker issue, 1 warning, large change (242 lines), new file |
| 3 | 214 | SECURITY.md | 1 blocker issue, 1 warning, new file |
| 4 | 202 | .gitignore | 1 blocker issue, 2 warnings, new file |
| 5 | 200 | CODE_OF_CONDUCT.md | 1 blocker issue, 1 warning, medium change (133 lines), new file |
| 6 | 200 | docs/getting-started.md | 1 blocker issue, 1 warning, medium change (137 lines), new file |
| 7 | 189 | docs/advanced/README.md | 1 blocker issue, 1 warning, new file |
| 8 | 188 | examples/README.md | 1 blocker issue, 1 warning, new file |
| 9 | 183 | CHANGELOG.md | 1 blocker issue, 1 warning, new file |
| 10 | 130 | package.json | 1 blocker issue, 1 warning |

## All Changed Files (26 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| README.md | 450 | ✅ Yes (Rank 1) |
| docs/basic-usage.md | 225 | ✅ Yes (Rank 2) |
| SECURITY.md | 214 | ✅ Yes (Rank 3) |
| .gitignore | 202 | ✅ Yes (Rank 4) |
| CODE_OF_CONDUCT.md | 200 | ✅ Yes (Rank 5) |
| docs/getting-started.md | 200 | ✅ Yes (Rank 6) |
| docs/advanced/README.md | 189 | ✅ Yes (Rank 7) |
| examples/README.md | 188 | ✅ Yes (Rank 8) |
| CHANGELOG.md | 183 | ✅ Yes (Rank 9) |
| package.json | 130 | ✅ Yes (Rank 10) |
| CONTRIBUTING.md | 126 | ❌ No |
| .hodge/features/HODGE-352/build/build-plan.md | 125 | ❌ No |
| .hodge/features/HODGE-352/decisions.md | 125 | ❌ No |
| .hodge/features/HODGE-352/explore/exploration.md | 125 | ❌ No |
| .hodge/features/HODGE-352/explore/test-intentions.md | 125 | ❌ No |
| scripts/README.md | 125 | ❌ No |
| .hodge/features/HODGE-352/ship-record.json | 108 | ❌ No |
| .hodge/project_management.md | 107 | ❌ No |
| .hodge/id-mappings.json | 102 | ❌ No |
| .hodge/features/HODGE-352/issue-id.txt | 101 | ❌ No |
| src/test/hodge-352.smoke.test.ts | 75 | ❌ No |
| .hodge/HODGE.md | 63 | ❌ No |
| .cache/npm-audit-cache.json | 56 | ❌ No |
| .hodge/.session | 55 | ❌ No |
| .hodge/context.json | 54 | ❌ No |
| .hodge/id-counter.json | 52 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
