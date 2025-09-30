# Exploration: HODGE-306

## Feature Overview
**PM Issue**: HODGE-306
**Type**: general
**Created**: 2025-09-30T14:06:05.387Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Implementation Approaches

### Approach 1: Template-Based Prompt Enhancement (Pure Documentation)
**Description**: Add a prompt in the .claude/commands/build.md template asking AI to check for PM issue mapping before proceeding, with guidance to offer creating one via the plan command.

**Pros**:
- Zero code changes - purely documentation-driven
- AI handles all decision logic (consistent with Hodge philosophy)
- Flexible - AI can adapt based on context
- No CLI architecture changes needed
- Easy to test and iterate

**Cons**:
- Relies on AI following instructions consistently
- No enforcement mechanism
- Could be skipped if AI misses the prompt

**When to use**: This approach aligns with Hodge's "AI-driven design" principle where templates guide AI behavior rather than enforcing rules programmatically.

### Approach 2: CLI Detection with Structured Output (Hybrid)
**Description**: Add logic to `hodge build` CLI to detect missing PM issues and output structured guidance for AI to present to user, including a template response suggesting PM creation.

**Pros**:
- Guaranteed detection (CLI always checks)
- Structured output ensures consistent AI response
- Maintains CLI architecture (no interactive prompts)
- Clear separation: CLI detects, AI presents choice

**Cons**:
- Requires code changes to build.ts
- More complex than pure template approach
- CLI becomes more opinionated about workflow
- Adds PM-awareness to build command

**When to use**: When detection reliability is critical and we want to ensure users never miss the opportunity to create PM issues.

### Approach 3: Pre-Build Hook in Template (AI-Driven Check)
**Description**: Add a pre-execution checklist in build.md template where AI checks id-mappings.json for the feature before calling `hodge build`, offering PM creation if unmapped.

**Pros**:
- AI performs the check explicitly in template
- No CLI code changes required
- Catches issue before build command runs
- Clear workflow: check → offer → proceed
- Testable through template compliance

**Cons**:
- Adds overhead to every /build invocation
- AI must read id-mappings.json each time
- More complex template instructions
- Could slow down experienced users

**When to use**: When we want proactive checking but want to avoid CLI changes, suitable for workflows where PM tracking is highly valued.

## Recommendation

**Recommended Approach: Approach 1 - Template-Based Prompt Enhancement**

This is the best fit for Hodge because:

1. **Aligns with Philosophy**: Hodge's recent decisions favor "AI-driven design" (see HODGE-301 decision on vertical slice validation). This approach trusts AI to apply guidance rather than enforcing rules programmatically.

2. **Minimal Impact**: Zero code changes means zero risk of breaking existing functionality. Quick to implement and test.

3. **Flexible & Adaptive**: AI can consider context (is this a quick experiment? a production feature?) and adjust its response accordingly, rather than showing the same prompt every time.

4. **Consistent with CLI Architecture**: The CLI standard states "Commands are called by Claude Code slash commands, never directly by developers" and "NO prompts, confirmations, or user input of any kind." This approach respects that by keeping interaction at the template/AI level.

5. **User Experience**: Users who don't want PM tracking won't be annoyed by prompts; AI can detect their preference over time.

**Implementation**: Add a section to build.md after "Command Execution" that instructs AI to:
- Check if feature is mapped in .hodge/id-mappings.json
- If not mapped, ask user if they'd like to create a PM issue
- If yes, guide them through `/plan {{feature}}` command for single issue creation
- Document the choice for future reference

## Decisions Needed

1. **Which approach to implement?**
   - Option A: Template-Based Prompt Enhancement (recommended)
   - Option B: CLI Detection with Structured Output
   - Option C: Pre-Build Hook in Template
   - Reasoning: Affects code complexity, maintenance burden, and user experience

2. **When should the PM creation check occur?**
   - Option A: Before calling `hodge build` CLI command (in template)
   - Option B: After `hodge build` displays context (in template follow-up)
   - Option C: Within `hodge build` CLI (requires code changes)
   - Reasoning: Affects workflow timing and user friction

3. **How should single-issue plan creation work?**
   - Option A: Reuse `/plan {{feature}}` with AI generating minimal plan
   - Option B: Create new flag `hodge plan {{feature}} --single-issue`
   - Option C: Create separate command `hodge issue {{feature}}`
   - Reasoning: Affects command API and user mental model

4. **Should the prompt be shown every time or only once?**
   - Option A: Every time /build is called without PM mapping
   - Option B: Once per feature (track in feature directory)
   - Option C: Skip for features without exploration (quick experiments)
   - Reasoning: Affects user experience and friction for different workflows

5. **What should the default behavior be if user ignores the prompt?**
   - Option A: Proceed with build anyway (non-blocking)
   - Option B: Ask again on next /build invocation
   - Option C: Remember user preference per feature
   - Reasoning: Affects user experience and respects user agency

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-306`

---
*Template created: 2025-09-30T14:06:05.387Z*
*AI exploration to follow*
