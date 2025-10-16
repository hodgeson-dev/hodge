# Slash Command Verification Pattern

## Purpose

This pattern provides a layered verification strategy for changes to AI prompt templates (`.claude/commands/*.md`) that control Claude Code's behavior. Since these templates guide AI interactions rather than deterministic code execution, traditional automated testing is insufficient.

## When to Use This Pattern

Apply this verification strategy when:
- Modifying existing slash command templates
- Creating new slash command workflows
- Refactoring AI interaction patterns
- Implementing UX improvements to conversational interfaces

## The Challenge

AI prompt templates are fundamentally different from code:
- **Non-deterministic**: Same template may produce different AI behaviors
- **Emergent properties**: Subtle wording changes can shift AI interpretation
- **Subjective qualities**: Tone, clarity, and "delight" aren't testable with assertions
- **Conditional logic**: AI interprets context-dependent instructions dynamically
- **No REPL**: Can't quickly iterate and test like traditional code

## Verification Layers

This pattern uses **four complementary layers** to catch different types of issues:

### Layer 1: Automated Tests (Fast Feedback Loop)

**Purpose**: Detect structural regressions and enforce consistency rules

#### Characterization Tests
Capture baseline behavior before making changes:

```typescript
// src/test/slash-command-baseline.test.ts
describe('Slash Command Baseline', () => {
  test('explore command has expected sections', () => {
    const template = readFileSync('.claude/commands/explore.md', 'utf-8');

    // Capture structural requirements
    expect(template).toContain('## Problem Statement');
    expect(template).toContain('## Implementation Approaches');
    expect(template).toContain('{{feature}}'); // Variable placeholder

    // Document current interaction count
    const interactions = template.match(/Your choice|Options:/gi);
    expect(interactions?.length).toBe(3); // Baseline: 3 decision points
  });
});
```

**What it catches**: Missing sections, deleted workflow steps, lost variable placeholders

#### UX Compliance Tests
Enforce consistent patterns across all commands:

```typescript
// src/test/ux-compliance.test.ts
describe('UX Compliance', () => {
  const commands = ['explore', 'decide', 'harden', 'ship', /* ... */];

  commands.forEach(cmd => {
    test(`${cmd} uses consistent interaction start box`, () => {
      const template = readFileSync(`.claude/commands/${cmd}.md`, 'utf-8');
      expect(template).toMatch(/┌─+┐/); // Box top
      expect(template).toMatch(/└─+┘/); // Box bottom
    });

    test(`${cmd} uses standard response indicator`, () => {
      const template = readFileSync(`.claude/commands/${cmd}.md`, 'utf-8');
      if (hasUserInteraction(template)) {
        expect(template).toContain('🔔 YOUR RESPONSE NEEDED');
      }
    });

    test(`${cmd} uses alphabetized choice lists`, () => {
      const template = readFileSync(`.claude/commands/${cmd}.md`, 'utf-8');
      const choices = extractChoiceLists(template);
      choices.forEach(list => {
        expect(list).toMatch(/\(a\).*\(b\).*\(c\)/s);
      });
    });
  });
});
```

**What it catches**: UX inconsistencies, pattern violations, style drift

**Run tests**:
```bash
npm test src/test/slash-command-baseline.test.ts
npm test src/test/ux-compliance.test.ts
```

### Layer 2: AI Diff Analysis (Static Analysis)

**Purpose**: Intelligent comparison of old vs new templates to detect regressions

#### How It Works

1. **Retrieve baseline version from git**:
   ```bash
   # Get commit SHA from ship-record.json (created at build start)
   baseline_commit=$(jq -r '.buildStartCommit' .hodge/features/YOUR-FEATURE/ship-record.json)

   # Retrieve old version
   git show $baseline_commit:.claude/commands/explore.md > /tmp/explore-baseline.md
   ```

2. **Ask AI to analyze**:
   ```
   Compare the slash command template from commit [buildStartCommit] with the current version.

   Old version: git show <commit>:.claude/commands/explore.md
   New version: .claude/commands/explore.md

   Have we preserved the essential workflow structure?
   Are there any regressions or breaking changes?
   ```

3. **AI Analysis Template**:
   ```markdown
   ## AI Diff Analysis: {command}

   **Workflow Preservation**: ✅/⚠️/❌
   - [ ] All original steps present
   - [ ] Decision points intact
   - [ ] File operations preserved
   - [ ] Variable placeholders unchanged

   **Changes Made**:
   1. [Description of change]
      - Intent: [Why this change was made]
      - Impact: [What it affects]
      - Risk: [Potential issues]

   **Regressions Detected**: None / [List with severity]

   **Behavioral Shifts Possible**:
   - [Wording changes that might affect AI interpretation]

   **Recommendations**: [Follow-up actions needed]
   ```

**What AI can detect**:
- ✅ Missing workflow steps
- ✅ Deleted decision points
- ✅ Removed file operations (Write, Read)
- ✅ Lost variable placeholders ({{feature}})
- ✅ Semantic changes to core instructions
- ✅ Unintended tone shifts

**What AI might miss**:
- ⚠️ Subtle behavioral changes from wording nuances
- ⚠️ Emergent UX impacts on user responses
- ⚠️ Conditional logic edge cases
- ⚠️ Performance implications (token usage changes)

### Layer 3: Manual Smoke Test (End-to-End Verification)

**Purpose**: Verify actual AI behavior and subjective qualities (tone, clarity, delight)

#### Process

1. **Capture baseline** (before making changes):
   ```bash
   mkdir -p .hodge/features/YOUR-FEATURE/baseline/

   # Run each affected command
   # Example: /explore test-feature-346
   # Copy full text output to:
   # .hodge/features/YOUR-FEATURE/baseline/explore-output.txt
   ```

2. **Make template changes**

3. **Capture after** (with new templates):
   ```bash
   mkdir -p .hodge/features/YOUR-FEATURE/after/

   # Run same commands again
   # Copy full text output to:
   # .hodge/features/YOUR-FEATURE/after/explore-output.txt
   ```

4. **Compare outputs**:
   ```bash
   diff .hodge/features/YOUR-FEATURE/baseline/explore-output.txt \
        .hodge/features/YOUR-FEATURE/after/explore-output.txt
   ```

5. **Verification checklist**:
   - [ ] Command completes successfully (no errors)
   - [ ] All workflow steps executed in order
   - [ ] UX enhancements present (visual patterns)
   - [ ] Tone feels natural and appropriate
   - [ ] Error recovery hints helpful
   - [ ] No unintended behavioral changes
   - [ ] Context loading still works correctly
   - [ ] Generated files have expected content

**What it catches**:
- End-to-end workflow breaks
- Subjective quality regressions
- Emergent behavioral changes
- Integration issues with other systems

### Layer 4: Diff Review (Pre-Commit Safety Check)

**Purpose**: Human review of actual changes before committing

#### Process

Before hardening/shipping:
```bash
git diff .claude/commands/
```

**Review checklist**:
- [ ] No accidental deletions of critical sections
- [ ] Variable placeholders preserved ({{feature}}, {{timestamp}})
- [ ] No unintended prompt injection vulnerabilities
- [ ] Changes align with story intent
- [ ] Consistent updates across related commands
- [ ] No hardcoded values that should be templated
- [ ] Comments/documentation updated as needed

**What it catches**:
- Accidental copy-paste errors
- Inconsistent changes across files
- Security vulnerabilities
- Scope creep

## Implementation Workflow

### First Story in Epic

**Before Changes**:
1. ✅ Write characterization tests (capture baseline)
2. ✅ Write UX compliance tests (define new patterns)
3. ✅ Run tests - should pass with current templates
4. ✅ Capture manual baseline outputs (all affected commands)
5. ✅ Commit tests and baselines

**During Changes**:
1. Update template files
2. Run automated tests continuously
3. Fix test failures as you go

**After Changes**:
1. Run characterization tests (detect regressions)
2. Run UX compliance tests (verify new patterns)
3. Perform AI diff analysis using git
4. Execute manual smoke tests
5. Capture after outputs, compare with baseline
6. Git diff review before commit
7. Commit changes once all layers pass

### Subsequent Stories in Epic

**Before Changes**:
1. Review previous story's "after" outputs as new baseline

**During Changes**:
1. Update templates
2. Run automated tests

**After Changes**:
1. All four verification layers (tests → AI → manual → diff)
2. Incremental comparison (this story vs previous story)

## File Organization

```
src/test/
├── slash-command-baseline.test.ts    # Characterization tests
├── ux-compliance.test.ts             # Pattern enforcement
└── helpers.ts                        # Shared test utilities

.hodge/features/YOUR-FEATURE/
├── baseline/
│   ├── explore-output.txt
│   ├── decide-output.txt
│   └── ... (one per affected command)
├── after/
│   ├── explore-output.txt
│   └── ... (one per affected command)
├── ai-analysis/
│   ├── explore-diff-analysis.md
│   └── ... (one per affected command)
└── verification-checklist.md

.claude/commands/              # Active templates (your changes)
```

## Git-Based Baseline Retrieval

### Why Git Instead of Backup Directory?

**Benefits**:
- ✅ Automatic tracking via ship-record.json (buildStartCommit)
- ✅ Works across any commit in history
- ✅ No extra files to maintain
- ✅ Built into version control workflow
- ✅ Supports comparing any two versions

### How to Retrieve Old Versions

```bash
# Method 1: Using ship-record.json (recommended)
baseline=$(jq -r '.buildStartCommit' .hodge/features/YOUR-FEATURE/ship-record.json)
git show $baseline:.claude/commands/explore.md

# Method 2: Using commit SHA directly
git show abc123:.claude/commands/explore.md

# Method 3: Using relative commits
git show HEAD~2:.claude/commands/explore.md

# Save to file for comparison
git show $baseline:.claude/commands/explore.md > /tmp/explore-old.md
```

### AI Analysis Command

```bash
# Get the baseline commit
baseline=$(jq -r '.buildStartCommit' .hodge/features/YOUR-FEATURE/ship-record.json)

# Show AI both versions
echo "Old version (commit $baseline):"
git show $baseline:.claude/commands/explore.md

echo "\nCurrent version:"
cat .claude/commands/explore.md

# Then ask AI:
# "Analyze these two versions. Have we preserved the workflow structure?"
```

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking core workflow | Medium | High | Characterization tests + AI diff analysis |
| Subtle behavioral shifts | High | Medium | Manual smoke test + baseline comparison |
| UX inconsistencies | Medium | Low | UX compliance tests |
| Security vulnerabilities | Low | High | Diff review + prompt injection scanning |
| Performance degradation | Low | Medium | Token usage monitoring in manual tests |

## Success Criteria

A change is ready to ship when:
- ✅ All automated tests passing (Layer 1)
- ✅ AI diff analysis shows no regressions (Layer 2)
- ✅ Manual smoke test confirms workflow works (Layer 3)
- ✅ Subjective qualities verified (tone, clarity, delight)
- ✅ Diff review completed with no concerns (Layer 4)

## Rollback Plan

If verification fails at any layer:

```bash
# Option 1: Revert specific file
git restore .claude/commands/explore.md

# Option 2: Revert to specific commit
git restore --source=$baseline .claude/commands/explore.md

# Option 3: Revert entire change
git reset --hard $baseline
```

Then investigate, fix, and re-verify.

## Examples

### Example 1: Adding Visual Box Pattern

**Change**: Add interaction start box to all commands

**Verification**:
1. ✅ Baseline tests pass (no box required yet)
2. ✅ Add UX compliance test requiring box
3. ✅ Update all 10 templates with box pattern
4. ✅ UX compliance tests pass (pattern enforced)
5. ✅ AI diff: "Box added to start, no workflow changes ✅"
6. ✅ Manual test: Commands display box correctly
7. ✅ Diff review: Consistent across all files

### Example 2: Changing Decision Prompt Wording

**Change**: "You must choose" → "Which resonates with you?"

**Verification**:
1. ✅ Characterization test: Decision point still exists
2. ✅ AI diff: "Tone softer, workflow preserved ✅, may encourage longer responses ⚠️"
3. ✅ Manual test: Users can still select options, tone feels better
4. ⚠️ Note in analysis: Monitor for response length changes

## Related Patterns

- `.hodge/patterns/test-pattern.md` - General testing approach
- `.hodge/patterns/review-profile-pattern.md` - UX rule enforcement
- `.hodge/patterns/temp-directory-fixture-pattern.md` - Test isolation

## History

- **Created**: 2025-10-16 (HODGE-346)
- **Context**: Unified UX system for Claude Code slash commands
- **Motivation**: Need reusable verification strategy for AI template changes

---

**Key Insight**: AI prompt templates require layered verification because they control emergent behavior, not deterministic logic. Automated tests catch structure, AI analysis catches semantics, manual testing catches experience.
