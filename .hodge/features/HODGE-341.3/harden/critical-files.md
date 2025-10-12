# Critical Files for Review

**Generated**: 2025-10-12T09:11:05.361Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 30 files changed, top 10 selected for deep review

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
| 1 | 900 | src/lib/critical-file-selector.ts | 8 blocker issues, large change (658 lines), new file |
| 2 | 225 | src/commands/harden.ts | 7 warnings, large change (346 lines) |
| 3 | 175 | src/lib/critical-files-report-generator.ts | 1 blocker issue, medium change (184 lines), new file |
| 4 | 150 | src/lib/critical-file-selector.smoke.test.ts | 1 blocker issue, large change (334 lines), new file, test file (lower priority) |
| 5 | 150 | src/lib/import-analyzer.ts | 2 warnings, large change (282 lines), new file |
| 6 | 138 | src/lib/harden-service.ts | 3 warnings, new file |
| 7 | 100 | .hodge/features/HODGE-341.3/explore/exploration.md | large change (1892 lines), new file |
| 8 | 100 | .hodge/features/HODGE-341.3/harden/quality-checks.md | large change (3510 lines), new file |
| 9 | 100 | .hodge/features/HODGE-341.3/harden/review-manifest.yaml | large change (266 lines), new file |
| 10 | 100 | src/lib/claude-commands.ts | 3 warnings, medium change (124 lines) |

## All Changed Files (30 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/lib/critical-file-selector.ts | 900 | ✅ Yes (Rank 1) |
| src/commands/harden.ts | 225 | ✅ Yes (Rank 2) |
| src/lib/critical-files-report-generator.ts | 175 | ✅ Yes (Rank 3) |
| src/lib/critical-file-selector.smoke.test.ts | 150 | ✅ Yes (Rank 4) |
| src/lib/import-analyzer.ts | 150 | ✅ Yes (Rank 5) |
| src/lib/harden-service.ts | 138 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-341.3/explore/exploration.md | 100 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-341.3/harden/quality-checks.md | 100 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-341.3/harden/review-manifest.yaml | 100 | ✅ Yes (Rank 9) |
| src/lib/claude-commands.ts | 100 | ✅ Yes (Rank 10) |
| .hodge/features/HODGE-341.3/explore/test-intentions.md | 99 | ❌ No |
| src/lib/toolchain-service.ts | 78 | ❌ No |
| .hodge/features/HODGE-341.3/build/build-plan.md | 75 | ❌ No |
| .hodge/features/HODGE-341.3/harden/critical-files.md | 75 | ❌ No |
| .hodge/features/HODGE-341.3/harden/review-report.md | 75 | ❌ No |
| src/lib/severity-extractor.ts | 75 | ❌ No |
| .hodge/features/HODGE-341.3/ship-record.json | 66 | ❌ No |
| .hodge/principles.md | 60 | ❌ No |
| .hodge/features/HODGE-341.3/issue-id.txt | 51 | ❌ No |
| .claude/commands/harden.md | 50 | ❌ No |
| .hodge/HODGE.md | 49 | ❌ No |
| .hodge/semgrep-rules/graphql-anti-patterns.yaml | 33 | ❌ No |
| .hodge/toolchain.yaml | 28 | ❌ No |
| .hodge/semgrep-rules/prisma-anti-patterns.yaml | 20 | ❌ No |
| .claude/commands/explore.md | 13 | ❌ No |
| package-lock.json | 11 | ❌ No |
| .hodge/.session | 10 | ❌ No |
| .hodge/context.json | 8 | ❌ No |
| .hodge/id-mappings.json | 8 | ❌ No |
| package.json | 4 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
