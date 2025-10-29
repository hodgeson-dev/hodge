# Critical Files for Review

**Generated**: 2025-10-28T22:31:44.691Z
**Algorithm**: risk-weighted-v1.0
**Scope**: 46 files changed, top 10 selected for deep review

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
| 1 | 116 | src/bundled-config/tool-registry.yaml | 1 blocker issue |
| 2 | 100 | .hodge/features/HODGE-359.1/explore/exploration.md | large change (227 lines), new file |
| 3 | 100 | .hodge/features/HODGE-359.1/harden/harden-report.md | large change (236 lines), new file |
| 4 | 97 | .hodge/features/HODGE-359.1/harden/validation-results.json | new file |
| 5 | 93 | .hodge/standards.md | new file |
| 6 | 91 | .hodge/features/HODGE-359.1/harden/critical-files.md | new file |
| 7 | 77 | .hodge/features/HODGE-359.1/checkpoint-2025-10-28-174258.yaml | new file |
| 8 | 75 | .hodge/features/HODGE-359.1/explore/test-intentions.md | new file |
| 9 | 75 | .hodge/features/HODGE-359.1/harden/review-manifest.yaml | medium change (177 lines), new file |
| 10 | 75 | .hodge/features/HODGE-359.1/ship-record.json | medium change (104 lines), new file |

## All Changed Files (46 total)

| File | Score | Included in Review |
|------|-------|-----------------|
| src/bundled-config/tool-registry.yaml | 116 | ✅ Yes (Rank 1) |
| .hodge/features/HODGE-359.1/explore/exploration.md | 100 | ✅ Yes (Rank 2) |
| .hodge/features/HODGE-359.1/harden/harden-report.md | 100 | ✅ Yes (Rank 3) |
| .hodge/features/HODGE-359.1/harden/validation-results.json | 97 | ✅ Yes (Rank 4) |
| .hodge/standards.md | 93 | ✅ Yes (Rank 5) |
| .hodge/features/HODGE-359.1/harden/critical-files.md | 91 | ✅ Yes (Rank 6) |
| .hodge/features/HODGE-359.1/checkpoint-2025-10-28-174258.yaml | 77 | ✅ Yes (Rank 7) |
| .hodge/features/HODGE-359.1/explore/test-intentions.md | 75 | ✅ Yes (Rank 8) |
| .hodge/features/HODGE-359.1/harden/review-manifest.yaml | 75 | ✅ Yes (Rank 9) |
| .hodge/features/HODGE-359.1/ship-record.json | 75 | ✅ Yes (Rank 10) |
| .hodge/features/HODGE-359/explore/exploration.md | 75 | ❌ No |
| .hodge/features/HODGE-359/plan.json | 75 | ❌ No |
| report/jscpd-report.json | 75 | ❌ No |
| src/lib/toolchain-service.ts | 75 | ❌ No |
| .hodge/features/HODGE-359.1/build/build-plan.md | 73 | ❌ No |
| .hodge/features/HODGE-359.1/checkpoint-2025-10-28-191714.yaml | 73 | ❌ No |
| .hodge/features/HODGE-359.1/checkpoint-2025-10-28-200000.yaml | 72 | ❌ No |
| .hodge/features/HODGE-359/explore/test-intentions.md | 64 | ❌ No |
| .hodge/project_management.md | 63 | ❌ No |
| .hodge/toolchain.yaml | 62 | ❌ No |
| src/commands/ship.ts | 58 | ❌ No |
| .hodge/id-mappings.json | 54 | ❌ No |
| src/types/review-engine.ts | 52 | ❌ No |
| src/lib/claude-commands.ts | 50 | ❌ No |
| src/lib/toolchain-service.smoke.test.ts | 50 | ❌ No |
| src/types/toolchain.ts | 49 | ❌ No |
| src/lib/ship-service.ts | 45 | ❌ No |
| .claude/commands/harden.md | 42 | ❌ No |
| .claude/commands/review.md | 34 | ❌ No |
| .claude/commands/ship.md | 33 | ❌ No |
| .dependency-cruiser.cjs | 32 | ❌ No |
| src/lib/ship-service.test.ts | 31 | ❌ No |
| src/commands/harden.ts | 30 | ❌ No |
| src/commands/harden/harden-review.ts | 29 | ❌ No |
| src/commands/review.ts | 29 | ❌ No |
| .hodge/HODGE.md | 28 | ❌ No |
| src/lib/review-engine-service.ts | 27 | ❌ No |
| src/lib/quality-report-generator.ts | 7 | ❌ No |
| .hodge/.session | 6 | ❌ No |
| src/commands/harden/harden-validator.ts | 5 | ❌ No |
| .hodge/context.json | 4 | ❌ No |
| src/test/hodge-356.smoke.test.ts | 4 | ❌ No |
| src/lib/harden-service.ts | 3 | ❌ No |
| .hodge/id-counter.json | 2 | ❌ No |
| src/commands/review.smoke.test.ts | 0 | ❌ No |
| src/lib/harden-service.test.ts | 0 | ❌ No |

---
**Note**: Focus your deep review on the Top 10 files. Other files should receive basic checks only.
