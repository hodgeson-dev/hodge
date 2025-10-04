# Hodge Explore Mode

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

### 1. Check Lessons from Similar Features
```bash
# Search for relevant lessons
ls -la .hodge/lessons/ | grep -i "{{feature-keyword}}"

# Review any relevant lessons found
cat .hodge/lessons/SIMILAR-FEATURE.md
```
Consider what worked well and what to avoid based on past experience.

### 2. Review Applicable Patterns
```bash
# List available patterns
ls -la .hodge/patterns/

# Review patterns that might apply to {{feature}}
cat .hodge/patterns/relevant-pattern.md
```
Consider which patterns might guide your exploration.

### 3. Check Related Principles
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

2. **Synthesize conversation into prose** (not Q&A format) covering:
   - Problem Statement
   - Conversation Summary (key points discussed)
   - Implementation Approaches (2-3 options based on discussion)
   - Recommendation (which approach and why)
   - Test Intentions (finalized during conversation)
   - Decisions Needed (for /decide phase)

3. **Show preview for approval** using this format:
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

   **Decisions Needed**:
   1. [Decision question 1]
   2. [Decision question 2]
   3. [Decision question 3]

   OR if no decisions:

   **No Decisions Needed**

   Would you like to:
   a) ✅ Approve and write to exploration.md
   b) 🔄 Revise specific sections
   c) ➕ Add more detail
   d) ➖ Simplify certain areas
   ```

4. **Only after approval**, update `.hodge/features/{{feature}}/explore/exploration.md` with:
   - Title field
   - Problem Statement
   - Conversation Summary (synthesized prose)
   - Implementation Approaches section (2-3 approaches)
   - Recommendation section
   - Test Intentions section
   - Decisions Needed section

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