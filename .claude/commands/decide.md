---
description: Make and record architectural decisions for a feature
argument-hint: <feature-id>
---

┌─────────────────────────────────────────────────────────┐
│ 📋 Decide: Decision Management                          │
└─────────────────────────────────────────────────────────┘

## Response Parsing (AI Instructions)

When user responds to choice prompts:
- "a" or "b" etc. → select single option
- "a,b" or "a, b" → select multiple options (comma-separated, if applicable)
- "r" → select all options marked with ⭐ (when 2+ recommendations exist)
- "a, and [modification]" → select option with user's changes applied
- Invalid (e.g., "7" when options are a-e) OR uncertain (e.g., "maybe b?") → use collaborative error recovery:
  - Detect uncertainty patterns: "maybe", "?", "not sure", "either"
  - Offer repair options, never just reject
  - Example: "Hmm, I got 'maybe b?' - sounds uncertain. Let me help clarify: a) Continue with b, b) Explain options better, c) Start over"

## ⚠️ DEFAULT BEHAVIOR: Interactive Decision Mode

**IMPORTANT**: Unless the user explicitly provides a pre-made decision, ALWAYS use Interactive Decision Mode (see below). Do NOT jump directly to recording a decision without presenting options first.

### ❌ WRONG: Jumping to recording
```
User: /decide
AI: *immediately executes hodge decide "Some decision"*
```

### ✅ RIGHT: Present options first
```
User: /decide
AI: *presents decision options with pros/cons*
User: chooses option 'a'
AI: *then executes hodge decide with chosen option*
```

## Interactive Decision Mode (DEFAULT)
When `/decide` is invoked, follow this process:

1. **Review Guiding Principles**:
   ```bash
   cat .hodge/principles.md | head -20
   ```
   Consider how principles might guide the decision.

2. **Gather pending decisions using Decision Categories Framework**:

   **PRIMARY SOURCE - Current Exploration**:
   ```bash
   # Check for decisions documented during exploration
   cat .hodge/features/{{current_feature}}/explore/exploration.md | grep -A 5 "Decisions Needed"
   ```

   **SECONDARY SOURCES - Always check these categories**:
   - **Implementation Approach**: Which approach from exploration to use?
   - **Scope Decisions**: What's in/out of scope for this feature?
   - **Technical Choices**: Libraries, patterns, architecture decisions
   - **Naming Conventions**: Feature names, function names, file structure
   - **Testing Strategy**: What and how to test?
   - **TODO Resolution**: Which TODOs to address now vs later?

   **TERTIARY SOURCES**:
   - Code comments (TODO, FIXME, QUESTION) - `grep -r "TODO\|FIXME" src/`
   - Uncommitted changes - `git status --short`
   - Open questions in conversation

   **IMPORTANT**: Try to find at least 2-3 decisions. If fewer exist, that's okay, but always check all categories.

3. **Present each decision with Principle Alignment**:

   ┌─────────────────────────────────────────────────────────┐
   │ 📋 Decide: Decision {{number}} of {{total}}             │
   └─────────────────────────────────────────────────────────┘

   **Topic**: {{decision_topic}}

   **Context**: {{brief_context}}

   **Principle Consideration**:
   [Note if decision aligns with or conflicts with any principles]

   **Options:**

   a) ⭐ {{option_1}} (Recommended)
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [Aligns with "Progressive Enhancement" principle]

   b) {{option_2}}
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [May conflict with "Behavior-Focused Testing"]

   c) {{option_3}} (if applicable)
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [Describe alignment]

   d) Skip for now
   e) Need more exploration

   💡 Tip: You can modify any choice, e.g., "a, and also document the rationale in decisions.md"

   🔔 YOUR RESPONSE NEEDED

   👉 Your choice [a/b/c/d/e]:

   **REQUIREMENT**: Always mark one option as "(Recommended)" based on your analysis.

4. **For each decision made**:
   ```bash
   hodge decide "{{chosen_option_description}}" --feature {{feature}}
   ```

## Recording the Decision (ONLY after user chooses)

### For Single Decision
After the user has chosen an option (a, b, c, etc.), execute:
```bash
hodge decide "{{decision}}"
```

With feature association:
```bash
hodge decide "{{decision}}" --feature {{feature}}
```

**WARNING**: Never execute this command until the user has explicitly chosen from presented options.

## Decision Format
Decisions follow a structured format with date, status, context, rationale, and consequences.

## Decision Storage
Decisions are stored in `.hodge/decisions.md` and synchronized with the current feature context.

## Work Planning
After making decisions, use the `/plan` command to:
- Break work into epics and stories
- Analyze dependencies
- Allocate work to parallel development lanes
- Create PM tool structure

See `/plan` for detailed work organization capabilities.

## What's Next?

After recording decisions, check feature status:

```bash
hodge status {{feature}}
```

**If PM tracking is needed:**
```
### What's Next?

Decisions recorded! Now you can structure the work.

• `/plan {{feature}}` - Create PM issues and work breakdown (Recommended if complex)
• `/build {{feature}}` - Start implementing (Recommended if straightforward)
• `/status {{feature}}` - Check overall feature status
• Continue refining - Add more decisions if needed

💡 Tip: Use /plan for complex features that need multiple sub-tasks. Use /build for simple features.
```

**If already planned or PM tracked:**
```
### What's Next?

Decisions are recorded and feature is tracked.

• `/build {{feature}}` - Start implementing (Recommended)
• `/plan {{feature}}` - Refine work breakdown if needed
• `/status {{feature}}` - Check current progress

💡 Tip: You're ready to build! The approach is clear and decisions are documented.
```

Remember: The `/decide` command focuses purely on recording technical and architectural decisions. Use `/plan` to organize work into epics, stories, and development lanes.