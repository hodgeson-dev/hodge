# Hodge Development Principles

These principles guide how we build software using the Hodge framework.

## Core Philosophy

> "Freedom to explore, discipline to ship"

Software development is a journey from uncertainty to confidence. Hodge provides a structured path that respects both creative exploration and production discipline.

## Standards Enforcement Guide

### Understanding Enforcement Notation

Standards in `.hodge/standards.md` use enforcement metadata headers to indicate when they apply:

- **`Build(suggested)`** - Nice to have, helps maintain consistency
- **`Harden(required)`** - Should be followed, warnings if not met
- **`Ship(mandatory)`** - Must be followed, blocks shipping if violated
- **`ALL PHASES (mandatory)`** - Critical standards that always apply

Examples:
- `**Enforcement: Build(suggested) → Harden(required) → Ship(mandatory)**` - Progressive
- `**Enforcement: ALL PHASES (mandatory)**` - Always required
- `**Enforcement: Ship(mandatory)**` - Only enforced when shipping

### AI Interpretation

When working in each phase, AI assistants should:

1. **Explore Phase**: Ignore most standards, focus on exploration
2. **Build Phase**: Consider standards marked as `Build(suggested)` or stronger
3. **Harden Phase**: Enforce standards marked as `Harden(required)` or stronger
4. **Ship Phase**: Block on any `Ship(mandatory)` violations

## The Five Principles

### 1. Progressive Enhancement 📈
**Standards tighten as code matures**

- Start loose, end tight
- Quality gates match development phase
- Technical debt is temporary, not permanent
- Refactoring is expected, not exceptional
- **Boy Scout Rule**: Always leave code better than you found it

**The Boy Scout Rule** (from Robert C. Martin):
> "Leave the code cleaner than you found it."

When working on a feature, if you encounter pre-existing code that violates current standards:
- **During Harden/Ship phases**: Fix it as part of your work
- **Small improvements**: Reduce cognitive complexity, fix TODO format, improve naming
- **Don't ignore warnings**: If lint/typecheck reports issues in files you touch, address them
- **Scope appropriately**: Don't refactor the entire codebase, just what you encounter

*Example from HODGE-341.3*:
```
User: "Let's fix the cognitive complexity issue. Boy Scout rule."

AI fixed:
- Feature code: 7 ESLint errors in new files (mandatory)
- Pre-existing code: Cognitive complexity 19 in harden.ts (Boy Scout)
- Result: Both feature and touched pre-existing code improved
```

*In practice:*
```typescript
// Explore: This is fine
function processData(data: any) {
  return data.items.map(x => x.value);
}

// Ship: This is required
function processData(data: ValidatedInput): ProcessedOutput[] {
  return data.items
    .filter(isValidItem)
    .map(transformItem)
    .filter(meetsBusinessRules);
}
```

### 2. Behavior-Focused Testing 🎯
**Test what users see, not how it works**

- Test the contract, not the implementation
- Mock boundaries, not internals
- Integration > Unit tests
- User stories drive test cases

*In practice:*
```typescript
// ❌ Implementation-focused
it('should set internal state to PROCESSING', () => {
  expect(service.state).toBe('PROCESSING');
});

// ✅ Behavior-focused
it('should process order and send confirmation email', async () => {
  const order = await service.processOrder(validOrder);
  expect(order.status).toBe('confirmed');
  expect(emailsSent).toContain(order.confirmationEmail);
});
```

### 3. Learn from Success 🎓
**Extract patterns from shipped code**

- Patterns emerge, they're not prescribed
- Success should be repeatable
- Failed experiments are learning opportunities
- Share what works, forget what doesn't

*In practice:*
- Ship a feature successfully
- Run `hodge learn` to extract patterns
- Reuse patterns in next feature
- Evolve patterns based on usage

### 4. Pragmatic Quality 🎚️
**Quality gates that make sense**

- Perfect is the enemy of shipped
- Quality is contextual, not absolute
- Measure what matters
- Automate what's repetitive

*Quality by Phase:*
| Phase | Quality Focus |
|-------|--------------|
| Explore | Does it work? |
| Build | Is it maintainable? |
| Harden | Is it reliable? |
| Ship | Is it production-ready? |

### 5. Transparent Progress 📊
**Make development state visible**

- Code's phase should be obvious
- Decisions should be documented
- Progress should be measurable
- Problems should surface early

*In practice:*
- Feature branches show phase: `explore/feature`, `build/feature`, etc.
- Comments mark temporary code: `// TODO: Harden this before ship`
- Dashboards show phase metrics
- Stand-ups discuss phase transitions

### 6. Structured Flexibility 🔄
**Balance framework structure with conversational discovery**

The framework balances structure with conversational discovery:

**Structure Provides**:
- Standards that define quality gates
- Progressive phases that build discipline
- Test requirements that ensure reliability
- Patterns that guide implementation

**Conversation Enables**:
- Discovery of missing requirements
- Course correction during implementation
- Natural iteration and refinement
- Flexible response to complexity

**The Balance**: Neither alone is sufficient. Structure without conversation becomes rigid and brittle. Conversation without structure becomes chaotic and inconsistent. Together they create "flexible discipline" - freedom to explore within guardrails that ensure quality.

**In Practice**: When implementing a feature:
- Start with the structured plan (exploration → decision → build → harden → ship)
- Allow conversation to discover gaps and opportunities
- Update the plan based on discoveries
- Maintain standards throughout

*This principle emerged from HODGE-333.4, where a clear 4-phase plan coexisted with conversational discovery of missing functionality (review report generation). The structure guided without constraining.*

## Hodge-Specific Architectural Principles

### 1. AI-Backend Separation
- **AI (Claude) Role**: Intellectual work - analysis, extraction, design, proposals
- **Backend (hodge) Role**: Operational work - file creation, PM updates, Git operations
- **Interface**: Clear command boundaries with well-defined inputs/outputs

### 2. Data Transfer Patterns
- **Simple Data**: CLI arguments for basic strings and flags
- **Complex Data**: File-based transfer through `.hodge/tmp/`
- **Structured Data**: YAML/JSON specifications for rich metadata
- **Preservation**: Spec files are historical artifacts, not temporary files

### 3. Template Abstraction
- **Principle**: Templates guide conversation flow, not implementation details
- **Good**: "Create the feature: `hodge explore feature --from-spec file.yaml`"
- **Bad**: "This will create directories X, Y, update file Z..."
- **Rule**: Treat hodge commands as black-box services

### 4. Context Preservation
- **Capture the Why**: Document rationale for decisions and groupings
- **Rich Metadata**: Preserve AI analysis (scope, dependencies, effort estimates)
- **Feature Specs**: Complete context from extraction to implementation

### 5. Progressive Development
- **Explore**: Freedom to experiment, minimal constraints
- **Build**: Balanced approach, should follow standards
- **Harden**: Strict enforcement, must meet quality gates
- **Ship**: Production ready, all requirements met

### 7. Performance Optimization Through Iteration 🔄
**Optimize through measurement cycles, not assumptions**

When addressing performance issues:
1. **Measure first** - Establish baseline metrics
2. **Target the biggest bottleneck** - Fix the most impactful issue
3. **Measure again** - Validate the improvement
4. **Repeat** - Continue until goals are met or diminishing returns

**Why**:
- Prevents premature optimization
- Ensures changes actually help
- Reveals hidden bottlenecks (solving one often exposes the next)
- Builds confidence through data

**Example (HODGE-351)**:
- Baseline: 74s with orphaned processes
- Fix 1: Worker limits → 23s, zero orphaned processes
- Fix 2: Test reclassification → clearer picture of where time goes
- Fix 3: detectTools() optimization → 16.5s (63% total improvement)

Each step revealed the next opportunity.

**Related**: Test performance standards (<30s full suite)

### 8. Proactive Quality 🎯
**Write code that passes standards from the start**

During build phase, write code that already complies with ship-phase standards when practical. This avoids rework cycles during hardening.

**Key practices:**
- Follow function length limits (50 lines) while writing, not after
- Stay within file length limits (400 lines) from the start
- Structure code for testability as you write it
- Use proper error handling patterns initially

**Why this matters:**
- Reduces harden-phase rework (no refactoring for length violations)
- Builds good habits (quality becomes natural, not forced)
- Faster shipping (fewer issues to fix before production)
- Less context switching (fix while context is fresh, not later)

**When to apply:**
- ✅ Build phase: Follow limits proactively when writing new code
- ✅ Harden phase: Must meet all standards before shipping
- ⚠️ Explore phase: Optional (freedom to experiment)

**Example:**
```typescript
// ❌ Build phase: Write 80-line function, fix later in harden
async function processOrder() {
  // ... 80 lines of mixed concerns
}

// ✅ Build phase: Extract helpers while writing
async function processOrder(order: Order) {
  validateOrder(order);
  const payment = await processPayment(order);
  await sendConfirmation(order, payment);
}
```

**Balance:** Don't let perfect be the enemy of good. If breaking a function into helpers disrupts your flow during exploration, that's fine. But during build phase, take the extra few minutes to structure properly.

**Related**: File and Function Length Standards (.hodge/standards.md:619-676)

## Applied Principles

### For Individual Developers

1. **Start messy, finish clean**
   - Don't optimize prematurely
   - Refactor when patterns emerge
   - Clean up before shipping

2. **Test what matters**
   - Skip tests during exploration
   - Add tests when design stabilizes
   - Full coverage before production

3. **Learn continuously**
   - Extract patterns from your wins
   - Document your decisions
   - Share your discoveries

### For Teams

1. **Align on phase**
   - Agree on current phase
   - Set phase transition criteria
   - Review phase appropriateness

2. **Share patterns**
   - Extract team patterns regularly
   - Document pattern usage
   - Evolve patterns together

3. **Communicate progress**
   - Make phase visible in PRs
   - Discuss quality expectations
   - Celebrate phase transitions

### For Organizations

1. **Standardize progressively**
   - Organization standards for ship phase
   - Team standards for harden phase
   - Individual standards for explore/build

2. **Measure phase metrics**
   - Time in each phase
   - Defect rates by phase
   - Velocity by phase

3. **Invest in tooling**
   - Automate phase transitions
   - Generate phase reports
   - Alert on phase violations

## Implementation Patterns

### File-Based Feature Extraction
```yaml
# Spec file preserves all AI analysis
version: "1.0"
feature:
  name: "feature-name"
  description: "What and why"
  rationale: "Why these pieces belong together"
  scope:
    included: ["what's in"]
    excluded: ["what's out"]
```

### Command Interface Design
- **Single Purpose**: Each command does one thing well
- **Progressive Options**: Simple cases easy, complex cases possible
- **Backward Compatible**: New approaches don't break old workflows

## Living Principles

These principles evolve based on:
- Team feedback
- Project outcomes
- Technology changes
- Business needs

Review quarterly and adjust based on what you learn.

## Anti-Patterns to Avoid

### 🚫 Premature Optimization
Applying ship-phase standards during exploration

### 🚫 Test Theater
Writing tests that don't actually verify behavior

### 🚫 Pattern Prescription
Forcing patterns before they've proven valuable

### 🚫 Quality Gate Gaming
Manipulating metrics instead of improving quality

### 🚫 Phase Skipping
Jumping from explore to ship without building and hardening

### 🚫 Tight Coupling
Templates depending on implementation details

### 🚫 Context Loss
Generic templates instead of rich, specific content

### 🚫 Auto-Deletion
Removing audit trail and debugging information

### 🚫 Pattern Matching in Code
Trying to implement what AI does better

### 🚫 Exposing Internals
Documenting backend mechanics in user-facing templates

## Questions for Reflection

Ask yourself regularly:

1. **Am I in the right phase?**
   - Too much structure in explore?
   - Too little structure in harden?

2. **Am I testing effectively?**
   - Testing behavior or implementation?
   - Right amount for current phase?

3. **Am I learning from success?**
   - Extracting patterns from wins?
   - Sharing knowledge with team?

4. **Is quality appropriate?**
   - Over-engineering in explore?
   - Under-engineering in ship?

5. **Is progress visible?**
   - Team knows current phase?
   - Decisions are documented?

---

*Principles guide but don't dictate. Use judgment and adjust as needed.*