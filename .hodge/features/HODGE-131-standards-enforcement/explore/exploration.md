# HODGE-131: Standards Enforcement Exploration

## Context
Standards enforcement is challenging because standards can be:
- Written in natural language with nuanced requirements
- About code style, architecture, documentation, process, or anything else
- Context-dependent (e.g., "use appropriate error handling")
- Evolving over time as the project grows
- Difficult to express as programmatic rules

## Approach 1: AI-Based Enforcement in Slash Commands
**Description**: Leverage Claude Code's AI capabilities to review standards compliance during `/harden` and `/ship` commands.

**Implementation**:
- `/harden` and `/ship` commands reload `.hodge/standards.md`
- AI reviews all changes since last commit using `git diff`
- AI evaluates compliance with natural language understanding
- AI provides specific feedback on violations
- Human-in-the-loop: developer can address or justify deviations

**Pros**:
- Handles ANY standard format (natural language, diagrams, examples)
- Understands context and nuance ("appropriate", "when necessary", etc.)
- Can evaluate subjective standards (readability, clarity, design patterns)
- Adapts to new standards without code changes
- Already integrated into developer workflow

**Cons**:
- Requires AI tool (Claude Code) to be active
- No enforcement in CI/CD without AI integration
- Subjective interpretation possible
- Can't auto-fix violations

**Code Sketch**:
```markdown
# In /harden command template
1. Load and display standards: `cat .hodge/standards.md`
2. Get recent changes: `git diff HEAD`
3. AI reviews changes against standards
4. AI reports: "❌ Standard violation: No TODO comments should lack phase markers"
5. Developer fixes or explains why deviation is necessary
```

## Approach 2: Hybrid AI + Programmatic
**Description**: Use programmatic checks for measurable standards, AI for subjective ones.

**Implementation**:
- Programmatic: ESLint, TypeScript, test coverage, performance benchmarks
- AI: Code organization, naming conventions, documentation quality
- Standards.md marks which standards are auto-checked vs AI-reviewed
- `/harden` runs both types of checks

**Pros**:
- Fast automated checks for objective standards
- AI handles subjective/complex standards
- Works partially in CI/CD (programmatic checks)
- Clear distinction between types of standards

**Cons**:
- More complex to implement and maintain
- Two different enforcement mechanisms
- Need to categorize each standard

## Approach 3: Programmatic-Only Enforcement
**Description**: Build standards checking directly into hodge CLI with only measurable standards.

**Implementation**:
- Create `StandardsChecker` class that wraps existing tools
- Parse structured standards from `.hodge/standards.md`
- Only enforce measurable standards (lint, types, tests, performance)
- Subjective standards become "guidelines" not enforced

**Pros**:
- Works without AI
- Fast and deterministic
- CI/CD compatible
- No ambiguity in pass/fail

**Cons**:
- Can't enforce many important standards (design patterns, readability, etc.)
- Rigid - new standard types need code changes
- May give false sense of compliance
- Loses the human judgment aspect

## Approach 4: Standards as Tests
**Description**: Express standards as executable tests that must pass.

**Implementation**:
- Create `.hodge/standards-tests/` directory
- Each standard becomes a test file
- Run tests during harden/ship phases
- Can mix unit tests, integration tests, and custom checks

**Pros**:
- Standards are code, versioned and testable
- Can be as simple or complex as needed
- Developers can write custom standard tests
- Works in CI/CD

**Cons**:
- Requires writing test code for each standard
- Can't handle subjective standards
- Maintenance burden as standards evolve
- Another layer of complexity

## Recommendation: Approach 1 (AI-Based Enforcement)

Given that:
1. Standards will be "about all sorts of things in all kinds of formats"
2. The workflow already happens in Claude Code (an AI environment)
3. Natural language standards are more maintainable than code
4. Human judgment is valuable for edge cases

**The AI-based approach is the most flexible and maintainable solution.** It leverages the fact that development is already happening in an AI-assisted environment and allows standards to be written in whatever format makes sense for humans.

### Implementation Plan for AI-Based Approach:

1. **Update slash command templates** to reload and review standards
2. **Structure standards.md** with clear sections for different phases
3. **Add review checkpoints** in /harden and /ship commands
4. **Create feedback loop** where AI explains violations and suggests fixes

This approach treats standards as **communication to the AI assistant** rather than rules for a program, which aligns perfectly with Hodge's philosophy of AI-assisted development.