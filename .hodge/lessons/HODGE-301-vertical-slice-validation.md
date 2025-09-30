# Lessons Learned: HODGE-301 - Vertical Slice Validation

## Feature: Vertical Slice Validation for /plan Command

### The Problem

The `/plan` command was creating epics and stories without enforcing that each story is a **vertical slice** - a complete, testable, shippable unit of value. This led to three critical issues:

1. **Horizontal slicing**: Stories split by technical layer (e.g., "Backend API" + "Frontend UI") rather than by complete features
2. **Incomplete stories**: Work items that couldn't be independently tested or shipped
3. **Unclear value**: Stories that didn't clearly benefit any stakeholder

The user requirement was explicit: Each story MUST be a vertical slice providing complete value, or the feature should be created as a single issue instead.

### Approach Taken

After exploring three implementation approaches during the `/decide` phase, we chose **Approach 2: AI-Driven Vertical Slice Design** (the pure template guidance approach) over hybrid validation or programmatic enforcement.

**Key decisions made:**
1. **AI-driven design only** - No programmatic validation code
2. **Warn-only validation** - Informational guidance, no blocking
3. **Moderate criteria** - Stories must provide stakeholder value AND be independently testable
4. **Auto-convert fallback** - Suggest single issue when vertical slicing isn't feasible
5. **Extensive documentation** - Comprehensive template with criteria, examples, and decision trees

### Implementation Details

**What was delivered:**
- Enhanced `.claude/commands/plan.md` with 145 lines of guidance:
  - "What is a Vertical Slice?" definition section
  - Moderate vertical slice criteria (stakeholder value + independently testable)
  - Good vs bad story examples (vertical vs horizontal slicing)
  - 4-step vertical slice decision tree
  - Updated AI workflow with validation reminders
  - Enhanced Important Notes section

- Added smoke tests (45 lines) to verify template content exists
- Zero runtime code changes (pure documentation enhancement)

### Key Learnings

#### 1. AI-Driven Validation for Complex Analysis

**Discovery**: When validation requires nuanced understanding and context (like determining if a story provides "complete value"), AI-driven approaches through template guidance can be more effective than rigid programmatic rules.

**User Insight**: "AI-driven validation when complex analysis is required. It's not perfect, but should be good enough for the current context."

**Why This Works**:
- AI can understand the semantic meaning of story descriptions
- Template provides examples and decision trees for consistent evaluation
- Avoids false positives from pattern-matching approaches
- Educational rather than punitive (teaches principles)
- More flexible than hard-coded validation rules

**Trade-offs**:
- Relies on AI following instructions (not guaranteed)
- No programmatic enforcement safety net
- Effectiveness depends on template quality
- Behavior may vary between AI sessions/models

**When to Use This Pattern**:
- Validation requires semantic understanding, not just syntax
- Context and nuance matter more than strict rules
- Educational guidance is more valuable than enforcement
- The cost of false positives exceeds false negatives
- Iterative improvement through examples is feasible

#### 2. Documentation-Only Features Can Have Significant Impact

**Discovery**: Sometimes the most effective solution is comprehensive documentation rather than code changes.

**Evidence**:
- Zero runtime code changes
- 145 lines of template guidance
- 2 smoke tests verify documentation exists
- All 207 tests passing (no regression risk)

**Impact**:
- Guides future AI behavior without code complexity
- Easy to iterate and improve based on real usage
- No performance overhead
- No maintenance burden from validation logic

#### 3. Template Compliance Testing

**Discovery**: For documentation-only features, smoke tests should verify the *existence* and *correctness* of template content, not runtime behavior.

**Implementation**:
```typescript
smokeTest('plan.md template includes vertical slice guidance', async () => {
  const template = await fs.readFile(templatePath, 'utf-8');

  expect(template).toContain('Vertical Slice Requirement');
  expect(template).toContain('What is a Vertical Slice?');
  expect(template).toContain('Good vs Bad Story Examples');
  expect(template).toContain('Vertical Slice Decision Tree');
});
```

**Why This Matters**:
- Prevents accidental removal of guidance
- Documents expected template structure
- Quick verification (no integration complexity)
- Clear signal if template is incomplete

### Related Decisions

From `.hodge/decisions.md`:

1. **AI-Driven Design Only** (2025-09-30)
   - Enhance template with guidance vs programmatic validation
   - Trust AI to apply principles over enforcing rules

2. **Warn-only validation strictness** (2025-09-30)
   - Informational warnings, no blocking behavior
   - Balances education with flexibility

3. **Moderate vertical slice criteria** (2025-09-30)
   - Stories must provide value to stakeholder AND be independently testable
   - Captures intent without over-constraining

4. **Auto-convert to single issue fallback** (2025-09-30)
   - System suggests single issue when stories can't meet criteria
   - Provides sensible default for edge cases

5. **AI validation during plan generation with mandatory user approval** (2025-09-30)
   - Validation happens during AI-guided plan creation
   - All plans require explicit user approval before CLI execution

6. **Extensive template documentation** (2025-09-30)
   - Add criteria, examples, and decision trees
   - One-time investment for long-term educational value

### Impact

**Immediate Benefits**:
- AI now has clear guidance for creating vertical slices
- Users see examples of good vs bad story breakdowns
- Decision tree helps validate stories during plan generation
- Fallback mechanism when vertical slicing isn't feasible

**Long-term Value**:
- Educational approach improves plan quality over time
- Template can be iteratively improved based on usage
- No code complexity or maintenance burden
- Zero regression risk (documentation-only change)

**Metrics**:
- 207 tests passing (205 existing + 2 new)
- Zero runtime performance impact
- 145 lines of comprehensive guidance
- 3 files modified (template + tests + sync)

### When to Apply This Pattern

Use AI-driven validation through template guidance when:

✅ **Good fit**:
- Validation requires semantic understanding
- Context and nuance are critical
- Educational value is important
- Iterative refinement is expected
- False positives would be frustrating

❌ **Not a good fit**:
- Strict enforcement is required
- Binary yes/no validation is sufficient
- Programmatic checks are simple and reliable
- Compliance must be guaranteed
- No AI is involved in the workflow

### Example: The Vertical Slice Decision Tree

```markdown
When generating stories, ask:

1. Can this story be tested independently?
   - No → Merge with dependent stories to create complete slice
   - Yes → Continue to question 2

2. Does this story provide value to a stakeholder?
   - No → Include as part of a value-delivering story
   - Yes → Continue to question 3

3. Could this story ship to production?
   - No → Expand to include all needed pieces
   - Yes → This is a valid vertical slice ✅

4. Are all stories in the epic vertical slices?
   - No → Revise the breakdown
   - Yes → Continue to dependencies
```

This decision tree provides clear, actionable steps for AI to follow during plan generation.

### Conclusion

This feature demonstrates that **AI-driven validation through comprehensive template guidance** can be an effective alternative to programmatic validation when:
- The validation requires nuanced understanding
- Educational value matters
- Flexibility is more important than rigid enforcement

The key is providing clear criteria, concrete examples, and decision trees that guide AI behavior consistently. While not perfect, this approach is "good enough for the current context" and can be iteratively improved based on real-world usage.

---
_Documented: 2025-09-30_
_Feature shipped in commit: 130939ebe06103b5948ab6d573c6805ac8671449_