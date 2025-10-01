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

## Your Tasks After CLI Command

### CRITICAL: Generate Implementation Approaches
The CLI has created a minimal exploration template. You MUST now:

1. **Read the template** at `.hodge/features/{{feature}}/explore/exploration.md`
2. **Generate a concise title** for the feature:
   - Add a `**Title**: <short description>` field at the top of exploration.md
   - Keep it under 100 characters
   - Make it descriptive and specific (e.g., "Fix PM issue description extraction from exploration.md")
   - This title will be used for PM issue creation
3. **Generate 2-3 implementation approaches** by updating the file:
   - Replace `<!-- AI will generate 2-3 approaches here -->` with actual approaches
   - Each approach should have:
     - Name and description
     - Pros (3-4 points)
     - Cons (2-3 points)
     - When to use this approach
4. **Provide a recommendation**:
   - Replace `<!-- AI will provide recommendation -->`
   - Explain which approach is best and why
5. **Document decisions needed**:
   - Replace `<!-- AI will list decisions for /decide command -->`
   - List 2-4 key decisions that need to be made
6. **Update test intentions** if needed
7. **Consider patterns and similar features** mentioned in the template
8. **IMPORTANT: Document Decisions Needed**
   Add a section to exploration.md titled "## Decisions Needed" that lists:
   - Implementation approach decision (which approach to use)
   - Scope decisions (what's in/out of scope)
   - Technical choices (libraries, patterns, architecture)
   - Naming decisions (if any naming conventions need deciding)
   - Testing strategy (how to test this feature)
   - TODO resolutions (which existing TODOs this might address)

   These decisions will be presented by `/decide` for resolution.

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