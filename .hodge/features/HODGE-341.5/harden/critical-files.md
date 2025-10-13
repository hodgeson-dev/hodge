# Critical Files for Review

**Generated**: 2025-10-13T02:52:54.666Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 23 files changed, top 10 selected for deep review

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
| 1 | 575 | src/lib/monorepo-detector.ts | 4 blocker issues, 3 warnings, large change (332 lines), new file |
| 2 | 300 | src/lib/framework-detector.ts | 2 blocker issues, large change (356 lines), new file |
| 3 | 300 | src/lib/language-detector.smoke.test.ts | 2 blocker issues, 2 warnings, large change (242 lines), new file, test file (lower priority) |
| 4 | 200 | src/lib/package-manager-detector.smoke.test.ts | 1 blocker issue, 2 warnings, large change (238 lines), new file, test file (lower priority) |
| 5 | 175 | src/lib/monorepo-detector.smoke.test.ts | 1 blocker issue, 1 warning, large change (282 lines), new file, test file (lower priority) |
| 6 | 100 | src/lib/framework-detector.smoke.test.ts | 2 warnings, large change (336 lines), new file, test file (lower priority) |
| 7 | 100 | src/lib/language-detector.ts | large change (422 lines), new file |
| 8 | 99 | .hodge/features/HODGE-341.5/explore/test-intentions.md | new file |
| 9 | 96 | .hodge/features/HODGE-341.5/build/build-plan.md | new file |
| 10 | 75 | src/bundled-config/semgrep-rules/java-anti-patterns.yaml | medium change (176 lines), new file |

## All Changed Files (23 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/monorepo-detector.ts | 575 | ✅ Yes (Rank 1) |
| src/lib/framework-detector.ts | 300 | ✅ Yes (Rank 2) |
| src/lib/language-detector.smoke.test.ts | 300 | ✅ Yes (Rank 3) |
| src/lib/package-manager-detector.smoke.test.ts | 200 | ✅ Yes (Rank 4) |
| src/lib/monorepo-detector.smoke.test.ts | 175 | ✅ Yes (Rank 5) |
| src/lib/framework-detector.smoke.test.ts | 100 | ✅ Yes (Rank 6) |
| src/lib/language-detector.ts | 100 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-341.5/explore/test-intentions.md | 99 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-341.5/build/build-plan.md | 96 | ✅ Yes (Rank 9) |
| src/bundled-config/semgrep-rules/java-anti-patterns.yaml | 75 | ✅ Yes (Rank 10) |
| src/bundled-config/semgrep-rules/kotlin-anti-patterns.yaml | 75 | ❌ No |
| src/bundled-config/semgrep-rules/python-anti-patterns.yaml | 75 | ❌ No |
| src/lib/package-manager-detector.ts | 75 | ❌ No |
| .hodge/features/HODGE-341.5/ship-record.json | 66 | ❌ No |
| .hodge/project_management.md | 63 | ❌ No |
| .hodge/.pm-queue.json | 61 | ❌ No |
| .hodge/id-mappings.json | 54 | ❌ No |
| .hodge/features/HODGE-341.5/issue-id.txt | 51 | ❌ No |
| .hodge/features/HODGE-341.5/explore/exploration.md | 50 | ❌ No |
| src/bundled-config/tool-registry.yaml | 50 | ❌ No |
| .hodge/HODGE.md | 20 | ❌ No |
| .hodge/.session | 10 | ❌ No |
| .hodge/context.json | 6 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
