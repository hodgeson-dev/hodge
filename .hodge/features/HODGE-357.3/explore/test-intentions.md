# Test Intentions: HODGE-357.3

## Feature: Complete All Remaining ESLint Errors - Zero Errors Goal

### TI-1: Security Vulnerability Remediation
**What**: All 11 security vulnerabilities must be patched without breaking functionality
**How to Verify**:
- [ ] Run `npm run lint` shows zero slow-regex errors
- [ ] Run `npm run lint` shows zero no-os-command-from-path errors
- [ ] Run `npm run lint` shows zero weak hashing errors
- [ ] Test regex patterns with inputs >1000 chars (prevent ReDoS)
- [ ] Test PATH validation rejects inputs with special chars (../, $(), etc.)
- [ ] Verify all hashing uses SHA-256 or stronger

---

### TI-2: Nested Ternary Extraction
**What**: All 11 nested ternaries extracted to clear variables/functions
**How to Verify**:
- [ ] Run `npm run lint` shows zero no-nested-conditional errors
- [ ] Code uses map lookups instead of nested ternaries where appropriate
- [ ] Extracted logic has descriptive names

---

### TI-3: Cognitive Complexity Reduction
**What**: All 15 functions reduced to complexity <15
**How to Verify**:
- [ ] Run `npm run lint` shows zero cognitive-complexity errors
- [ ] init.ts: execute(), setupPMIntegration(), smartQuestionFlow(), promptForPMTool() all <15
- [ ] plan.ts: execute(), analyzeFeature(), generateSubIssues(), createPMIssues() all <15
- [ ] status.ts: generateReport(), displayFeatureStatus(), formatProgressBar() all <15
- [ ] decide.ts, toolchain-generator.ts, toolchain-service.ts, toolchain-service-registry.ts all <15
- [ ] Each refactored function follows constructor injection pattern
- [ ] Services properly extracted without duplicating existing service logic

---

### TI-4: File Length Compliance
**What**: All files under 400-line limit (except 2 exempted templates)
**How to Verify**:
- [ ] Run `npm run lint` shows only 2 file-length warnings (exempted templates)
- [ ] init.ts < 400 lines (was 983)
- [ ] plan.ts < 400 lines (was 604)
- [ ] harden.ts < 400 lines (was 570)
- [ ] hodge-md-generator.ts < 400 lines (was 458)
- [ ] pattern-learner.ts < 400 lines (was 427)
- [ ] sub-feature-context-service.ts < 400 lines (was 421)
- [ ] explore-service.ts < 400 lines (was 409)
- [ ] status.ts < 400 lines (was 401)
- [ ] claude-commands.ts and pm-scripts-templates.ts added to ESLint ignorePatterns

---

### TI-5: Service Infrastructure Reuse
**What**: No duplicate detection/service logic created during refactoring
**How to Verify**:
- [ ] PMSetupService uses existing PMToolDetector (not reimplementing)
- [ ] PatternLearningService uses existing pattern-learner infrastructure
- [ ] AIIntegrationService doesn't duplicate detection logic
- [ ] New plan services use existing PM integration infrastructure
- [ ] New status services use existing feature detection
- [ ] Review all new services - confirm they compose existing services

---

### TI-6: Zero ESLint Errors
**What**: Complete elimination of all 75 errors
**How to Verify**:
- [ ] Run `npm run lint` shows 0 errors (warnings OK)
- [ ] 0 cognitive-complexity errors (was 15)
- [ ] 0 security vulnerabilities (was 11)
- [ ] 0 nested-conditional errors (was 11)
- [ ] 0 file-length errors except exempted templates (was 10)
- [ ] 0 dead-store errors
- [ ] 0 unused-variable errors
- [ ] 0 unsafe-any errors
- [ ] 0 require-await errors
- [ ] CI quality checks pass completely

---

### TI-7: Regression Prevention
**What**: All existing functionality preserved after refactoring
**How to Verify**:
- [ ] Run `npm test` - all 1300+ tests passing
- [ ] Manual smoke test: `hodge init` completes successfully
- [ ] Manual smoke test: `hodge explore TEST-FEATURE` works
- [ ] Manual smoke test: `hodge build TEST-FEATURE` works
- [ ] Manual smoke test: `hodge ship TEST-FEATURE` works
- [ ] No breaking changes to public command APIs
- [ ] All existing commands work as before

---

### TI-8: Constructor Injection Pattern Consistency
**What**: All new services follow Phase 1/2 constructor injection pattern
**How to Verify**:
- [ ] PMSetupService has constructor with default instances
- [ ] PatternLearningService has constructor with default instances
- [ ] AIIntegrationService has constructor with default instances
- [ ] PlanAnalysisService has constructor with default instances
- [ ] SubIssueGeneratorService has constructor with default instances
- [ ] ReportGeneratorService has constructor with default instances
- [ ] ProgressFormatterService has constructor with default instances
- [ ] All new services testable via constructor injection
- [ ] Pattern matches ShipService, ExploreService, HardenService

---

### TI-9: Template File Exemption
**What**: Template files properly exempted from file-length checks
**How to Verify**:
- [ ] .eslintrc.json includes "src/lib/claude-commands.ts" in ignorePatterns
- [ ] .eslintrc.json includes "src/lib/pm-scripts-templates.ts" in ignorePatterns
- [ ] Run `npm run lint` doesn't show file-length errors for these files
- [ ] Other files still subject to 400-line limit enforcement

---

## Success Criteria Summary

**Primary Goal**: 75 errors → 0 errors
**Secondary Goals**:
- CI passing
- All files <400 lines (except 2 exempted)
- No code duplication
- All tests passing
- Maintainable architecture established
