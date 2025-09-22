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