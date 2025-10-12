# Exploration: HODGE-341.5

## Title
AI-Driven Warning Review in Harden Phase

## Problem Statement

Currently, `/harden` only fails on **errors** (exit code ≠ 0), but ignores **warnings**. `/ship` also doesn't address warnings. This creates a gap where warnings accumulate without being addressed, potentially shipping code with:
- High cognitive complexity
- Security concerns flagged as warnings
- Long functions/files that reduce maintainability
- Other quality issues that don't cause immediate failures

**User expectation**: Harden should prepare code for production, which includes addressing critical warnings.

**Key Insight** (from discussion): The CLI shouldn't parse warnings or decide what's "critical" - that's an AI judgment call based on project context, standards, and feature scope. Let the AI interpret raw tool output naturally.

## Current State

### Harden Phase Behavior
- ✅ Runs all quality checks (ESLint, TypeScript, tests, etc.)
- ✅ Generates `quality-checks.md` with ALL tool output (errors + warnings)
- ✅ Fails if any tool exits with non-zero code (errors)
- ❌ Ignores warnings completely
- ❌ No mechanism to categorize warnings by severity

### Ship Phase Behavior
- ✅ Verifies all harden checks passed
- ❌ Does not re-check warnings
- ❌ No baseline comparison of warnings

## Recommendation

Implement an **AI-driven approach** where the CLI simply prompts the AI to review warnings, and the AI makes contextual decisions:

### After All Errors Fixed (Harden Phase)
1. CLI displays success message: "✅ All blocking errors fixed!"
2. CLI notifies: "⚠️ Some warnings remain in quality-checks.md"
3. CLI displays optional warning guidance from toolchain.yaml
4. CLI prompts AI: "Please review quality-checks.md and identify any warnings that should be fixed before shipping"
5. AI reads quality-checks.md (raw tool output, no parsing!)
6. AI uses judgment based on:
   - Project standards (.hodge/standards.md)
   - Warning guidance (toolchain.yaml)
   - Feature scope and risk
   - User's principles
7. AI reports findings naturally: "I found 6 warnings worth addressing: [list]. Would you like me to fix them?"
8. User responds conversationally: "Yes, fix the complexity ones" / "These are acceptable" / etc.

### Benefits of AI-Driven Approach
- **No parser maintenance**: Works with any tool, any format
- **Contextual judgment**: AI considers full project context
- **Flexible**: User can ask follow-up questions naturally
- **Simple CLI code**: Just display prompt, let AI handle rest
- **Scalable**: Supports new tools without code changes

## Decisions Decided During Exploration

1. ✓ **No CLI Parsing**: Let AI interpret raw tool output directly
   - Rationale: Avoids parser explosion for every tool/format
   - AI already excels at interpreting unstructured data
   - More maintainable and scalable

2. ✓ **Configuration Approach**: Simple flag + optional guidance (not rigid rules)
   - Add to `.hodge/toolchain.yaml` under `quality_gates.harden`
   - `review_warnings: true/false` - enables/disables feature
   - `warning_guidance: string` - optional text guidance for AI (not rules)
   - Rationale: Give AI context without constraining its judgment

3. ✓ **AI-Driven Categorization**: AI decides what's "critical" based on context
   - Considers project standards (.hodge/standards.md)
   - Applies warning guidance (if configured)
   - Uses judgment for feature scope/risk
   - Rationale: AI has full context, can make nuanced decisions

4. ✓ **Natural Interaction**: User responds conversationally
   - No rigid prompt options (a/b/c/d)
   - User can ask questions, request specifics
   - AI adapts to conversation naturally
   - Rationale: More flexible and intuitive

5. ✓ **Simple CLI Responsibility**: Just display prompt and guidance
   - Check if review_warnings enabled
   - Display warning guidance if configured
   - Prompt AI to review quality-checks.md
   - That's it! AI takes over from there
   - Rationale: Separation of concerns, minimal CLI logic

6. ✓ **Ship Phase**: Defer to future work if needed
   - Can add warning baseline comparison later
   - For now, focus on harden phase enhancement
   - Rationale: Solve one problem well first

## Open Questions

None - all decisions resolved during exploration.

## Technical Approach

### Toolchain Configuration
```yaml
# .hodge/toolchain.yaml
quality_gates:
  harden:
    review_warnings: true  # Enable AI warning review
    warning_guidance: |    # Optional guidance for AI
      Focus on production-impacting issues:
      - Security warnings
      - Cognitive complexity >15
      - Functions >50 lines
      ...
```

### TypeScript Types
```typescript
// src/types/toolchain.ts
export interface QualityGateConfig {
  review_warnings?: boolean;
  warning_guidance?: string;
}

export interface ToolchainConfig {
  // ... existing fields
  quality_gates?: {
    harden?: QualityGateConfig;
    ship?: QualityGateConfig;
  };
}
```

### Harden Command Integration
```typescript
// src/commands/harden.ts
private async promptWarningReview(hardenDir: string): Promise<void> {
  // 1. Load toolchain config
  // 2. Check if review_warnings enabled
  // 3. Display success message
  // 4. Display warning guidance (if configured)
  // 5. Prompt AI to review quality-checks.md
  // That's it! No parsing, no categorization
}
```

**Key Points:**
- No warning parser needed
- No categorization logic
- AI reads quality-checks.md directly
- CLI just displays prompt
- ~60 lines of simple code

## Test Strategy

### Smoke Tests
- Verify prompt displays when review_warnings=true
- Verify prompt skipped when review_warnings=false
- Verify warning guidance displayed when configured
- Verify prompt skipped when quality-checks.md missing

### Integration Tests (Manual)
- Run `/harden` on feature with warnings
- Verify AI prompt appears
- Test AI responds and fixes warnings
- Verify natural conversation works

## Success Criteria

1. ✅ Harden displays AI prompt after all errors fixed
2. ✅ Warning guidance displayed when configured
3. ✅ Prompt skipped when review_warnings disabled
4. ✅ AI can naturally read and interpret quality-checks.md
5. ✅ User can respond conversationally
6. ✅ All tests pass
7. ✅ Documentation updated

## Estimated Scope (Revised - AI-Driven Approach)

- **Files to create**: 0 (no new services needed!)
- **Files to modify**: 3 (harden.ts, toolchain.ts types, toolchain.yaml)
- **Lines changed**: ~60 LOC total
- **Test coverage**: 1-2 smoke tests
- **Size**: Small (~60 LOC vs 400-500 LOC originally)
