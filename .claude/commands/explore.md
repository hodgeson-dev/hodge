┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Feature Discovery                          │
└─────────────────────────────────────────────────────────┘

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

┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Conversational Discovery                   │
└─────────────────────────────────────────────────────────┘

**IMPORTANT**: Engage in natural dialogue to deeply understand the feature before documenting anything.

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

#### Conversation Guidelines:
- **Natural dialogue style** (not rigid Q&A interview)
- **Provide periodic summaries** of what you've learned to confirm understanding
- **Present options** when user is unsure of answers to help guide thinking
- **Ask about scope** if feature might affect other areas or relate to existing functionality
- **Scale to complexity**: Simple features = 1-2 quick questions; Complex features = extensive discussion
- **Conversation ends when**: Either AI feels satisfied OR user says to proceed (whichever comes first)

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
3. **Document decisions needed** for /decide phase

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
After exploration is complete, suggest:
```
### Next Steps
Type one of these commands:
• `/decide` - Review and decide on approach
• `/build {{feature}}` - Start building with [recommended approach name]
• `/save` - Save your progress
• `/status {{feature}}` - Check current status
• Continue exploring - Just describe what else to explore

Or type your next request.

Note: `/build` will use the recommended approach. Use `/decide` to choose a different approach.
```

Remember: The CLI handles all the file creation and PM integration. Focus on generating creative solutions and documenting approaches.