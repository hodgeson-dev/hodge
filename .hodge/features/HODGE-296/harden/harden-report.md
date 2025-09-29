# Harden Report: HODGE-296

## Validation Results
**Date**: 9/29/2025, 9:56:02 AM
**Overall Status**: ✅ PASSED

### Test Results
- **Tests**: ✅ Passed
- **Linting**: ✅ Passed
- **Type Check**: ✅ Passed
- **Build**: ✅ Passed

## Standards Compliance
All standards have been met. Code is production-ready.

## Performance
Validations were run in parallel for optimal performance.

## Next Steps
✅ Feature is production-ready!
- Use `/ship HODGE-296` to deploy
- Update PM issue status to "Done"

## Detailed Output

### Test Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 test
> vitest run

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m

 RUN  v1.6.1 /Users/michaelkelly/Projects/hodge

stderr | src/lib/pattern-learner.test.ts > PatternLearner > analyzeShippedCode > should handle file read errors gracefully
Failed to analyze src/error-file.ts: Error: File read error
    at /Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.test.ts:108:38
    at file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:135:14
    at file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:60:26
    at runTest (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:781:17)
    at runSuite (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:909:15)
    at runSuite (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:909:15)
    at runSuite (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:909:15)
    at runFiles (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:958:5)
    at startTests (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:967:3)
    at file:///Users/michaelkelly/Projects/hodge/node_modules/vitest/dist/chunks/runtime-runBaseTests.oAvMKtQC.js:116:7

 ✓ src/lib/pattern-learner.test.ts  (14 tests) 18ms
 ↓ scripts/npm-link-integration.test.ts  (17 tests | 17 skipped)
stderr | src/lib/detection.test.ts > ProjectDetector > project name detection > should handle package.json read errors gracefully
Warning: Failed to read package.json: Malformed JSON
Warning: Failed to read package.json for test framework detection: Malformed JSON

stderr | src/lib/detection.test.ts > ProjectDetector > project type detection > should detect Node.js project from package.json
Warning: Failed to read package.json: Cannot read properties of undefined (reading 'name')
Warning: Failed to read package.json for test framework detection: Cannot read properties of undefined (reading 'dependencies')

stderr | src/lib/detection.test.ts > ProjectDetector > test framework detection > should handle malformed package.json gracefully
Warning: Failed to read package.json: Invalid JSON
Warning: Failed to read package.json for test framework detection: Invalid JSON

 ✓ src/lib/detection.test.ts  (37 tests) 35ms
 ✓ src/lib/cache-manager.test.ts  (28 tests) 74ms
 ✓ scripts/create-test-workspace.test.ts  (34 tests | 3 skipped) 57ms
 ✓ scripts/cross-platform.test.ts  (25 tests) 61ms
 ✓ src/lib/structure-generator.test.ts  (27 tests) 22ms
stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should work as a drop-in replacement for BasePMAdapter
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should work as a drop-in replacement for BasePMAdapter
✓ Added UNIFIED-001 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should work as a drop-in replacement for BasePMAdapter
✓ Updated UNIFIED-001 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should work as a drop-in replacement for BasePMAdapter
✓ Updated UNIFIED-001 status to: hardening

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should work as a drop-in replacement for BasePMAdapter
✓ Updated UNIFIED-001 status to: shipped

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should maintain backward compatibility with special methods
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should maintain backward compatibility with special methods
✓ Added COMPAT-001 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should maintain backward compatibility with special methods
✓ Updated COMPAT-001 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should maintain backward compatibility with special methods
✓ Updated project plan phase progress

 ✓ src/lib/id-manager.test.ts  (27 tests) 358ms
stdout | src/lib/__tests__/feature-spec-loader.test.ts > [unit] FeatureSpecLoader > loadSpec > should load a valid YAML spec
✓ Loaded feature spec from /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-lm6duq/test-spec.yaml

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle search through unified interface
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle search through unified interface
✓ Added SEARCH-001 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle search through unified interface
✓ Added SEARCH-002 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle search through unified interface
✓ Added SEARCH-003 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle search through unified interface
✓ Added SEARCH-004 to project management tracking

stdout | src/lib/__tests__/feature-spec-loader.test.ts > [unit] FeatureSpecLoader > loadSpec > should handle spec with minimal required fields
✓ Loaded feature spec from /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-1ugjj/minimal-spec.yaml

 ✓ src/lib/__tests__/feature-spec-loader.test.ts  (15 tests) 45ms
stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-001 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-002 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-003 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-004 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-005 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-006 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-007 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-008 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-009 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Added CONCURRENT-010 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-001 status to: hardening
✓ Updated CONCURRENT-002 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-003 status to: hardening

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-004 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-005 status to: hardening

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-006 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-007 status to: hardening

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-008 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should properly serialize concurrent operations
✓ Updated CONCURRENT-009 status to: hardening
✓ Updated CONCURRENT-010 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle state transitions correctly
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle state transitions correctly
✓ Added TRANSITION-001 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle state transitions correctly
✓ Updated TRANSITION-001 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle state transitions correctly
✓ Updated TRANSITION-001 status to: hardening

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle state transitions correctly
✓ Updated TRANSITION-001 status to: shipped

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should save and load a session successfully
📝 Creating full save...

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should save and load a session successfully
✓ Save complete in 31ms
✓ Session saved successfully
  Name: integration-test-save
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-af3cfcf7ef839965/.hodge/saves/integration-test-save
  Time: 31ms
  Type: Full save

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should save and load a session successfully
📂 Loading session...

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should save and load a session successfully
✓ Manifest loaded in 0ms
✓ Session loaded successfully (1ms)

Session Overview:
  Feature: TEST-INTEGRATION
  Phase: build
  Last Action: test
  Duration: 0 minutes

Current State:
  Test Status: unknown
  Completed Tasks: 0
  Pending Tasks: 0
  Modified Files: 0

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should save and load a session successfully

Quick Actions:
  • Continue building: /build TEST-INTEGRATION
  • Run tests: npm test

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should provide proper issue URLs
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should provide proper issue URLs
✓ Added URL-001 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should provide proper issue URLs
✓ Updated URL-001 status to: shipped

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle missing features gracefully
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.integration.test.ts > LocalPMAdapter Unified Architecture Integration Tests > [integration] should handle missing features gracefully
✓ Updated NONEXISTENT-002 status to: building

 ✓ src/lib/pm/local-pm-adapter-unified.integration.test.ts  (7 tests) 739ms
 ✓ src/lib/metadata-clarity.smoke.test.ts  (5 tests) 342ms
 ✓ src/lib/config-manager.integration.test.ts  (6 tests) 95ms
 ✓ src/commands/ship-commit-messages.integration.test.ts  (4 tests) 509ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should handle minimal saves efficiently
📝 Creating minimal save (manifest only)...

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should handle minimal saves efficiently
✓ Minimal save complete in 34ms
✓ Session saved successfully
  Name: minimal-integration-test
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-8bd2029c91bc6044/.hodge/saves/minimal-integration-test
  Time: 34ms
  Type: Minimal (manifest only)

stdout | test/pm-integration.integration.test.ts > [integration] PM integration: decide command creates issues after decisions
📝 Recording Decision

(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should list saves correctly
📝 Creating full save...

stdout | test/pm-integration.integration.test.ts > [integration] PM integration: decide command creates issues after decisions

════════════════════════════════════════════════════════════
DECISION RECORDED:
════════════════════════════════════════════════════════════
Decision: Create epic for authentication
Date: 2025-09-29 9:55:49 AM
Feature: TEST-001

This decision is now part of the project context and should be
considered in all future implementations.
════════════════════════════════════════════════════════════

✓ Decision recorded successfully
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-1759164949418/.hodge/decisions.md
  Feature: TEST-001
  Total decisions: 2

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should create PM tracking on explore
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should create PM tracking on explore
✓ Added TEST-FEATURE to project management tracking

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should list saves correctly
✓ Save complete in 34ms
✓ Session saved successfully
  Name: list-test-1
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-64a7a90e6ba584ac/.hodge/saves/list-test-1
  Time: 34ms
  Type: Full save

stdout | test/pm-integration.integration.test.ts > [integration] PM integration: plan command analyzes decisions
📋 Planning Work Structure

stdout | test/pm-integration.integration.test.ts > [integration] PM integration: plan command analyzes decisions

📋 Development Plan
==================================================
Feature: FEAT-001
Type: epic

Stories (1):
  FEAT-001.1: Frontend components (Lane 1)

Lane Allocation (1 lanes):
  Lane 1: FEAT-001.1

Estimated Timeline: 2 days
==================================================

stdout | test/pm-integration.integration.test.ts > [integration] PM integration: plan command analyzes decisions

✓ Plan created for FEAT-001

Next Steps:
  Start with: hodge build FEAT-001.1

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should update status through workflow phases
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should update status through workflow phases
✓ Added WORKFLOW-TEST to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should update status through workflow phases
✓ Updated WORKFLOW-TEST status to: building

 ✓ test/pm-integration.integration.test.ts  (6 tests) 183ms
stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should update status through workflow phases
✓ Updated WORKFLOW-TEST status to: hardening

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should update status through workflow phases
✓ Updated WORKFLOW-TEST status to: shipped

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should preserve special init method
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should update status through workflow phases
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should list saves correctly
📝 Creating full save...

stdout | src/lib/__tests__/auto-save.test.ts > AutoSave > Behavioral Tests > [unit] should create auto-save when switching features
✓ Save complete in 43ms
📦 Auto-saved: old-feature → /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-1759164949584-9a399967/.hodge/saves/auto-old-feature-2025-09-29T16-55-49 (49ms)

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should maintain project plan structure
ℹ️  Created project_management.md with project plan

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should list saves correctly
✓ Save complete in 27ms
✓ Session saved successfully
  Name: list-test-2
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-64a7a90e6ba584ac/.hodge/saves/list-test-2
  Time: 27ms
  Type: Full save

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should list saves correctly
📝 Creating minimal save (manifest only)...

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should maintain project plan structure
✓ Added PLAN-TEST-1 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should preserve updateFeatureStatus method
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should preserve updateFeatureStatus method
✓ Updated TEST-001 status to: building

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should list saves correctly
✓ Minimal save complete in 23ms
✓ Session saved successfully
  Name: list-test-3
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-64a7a90e6ba584ac/.hodge/saves/list-test-3
  Time: 24ms
  Type: Minimal (manifest only)

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should maintain project plan structure
✓ Updated PLAN-TEST-1 status to: building

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should maintain project plan structure
✓ Added PLAN-TEST-2 to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should maintain project plan structure
✓ Updated PLAN-TEST-2 status to: shipped

stdout | src/lib/__tests__/auto-save.test.ts > AutoSave > Behavioral Tests > [unit] should preserve context in auto-save
✓ Save complete in 83ms
📦 Auto-saved: old-feature → /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-1759164949639-6b93867f/.hodge/saves/auto-old-feature-2025-09-29T16-55-49 (83ms)

 ✓ src/lib/config-cleanup.smoke.test.ts  (5 tests) 145ms
stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should handle HODGE-006 specifically
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should preserve addFeature method
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should preserve addFeature method
✓ Added TEST-002 to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should handle HODGE-006 specifically
✓ Added HODGE-006 to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should handle HODGE-006 specifically
✓ Updated HODGE-006 status to: building

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should handle HODGE-006 specifically
✓ Updated HODGE-006 status to: shipped

(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should preserve existing PM content
ℹ️  Created project_management.md with project plan
✓ Added EXISTING-1 to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should preserve existing PM content
✓ Added EXISTING-2 to project management tracking

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should load most recent save automatically
📝 Creating full save...

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should preserve existing PM content
✓ Added NEW-FEATURE to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should map feature to issue through getIssue
ℹ️  Created project_management.md with project plan

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should load most recent save automatically
✓ Save complete in 35ms
✓ Session saved successfully
  Name: old-save
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-88ad54626bd025cf/.hodge/saves/old-save
  Time: 35ms
  Type: Full save

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should map feature to issue through getIssue
✓ Added TEST-003 to project management tracking

stdout | src/lib/__tests__/auto-save.test.ts > AutoSave > Behavioral Tests > [unit] should use auto- prefix for save names
✓ Save complete in 85ms
📦 Auto-saved: test-feature → /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-1759164949724-3e2d7677/.hodge/saves/auto-test-feature-2025-09-29T16-55-49 (85ms)

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should handle concurrent updates gracefully
ℹ️  Created project_management.md with project plan
✓ Added CONCURRENT-1 to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should handle concurrent updates gracefully
✓ Added CONCURRENT-2 to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should handle concurrent updates gracefully
✓ Added CONCURRENT-3 to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should track feature history correctly
ℹ️  Created project_management.md with project plan

 ✓ src/lib/hodge-md-generator.test.ts  (10 tests) 30ms
stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should track feature history correctly
✓ Added HISTORY-TEST to project management tracking

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should track feature history correctly
✓ Updated HISTORY-TEST status to: building

stdout | test/pm-integration.smoke.test.ts > [smoke] DecideCommand should record decisions without PM integration
📝 Recording Decision

stdout | test/pm-integration.smoke.test.ts > [smoke] DecideCommand should record decisions without PM integration

════════════════════════════════════════════════════════════
DECISION RECORDED:
════════════════════════════════════════════════════════════
Decision: Implement as a single story
Date: 2025-09-29 9:55:49 AM
Feature: HODGE-301

This decision is now part of the project context and should be
considered in all future implementations.
════════════════════════════════════════════════════════════

✓ Decision recorded successfully
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-1759164949856/.hodge/decisions.md
  Feature: HODGE-301
  Total decisions: 1

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should update feature through updateIssueState
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should update feature through updateIssueState
✓ Added TEST-004 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should update feature through updateIssueState
✓ Updated TEST-004 status to: building

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should track feature history correctly
✓ Updated HISTORY-TEST status to: hardening

stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should track feature history correctly
✓ Updated HISTORY-TEST status to: shipped

stdout | src/lib/__tests__/auto-save.test.ts > AutoSave > Error Handling > [integration] should continue even if save fails
✓ Save complete in 65ms
📦 Auto-saved: old-feature → /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-test-1759164949816-19a132a1/.hodge/saves/auto-old-feature-2025-09-29T16-55-49 (65ms)

 ✓ src/lib/__tests__/auto-save.test.ts  (10 tests) 311ms
stdout | src/lib/pm/integration.test.ts > PM Integration Tests > [integration] should track feature history correctly
✓ Updated project plan phase progress
✓ Updated project management tracking

 ✓ src/lib/pm/integration.test.ts  (7 tests) 393ms
 ✓ test/pm-integration.smoke.test.ts  (13 tests) 147ms
stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should load most recent save automatically
📝 Creating full save...

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should search features through searchIssues
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should search features through searchIssues
✓ Added TEST-005 to project management tracking

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should load most recent save automatically
✓ Save complete in 44ms
✓ Session saved successfully
  Name: recent-save
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-88ad54626bd025cf/.hodge/saves/recent-save
  Time: 44ms
  Type: Full save

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should load most recent save automatically
Loading most recent save: recent-save
📂 Loading session...
✓ Manifest loaded in 0ms
✓ Session loaded successfully (0ms)

Session Overview:
  Feature: TEST-INTEGRATION
  Phase: build
  Last Action: save old-save
  Duration: 0 minutes

Current State:
  Test Status: unknown
  Completed Tasks: 0
  Pending Tasks: 0
  Modified Files: 0

Quick Actions:
  • Continue building: /build TEST-INTEGRATION
  • Run tests: npm test

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should search features through searchIssues
✓ Added TEST-006 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should create feature through createIssue
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should create feature through createIssue
✓ Added TEST-007 to project management tracking

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should preserve session metadata through save/load cycle
📝 Creating full save...

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should preserve session metadata through save/load cycle
✓ Save complete in 35ms
✓ Session saved successfully
  Name: metadata-test-save
  Location: /var/folders/_g/gy5jp17j06s7b882m93tlk140000gn/T/hodge-integration-test-ea82a8d0f7eb994d/.hodge/saves/metadata-test-save
  Time: 35ms
  Type: Full save

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should preserve session metadata through save/load cycle
📂 Loading session...
✓ Manifest loaded in 1ms
✓ Session loaded successfully (1ms)

Session Overview:
  Feature: METADATA-TEST
  Phase: harden
  Last Action: test-command
  Duration: 0 minutes

Current State:
  Test Status: unknown
  Completed Tasks: 0
  Pending Tasks: 0
  Modified Files: 0

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should be compatible with BasePMAdapter interface
ℹ️  Created project_management.md with project plan

stdout | src/commands/save-load.integration.test.ts > Save/Load Commands [integration] > should preserve session metadata through save/load cycle

Quick Actions:
  • Continue hardening: /harden METADATA-TEST
  • Run integration tests: npm run test:integration

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should be compatible with BasePMAdapter interface
✓ Added TEST-008 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should be compatible with BasePMAdapter interface
✓ Updated TEST-008 status to: shipped

 ✓ src/commands/save-load.integration.test.ts  (5 tests) 1139ms
 ✓ src/lib/pm/base-adapter.test.ts  (16 tests) 43ms
stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should handle file operations with serialization
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should handle file operations with serialization
✓ Added TEST-009 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should handle file operations with serialization
✓ Added TEST-010 to project management tracking

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should handle file operations with serialization
✓ Updated TEST-009 status to: building

stdout | src/lib/pm/local-pm-adapter-unified.smoke.test.ts > LocalPMAdapter Unified Architecture Smoke Tests > [smoke] should handle file operations with serialization
✓ Updated TEST-010 status to: hardening

 ✓ src/lib/pm/local-pm-adapter-unified.smoke.test.ts  (12 tests) 631ms
 ✓ src/lib/config-manager.smoke.test.ts  (10 tests) 31ms
 ✓ src/commands/ship-commit-messages.smoke.test.ts  (5 tests) 57ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should properly integrate with configuration loading
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should properly integrate with configuration loading
✓ Added TEST-001 to project management tracking

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should properly integrate with configuration loading
✓ Updated TEST-001 status to: building

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should properly integrate with configuration loading
✓ Updated TEST-001 status to: hardening

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should properly integrate with configuration loading
✓ Updated TEST-001 status to: shipped

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should properly integrate with configuration loading
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should track features through entire workflow
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should track features through entire workflow
✓ Added WORKFLOW-TEST to project management tracking

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should track features through entire workflow
✓ Updated WORKFLOW-TEST status to: building

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should track features through entire workflow
✓ Updated WORKFLOW-TEST status to: hardening

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should track features through entire workflow
✓ Updated WORKFLOW-TEST status to: shipped

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should track features through entire workflow
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should handle concurrent feature updates
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should handle concurrent feature updates
✓ Added CONCURRENT-1 to project management tracking
✓ Added CONCURRENT-2 to project management tracking
✓ Added CONCURRENT-3 to project management tracking

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should handle concurrent feature updates
✓ Updated CONCURRENT-1 status to: building

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should handle concurrent feature updates
✓ Updated CONCURRENT-2 status to: hardening

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should handle concurrent feature updates
✓ Updated CONCURRENT-3 status to: shipped

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should handle concurrent feature updates
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should silently handle external PM failures
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should silently handle external PM failures
✓ Added PM-TEST to project management tracking
📋 Updating linear issue: PM-TEST
   ℹ️ Could not update linear issue (non-blocking)
✓ Updated PM-TEST status to: building
📋 Updating linear issue: PM-TEST
   ℹ️ Could not update linear issue (non-blocking)

stdout | src/lib/pm/pm-hooks.integration.test.ts > PMHooks Integration Tests > [integration] should respect custom status mappings
ℹ️  Created project_management.md with project plan
✓ Added CUSTOM-STATUS to project management tracking

 ✓ src/lib/pm/pm-hooks.integration.test.ts  (5 tests) 226ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ↓ src/commands/build.test.ts  (7 tests | 7 skipped)
- Detecting project configuration...
stdout | src/commands/init.test.ts > InitCommand Integration Tests > successful initialization scenarios > should initialize Python project successfully
\n📋 Detected Configuration:
   Name: project
   Type: python
   PM Tool: linear
   Git: Yes

✅ Hodge initialization completed successfully

🎉 Hodge initialized successfully!

📁 Created structure:
   .hodge/
   ├── config.json     # Project configuration
   ├── standards.md    # Development standards
   ├── decisions.md    # Architecture decisions
   ├── patterns/       # Extracted patterns
   └── features/       # Feature development

💡 Tip: Run `claude project init` to set up Claude Code for this project

🔧 PM Integration (linear):
   ✓ Automatic status updates on workflow progression
   ✓ Local tracking in .hodge/project_management.md
   Configure in hodge.json for custom workflow mappings
\n💡 Tip: Use --interactive for full setup with PM tool selection and pattern learning

🚀 Next steps:
   hodge explore <feature>  # Start exploring a new feature
   hodge status              # Check current status


stdout | src/commands/init.test.ts > InitCommand Integration Tests > successful initialization scenarios > should handle unknown project type gracefully
\n📋 Detected Configuration:
   Name: project
   Type: unknown
   PM Tool: linear
   Git: Yes

✅ Hodge initialization completed successfully

🎉 Hodge initialized successfully!

📁 Created structure:
   .hodge/
   ├── config.json     # Project configuration
   ├── standards.md    # Development standards
   ├── decisions.md    # Architecture decisions
   ├── patterns/       # Extracted patterns
   └── features/       # Feature development

💡 Tip: Run `claude project init` to set up Claude Code for this project

🔧 PM Integration (linear):
   ✓ Automatic status updates on workflow progression
   ✓ Local tracking in .hodge/project_management.md
   Configure in hodge.json for custom workflow mappings
\n💡 Tip: Use --interactive for full setup with PM tool selection and pattern learning

🚀 Next steps:
   hodge explore <feature>  # Start exploring a new feature
   hodge status              # Check current status


stdout | src/commands/init.test.ts > InitCommand Integration Tests > successful initialization scenarios > should skip questions with --yes flag
\n📋 Detected Configuration:
   Name: project
   Type: unknown
   PM Tool: linear
   Git: Yes

Using all defaults (--yes flag)
✅ Hodge initialization completed successfully

🎉 Hodge initialized successfully!

📁 Created structure:
   .hodge/
   ├── config.json     # Project configuration
   ├── standards.md    # Development standards
   ├── decisions.md    # Architecture decisions
   ├── patterns/       # Extracted patterns
   └── features/       # Feature development

💡 Tip: Run `claude project init` to set up Claude Code for this project

🔧 PM Integration (linear):
   ✓ Automatic status updates on workflow progression
   ✓ Local tracking in .hodge/project_management.md
   Configure in hodge.json for custom workflow mappings
\n💡 Tip: Use --interactive for full setup with PM tool selection and pattern learning

🚀 Next steps:
   hodge explore <feature>  # Start exploring a new feature
   hodge status              # Check current status


✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
 ✓ src/commands/init.test.ts  (5 tests) 20ms
 ✓ src/lib/session-manager.test.ts  (11 tests) 104ms
 ✓ src/lib/config-defaults.smoke.test.ts  (5 tests) 269ms
 ✓ src/lib/pm/env-validator.test.ts  (13 tests) 11ms
 ✓ src/test/documentation-hierarchy.integration.test.ts  (2 tests) 197ms
 ✓ src/lib/pm/index.test.ts  (10 tests) 25ms
stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should not crash on init
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should create project_management.md on init
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should include project plan in template
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should add new feature to tracking
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should add new feature to tracking
✓ Added TEST-001 to project management tracking

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should update feature status
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should update feature status
✓ Added TEST-002 to project management tracking

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should update feature status
✓ Updated TEST-002 status to: building

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should mark feature complete in project plan
ℹ️  Created project_management.md with project plan
✓ Added HODGE-006 to project management tracking

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should mark feature complete in project plan
✓ Updated HODGE-006 status to: shipped

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should handle in-progress status in project plan
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should handle in-progress status in project plan
✓ Added HODGE-006 to project management tracking

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should handle in-progress status in project plan
✓ Updated HODGE-006 status to: building

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should preserve project plan structure
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should preserve project plan structure
✓ Added TEST-003 to project management tracking

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should preserve project plan structure
✓ Updated TEST-003 status to: building

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should not duplicate features
ℹ️  Created project_management.md with project plan
✓ Added TEST-004 to project management tracking

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should not duplicate features
⚠️  Feature TEST-004 already exists

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should move feature to completed on ship
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should move feature to completed on ship
✓ Added TEST-005 to project management tracking

stdout | src/lib/pm/local-pm-adapter.test.ts > LocalPMAdapter > [smoke] should move feature to completed on ship
✓ Updated TEST-005 status to: shipped

 ✓ src/lib/pm/local-pm-adapter.test.ts  (10 tests) 110ms
 ✓ src/lib/pm/pm-adapter.test.ts  (14 tests) 8ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ↓ src/commands/explore.test.ts  (6 tests | 6 skipped)
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ↓ src/commands/harden.test.ts  (5 tests | 5 skipped)
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/test/standards-enforcement.smoke.test.ts  (7 tests) 15ms
stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should initialize without configuration
ℹ️  Created project_management.md with project plan

 ↓ src/lib/save-performance.test.ts  (5 tests | 5 skipped)
 ✓ test/commands/hodge-context-loading.test.ts  (4 tests) 37ms
stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle explore hook
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle explore hook
✓ Added TEST-001 to project management tracking

 ✓ src/lib/install-hodge-way.test.ts  (6 tests) 358ms
stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle build hook
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle build hook
✓ Updated TEST-001 status to: building

 ✓ src/test/test-isolation.smoke.test.ts  (3 tests) 2ms
stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle harden hook
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle harden hook
✓ Updated TEST-001 status to: hardening

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle ship hook with string
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle ship hook with string
✓ Updated TEST-001 status to: shipped

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle ship hook with string
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle ship hook with context
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle ship hook with context
✓ Updated TEST-001 status to: shipped
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should load configuration from hodge.json
ℹ️  Created project_management.md with project plan

(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/lib/logger.smoke.test.ts  (9 tests) 21ms
 ✓ src/commands/explore.hodge053.test.ts  (11 tests) 10ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle missing PM tool gracefully
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle missing PM tool gracefully
✓ Added TEST-002 to project management tracking

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle missing PM tool gracefully
✓ Updated TEST-002 status to: building

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should initialize without crashing
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle missing PM tool gracefully
✓ Updated TEST-002 status to: hardening

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should handle missing PM tool gracefully
✓ Updated TEST-002 status to: shipped
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should handle missing configuration gracefully
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should update local PM tracking
ℹ️  Created project_management.md with project plan

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should update local PM tracking
✓ Added TEST-003 to project management tracking

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should update local PM tracking
✓ Updated TEST-003 status to: building

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should update local PM tracking
✓ Updated TEST-003 status to: hardening

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should update local PM tracking
✓ Updated TEST-003 status to: shipped

stdout | src/lib/pm/pm-hooks.smoke.test.ts > PM Hooks Smoke Tests > [smoke] should update local PM tracking
✓ Updated project plan phase progress
✓ Updated project management tracking

 ✓ src/lib/pm/pm-hooks.smoke.test.ts  (10 tests) 893ms
stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should handle missing configuration gracefully
✓ Added TEST-001 to project management tracking

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should handle missing configuration gracefully
✓ Updated TEST-001 status to: building

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should handle missing configuration gracefully
✓ Updated TEST-001 status to: hardening

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should handle missing configuration gracefully
✓ Updated TEST-001 status to: shipped

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should handle missing configuration gracefully
✓ Updated project plan phase progress
✓ Updated project management tracking

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should update local PM tracking
ℹ️  Created project_management.md with project plan

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should update local PM tracking
✓ Added TEST-002 to project management tracking

 ✓ test/pre-push-hook.test.ts  (10 tests) 5ms
stdout | src/test/pm-hooks.smoke.test.ts > [smoke] LocalPMAdapter should track feature status changes
ℹ️  Created project_management.md with project plan

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] LocalPMAdapter should track feature status changes
✓ Added TEST-003 to project management tracking

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] LocalPMAdapter should track feature status changes
✓ Updated TEST-003 status to: building

stdout | src/test/pm-hooks.smoke.test.ts > [smoke] PMHooks should load configuration from hodge.json
ℹ️  Created project_management.md with project plan
✓ Added TEST-004 to project management tracking

 ✓ src/test/pm-hooks.smoke.test.ts  (5 tests) 240ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/commands/ship-clean-tree.integration.test.ts  (4 tests) 525ms
 ✓ src/test/documentation-hierarchy.smoke.test.ts  (4 tests) 5ms
stderr | src/lib/__tests__/context-manager.test.ts > [smoke] ContextManager > should handle corrupted context gracefully
Warning: Failed to load context.json: SyntaxError: Expected property name or '}' in JSON at position 2 (line 1 column 3)
    at JSON.parse (<anonymous>)
    at ContextManager.load (/Users/michaelkelly/Projects/hodge/src/lib/context-manager.ts:59:19)
    at /Users/michaelkelly/Projects/hodge/src/lib/__tests__/context-manager.test.ts:76:21
    at runTest (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:781:11)
    at runSuite (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:909:15)
    at runSuite (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:909:15)
    at runFiles (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:958:5)
    at startTests (file:///Users/michaelkelly/Projects/hodge/node_modules/@vitest/runner/dist/index.js:967:3)
    at file:///Users/michaelkelly/Projects/hodge/node_modules/vitest/dist/chunks/runtime-runBaseTests.oAvMKtQC.js:116:7
    at withEnv (file:///Users/michaelkelly/Projects/hodge/node_modules/vitest/dist/chunks/runtime-runBaseTests.oAvMKtQC.js:83:5)

 ✓ src/lib/__tests__/context-manager.test.ts  (9 tests) 99ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/test/context-aware-commands.test.ts  (8 tests) 51ms
 ✓ src/test/decide-command.smoke.test.ts  (6 tests) 6ms
 ✓ src/test/standards-enforcement.integration.test.ts  (2 tests) 161ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
stdout | src/lib/pm/pm-hooks-integration.test.ts > PM Hooks Integration > [smoke] PM hooks should handle missing configuration gracefully
✓ Updated test-feature status to: exploring

stdout | src/lib/pm/pm-hooks-integration.test.ts > PM Hooks Integration > [smoke] PM hooks should handle missing configuration gracefully
✓ Updated test-feature status to: building

stdout | src/lib/pm/pm-hooks-integration.test.ts > PM Hooks Integration > [smoke] PM hooks should handle missing configuration gracefully
✓ Updated test-feature status to: shipped

stdout | src/lib/pm/pm-hooks-integration.test.ts > PM Hooks Integration > [smoke] PM hooks should handle missing configuration gracefully
✓ Updated project management tracking

 ✓ src/lib/pm/pm-hooks-integration.test.ts  (6 tests) 23ms
 ✓ src/lib/standards-validator.test.ts  (7 tests) 3ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/test/ship-lessons.smoke.test.ts  (5 tests) 452ms
 ✓ src/test/explore-no-approach-generation.smoke.test.ts  (5 tests) 3ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/commands/ship-clean-tree.smoke.test.ts  (3 tests) 606ms
(node:72349) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 ✓ src/lib/pm/linear-adapter.smoke.test.ts  (6 tests) 4ms
 ✓ src/commands/save-load.basic.integration.test.ts  (5 tests) 3ms
 ✓ src/commands/load.test.ts  (4 tests) 51ms
 ✓ src/commands/save.test.ts  (4 tests) 29ms
stdout | src/commands/status.smoke.test.ts > StatusCommand - Non-Interactive Smoke Tests > [smoke] should not crash when showing overall status
📂 Showing status for HODGE-296 from session

📊 Status for feature: HODGE-296


stdout | src/commands/status.smoke.test.ts > StatusCommand - Non-Interactive Smoke Tests > [smoke] should not crash when showing overall status
Progress:
  ✓ Exploration
  ○ Decision
  ✓ Build
  ✓ Harden
  ○ Production Ready

PM Integration:
  Issue: HODGE-296
  Tool: linear

Next Step:
  Review exploration and make a decision
  hodge decide "Your decision here" --feature HODGE-296

stdout | src/commands/status.smoke.test.ts > StatusCommand - Non-Interactive Smoke Tests > [smoke] should not crash when showing feature status
📊 Status for feature: TEST-001

⚠️  No work found for this feature.
   Start with: hodge explore TEST-001

 ✓ src/commands/explore-enhanced-simple.test.ts  (2 tests) 2ms
stdout | src/commands/status.smoke.test.ts > StatusCommand - Non-Interactive Smoke Tests > [smoke] should not update HODGE.md file
📂 Showing status for HODGE-296 from session

📊 Status for feature: HODGE-296


stdout | src/commands/status.smoke.test.ts > StatusCommand - Non-Interactive Smoke Tests > [smoke] should not update HODGE.md file
Progress:
  ✓ Exploration
  ○ Decision
  ✓ Build
  ✓ Harden
  ○ Production Ready

PM Integration:
  Issue: HODGE-296
  Tool: linear

Next Step:
  Review exploration and make a decision
  hodge decide "Your decision here" --feature HODGE-296

 ✓ src/lib/pm/github-adapter.smoke.test.ts  (4 tests) 45ms
stdout | src/commands/status.smoke.test.ts > StatusCommand - Non-Interactive Smoke Tests > [smoke] should handle session without prompting
📂 Showing status for HODGE-296 from session

📊 Status for feature: HODGE-296


stdout | src/commands/status.smoke.test.ts > StatusCommand - Non-Interactive Smoke Tests > [smoke] should handle session without prompting
Progress:
  ✓ Exploration
  ○ Decision
  ✓ Build
  ✓ Harden
  ○ Production Ready

PM Integration:
  Issue: HODGE-296
  Tool: linear

Next Step:
  Review exploration and make a decision
  hodge decide "Your decision here" --feature HODGE-296

 ✓ src/commands/status.smoke.test.ts  (4 tests) 315ms
- Detecting project configuration...
✔ Project detection complete
- Creating Hodge structure...
✔ Hodge structure created successfully
 ✓ src/test/commonjs-compatibility.smoke.test.ts  (3 tests) 411ms
 ✓ src/commands/ship.integration.test.ts  (5 tests) 6402ms
 ✓ src/test/commonjs-compatibility.integration.test.ts  (3 tests) 3375ms
 ✓ src/commands/ship.smoke.test.ts  (5 tests) 5785ms
 ✓ src/commands/explore-timing-fix.integration.test.ts  (2 tests) 2878ms
 ✓ src/test/test-isolation.integration.test.ts  (4 tests) 8849ms
 ✓ src/commands/explore.new-style.test.ts  (12 tests) 11325ms

 Test Files  66 passed | 5 skipped (71)
      Tests  587 passed | 43 skipped (630)
   Start at  09:55:47
   Duration  12.30s (transform 2.43s, setup 2ms, collect 12.20s, tests 49.42s, environment 9ms, prepare 7.91s)


```

### Lint Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 lint
> eslint . --ext .ts,.tsx


/Users/michaelkelly/Projects/hodge/src/commands/build.ts
  129:23  warning  Variable name `_standards` must match one of the following formats: camelCase, PascalCase                  @typescript-eslint/naming-convention
  187:24  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  201:78  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  214:11  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/context.ts
   74:82  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  164:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  285:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  286:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  287:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  288:60  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  288:81  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/decide.ts
   14:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  150:57  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/explore.ts
   77:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   89:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  200:76  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  298:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  394:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  512:21  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined         @typescript-eslint/no-unnecessary-condition
  513:17  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  514:16  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined         @typescript-eslint/no-unnecessary-condition
  640:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  641:49  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  646:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  646:61  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  647:41  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/init.ts
  233:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  345:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  365:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  485:63  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  728:39  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  800:9   warning  Unnecessary conditional, the types have no overlap                                                         @typescript-eslint/no-unnecessary-condition
  800:31  warning  Unnecessary conditional, the types have no overlap                                                         @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/load.ts
   41:26  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   56:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   57:52  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   66:11  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  138:50  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  139:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  140:45  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  141:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/logs.ts
  183:22  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined  @typescript-eslint/no-unnecessary-condition
  185:19  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/plan.ts
   42:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   52:64  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
   53:76  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   55:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   58:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   94:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  297:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  314:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  340:58  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  384:75  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  403:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/save.ts
  29:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  33:28  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  35:52  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  94:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/ship.ts
   357:53  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   362:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   494:15  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
   511:32  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
   611:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   692:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   731:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   776:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   788:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   827:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   981:65  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  1015:17  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/status.ts
  128:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  129:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  164:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  191:48  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/todos.ts
  13:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/auto-save.ts
  88:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/cache-manager.ts
  95:10  warning  Unnecessary conditional, value is always falsy  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/config-manager.ts
   80:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  153:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  158:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  159:41  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  235:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  241:41  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  285:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  293:60  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  303:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  311:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/context-manager.ts
   45:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   80:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   84:23  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  163:44  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  203:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/detection.ts
  195:11  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  304:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  386:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  387:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  435:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  435:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  436:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  436:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  437:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  437:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  490:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  490:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  491:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  491:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  492:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  492:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  493:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  493:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  494:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  494:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain

/Users/michaelkelly/Projects/hodge/src/lib/environment-detector.ts
  179:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  180:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  191:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  192:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  203:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  204:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  215:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  216:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  217:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  229:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts
  52:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/git-utils.ts
  157:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  158:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/hodge-md-generator.ts
   68:24  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  381:68  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts
  107:14  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  112:53  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  136:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  224:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  342:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  361:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  390:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  432:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  453:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  458:12  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  469:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  472:19  warning  Unnecessary optional chain on a non-nullish value                                                          @typescript-eslint/no-unnecessary-condition
  472:66  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  486:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts
  541:14  warning  Unnecessary conditional, value is always falsy  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pm-manager.ts
  104:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/base-adapter.ts
  20:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  47:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  68:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/conventions.ts
  137:12  warning  Unnecessary conditional, value is always truthy  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pm/env-validator.ts
  26:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  34:8   warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  85:52  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts
  116:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  153:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  176:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  231:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  344:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  385:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  409:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/index.ts
  67:8   warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  73:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts
   47:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   75:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   83:48  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  129:44  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  170:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  195:12  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pm/local-pm-adapter.ts
   44:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   47:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  170:22  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  277:62  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  278:62  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  473:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  538:12  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts
  256:60  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  282:38  warning  Unnecessary conditional, both sides of the expression are literal values                                   @typescript-eslint/no-unnecessary-condition
  283:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  283:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  364:50  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  412:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  526:52  warning  Unnecessary conditional, both sides of the expression are literal values                                   @typescript-eslint/no-unnecessary-condition
  530:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/save-manager.ts
   74:22  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  101:26  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  283:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  284:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  284:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  285:44  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  285:71  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  316:72  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  369:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/session-manager.ts
   43:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   43:51  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   44:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   44:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   45:45  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   45:72  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   46:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   46:75  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   47:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   48:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   98:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  108:48  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/structure-generator.ts
  177:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  284:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/test/mocks.ts
   29:45  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   33:61  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   36:58  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   39:44  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   43:43  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   47:62  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   50:55  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   69:33  warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
   73:26  warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
   74:13  warning  Unsafe assignment of an `any` value                                                                                                                                                            @typescript-eslint/no-unsafe-assignment
   76:7   warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
   84:26  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                                                         @typescript-eslint/no-unsafe-argument
  164:26  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  165:41  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  165:44  warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
  166:42  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  169:7   warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
  171:54  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  172:13  warning  Unsafe assignment of an `any` value                                                                                                                                                            @typescript-eslint/no-unsafe-assignment
  174:13  warning  Unsafe assignment of an `any` value                                                                                                                                                            @typescript-eslint/no-unsafe-assignment
  176:7   warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
  207:22  warning  Unsafe argument of type `any` assigned to a parameter of type `{ exists?: boolean | undefined; content?: string | undefined; files?: string[] | undefined; throwOn?: string[] | undefined; }`  @typescript-eslint/no-unsafe-argument
  207:30  warning  Unsafe member access .fs on an `any` value                                                                                                                                                     @typescript-eslint/no-unsafe-member-access
  208:28  warning  Unsafe argument of type `any` assigned to a parameter of type `{ hits?: Map<string, any> | undefined; ttl?: number | undefined; }`                                                             @typescript-eslint/no-unsafe-argument
  208:36  warning  Unsafe member access .cache on an `any` value                                                                                                                                                  @typescript-eslint/no-unsafe-member-access
  210:24  warning  Unsafe argument of type `any` assigned to a parameter of type `{ branch?: string | undefined; files?: string[] | undefined; status?: string | undefined; remote?: string | undefined; }`       @typescript-eslint/no-unsafe-argument
  210:32  warning  Unsafe member access .git on an `any` value                                                                                                                                                    @typescript-eslint/no-unsafe-member-access
  211:22  warning  Unsafe argument of type `any` assigned to a parameter of type `{ issues?: Map<string, any> | undefined; canConnect?: boolean | undefined; }`                                                   @typescript-eslint/no-unsafe-argument
  211:30  warning  Unsafe member access .pm on an `any` value                                                                                                                                                     @typescript-eslint/no-unsafe-member-access

/Users/michaelkelly/Projects/hodge/src/test/runners.ts
   33:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   48:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   49:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   50:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   51:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   60:26  warning  Unsafe argument of type `any` assigned to a parameter of type `{ cwd?: string | undefined; env?: Record<string, string> | undefined; timeout?: number | undefined; }`  @typescript-eslint/no-unsafe-argument
   68:50  warning  Unsafe argument of type `any` assigned to a parameter of type `{ cwd?: string | undefined; env?: Record<string, string> | undefined; timeout?: number | undefined; }`  @typescript-eslint/no-unsafe-argument
   75:61  warning  Unsafe argument of type `any` assigned to a parameter of type `{ cwd?: string | undefined; env?: Record<string, string> | undefined; timeout?: number | undefined; }`  @typescript-eslint/no-unsafe-argument
  235:17  warning  Unsafe array destructuring of an `any` array value                                                                                                                     @typescript-eslint/no-unsafe-assignment
  236:17  warning  Unsafe argument of type `any` assigned to a parameter of type `number`                                                                                                 @typescript-eslint/no-unsafe-argument
  236:23  warning  Unsafe argument of type `any` assigned to a parameter of type `number`                                                                                                 @typescript-eslint/no-unsafe-argument
  236:29  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:35  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:41  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:47  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:53  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument

✖ 248 problems (0 errors, 248 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.


```

### Type Check Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 typecheck
> tsc -p tsconfig.build.json --noEmit


```

### Build Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 build
> npm run sync:commands && tsc -p tsconfig.build.json && cp package.json dist/ && cp -r src/templates dist/src/


> @agile-explorations/hodge@0.1.0-alpha.1 sync:commands
> node scripts/sync-claude-commands.js

🔄 Syncing Claude slash commands...
📖 Found 11 command files
  ✓ build
  ✓ decide
  ✓ explore
  ✓ harden
  ✓ hodge
  ✓ load
  ✓ plan
  ✓ review
  ✓ save
  ✓ ship
  ✓ status
✅ Successfully synced 11 commands to /Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts
📝 Remember to commit the updated claude-commands.ts file

```
