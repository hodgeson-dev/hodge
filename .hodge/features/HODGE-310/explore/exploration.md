# Exploration: HODGE-310

## Feature Overview
**PM Issue**: HODGE-310
**Type**: general
**Created**: 2025-09-30T19:51:11.589Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 10

- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: None identified

## Problem Analysis

The `/plan` command (`src/commands/plan.ts`) has a **keyword-based story generation** system (lines 202-273) that searches decisions for keywords like "frontend", "api", "database", etc. to create stories.

**What went wrong with HODGE-309**:
1. The 4 decisions for HODGE-309 mentioned:
   - "Enhanced grep pattern" → No matching keywords
   - "Smoke test for bash command logic" → Matched "test" keyword
   - "Pattern documentation" → No matching keywords
   - "Backward compatibility audit" → No matching keywords

2. The keyword matcher found "test" in one decision, which triggered:
   - Line 244: Added "Tests and validation" story (HODGE-309.2) ✓

3. Line 254-270: Since no other keywords matched, the fallback kicked in:
   - Created generic "Frontend components" stories (HODGE-309.1 and HODGE-309.3)
   - This is clearly wrong for a template fix!

**Root Cause**: The keyword-based approach can't understand context. It assumes "test" means "write tests" rather than "testing strategy decision". It has no semantic understanding of what the feature actually does.

## Implementation Approaches

### Approach 1: AI-Driven Plan Generation (Slash Command Enhancement)
**Description**: Have the `/plan` slash command's AI assistant analyze decisions and generate context-aware stories, then pass the plan structure to the CLI for validation and PM creation.

**Pros**:
- AI has full context from exploration, decisions, and conversation history
- Can understand semantic meaning (e.g., "template fix" vs "backend service")
- Can detect single-issue vs epic patterns accurately
- Leverages existing AI decision-making capability
- Minimal CLI code changes (CLI becomes validator/executor)

**Cons**:
- Shifts responsibility from CLI to slash command template
- Requires clear specification in `.claude/commands/plan.md`
- AI might hallucinate or make incorrect inferences
- Less deterministic than keyword matching

**When to use**: When plans require contextual understanding that simple keyword matching can't provide.

**Implementation**:
- Update `.claude/commands/plan.md` to guide AI through plan generation
- AI analyzes decisions and generates plan structure
- AI presents plan to user for approval
- AI saves plan structure to `.hodge/temp/plan-interaction/{feature}/plan.json`
- CLI reads this file and uses it instead of generating its own plan
- CLI validates plan structure and creates PM issues if requested

### Approach 2: Enhanced Keyword Matching with Context
**Description**: Improve the CLI's keyword matching by adding more contextual keywords and better heuristics to detect single-issue scenarios.

**Pros**:
- Builds on existing system (less disruptive)
- Deterministic and testable
- No dependency on AI interpretation
- Easier to debug when it goes wrong

**Cons**:
- Still fundamentally limited by keyword matching
- Will always have edge cases (like HODGE-309)
- Requires extensive keyword list maintenance
- Can't understand nuance (e.g., "template change" is small, "API refactor" is large)

**When to use**: When you want deterministic, predictable planning without AI involvement.

**Implementation**:
- Add keywords for common scenarios: "template", "documentation", "pattern", "fix", "defect"
- Add size heuristics: single-file changes → single issue
- Detect "single issue" patterns explicitly
- Improve fallback logic to avoid generic "Frontend components" stories

### Approach 3: Hybrid: AI Suggestion + CLI Validation
**Description**: AI generates plan suggestions in slash command, CLI validates structure and provides guardrails, user approves final plan.

**Pros**:
- Best of both worlds: AI context understanding + CLI validation
- User approval gate prevents AI hallucinations from causing problems
- CLI enforces vertical slice requirements and story quality
- Maintains clean separation: AI for creativity, CLI for execution

**Cons**:
- More complex interaction flow
- Requires coordination between slash command and CLI
- Two places to maintain plan logic (template + CLI)

**When to use**: Production use where you need both flexibility and reliability.

**Implementation**:
- AI analyzes and generates plan in slash command
- AI saves suggested plan to temp file
- CLI reads suggestion, validates vertical slices
- CLI warns about horizontal slices or invalid structure
- User approves/modifies plan
- CLI creates PM issues based on approved plan

## Recommendation

**Use Approach 1: AI-Driven Plan Generation**

**Rationale**:
1. **Aligns with Hodge philosophy**: "AI analyzes, backend executes" - the AI should do the creative work of understanding context and generating plans
2. **Solves the root problem**: Keyword matching fundamentally can't understand context. HODGE-309's "template fix" vs a "frontend feature" require semantic understanding.
3. **Consistent with existing patterns**: Other slash commands (like `/ship`) already have AI generate content (commit messages) with CLI executing the action
4. **User approval gate**: The `/plan` template already requires user approval before creating PM issues, so AI mistakes won't cause harm
5. **Easier to improve**: Adding guidance to a markdown template is faster than updating TypeScript keyword matchers

**Migration path**:
- Phase 1: Add AI plan generation to `/plan` template (reads decisions, generates plan, saves to temp file)
- Phase 2: Update CLI to check for AI-generated plan file before falling back to keyword matching
- Phase 3: Eventually deprecate keyword matching once AI approach is proven

## Decisions Needed

1. **Implementation approach**: Which approach to use? (Recommend: Approach 1 - AI-Driven)
2. **Backward compatibility**: Should CLI keep keyword matching as fallback?
3. **Validation level**: Should CLI validate AI-generated plans (vertical slices, dependencies)?
4. **Error handling**: What happens if AI generates invalid plan structure?
5. **Testing strategy**: How to test AI-driven plan generation (integration tests with sample decisions)?
6. **Documentation**: Update `/plan` template vs CLI code - where should plan generation logic live?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-310`

---
*Template created: 2025-09-30T19:51:11.589Z*
*AI exploration to follow*
