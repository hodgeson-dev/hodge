---
description: Explore a feature idea and create test intentions
argument-hint: <feature-id>
---

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Feature Discovery                           │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Explore:" prefix for context awareness
- ✅ Section name matches exactly as shown

## IMPORTANT: Template Compliance
When presenting exploration results, you MUST follow this template EXACTLY:
- Option (c) MUST include the recommended approach name: "Start building with [approach name]"
- The note "Note: Option (c) will use the recommended approach..." MUST be included
- Don't abbreviate or modify the menu structure
- Include ALL menu options (a-f) even if they seem redundant
- Follow the exact wording shown in the "Next Steps Menu" section below

## Command Execution
Execute the portable Hodge CLI command:
```bash
hodge explore {{feature}}
```

## What This Does
1. Creates exploration directory: `.hodge/features/{{feature}}/explore/`
2. Generates `test-intentions.md` with behavior checklist
3. Checks for PM issue and links if found
4. Displays AI context for exploration mode
5. Shows available patterns and decisions
6. Creates exploration template for you to fill in

## After Command Execution
The CLI will output:
- AI context guidelines for exploration mode
- PM issue linking status
- Project context (patterns, decisions)
- Created files location
- Next steps

## Review Relevant Context

### 1. Sub-Feature Context (Auto-Loaded)
**IMPORTANT**: If the CLI output shows "📚 Sub-Feature Context Available", you MUST:

1. **MUST Read all listed files** in the suggested order:
   - Parent exploration.md (understand the epic)
   - Parent decisions.md (know what was decided)
   - Sibling exploration.md files (understand the work up to this point)
   - Sibling decisions.md files (know what was decided up to this point)
   - Sibling ship records (see what worked)
   - Sibling lessons (learn from experience)

2. **MUST Start exploration with context summary** before any questions:
   - "I've reviewed the parent epic (HODGE-XXX) which [1-2 sentence summary]"
   - "Sibling HODGE-XXX.Y established [key infrastructure/decisions from their exploration and decisions]"
   - "This positions HODGE-XXX.Z to [how this sub-feature builds on siblings]"
   - **This summary is mandatory - demonstrates you've actually synthesized the context**

3. **MUST Synthesize context naturally** throughout exploration conversation:
   - Reference parent problem statement when discussing requirements
   - Mention sibling decisions when exploring approaches
   - Cite lessons learned when identifying gotchas
   - Leverage infrastructure created by siblings
   - Note any dependencies or integration points with sibling work

4. **MUST Ask user about exclusions** before deep exploration:
   - "I see HODGE-333.1 and HODGE-333.2 were shipped. Should I exclude any sibling context?"
   - Accept format: "333.1" or "HODGE-333.1" or "skip 333.2"

### 2. Check Lessons from Similar Features
```bash
# Search for relevant lessons
ls -la .hodge/lessons/ | grep -i "{{feature-keyword}}"

# Review any relevant lessons found
cat .hodge/lessons/SIMILAR-FEATURE.md
```
Consider what worked well and what to avoid based on past experience.

### 3. Review Applicable Patterns
```bash
# List available patterns
ls -la .hodge/patterns/

# Review patterns that might apply to {{feature}}
cat .hodge/patterns/relevant-pattern.md
```
Consider which patterns might guide your exploration.

### 4. Check Related Principles
```bash
# Review principles for exploration phase guidance
grep -A 5 "Explore" .hodge/principles.md
```
Remember: "Freedom to explore" - Standards are suggestions only in this phase.

## Conversational Exploration (REQUIRED)

### Phase 1: Context Loading (REQUIRED)
Before asking any questions, you MUST:

```bash
# Load existing context
cat .hodge/patterns/ | head -20      # Available patterns
cat .hodge/lessons/ | head -20       # Past lessons
cat .hodge/decisions.md | tail -50   # Recent decisions
```

### Phase 2: Conversational Discovery (REQUIRED)

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST output this EXACT formatted box below.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Conversational Discovery                    │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Explore:" prefix for context awareness
- ✅ Section name is "Conversational Discovery" exactly as shown

**IMPORTANT**: Engage in natural dialogue to deeply understand the feature before documenting anything.

**FOCUS**: This phase focuses on the **"what"** (requirements, behavior, scope) with minimal technical detail - only enough to validate feasibility and understand constraints/opportunities. Save the **"how"** (implementation details) for `/refine`.

#### "What" vs "How" Decision Framework

**Explore in /explore** (affects what's possible):
- Architecture choices that affect capabilities (REST vs GraphQL, monolith vs microservices)
- Technology decisions that constrain or enable features (database choice affects query capabilities)
- High-level approach options (batch vs real-time processing)
- Technical feasibility validation (can we do X with our current stack?)
- Integration patterns that affect user experience (sync vs async workflows)

**Defer to /refine** (implementation details):
- Specific library/framework choices (which GraphQL library, which validation library)
- Code organization patterns (folder structure, module boundaries)
- Validation strategies (Zod vs Yup, where to validate)
- Authentication/authorization mechanisms (JWT vs sessions, where to check)
- Error handling approaches (error codes, message formats)
- Caching strategies (what to cache, when to invalidate)
- Naming conventions and code style details

**Examples**:
- ✅ Explore: "Should we use REST or GraphQL?" (affects API capabilities)
- ❌ Explore: "Which GraphQL library should we use?" → Defer to /refine
- ✅ Explore: "Do we need real-time updates or is polling sufficient?" (affects UX)
- ❌ Explore: "How should we structure the WebSocket connection logic?" → Defer to /refine
- ✅ Explore: "Should authentication be required for this feature?" (affects requirements)
- ❌ Explore: "Should we use JWT or sessions for authentication?" → Defer to /refine

#### Required Coverage Areas (MUST ask about ALL of these):
1. **What & Why** (Requirements and Context)
   - What is the feature trying to accomplish? (high-level, not implementation details)
   - Why is this needed? (business value, user impact, technical necessity)
   - Who benefits from this feature?

2. **Gotchas & Considerations** (After understanding requirements)
   - Are there potential technical debt concerns?
   - What edge cases should be considered?
   - Are there integration challenges with existing features?
   - What testing complexity should be anticipated?
   - Reference relevant patterns from .hodge/patterns/
   - Reference relevant lessons from .hodge/lessons/
   - Mention similar features if applicable

3. **Test Intentions** (Behavioral expectations)
   - What behaviors should this feature have?
   - How can each behavior be verified independently?
   - Propose test intentions and solicit feedback
   - Test intentions must be finalized during conversation

   **Test Intention Depth**:
   - **Parent features** (e.g., HODGE-348): High-level behavioral expectations only (e.g., "exploration completes within context limits", "AI recommends /plan when appropriate")
   - **Sub-features** (e.g., HODGE-348.1 after /plan): More specific test intentions including edge cases (e.g., "handles invalid input gracefully", "persists state correctly")

#### Conversation Guidelines:
- **Natural dialogue style** (not rigid Q&A interview)
- **Provide periodic summaries** of what you've learned to confirm understanding
- **Present options** when user is unsure of answers to help guide thinking
- **Ask about scope** if feature might affect other areas or relate to existing functionality
- **Scale to complexity**: Simple features = 1-2 quick questions; Complex features = extensive discussion
- **Conversation pacing**: Aim for 5-7 exchanges to keep exploration focused, but conclude earlier if understanding is complete
- **Conversation ends when**: Either AI feels satisfied OR user says to proceed (whichever comes first)
- **Stop before "how" details**: If conversation drifts into implementation specifics (library choices, code organization), acknowledge them but note they're for `/refine` phase

#### Complexity Signals (When to Recommend /plan):
Watch for these signals that indicate feature breakdown might be beneficial:
- **Multiple components**: Feature touches 3+ distinct areas of the codebase
- **Long conversations**: Discussion exceeds 7-8 exchanges and scope keeps expanding
- **User cues**: User mentions "phases", "stages", "first we need to...", or "depends on..."
- **Integration complexity**: Feature requires coordinating multiple systems or services
- **Unclear dependencies**: Parts of the feature have unclear order or dependencies

When you notice 2+ complexity signals, explicitly recommend:
```
This feels like a larger feature that might benefit from breakdown. Consider using `/plan {{feature}}` to create sub-issues that can be explored and built independently.
```

#### Error Handling:
- If conversation goes off track, user can provide direction or request restart
- User maintains control - they can guide the conversation at any time
- No complex state management needed - keep it simple

### Phase 3: Conversation Synthesis & Preview (REQUIRED)

After the conversation, you MUST:

1. **Generate a concise title** from the `/explore {{feature}}` command text (under 100 characters)

2. **Track decisions made during conversation**:
   - Review the conversation history for decisions that were resolved
   - Identify firm decisions using language cues:
     * Explicit choices between options ("use approach A", "definitely B")
     * Clear directional guidance ("we should prioritize performance")
     * Definitive answers to specific questions ("yes, include that feature")
   - Flag edge cases to remain in "Decisions Needed":
     * Tentative answers with uncertainty ("probably X, but not sure", "maybe")
     * Contradictory feedback (user says A early, then implies B later)
     * Partial decisions on complex multi-part questions
   - Create two lists:
     * **Decided during exploration**: Firm decisions made in conversation
     * **Still needs decision**: Unresolved items or edge cases

3. **Synthesize conversation into prose** (not Q&A format) covering:
   - Problem Statement
   - Conversation Summary (key points discussed)
   - Implementation Approaches (2-3 options based on discussion)
   - Recommendation (which approach and why)
   - Test Intentions (finalized during conversation)
   - Decisions Decided During Exploration (if any)
   - Decisions Needed (only unresolved items, or "No Decisions Needed" if all resolved)

4. **Show preview for approval** using this format:
   ```
   ## Preview: exploration.md Summary

   **Title**: [generated title]

   **Problem Statement**: [1-2 sentences]

   **Key Discussion Points**:
   - [Point 1]
   - [Point 2]
   - [Point 3]

   **Recommended Approach**: [approach name]

   **Test Intentions**: [count] behavioral expectations defined

   **Decisions Decided During Exploration**:
   1. ✓ [Decision summary 1]
   2. ✓ [Decision summary 2]
   3. ✓ [Decision summary 3]

   **Decisions Needed**:
   1. [Decision question 1]
   2. [Decision question 2]

   OR if no unresolved decisions:

   **No Decisions Needed**

   Would you like to:
   a) ✅ Approve and write to exploration.md
   b) 🔄 Revise specific sections
   c) ➕ Add more detail
   d) ➖ Simplify certain areas
   ```

5. **Only after approval**, update `.hodge/features/{{feature}}/explore/exploration.md` with:
   - Title field
   - Problem Statement
   - Conversation Summary (synthesized prose)
   - Implementation Approaches section (2-3 approaches)
   - Recommendation section
   - Test Intentions section
   - Decisions Decided During Exploration section (if any decisions were resolved)
   - Decisions Needed section (only unresolved items, or **"No Decisions Needed"** in bold if everything resolved)

### Phase 4: Traditional Approach Generation (If Needed)

If user skips conversation or provides complete requirements upfront, fall back to traditional approach:

1. **Read the template** at `.hodge/features/{{feature}}/explore/exploration.md`
2. **Generate title, approaches, recommendations** as before
3. **Document questions for refinement** for /refine phase

## Exploration Guidelines
- Standards are **suggested** but not enforced
- Multiple approaches encouraged
- Focus on rapid prototyping and idea validation
- Be creative and explore alternatives
- **No tests required** - only test intentions (what should it do?)

## Example Approach Format
```markdown
### Approach 1: [Descriptive Name]
**Description**: Brief explanation of this approach

**Pros**:
- Clear benefit 1
- Clear benefit 2
- Clear benefit 3

**Cons**:
- Potential drawback 1
- Potential drawback 2

**When to use**: This approach is ideal when...
```

## Next Steps Menu

After exploration is complete, check feature status to provide smart suggestions:

```bash
hodge status {{feature}}
```

Based on the status output, suggest relevant next steps:

**If "Decisions Needed" section in exploration has items:**
```
### What's Next?

I see you have decisions to make. Here are your options:

• `/refine` - Drill into implementation details (Recommended)
• `/build {{feature}}` - Start building with recommended approach (decisions can be made later)
• `/save` - Save your progress
• Continue exploring - Just describe what else to explore

💡 Tip: Making decisions now helps clarify the implementation approach.
```

**If "No Decisions Needed" (exploration shows all decisions made):**
```
### What's Next?

Your exploration is complete and all decisions are made! 🎉

• `/build {{feature}}` - Start building with [recommended approach name] (Recommended)
• `/save` - Save your progress
• Continue exploring - Just describe what else to explore

💡 Tip: You're ready to build! The recommended approach is clearly defined.
```

**If feature already has build started (status shows Build ✓):**
```
### What's Next?

I see you've already started building this feature.

• `/build {{feature}}` - Continue building
• `/harden {{feature}}` - Add integration tests and validate
• `/status {{feature}}` - Check current progress
• Continue exploring - Refine the approach based on what you've learned

💡 Tip: Building while exploring is fine - update the exploration as you learn.
```

Remember: The CLI handles all the file creation and PM integration. Focus on generating creative solutions and documenting approaches.