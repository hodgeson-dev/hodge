/**
 * Claude Code slash command definitions for Hodge
 *
 * AUTO-GENERATED from .claude/commands/*.md
 * Do not edit directly - edit the source files and run: npm run sync:commands
 */

export interface ClaudeCommand {
  name: string;
  content: string;
}

export function getClaudeCommands(): ClaudeCommand[] {
  return [
    {
      name: 'build',
      content: `# Hodge Build Mode

## Decision Extraction (Before Build)

**IMPORTANT**: Before checking PM issues, check if this feature has decisions. If not, try to extract guidance from exploration.md.

### Step 1: Check for decisions.md
\`\`\`bash
cat .hodge/features/{{feature}}/decisions.md 2>/dev/null
\`\`\`

**If decisions.md exists** → Skip extraction, proceed to PM check

**If decisions.md does NOT exist** → Continue to Step 2

### Step 2: Check for wrong-location decisions.md
\`\`\`bash
# Check common wrong locations
cat .hodge/features/{{feature}}/explore/decisions.md 2>/dev/null
\`\`\`

**If found in wrong location**:
\`\`\`
⚠️  I found decisions.md in the wrong location (.hodge/features/{{feature}}/explore/)

The correct location is: .hodge/features/{{feature}}/decisions.md

Would you like me to move it for you?
a) Yes - Move it to the correct location
b) No - I'll handle it manually

Your choice:
\`\`\`

**If user chooses (a)**:
\`\`\`bash
mv .hodge/features/{{feature}}/explore/decisions.md .hodge/features/{{feature}}/decisions.md
\`\`\`
Then confirm: "✓ Moved decisions.md to correct location. Proceeding with build..."
Proceed to PM check.

**If user chooses (b)** or file not in wrong location:
Continue to Step 3

### Step 3: Extract from exploration.md
\`\`\`bash
cat .hodge/features/{{feature}}/explore/exploration.md 2>/dev/null
\`\`\`

**If exploration.md exists**, parse for:
- **Recommendation section**: Look for \`## Recommendation\` followed by text starting with \`**Use \` or \`**\`
- **Decisions Needed section**: Look for \`## Decisions Needed\` followed by \`### Decision N:\` entries

**Extraction Pattern**:
1. Find \`## Recommendation\` section
2. Extract the paragraph after it (usually starts with \`**Use Approach...\`)
3. Find \`## Decisions Needed\` section
4. Extract all \`### Decision N: [title]\` entries (just the titles)

### Step 4: Handle Extraction Results

**IMPORTANT**: Check if "Decisions Needed" section has content before showing prompts.

**Empty Check Logic**:
- Treat whitespace-only content (spaces, newlines) as empty
- Use regex pattern to check: \`/##\\s*Decisions Needed\\s*(?:###|\\n|$)/\` (section header followed immediately by next section or end)
- If section contains actual decision entries (\`### Decision N:\`), it's NOT empty

**Case A: Recommendation Found + Decisions Needed is EMPTY**

**Action**: Proceed silently with build (no prompt needed)
\`\`\`bash
# User implicitly accepted recommendation by running /build without /decide
hodge build {{feature}}
\`\`\`

**Case B: Recommendation Found + Decisions Needed HAS items**

Display to user:
\`\`\`
📋 No decisions.md found, but I found this recommendation from exploration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full verbatim text of Recommendation section]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Unresolved decisions still need attention:
  1. [Decision 1 title]
  2. [Decision 2 title]
  ...

What would you like to do?
  a) ✅ Use this recommendation and proceed with /build
  b) 🔄 Go to /decide to formalize decisions first
  c) ⏭️  Skip and build without guidance

Your choice:
\`\`\`

**User Response Handling**:
- **(a)** → Call \`hodge build {{feature}}\` and proceed with implementation
- **(b)** → Exit with message: "Please run \`/decide\` to formalize your decisions, then return to \`/build {{feature}}\`"
- **(c)** → Call \`hodge build {{feature}} --skip-checks\` and proceed

**Case B: Multiple Recommendations Found**

Display to user:
\`\`\`
📋 No decisions.md found, but I found multiple recommendations from exploration:

1. [First recommendation text excerpt - first 100 chars...]
2. [Second recommendation text excerpt - first 100 chars...]
3. [Third recommendation text excerpt - first 100 chars...]

Which recommendation would you like to use?
  a) Use recommendation 1
  b) Use recommendation 2
  c) Use recommendation 3
  d) Go to /decide to formalize decisions
  e) Skip and build without guidance

Your choice:
\`\`\`

After user selects a recommendation (a/b/c), show full text:
\`\`\`
You selected:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full verbatim text of selected Recommendation]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceed with /build using this guidance?
  a) Yes, proceed
  b) No, go to /decide instead

Your choice:
\`\`\`

**Case C: No Recommendation Found**

Display to user:
\`\`\`
⚠️  No decisions.md found and exploration.md has no recommendation section.

To proceed, you can either:
  a) Run /decide to make and record decisions
  b) Use --skip-checks to build anyway (not recommended)

Your choice:
\`\`\`

**Case D: exploration.md Missing**

Fall back to current behavior (proceed to PM check, CLI will show warning).

**Case E: exploration.md Malformed (Cannot Parse)**

If exploration.md exists but parsing fails (e.g., unexpected format, corrupted markdown):

Display warning and proceed:
\`\`\`
⚠️  Warning: Could not parse exploration.md (file may be malformed)
   Proceeding with build without decision guidance.

   You can:
   - Fix exploration.md format manually
   - Run /decide to create decisions.md
   - Continue with build as-is

Proceeding with build...
\`\`\`

Then call \`hodge build {{feature}}\` to proceed.

## PM Issue Check (Before Build)

**IMPORTANT**: Before executing \`hodge build\`, check if this feature has a PM issue mapping.

### Check for PM Issue Mapping
\`\`\`bash
# Read the id-mappings file to check if feature has externalID (actual PM issue created)
cat .hodge/id-mappings.json | grep -A 2 "\\"{{feature}}\\"" | grep "externalID"
\`\`\`

**Interpreting the result:**
- **Empty output (no lines returned)** = Feature is NOT mapped to PM issue
- **Output contains "externalID: ..."** = Feature IS mapped to PM issue

### If Feature is NOT Mapped
If the grep returns **empty/no output**, the feature has no PM issue. Ask the user:

\`\`\`
I notice this feature ({{feature}}) doesn't have a PM issue tracking it yet.

Would you like to create a PM issue for this work?

a) Yes - Create a PM issue (recommended for production features)
b) No - Continue without PM tracking (good for quick experiments)

Your choice:
\`\`\`

**If user chooses (a) - Yes**:
Guide them to use the \`/plan\` command to create a single issue:
\`\`\`
Let me help you create a PM issue for tracking this work.

I'll generate a minimal plan with a single issue.
\`\`\`
Then execute \`/plan {{feature}}\` with AI generating a single-issue plan (no epic breakdown needed).

**If user chooses (b) - No, or doesn't respond**:
Proceed with build anyway (non-blocking). This respects user agency and the "freedom to explore" principle.

### If Feature IS Already Mapped
If the grep returns **output containing "externalID: ..."**, the feature already has a PM issue. Skip the prompt and proceed directly to build command.

## Command Execution
Execute the portable Hodge CLI command:
\`\`\`bash
hodge build {{feature}}
\`\`\`

If you need to skip exploration/decision checks:
\`\`\`bash
hodge build {{feature}} --skip-checks
\`\`\`

## What This Does
1. Checks for existing exploration and decisions
2. Creates build directory: \`.hodge/features/{{feature}}/build/\`
3. Displays AI context for build mode
4. Shows available patterns to use
5. Creates build plan template
6. Links PM issue and updates status to "In Progress"

## After Command Execution
The CLI will output:
- AI context guidelines for build mode
- PM issue status update
- Available patterns list
- Build guidelines (SHOULD follow standards)
- Created files location

## Your Tasks After CLI Command
1. Review the build plan at \`.hodge/features/{{feature}}/build/build-plan.md\`
2. Implement the feature following:
   - **SHOULD** follow coding standards
   - **SHOULD** use established patterns
   - **SHOULD** include basic error handling
   - **MUST** write at least one smoke test
3. Write smoke tests (required):
   \`\`\`typescript
   import { smokeTest } from '../test/helpers';

   smokeTest('should not crash', async () => {
     await expect(command.execute()).resolves.not.toThrow();
   });
   \`\`\`
4. Update the build plan as you progress
5. Track files modified and decisions made
6. **Stage all your work** (REQUIRED - enables /harden review):
   \`\`\`bash
   git add .
   \`\`\`
   This stages all files you created/modified during build (implementation, tests, config) so they can be reviewed during \`/harden\`.

## Implementation Guidelines
- Use existing patterns where applicable
- Maintain consistency with project architecture
- Include helpful comments for complex logic
- Balance quality with development speed

## Testing Requirements (Progressive Model)
- **Build Phase**: Minimum 1 smoke test required
- **Test Type**: Quick sanity checks (<100ms)
- **Focus**: Does it work without crashing?
- **Run Command**: \`npm run test:smoke\`
- Use test utilities from \`src/test/helpers.ts\`

## Next Steps Menu
After building is complete, suggest:
\`\`\`
### Next Steps
Choose your next action:
a) Run smoke tests → \`npm run test:smoke\`
b) Proceed to hardening → \`/harden {{feature}}\`
c) Review changes → \`/review\`
d) Save progress → \`/save\`
e) Check status → \`/status {{feature}}\`
f) Switch to another feature → \`/build\`
g) Update PM issue status
h) Done for now

Enter your choice (a-h):
\`\`\`

Remember: The CLI handles all file management and PM integration. Focus on implementing quality code that follows project conventions.`,
    },
    {
      name: 'decide',
      content: `# Hodge Decide - Decision Management

## ⚠️ DEFAULT BEHAVIOR: Interactive Decision Mode

**IMPORTANT**: Unless the user explicitly provides a pre-made decision, ALWAYS use Interactive Decision Mode (see below). Do NOT jump directly to recording a decision without presenting options first.

### ❌ WRONG: Jumping to recording
\`\`\`
User: /decide
AI: *immediately executes hodge decide "Some decision"*
\`\`\`

### ✅ RIGHT: Present options first
\`\`\`
User: /decide
AI: *presents decision options with pros/cons*
User: chooses option 'a'
AI: *then executes hodge decide with chosen option*
\`\`\`

## Interactive Decision Mode (DEFAULT)
When \`/decide\` is invoked, follow this process:

1. **Review Guiding Principles**:
   \`\`\`bash
   cat .hodge/principles.md | head -20
   \`\`\`
   Consider how principles might guide the decision.

2. **Gather pending decisions using Decision Categories Framework**:

   **PRIMARY SOURCE - Current Exploration**:
   \`\`\`bash
   # Check for decisions documented during exploration
   cat .hodge/features/{{current_feature}}/explore/exploration.md | grep -A 5 "Decisions Needed"
   \`\`\`

   **SECONDARY SOURCES - Always check these categories**:
   - **Implementation Approach**: Which approach from exploration to use?
   - **Scope Decisions**: What's in/out of scope for this feature?
   - **Technical Choices**: Libraries, patterns, architecture decisions
   - **Naming Conventions**: Feature names, function names, file structure
   - **Testing Strategy**: What and how to test?
   - **TODO Resolution**: Which TODOs to address now vs later?

   **TERTIARY SOURCES**:
   - Code comments (TODO, FIXME, QUESTION) - \`grep -r "TODO\\|FIXME" src/\`
   - Uncommitted changes - \`git status --short\`
   - Open questions in conversation

   **IMPORTANT**: Try to find at least 2-3 decisions. If fewer exist, that's okay, but always check all categories.

3. **Present each decision with Principle Alignment**:
   \`\`\`
   ## Decision {{number}} of {{total}}

   **Topic**: {{decision_topic}}

   **Context**: {{brief_context}}

   **Principle Consideration**:
   [Note if decision aligns with or conflicts with any principles]

   **Options:**

   **a) {{option_1}}** (Recommended)
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [Aligns with "Progressive Enhancement" principle]

   **b) {{option_2}}**
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [May conflict with "Behavior-Focused Testing"]

   **c) {{option_3}}** (if applicable)
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [Describe alignment]

   **d) Skip for now**
   **e) Need more exploration**

   Your choice:
   \`\`\`

   **REQUIREMENT**: Always mark one option as "(Recommended)" based on your analysis.

4. **For each decision made**:
   \`\`\`bash
   hodge decide "{{chosen_option_description}}" --feature {{feature}}
   \`\`\`

## Recording the Decision (ONLY after user chooses)

### For Single Decision
After the user has chosen an option (a, b, c, etc.), execute:
\`\`\`bash
hodge decide "{{decision}}"
\`\`\`

With feature association:
\`\`\`bash
hodge decide "{{decision}}" --feature {{feature}}
\`\`\`

**WARNING**: Never execute this command until the user has explicitly chosen from presented options.

## Decision Format
Decisions follow a structured format with date, status, context, rationale, and consequences.

## Decision Storage
Decisions are stored in \`.hodge/decisions.md\` and synchronized with the current feature context.

## Work Planning
After making decisions, use the \`/plan\` command to:
- Break work into epics and stories
- Analyze dependencies
- Allocate work to parallel development lanes
- Create PM tool structure

See \`/plan\` for detailed work organization capabilities.

## Next Steps
After decisions are recorded:
\`\`\`
### Next Steps
Choose your next action:
a) Plan work structure → \`/plan {{feature}}\`
b) Start building → \`/build {{feature}}\`
c) Review all decisions → \`/status\`
d) View project roadmap → \`hodge status\`
e) Continue development
f) Done for now

Enter your choice (a-f):
\`\`\`

Remember: The \`/decide\` command focuses purely on recording technical and architectural decisions. Use \`/plan\` to organize work into epics, stories, and development lanes.`,
    },
    {
      name: 'explore',
      content: `# Hodge Explore Mode

## IMPORTANT: Template Compliance
When presenting exploration results, you MUST follow this template EXACTLY:
- Option (c) MUST include the recommended approach name: "Start building with [approach name]"
- The note "Note: Option (c) will use the recommended approach..." MUST be included
- Don't abbreviate or modify the menu structure
- Include ALL menu options (a-f) even if they seem redundant
- Follow the exact wording shown in the "Next Steps Menu" section below

## Command Execution
Execute the portable Hodge CLI command:
\`\`\`bash
hodge explore {{feature}}
\`\`\`

## What This Does
1. Creates exploration directory: \`.hodge/features/{{feature}}/explore/\`
2. Generates \`test-intentions.md\` with behavior checklist
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
   - Sibling ship records (see what worked)
   - Sibling lessons (learn from experience)

2. **MUST Synthesize context naturally** during exploration conversation:
   - Reference parent problem statement when discussing requirements
   - Mention sibling decisions when exploring approaches
   - Cite lessons learned when identifying gotchas
   - Leverage infrastructure created by siblings

3. **MUST Ask user about exclusions** before deep exploration:
   - "I see HODGE-333.1 and HODGE-333.2 were shipped. Should I exclude any sibling context?"
   - Accept format: "333.1" or "HODGE-333.1" or "skip 333.2"

### 2. Check Lessons from Similar Features
\`\`\`bash
# Search for relevant lessons
ls -la .hodge/lessons/ | grep -i "{{feature-keyword}}"

# Review any relevant lessons found
cat .hodge/lessons/SIMILAR-FEATURE.md
\`\`\`
Consider what worked well and what to avoid based on past experience.

### 3. Review Applicable Patterns
\`\`\`bash
# List available patterns
ls -la .hodge/patterns/

# Review patterns that might apply to {{feature}}
cat .hodge/patterns/relevant-pattern.md
\`\`\`
Consider which patterns might guide your exploration.

### 4. Check Related Principles
\`\`\`bash
# Review principles for exploration phase guidance
grep -A 5 "Explore" .hodge/principles.md
\`\`\`
Remember: "Freedom to explore" - Standards are suggestions only in this phase.

## Conversational Exploration (REQUIRED)

### Phase 1: Context Loading (REQUIRED)
Before asking any questions, you MUST:

\`\`\`bash
# Load existing context
cat .hodge/patterns/ | head -20      # Available patterns
cat .hodge/lessons/ | head -20       # Past lessons
cat .hodge/decisions.md | tail -50   # Recent decisions
\`\`\`

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

1. **Generate a concise title** from the \`/explore {{feature}}\` command text (under 100 characters)

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
   \`\`\`
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
   \`\`\`

5. **Only after approval**, update \`.hodge/features/{{feature}}/explore/exploration.md\` with:
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

1. **Read the template** at \`.hodge/features/{{feature}}/explore/exploration.md\`
2. **Generate title, approaches, recommendations** as before
3. **Document decisions needed** for /decide phase

## Exploration Guidelines
- Standards are **suggested** but not enforced
- Multiple approaches encouraged
- Focus on rapid prototyping and idea validation
- Be creative and explore alternatives
- **No tests required** - only test intentions (what should it do?)

## Example Approach Format
\`\`\`markdown
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
\`\`\`

## Next Steps Menu
After exploration is complete, suggest:
\`\`\`
### Next Steps
Type one of these commands:
• \`/decide\` - Review and decide on approach
• \`/build {{feature}}\` - Start building with [recommended approach name]
• \`/save\` - Save your progress
• \`/status {{feature}}\` - Check current status
• Continue exploring - Just describe what else to explore

Or type your next request.

Note: \`/build\` will use the recommended approach. Use \`/decide\` to choose a different approach.
\`\`\`

Remember: The CLI handles all the file creation and PM integration. Focus on generating creative solutions and documenting approaches.`,
    },
    {
      name: 'harden',
      content: `# Hodge Harden Mode

## ⚠️ REQUIRED: Pre-Harden Code Review

**STOP! You MUST complete this AI Code Review BEFORE running the harden command.**

### Step 1: Generate Review Manifest
**Analyze changes and generate tiered review manifest:**

\`\`\`bash
hodge harden {{feature}} --review
\`\`\`

This command will:
1. Analyze changed files (via git diff with line counts)
2. Classify changes into review tier (SKIP/QUICK/STANDARD/FULL)
3. Filter relevant patterns and review profiles
4. Generate review-manifest.yaml with:
   - Recommended tier and reason
   - Changed files list with line counts
   - Context files to load (organized by precedence)
   - Matched patterns and profiles

### Step 2: Read Review Manifest
\`\`\`bash
# Read the generated manifest
cat .hodge/features/{{feature}}/harden/review-manifest.yaml
\`\`\`

The manifest shows:
- \`recommended_tier\`: SKIP | QUICK | STANDARD | FULL
- \`change_analysis\`: File counts and line counts
- \`changed_files\`: List of files with (+added/-deleted) counts
- \`context\`: Files to load for review (organized by precedence)

### Step 3: Choose Review Tier
Based on the manifest's \`recommended_tier\`, choose your review tier:

**Tier Options:**
- **SKIP**: Pure documentation changes (no code review needed)
- **QUICK**: Test/config only, ≤3 files, ≤50 lines (~1K lines of context)
- **STANDARD**: Implementation changes, ≤10 files, ≤200 lines (~3K lines of context)
- **FULL**: Major changes or critical paths (~8K lines of context)

**Default**: Use the recommended tier unless you have a reason to override.

### Step 4: Load Context Files
**Based on your chosen tier**, load the context files listed in the manifest's \`context\` section in precedence order:

**Precedence Rules** (CRITICAL - higher precedence = more authority):
1. **project_standards** (.hodge/standards.md) - HIGHEST PRECEDENCE
2. **project_principles** (.hodge/principles.md)
3. **project_decisions** (.hodge/decisions.md) - FULL tier only
4. **matched_patterns** (.hodge/patterns/*.md)
5. **matched_profiles** (.hodge/review-profiles/**/*.md)
6. **lessons_learned** (.hodge/lessons/*.md) - FULL tier only

**Read files using the Read tool based on your chosen tier:**
- All tiers: Load standards, principles, matched patterns, matched profiles
- FULL tier only: Also load decisions and lessons

**⚠️ CRITICAL**: Project standards override review profiles. If a standard conflicts with a profile recommendation, the standard takes precedence.

### Step 5: Conduct AI Code Review
**Review each changed file (from manifest) against the loaded context.**

Focus areas:
- Changed files are listed in manifest with line counts
- Review only the changed files, not entire codebase
- Apply precedence rules when standards conflict
- Check for violations categorized as BLOCKER, WARNING, or SUGGESTION

### Step 6: Report Review Findings
Based on your code review, choose ONE:

**Option A: Ready to Harden ✅**
\`\`\`
✅ STANDARDS PRE-CHECK PASSED
All standards requirements appear to be met.
Proceeding with harden command...
\`\`\`

**Option B: Minor Issues (Warnings) ⚠️**
\`\`\`
⚠️ STANDARDS PRE-CHECK - Warnings Found:

[List specific issues found, e.g.:]
1. TODO format violations in src/example.ts:45
2. Could use more comprehensive error handling
3. Some functions missing explicit return types

These are WARNINGS. Proceeding with harden, but should address before ship.
\`\`\`

**Option C: Blocking Issues 🚫**
\`\`\`
🚫 STANDARDS PRE-CHECK - Blocking Issues:

[List critical issues, e.g.:]
1. No integration tests found
2. Test modifies project .hodge directory
3. Multiple untyped 'any' uses in production code

RECOMMENDATION: Fix these issues before running harden.
Returning to build phase to address issues.
\`\`\`

### Step 7: Generate Review Report
**IMPORTANT**: After conducting your review, you MUST write a review-report.md file documenting your findings.

Use the Write tool to create \`.hodge/features/{{feature}}/harden/review-report.md\` with this format:

\`\`\`markdown
# Code Review Report: {{feature}}

**Reviewed**: [ISO timestamp]
**Tier**: [SKIP | QUICK | STANDARD | FULL]
**Scope**: Feature changes ([N] files, [N] lines)
**Profiles Used**: [list profiles from manifest]

## Summary
- 🚫 **[N] Blockers** (must fix before proceeding)
- ⚠️ **[N] Warnings** (should address before ship)
- 💡 **[N] Suggestions** (optional improvements)

## Critical Issues (BLOCKER)
[If any blockers found, list them here with file:line references]

### [file path]:[line number]
**Violation**: [Standard/Rule Name] - BLOCKER
[Detailed explanation of the issue and why it's blocking]

## Warnings
[If any warnings found, list them here]

### [file path]:[line number]
**Violation**: [Standard/Rule Name] - WARNING
[Detailed explanation]

## Suggestions
[If any suggestions, list them here]

### [file path]:[line number]
**Violation**: [Standard/Rule Name] - SUGGESTION
[Detailed explanation]

## Files Reviewed
[List all files that were reviewed]
1. [file path]
2. [file path]
...

## Conclusion
[Overall assessment - ready to proceed, needs fixes, etc.]
\`\`\`

**Example for a clean review:**
\`\`\`markdown
# Code Review Report: HODGE-333.4

**Reviewed**: 2025-10-08T17:30:00.000Z
**Tier**: STANDARD
**Scope**: Feature changes (6 files, 234 lines)
**Profiles Used**: general-coding-standards, general-test-standards, typescript-5.x, vitest-1.x

## Summary
- 🚫 **0 Blockers** (must fix before proceeding)
- ⚠️ **0 Warnings** (should address before ship)
- 💡 **0 Suggestions** (optional improvements)

## Critical Issues (BLOCKER)
None found.

## Warnings
None found.

## Suggestions
None found.

## Files Reviewed
1. src/test/standards-enforcement.smoke.test.ts
2. src/commands/review.integration.test.ts

## Conclusion
✅ All files meet project standards. Ready to proceed with harden validation.
\`\`\`

**Important**:
- If you found BLOCKER issues in Step 6 (Option C), document them in the report and STOP - do not proceed to Command Execution
- If you found only warnings (Option B) or no issues (Option A), generate the report and proceed to Command Execution

## Command Execution (After Pre-Check and Report Generation)

**Only proceed here if you chose Option A or B above!**

Execute the portable Hodge CLI command:
\`\`\`bash
hodge harden {{feature}}
\`\`\`

Options:
\`\`\`bash
hodge harden {{feature}} --skip-tests  # Skip test execution (not recommended)
hodge harden {{feature}} --auto-fix    # Attempt to auto-fix linting issues
\`\`\`

## What The CLI Does
1. Checks that feature has been built
2. Creates harden directory: \`.hodge/features/{{feature}}/harden/\`
3. Displays strict AI context for production standards
4. Runs progressive validation checks:
   - Integration tests (npm run test:integration)
   - Smoke tests (npm run test:smoke)
   - Linting (npm run lint)
   - Type checking (npm run typecheck)
   - Build (npm run build)
5. Generates validation report
6. Updates PM issue to "In Review"

## Post-Execution Verification

### Compare Results with Pre-Check
After the CLI runs, verify:
1. Did the CLI find issues you missed in pre-check?
2. Did your warnings align with actual validation results?
3. Are there patterns to improve future pre-checks?

### Review Harden Report
\`\`\`bash
cat .hodge/features/{{feature}}/harden/harden-report.md
\`\`\`

## Your Tasks Based on Results

### If Validation Passed ✅
1. Confirm your pre-check assessment was accurate
2. Review the harden report for any warnings
3. Consider proceeding to ship

### If Validation Failed ❌
1. Compare failures with your pre-check assessment
2. Fix each failing check:
   - **Integration tests failing**: Write or fix integration tests
   - **Smoke tests failing**: Fix basic functionality issues
   - **Linting errors**: Run with \`--auto-fix\` or fix manually
   - **Type errors**: Fix TypeScript issues
   - **Build errors**: Resolve compilation problems
3. Return to build phase if needed: \`/build {{feature}}\`
4. Re-run the ENTIRE harden process (including pre-check)

## Testing Requirements (Progressive Model)
- **Harden Phase**: Integration tests required
- **Test Types**: Smoke + Integration tests
- **Focus**: Does it behave correctly end-to-end?
- **Critical Rule**: Tests must NEVER modify project's .hodge directory
- Use test utilities from \`src/test/helpers.ts\` and \`src/test/runners.ts\`

## Production Checklist
Before proceeding to ship, ensure:
- [ ] Standards pre-check completed and documented
- [ ] Integration tests passing (behavior verification)
- [ ] Smoke tests passing (basic functionality)
- [ ] No linting errors (warnings acceptable)
- [ ] TypeScript strict mode passing
- [ ] Build succeeds without errors
- [ ] Test Isolation Requirement followed
- [ ] Error handling comprehensive
- [ ] Performance standards met
- [ ] Documentation updated if needed

## Next Steps Menu
After hardening is complete, suggest:
\`\`\`
### Next Steps
Choose your next action:
a) Ship to production → \`/ship {{feature}}\`
b) Run additional tests
c) Request code review
d) Generate documentation
e) Back to build for fixes → \`/build {{feature}}\`
f) Check status → \`/status {{feature}}\`
g) Save progress → \`/save\`
h) Done for now

Enter your choice (a-h):
\`\`\`

## Important Notes
1. **The AI Standards Pre-Check is MANDATORY** - Never skip it
2. **Document your pre-check findings** - Include them in your response
3. **Be honest about issues** - Better to catch them now than in production
4. **Learn from mismatches** - If CLI finds issues you missed, understand why

Remember: The pre-check helps YOU catch issues early and understand the codebase better. The CLI validates, but YOUR review provides context and understanding.

ARGUMENTS: {{feature}}`,
    },
    {
      name: 'hodge',
      content: `# Hodge - Session & Context Manager

## Purpose
Initialize or resume your Hodge development session with appropriate context.

**What this command does:**
- Loads context for your **last worked feature** (from session) or project overview
- Shows current state (exploration, decisions, build progress)
- Displays accurate mode for the feature you were working on
- Suggests possible next actions

**What this command does NOT do:**
- Does NOT automatically start building
- Does NOT run any development commands
- Does NOT make assumptions about what you want to do next
- Simply loads context and waits for your direction

**Note:** The \`/hodge\` command shows status for your last worked feature based on the active session. If you have a recent session for a feature, it will show that feature's accurate mode (e.g., "shipped", "build", etc.). If no session exists, it shows general project context.

## Usage Patterns
- \`/hodge\` - Load project context
- \`/hodge {{feature}}\` - Load context for specific feature

## Command Execution

### 1. Always Load Core Context First (ALL MODES)
\`\`\`bash
# Load project HODGE.md (session info)
cat .hodge/HODGE.md

# Load complete standards
echo "=== PROJECT STANDARDS ==="
cat .hodge/standards.md

# Load all decisions
echo "=== PROJECT DECISIONS ==="
cat .hodge/decisions.md

# List available patterns
echo "=== AVAILABLE PATTERNS ==="
ls -la .hodge/patterns/
\`\`\`

This provides core context for ALL modes:
- Current feature and mode (from HODGE.md)
- Complete standards (full file)
- All decisions (full file)
- Available patterns (list)

{{#if feature}}
### 2. Handle Feature Mode - Loading Feature-Specific Context

**IMPORTANT: This command ONLY loads context. It does not start any work.**

Load the project state and feature-specific context:
\`\`\`bash
# Get current project status
hodge status

# Check for feature directory
ls -la .hodge/features/{{feature}}/ 2>/dev/null || echo "No feature directory yet"

# Load feature-specific context
hodge context --feature {{feature}}

# Load feature HODGE.md if it exists
echo "=== FEATURE CONTEXT ==="
cat .hodge/features/{{feature}}/HODGE.md 2>/dev/null || echo "No feature HODGE.md yet"
\`\`\`

After loading context, these files are available:
- Feature HODGE.md: \`.hodge/features/{{feature}}/HODGE.md\` (if generated)
- Exploration: \`.hodge/features/{{feature}}/explore/exploration.md\`
- Decisions: \`.hodge/features/{{feature}}/linked-decisions.md\`
- Build plan: \`.hodge/features/{{feature}}/build/build-plan.md\`
- Test intentions: \`.hodge/features/{{feature}}/explore/test-intentions.md\`

**STOP HERE and present the context to the user.**

Based on what you find, present the current state:
- If exploration exists → "Exploration complete"
- If decision exists → "Decision made: [brief summary]"
- If build started → "Build in progress"
- If nothing exists → "No work started yet"

Then list available options WITHOUT taking action:
- "Continue with \`/explore {{feature}}\`" (if not explored)
- "Continue with \`/build {{feature}}\`" (if explored and decided)
- "Continue with \`/harden {{feature}}\`" (if built)
- "Review existing work at \`.hodge/features/{{feature}}/\`"

**Wait for explicit user direction before proceeding.**

{{else}}
### 2. Handle Standard Mode - Session Initialization

Load current project state:
\`\`\`bash
hodge context
\`\`\`

{{/if}}

## Core Principles
Before starting work, remember:
- **AI analyzes, backend executes** - You design, hodge implements
- **Complex data through files** - Use .hodge/tmp/ for structured data
- **Templates guide conversations** - Don't document hodge internals
- **Progressive development** - Explore freely, ship strictly

## Context Loaded

{{#if feature}}
### Working on: {{feature}}
Current mode: {{mode}}
Next suggested action: {{next_action}}

Available commands:
- \`/explore {{feature}}\` - Continue exploration
- \`/build {{feature}}\` - Start/continue building
- \`/decide\` - Record decisions

{{else}}
### Available Commands
- \`/explore {{feature}}\` - Start exploring a new feature
- \`/build {{feature}}\` - Build a feature with standards
- \`/decide {{decision}}\` - Record a decision
- \`/ship {{feature}}\` - Ship feature to production
- \`/status\` - Check current status
- \`/review\` - Review current work

### Quick Actions
{{#if current_feature}}
Continue with {{current_feature}}:
- Next: {{suggested_next_command}}
{{else}}
Start with:
- \`/explore {{new_feature}}\` for new work
{{/if}}

{{/if}}

## Session Best Practices

1. **Start each session with \`/hodge\`** to load context
2. **Run \`/hodge {{feature}}\`** when switching features
3. **Check \`/status\`** to see current progress

## Implementation Note

The \`/hodge\` command coordinates with the Hodge CLI to:
- Generate fresh context via \`hodge status\`
- Load feature-specific files from \`.hodge/features/\`
- Ensure principles and standards are available

## Context Loading Complete

**This command has finished loading context. No actions have been taken.**

What would you like to do next?`,
    },
    {
      name: 'plan',
      content: `# Hodge Plan - Work Organization & PM Integration

## Purpose
The \`/plan\` command transforms technical decisions into organized, executable work. It handles epic/story breakdown, dependency analysis, parallel lane allocation, and PM tool integration.

**IMPORTANT**: This slash command handles ALL user interaction for plan generation, refinement, and approval. The \`hodge plan\` CLI command is ONLY called after user approval to save the plan and optionally create PM issues.

## Command Execution Flow

### Phase 1: Generate Plan (No CLI Call)
AI analyzes decisions and generates plan structure WITHOUT calling any CLI commands yet.

### Phase 2: Display and Refine (Interactive)
Display the proposed plan to the user and allow refinement:
- Show epic/story breakdown
- Display dependencies
- Show lane allocation
- Allow user to request changes

### Phase 3: Save Plan (First CLI Call)
After user approves the plan structure:
\`\`\`bash
hodge plan {{feature}} --lanes N
# This saves plan locally but does NOT create PM issues
\`\`\`

### Phase 4: Create PM Issues (Second CLI Call - Optional)
Only after explicit user confirmation to create PM issues:
\`\`\`bash
hodge plan {{feature}} --lanes N --create-pm
# This creates epic and stories in Linear
\`\`\`

## Available Options
\`\`\`bash
hodge plan {{feature}} --lanes 3        # Specify number of development lanes
hodge plan {{feature}} --create-pm      # Create PM issues (after approval only!)
\`\`\`

## Workflow Position
\`\`\`
/explore → /decide → /plan → /build
    ↑         ↑        ↑        ↑
 Investigate  Record  Organize  Implement
            Decisions   Work
\`\`\`

## What This Command Does

### 1. Analyzes Decisions
- Reads decisions from \`.hodge/decisions.md\`
- Identifies work units from technical choices
- Determines complexity (single story vs epic)

### 2. Generates Work Breakdown
- Creates stories with effort estimates
- Identifies dependencies between stories
- Proposes epic structure when appropriate

### 3. Allocates to Development Lanes
- Distributes work across parallel tracks
- Respects dependency chains
- Optimizes for minimal blocking

### 4. Creates PM Structure
- Creates epics and stories in PM tool
- Sets up parent/child relationships
- Maps IDs for tracking

## Configuration

Add to \`hodge.json\`:
\`\`\`json
{
  "planning": {
    "developmentLanes": 3,        // Number of parallel tracks
    "laneNames": [                // Optional custom names
      "backend",
      "frontend",
      "infrastructure"
    ],
    "autoAssignDependencies": true,
    "defaultStorySize": "medium"
  }
}
\`\`\`

## Interactive Planning Process

### Step 1: Complexity Analysis
The AI analyzes decisions to determine if the feature needs:
- **Single Story**: Simple implementation (1-3 days)
- **Epic with Stories**: Complex feature requiring breakdown

### Step 2: Story Generation (Vertical Slice Requirement)

**CRITICAL REQUIREMENT**: All stories MUST be vertical slices - complete, testable, shippable units of value.

#### What is a Vertical Slice?
A vertical slice is a story that:
1. **Provides complete value** to a stakeholder (user, admin, developer, tester, etc.)
2. **Is independently testable** - can be verified without other stories
3. **Is shippable** - could go to production on its own (even if behind a feature flag)

#### Vertical Slice Criteria (Moderate Standard)
Each story must satisfy BOTH criteria:
- ✅ **Stakeholder Value**: Clearly benefits someone (not just "backend work" or "setup")
- ✅ **Independently Testable**: Has verification criteria that don't depend on other incomplete stories

#### Good vs Bad Story Examples

**❌ BAD: Horizontal Slicing (Layer-Based)**
\`\`\`
Epic: User Authentication
- Story 1: Backend API endpoints
- Story 2: Frontend UI components
- Story 3: Database schema
- Story 4: Integration tests

Problem: No story provides complete value alone. Can't test/ship backend without frontend.
\`\`\`

**✅ GOOD: Vertical Slicing (Value-Based)**
\`\`\`
Epic: User Authentication
- Story 1: Login with email/password (backend + frontend + tests + DB)
  Value: Users can log in, testable end-to-end, shippable
- Story 2: Password reset flow (backend + frontend + tests + email)
  Value: Users can reset passwords, independently testable, shippable
- Story 3: OAuth social login (backend + frontend + tests + provider integration)
  Value: Users can log in with Google, independently testable, shippable

Each story is a complete, working feature slice.
\`\`\`

**❌ BAD: Incomplete Value**
\`\`\`
- Story 1: Set up authentication configuration
- Story 2: Add user database tables
- Story 3: Create login API skeleton

Problem: None provide value to any stakeholder. Just setup/infrastructure.
\`\`\`

**✅ GOOD: Complete Value**
\`\`\`
- Story 1: Basic login authentication (includes setup, DB, API, UI - all needed for login to work)
  Value: Users can log in - complete feature

Each story delivers working functionality.
\`\`\`

#### Vertical Slice Decision Tree

When generating stories, ask:

1. **Can this story be tested independently?**
   - No → Merge with dependent stories to create complete slice
   - Yes → Continue to question 2

2. **Does this story provide value to a stakeholder?**
   - No → This might be infrastructure - include it as part of a value-delivering story
   - Yes → Continue to question 3

3. **Could this story ship to production (even behind a feature flag)?**
   - No → Missing something (UI? Backend? Tests?) - expand to include all needed pieces
   - Yes → This is a valid vertical slice ✅

4. **Are all stories in the epic vertical slices?**
   - No → Revise the breakdown
   - Yes → Continue to dependencies

**If vertical slicing is not feasible:**
- ⚠️ Warn the user that stories may not meet vertical slice criteria
- 💡 Suggest creating a single issue instead of epic/stories
- ✅ Allow user to override with explanation if they have good reason

#### Story Generation Guidelines
For epics, identify stories based on:
- **Value-based boundaries** (not technical layers)
- Complete user workflows or features
- Natural work boundaries that deliver value
- Testing requirements (each story must be testable)
- Dependencies between components (minimize them)

### Step 3: Dependency Analysis
\`\`\`
Example Dependency Graph:
Database Schema (296.1) → User Service (296.2) → Auth API (296.3)
                                               ↘
                                                  Frontend (296.4)
                                               ↗
Session Store (296.5) ────────────────────────→
\`\`\`

### Step 4: Lane Allocation
Work is distributed to maximize parallelism:
\`\`\`
Lane 1: Backend Core
  Day 1: Database schema (296.1)
  Day 2-3: User service (296.2)

Lane 2: Infrastructure (can start immediately)
  Day 1-2: Session store (296.5)
  Day 3: Available for next story

Lane 3: API/Frontend (starts after 296.1)
  Day 2-3: Auth API (296.3)
  Day 4-5: Frontend (296.4)
\`\`\`

## Example Usage

### Basic Planning
\`\`\`
$ hodge plan HODGE-296

📋 Planning Work Structure

Analyzing 3 decisions for HODGE-296...

Development Plan
================
Feature: HODGE-296
Type: epic

Stories (5):
  HODGE-296.1: Database schema and migrations (Lane 1)
  HODGE-296.2: API implementation [depends on: HODGE-296.1] (Lane 1)
  HODGE-296.3: Frontend components [depends on: HODGE-296.2] (Lane 2)
  HODGE-296.4: Tests and validation [depends on: all] (Lane 3)
  HODGE-296.5: Documentation (Lane 2)

Lane Allocation (3 lanes):
  Lane 1: HODGE-296.1, HODGE-296.2
  Lane 2: HODGE-296.3, HODGE-296.5
  Lane 3: HODGE-296.4

Estimated Timeline: 4 days
================

✓ Created epic with 5 stories in Linear
✓ Plan saved to .hodge/development-plan.json

Next Steps:

Parallel development ready:
  Lane 1: hodge build HODGE-296.1
  Lane 2: hodge build HODGE-296.5
  Lane 3: (wait for dependencies)
\`\`\`

### Single Developer Mode
\`\`\`
$ hodge plan HODGE-297 --lanes 1

📋 Planning Work Structure

Development Plan
================
Feature: HODGE-297
Type: epic

Stories in sequence:
  1. HODGE-297.1: Core implementation
  2. HODGE-297.2: Tests
  3. HODGE-297.3: Documentation

Estimated Timeline: 5 days
================

Next Steps:
  Start with: hodge build HODGE-297.1
\`\`\`

## Output Files

### \`.hodge/development-plan.json\`
\`\`\`json
{
  "feature": "HODGE-296",
  "type": "epic",
  "stories": [
    {
      "id": "HODGE-296.1",
      "title": "Database schema",
      "effort": "medium",
      "dependencies": [],
      "lane": 0
    }
  ],
  "lanes": {
    "count": 3,
    "assignments": {
      "0": ["HODGE-296.1", "HODGE-296.2"],
      "1": ["HODGE-296.3"],
      "2": ["HODGE-296.4"]
    }
  },
  "dependencies": {
    "HODGE-296.2": ["HODGE-296.1"],
    "HODGE-296.3": ["HODGE-296.2"]
  },
  "estimatedDays": 4,
  "createdAt": "2025-01-29T12:00:00Z"
}
\`\`\`

## Benefits Over Previous Approach

### Before (in \`/decide\`)
- Mixed concerns: decisions + work planning
- No dependency analysis
- No parallel development support
- Confusing workflow

### After (with \`/plan\`)
- Clean separation of concerns
- Smart dependency management
- Parallel lane optimization
- Clear workflow progression

## Team Development

The \`/plan\` command enables effective team collaboration:

1. **Developer A** works Lane 1 (backend)
2. **Developer B** works Lane 2 (frontend)
3. **Developer C** works Lane 3 (testing/infrastructure)

All developers can see:
- What they can work on now
- What's blocking them
- When dependencies will be ready

## Solo Development

Even for solo developers, \`/plan\` provides value:
- Clear work sequence
- Dependency visibility
- Progress tracking
- Realistic time estimates

## AI Workflow for /plan Slash Command

### Step 1: Analyze Decisions
Read decisions from \`.hodge/decisions.md\` for the feature and identify work units.

### Step 2: Generate Plan Structure (AI Task)

**Before creating stories, validate vertical slice requirements:**

1. **Check each proposed story against vertical slice criteria:**
   - Does it provide complete value to a stakeholder?
   - Is it independently testable?
   - Could it ship to production (even behind a feature flag)?

2. **If stories are horizontal slices (e.g., "Backend" + "Frontend"):**
   - ⚠️ **WARN the user** that stories may not meet vertical slice criteria
   - 💡 **SUGGEST** combining them into value-based slices OR creating a single issue
   - Example: "⚠️ Warning: Stories 'Backend API' and 'Frontend UI' appear to be horizontal slices. Consider combining into 'Login Feature (backend + frontend + tests)' for complete value."

3. **If vertical slicing is not feasible:**
   - 💡 **RECOMMEND** creating a single issue instead of epic/stories
   - Example: "💡 Recommendation: This feature may be better as a single issue since it's difficult to split into independently valuable stories."

4. **Generate the plan with validated stories:**

Create epic/story breakdown:
\`\`\`
Epic: HODGE-XXX: [Description from exploration.md]

Decisions Made:
1. Decision title 1
2. Decision title 2
3. Decision title 3

Stories (Vertical Slices):
- HODGE-XXX.1: Story title 1 (complete feature with backend + frontend + tests)
  ✅ Value: [Who benefits and how]
  ✅ Testable: [How to verify independently]
- HODGE-XXX.2: Story title 2 (complete feature slice) [depends on: HODGE-XXX.1]
  ✅ Value: [Who benefits and how]
  ✅ Testable: [How to verify independently]

Vertical Slice Validation:
✅ All stories provide complete stakeholder value
✅ All stories are independently testable
✅ All stories are shippable

Lane Allocation (N lanes):
Lane 1: HODGE-XXX.1
Lane 2: HODGE-XXX.2
\`\`\`

**If warnings were issued:**
\`\`\`
⚠️ Vertical Slice Warnings:
- Story X may not provide complete value (missing frontend/backend/tests)
- Consider revising breakdown or creating single issue

Would you like to:
a) Revise the plan to use vertical slices
b) Create as single issue instead
c) Proceed anyway (explain why this breakdown is correct)
\`\`\`

### Step 3: Present to User
Display the proposed plan and ask:
\`\`\`
Review the plan above. Would you like to:
a) Approve and save plan locally
b) Approve and create PM issues in Linear
c) Modify the plan (adjust stories, dependencies, etc.)
d) Cancel

Your choice:
\`\`\`

### Step 4: Save AI-Generated Plan Structure

**IMPORTANT**: Before calling the CLI, save your generated plan structure to a file so the CLI can use it instead of keyword matching.

Use the Write tool to create the plan file:

**For epic plans with multiple stories:**
\`\`\`
Write to: .hodge/temp/plan-interaction/{{feature}}/plan.json

Content (replace all {{placeholders}} with actual values):
{
  "feature": "{{feature}}",
  "type": "epic",
  "stories": [
    {
      "id": "{{feature}}.1",
      "title": "Story title",
      "description": "What this story delivers",
      "effort": "small|medium|large",
      "dependencies": [],
      "lane": 0
    }
  ],
  "lanes": {
    "count": {{N}},
    "assignments": {
      "0": ["{{feature}}.1"]
    }
  },
  "dependencies": {
    "{{feature}}.2": ["{{feature}}.1"]
  },
  "estimatedDays": {{days}},
  "createdAt": "{{current_iso_timestamp}}"
}
\`\`\`

**For single-issue plans:**
\`\`\`
Write to: .hodge/temp/plan-interaction/{{feature}}/plan.json

Content:
{
  "feature": "{{feature}}",
  "type": "single",
  "estimatedDays": 1,
  "createdAt": "{{current_iso_timestamp}}"
}
\`\`\`

**Important**: Replace all \`{{placeholders}}\` with actual values from your analysis!

### Step 5: Execute Based on User Choice

**If user chooses (a) - Save locally:**
\`\`\`bash
hodge plan {{feature}} --lanes N
\`\`\`
The CLI will detect and use the plan.json file you created above.

**If user chooses (b) - Save and create PM issues:**
\`\`\`bash
hodge plan {{feature}} --lanes N --create-pm
\`\`\`
The CLI will detect and use the plan.json file, then create PM issues.

**If user chooses (c) - Modify:**
Allow user to specify changes, regenerate plan, update plan.json file, then return to Step 3.

**If user chooses (d) - Cancel:**
Exit without saving or creating anything. Clean up the temp file:
\`\`\`bash
rm -rf .hodge/temp/plan-interaction/{{feature}}
\`\`\`

## Important Notes

- **CRITICAL**: NEVER call \`hodge plan\` with \`--create-pm\` without explicit user approval
- **CRITICAL**: All stories MUST be vertical slices (complete value + independently testable + shippable)
- The \`hodge plan\` CLI is an internal tool, users never invoke it directly
- All user interaction happens in this slash command template
- PM issue creation is a destructive operation requiring explicit consent
- Plans can be regenerated if decisions change
- Lane allocation respects dependencies automatically
- Stories can be worked on independently within constraints
- **Warn users** if stories appear to be horizontal slices (layer-based)
- **Suggest single issue** when vertical slicing is not feasible

## Next Steps After Planning

After plan is saved and/or PM issues created:
\`\`\`
### What would you like to do?
a) Start building first story → \`/build {{first_story}}\`
b) Review plan details → \`cat .hodge/development-plan.json\`
c) Regenerate plan → \`/plan {{feature}} --lanes N\`
d) View in Linear → [provide Linear URL if PM issues created]
e) Continue development
f) Done for now

Your choice:
\`\`\`

Remember: \`/plan\` bridges the gap between decisions and implementation, turning ideas into actionable, parallel work streams.`,
    },
    {
      name: 'review',
      content: `# Hodge Review - AI-Driven Code Quality Analysis

## Purpose
The \`/review\` command performs AI-driven architectural code review to identify quality issues that automated tools cannot detect: coupling violations, single responsibility problems, DRY violations across files, naming inconsistencies, complexity hotspots, and lessons-learned violations.

## Command Usage

\`\`\`bash
/review file <path>              # Review single file
/review directory <path>         # Review directory (future: HODGE-327.3)
/review pattern <glob>           # Review by pattern (future: HODGE-327.3)
/review recent --last N          # Review recent changes (future: HODGE-327.3)
\`\`\`

**For HODGE-327.1**: Only \`/review file <path>\` is supported.

## What This Command Does

### 1. Load Project Context (Automatic Merge)
The review engine ALWAYS loads these project files regardless of profile:

**Standards** (Layer 1 - Highest Priority):
\`\`\`bash
cat .hodge/standards.md
\`\`\`
Project-specific enforceable rules that MUST be followed. These override profile recommendations.

**Principles** (Layer 1):
\`\`\`bash
cat .hodge/principles.md
\`\`\`
Project philosophy and values that guide interpretation of quality criteria.

**Patterns** (Layer 1):
\`\`\`bash
ls .hodge/patterns/*.md
# Load each pattern file for reference
\`\`\`
Project-specific solutions and expected implementation patterns.

**Lessons** (Layer 1):
\`\`\`bash
ls .hodge/lessons/*.md
# Load ALL lesson files for violation checking
\`\`\`
Hard-won knowledge from past mistakes. Violations are BLOCKERS.

### 2. Load Review Profile
\`\`\`bash
cat .hodge/review-profiles/default.yml
\`\`\`

The profile provides Layer 2 criteria (domain defaults) and Layer 3 criteria (universal baseline).

### 3. Analyze Target File
Read the file to review:
\`\`\`bash
cat {{file_path}}
\`\`\`

### 4. Perform Layered Analysis

**IMPORTANT**: Apply review criteria in layered priority order:

**Layer 1: Project-Specific (Overrides Everything)**
1. Check if code violates \`.hodge/standards.md\` → BLOCKER
2. Check if code violates \`.hodge/lessons/\` → BLOCKER
3. Check if code follows \`.hodge/patterns/\` → WARNING if violated
4. Use \`.hodge/principles.md\` to guide interpretation

**Layer 2: Profile Domain Defaults**
5. Apply profile criteria patterns
6. Use profile custom_instructions for analysis guidance

**Layer 3: Universal Baseline**
7. Check basic code quality (coupling, SRP, DRY, complexity, naming)

**Conflict Resolution**:
If a profile criterion conflicts with a standard, the STANDARD wins. For example:
- Profile says "Use functional components" (warning)
- Standard says "This project uses class components for legacy compatibility"
- Result: Do NOT flag class components (standard overrides profile)

### 5. Generate Report

**Output Format**: Grouped findings with medium verbosity (blocker/warning/suggestion)

For each finding, include:
- **Severity**: blocker | warning | suggestion
- **Criteria**: Which criteria triggered this finding
- **Description**: What's the issue
- **Location**: file:line (if line number can be determined)
- **Rationale**: Why this matters (reference standard/lesson/pattern if applicable)
- **Suggested Action**: \`/explore "{{feature_description}}"\` command to fix

**Report Structure**:
\`\`\`markdown
# Code Review Report: {{file_path}}

**Profile**: {{profile_name}}
**Reviewed**: {{timestamp}}

## Blockers ({{count}})

### 1. Lessons Learned Violation: Subprocess Spawning
- **Location**: src/example.ts:45
- **Description**: Uses \`execSync()\` to spawn subprocess
- **Rationale**: Violates HODGE-317.1 - subprocess spawning creates hung processes
- **Suggested Action**: \`/explore "Refactor subprocess spawning to direct function calls in src/example.ts"\`

## Warnings ({{count}})

### 1. Single Responsibility Violation
- **Location**: src/example.ts:23-67
- **Description**: \`UserService\` class handles authentication, validation, and database operations
- **Rationale**: Class should have one reason to change (SRP principle)
- **Suggested Action**: \`/explore "Extract authentication and validation logic from UserService"\`

## Suggestions ({{count}})

### 1. DRY Violation
- **Location**: src/example.ts:12, src/another.ts:34
- **Description**: Validation logic duplicated across files
- **Rationale**: Repeated code makes maintenance harder
- **Suggested Action**: \`/explore "Extract shared validation logic into ValidationService"\`

---

**Summary**: {{total}} findings ({{blockers}} blockers, {{warnings}} warnings, {{suggestions}} suggestions)
\`\`\`

## AI Analysis Guidelines

### What to Look For (Based on Profile Criteria)

The profile defines criteria with:
- **name**: Criteria being checked (e.g., "Single Responsibility Principle")
- **severity**: blocker | warning | suggestion
- **patterns**: Natural language descriptions of what to check
- **reference**: Optional path to project files (e.g., ".hodge/lessons/")
- **custom_instructions**: Optional analysis guidance

**Example Profile Criteria**:
\`\`\`yaml
criteria:
  - name: "Lessons Learned Violations"
    severity: blocker
    reference: ".hodge/lessons/"
    patterns:
      - "Check for subprocess spawning in tests (HODGE-317.1)"
      - "Verify test isolation - no .hodge modification (HODGE-308)"
\`\`\`

For each criteria:
1. Read the patterns (simple strings, interpret naturally)
2. If \`reference\` exists, cross-check against referenced files
3. If \`custom_instructions\` exist, use as analysis guidance
4. Check the target file for violations
5. Report findings with specified severity

### Quality Analysis Framework

**Coupling & Cohesion**:
- Are modules/classes dependent on internal details of other modules?
- Are unrelated responsibilities grouped together?

**Single Responsibility**:
- Does each class/function have one clear purpose?
- Would this need to change for multiple reasons?

**DRY Violations**:
- Is the same logic repeated in multiple places?
- Are there patterns that could be extracted?

**Naming**:
- Do names clearly convey intent?
- Are names consistent with project conventions?

**Complexity**:
- Are there deeply nested conditionals (4+ levels)?
- Are functions too long (>50 lines)?
- Is logic easy to understand?

**Maintainability**:
- Would this confuse a new team member?
- Is there "clever" code that sacrifices clarity?

## Error Handling

**Missing Profile**:
\`\`\`
❌ Error: Profile not found at .hodge/review-profiles/default.yml

Please ensure the profile exists or specify a different profile.
\`\`\`

**Missing File**:
\`\`\`
❌ Error: File not found: {{file_path}}

Please check the file path and try again.
\`\`\`

**Malformed Profile**:
\`\`\`
❌ Error: Invalid profile syntax in default.yml: {{details}}

Please check the YAML syntax and required fields.
\`\`\`

## Implementation Notes (HODGE-327.1)

**CLI Command** (\`hodge review\`):
1. Parse arguments (file <path>)
2. Load profile using ProfileLoader
3. Load context using ContextAggregator
4. Read target file
5. Output context and file to this slash command template
6. Capture AI-generated report
7. Display report to user

**Slash Command** (this template):
1. Receive context and file from CLI
2. Perform layered analysis
3. Generate markdown report
4. Return to CLI for output

## Step 6: Save Review Report (Optional)

After displaying the review report, prompt the user:

\`\`\`
Would you like to save this review report? (s/d)
  s) Save report to .hodge/reviews/
  d) Discard (exit without saving)

Your choice:
\`\`\`

### If user chooses 's' (Save):

1. **Generate filename** from file path and timestamp:
\`\`\`bash
# Convert file path to slug (replace slashes and special chars with dashes)
FILE_SLUG=$(echo "{{file_path}}" | sed 's|^\\./||' | sed 's|/|-|g' | sed 's|\\\\|-|g' | sed 's|[^a-zA-Z0-9._-]|-|g' | sed 's|-\\+|-|g' | sed 's|^-||' | sed 's|-$||')

# Generate ISO timestamp for filename (replace colons with dashes)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")

# Construct filename (omit "file-" prefix for file scope)
FILENAME="\${FILE_SLUG}-\${TIMESTAMP}.md"

echo "Saving to: .hodge/reviews/\${FILENAME}"
\`\`\`

2. **Detect feature context** (optional, best-effort):
\`\`\`bash
# Attempt to detect HODGE-XXX feature from git blame
FEATURE=$(git blame --line-porcelain "{{file_path}}" 2>/dev/null | grep "^summary" | grep -oE "HODGE-[0-9]+(\\.[0-9]+)?" | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')

# If no feature detected, leave empty
if [ -z "$FEATURE" ]; then
  FEATURE_LINE=""
else
  FEATURE_LINE="feature: $FEATURE"
fi
\`\`\`

3. **Extract finding counts** from generated report:
\`\`\`bash
# Count findings by severity from the markdown report
BLOCKERS=$(echo "$REPORT" | grep -oE "## Blockers \\(([0-9]+)\\)" | grep -oE "[0-9]+")
WARNINGS=$(echo "$REPORT" | grep -oE "## Warnings \\(([0-9]+)\\)" | grep -oE "[0-9]+")
SUGGESTIONS=$(echo "$REPORT" | grep -oE "## Suggestions \\(([0-9]+)\\)" | grep -oE "[0-9]+")

# Default to 0 if not found
BLOCKERS=\${BLOCKERS:-0}
WARNINGS=\${WARNINGS:-0}
SUGGESTIONS=\${SUGGESTIONS:-0}
\`\`\`

4. **Use Write tool to save report** with YAML frontmatter:

Create the full report content with metadata header, then use the Write tool:

**File path**: \`.hodge/reviews/{{filename}}\`

**Content structure**:
\`\`\`markdown
---
reviewed_at: {{iso_timestamp}}
scope: file
target: {{file_path}}
profile: default.yml
{{feature_line}}
findings:
  blockers: {{blocker_count}}
  warnings: {{warning_count}}
  suggestions: {{suggestion_count}}
---

{{full_report_content}}
\`\`\`

After writing, confirm to user:
\`\`\`
✅ Review saved to: .hodge/reviews/{{filename}}
\`\`\`

### If user chooses 'd' (Discard):

Exit silently with no output. User can regenerate the review if needed later.

## Next Steps

After review complete (whether saved or discarded):
\`\`\`
Review complete. You can now:
- Fix issues using suggested \`/explore\` commands from the report
- Review another file with \`/review file <path>\`
- Continue development
\`\`\`

## Future Enhancements (Later Stories)

- **HODGE-327.3**: Support directory, pattern, and recent scopes
- **HODGE-327.4**: Additional profiles (React, API, test quality)
- **HODGE-327.5**: Integration with \`/harden\` command
- **HODGE-327.6**: Comprehensive documentation

---

Remember: Review is advisory, not blocking. Users decide which findings to act on.

ARGUMENTS: {{file_path}}
`,
    },
    {
      name: 'ship',
      content: `# 🚀 Ship Command - Interactive Commit & Ship

## Standards Review Process

### AI Standards Compliance Check
Before shipping, you MUST ensure all standards are met at the **BLOCKING Level**:

- [ ] **All tests passing** (no failures allowed)
- [ ] **No TypeScript errors** (strict mode compliance)
- [ ] **No ESLint errors** (warnings acceptable)
- [ ] **Performance standards met** (CLI < 500ms response)
- [ ] **Documentation updated** (if public APIs changed)
- [ ] **Test coverage >80%** for new code

If any BLOCKING standards are not met, return to \`/harden\` phase.

## Step 1: Analyze Changes
First, analyze the git changes to understand what was modified:

\`\`\`bash
# Check if feature is ready
feature="{{feature}}"
if [ ! -d ".hodge/features/$feature/harden" ]; then
    echo "⚠️ Feature has not been hardened yet"
    echo "Run: hodge harden $feature"
    exit 1
fi

# Gather change information
echo "📊 Analyzing changes for $feature..."
git status --short
echo ""
echo "📝 Detailed changes:"
git diff --stat
echo ""
echo "📄 File-by-file changes:"
git diff --name-status
\`\`\`

## Step 2: Generate Rich Commit Message

Based on the git analysis above, generate a detailed commit message that:
1. Uses conventional commit format (feat:, fix:, test:, docs:, refactor:, chore:)
2. Provides a clear, concise summary in the first line
3. Includes a "What Changed" section with specific details
4. Explains "Why This Change" when the context is clear
5. Lists the "Impact" of the changes
6. References the issue ID if available

**Analyze the actual changes from the git diff above to create a contextual message.**

For example, if package.json changed, list specific dependencies updated.
If tests were added, mention the test count and what they test.
If it's a bug fix, explain what was broken and how it's fixed.

### Generated Commit Message:
\`\`\`
[Create a rich, detailed commit message based on the actual git diff analysis above]

## What Changed
- [Specific files and changes, e.g., "Modified 3 ship command files"]
- [Dependencies if package.json changed]
- [Test additions with counts]
- [Documentation updates]

## Why This Change
[Explain the motivation based on the feature name and changes]

## Impact
- [User-facing impacts]
- [Developer experience improvements]
- [Performance or reliability changes]
\`\`\`

## Step 3: Interactive Approval

Present the generated commit message for approval:

\`\`\`
════════════════════════════════════════════════════════════
COMMIT MESSAGE FOR REVIEW:
════════════════════════════════════════════════════════════
[Display the generated message from Step 2]
════════════════════════════════════════════════════════════

Options:
(a) ✅ Approve - Use this message
(r) 🔄 Regenerate - Create a different message
(e) ✏️ Edit - Let me modify this message
(c) ❌ Cancel - Stop the ship process

Your choice [a/r/e/c]:
\`\`\`

### Based on User Choice:

**If (a) Approve:**
Save the message to the interaction state and proceed with shipping.

Use the Write tool to save the approved message to both ui.md AND state.json (Write tool creates parent directories automatically):

**Write to:** \`.hodge/temp/ship-interaction/{{feature}}/ui.md\`
\`\`\`markdown
# Ship Commit - {{feature}}

## Approved Commit Message

\`\`\`
[The approved commit message]
\`\`\`
\`\`\`

**Write to:** \`.hodge/temp/ship-interaction/{{feature}}/state.json\`
\`\`\`json
{
  "command": "ship",
  "feature": "{{feature}}",
  "status": "edited",
  "timestamp": "{{current_iso_timestamp}}",
  "environment": "Claude Code",
  "data": {
    "edited": "[The approved commit message]",
    "suggested": "[Original suggested message if available]"
  },
  "history": [
    {
      "timestamp": "{{current_iso_timestamp}}",
      "type": "edit",
      "data": "User approved message via slash command"
    }
  ]
}
\`\`\`

**Important**: Replace \`{{feature}}\` and \`{{current_iso_timestamp}}\` with actual values, and insert the actual approved commit message in the appropriate locations.

Finally, run ship with the message (it will detect and use the edited state):
\`\`\`bash
hodge ship "{{feature}}"
\`\`\`

**If (r) Regenerate:**
Return to Step 2 and create a different version of the commit message, varying:
- The phrasing and structure
- The level of detail
- The emphasis on different aspects

**If (e) Edit:**
Ask the user to provide their edited version:
\`\`\`
Please provide your edited commit message:
(Paste the complete message below)
\`\`\`

Then use the Write tool to save their edited version to state files (Write tool creates parent directories automatically):

**Write to:** \`.hodge/temp/ship-interaction/{{feature}}/ui.md\`
\`\`\`markdown
# Ship Commit - {{feature}}

## Edited Commit Message

\`\`\`
[User's edited commit message]
\`\`\`
\`\`\`

**Write to:** \`.hodge/temp/ship-interaction/{{feature}}/state.json\`
\`\`\`json
{
  "command": "ship",
  "feature": "{{feature}}",
  "status": "edited",
  "timestamp": "{{current_iso_timestamp}}",
  "environment": "Claude Code",
  "data": {
    "edited": "[User's edited commit message]",
    "suggested": "[Original suggested message]"
  },
  "history": [
    {
      "timestamp": "{{current_iso_timestamp}}",
      "type": "edit",
      "data": "User provided custom message via slash command"
    }
  ]
}
\`\`\`

**Important**: Replace \`{{feature}}\` and \`{{current_iso_timestamp}}\` with actual values, and insert the user's actual edited commit message.

Finally, run ship with the edited message:
\`\`\`bash
hodge ship "{{feature}}"
\`\`\`

**If (c) Cancel:**
\`\`\`bash
echo "Ship cancelled. Your changes remain uncommitted."
echo "Run '/ship {{feature}}' when ready to try again."
\`\`\`

## Step 3.5: Capture Lessons Learned (Optional - Before Commit)

**IMPORTANT**: This step happens BEFORE the ship command executes, so lessons are included in the feature commit.

### Ask User About Lessons

\`\`\`
Would you like to document lessons learned from this feature? (y/n)

This will be committed with your feature work.
\`\`\`

If user says **no** or **n**:
- Thank them and skip to Step 4
- No lesson files will be created
- Proceed directly to ship execution

If user says **yes** or **y**, proceed with enhancement questions:

### Gather Lessons Information

Ask the following questions to gather insights (3-4 questions):

**Question 1: What Worked Well**
\`\`\`
What approach or technique worked particularly well in this implementation?

(Share your thoughts, or type 'skip' to skip this question)
\`\`\`

**Question 2: What to Improve**
\`\`\`
If you were implementing this feature again, what would you do differently?

(Share your thoughts, or type 'skip' to skip this question)
\`\`\`

**Question 3: Gotchas and Surprises**
\`\`\`
Were there any gotchas, surprises, or unexpected challenges?

(Share your thoughts, or type 'skip' to skip this question)
\`\`\`

**Question 4: Pattern Potential** (Optional)
\`\`\`
Did you create reusable code that could become a pattern for others?

(Share your thoughts, or type 'skip' to skip this question)
\`\`\`

### Analyze and Create Finalized Lesson

After gathering responses, create the enriched lesson:

1. **Read context files**:
   \`\`\`bash
   # Get git diff to analyze changes
   git diff --stat
   git diff --name-status

   # Review exploration decisions
   cat ".hodge/features/$feature/explore/exploration.md"

   # Check decisions made
   cat ".hodge/features/$feature/decisions.md" 2>/dev/null || grep -A 10 "Feature: $feature" .hodge/decisions.md
   \`\`\`

2. **Generate enriched lesson** combining:
   - Git diff analysis (files changed, scope of changes)
   - User insights from questions above
   - Exploration context and decisions made
   - Lessons structure similar to \`HODGE-003-feature-extraction.md\`

3. **Create finalized lesson**:

   First, generate descriptive slug from feature title:
   \`\`\`bash
   slug=$(echo "{{feature}}" | tr '[:upper:]' '[:lower:]' | sed 's/hodge-//' | sed 's/[^a-z0-9]/-/g')
   echo "Lesson file will be: .hodge/lessons/{{feature}}-\${slug}.md"
   \`\`\`

   Then use the Write tool to create the enriched lesson (Write tool creates parent directories automatically):

   **Write to:** \`.hodge/lessons/{{feature}}-{{slug}}.md\`
   \`\`\`markdown
# Lessons Learned: {{feature}}

## Feature: [Feature Title]

### The Problem
[Describe the problem this feature solved]

### Approach Taken
[Summarize the implementation approach chosen]

### Key Learnings

#### 1. [Learning Title]
**Discovery**: [What was discovered]

**Solution**: [How it was addressed]

[User insights from questions]

### Code Examples
[Include relevant code patterns if applicable]

### Impact
[Describe the impact and benefits]

### Related Decisions
[List related decisions from decisions.md]

---
_Documented: {{current_date}}_
\`\`\`

   **Important**: Replace \`{{feature}}\`, \`{{slug}}\`, and \`{{current_date}}\` with actual values, and fill in all bracketed sections with the enriched content.

   Then confirm to the user:
   \`\`\`bash
   echo "✅ Lessons documented at: .hodge/lessons/{{feature}}-\${slug}.md"
   echo "This will be committed with your feature."
   \`\`\`

4. **Example Enriched Lesson Structure**:

   See \`.hodge/lessons/HODGE-003-feature-extraction.md\` for example of rich lesson format with:
   - Problem statement and context
   - Approach evolution (what worked, what didn't)
   - Key learnings with code examples
   - Impact assessment
   - Related decisions

### Elevation Analysis (After Lesson Creation)

After creating the lesson, analyze whether any insights should be elevated to project-level artifacts:

**Ask yourself (AI):**
1. **Is this an architectural principle?** → Should it be a STANDARD?
   - Does it define fundamental system architecture?
   - Would violating it break the architecture?
   - Should it be enforced at all phases?
   - Examples: CLI/AI separation, non-interactive commands, test isolation

2. **Is this a reusable implementation?** → Should it be a PATTERN?
   - Is it a proven solution to a recurring problem?
   - Can it be applied in multiple contexts?
   - Does it have clear usage guidelines?
   - Examples: async resource pattern, error context pattern

3. **Is this a project-wide decision?** → Should it be a DECISION?
   - Does it constrain future feature development?
   - Should all developers know about it?
   - Is it a trade-off or architectural choice?
   - Examples: "Use pino for logging", "Prefer integration tests"

4. **Is this a philosophical guideline?** → Should it be a PRINCIPLE?
   - Does it guide thinking and approach?
   - Is it aspirational rather than enforceable?
   - Does it shape the project's character?
   - Examples: "Freedom to explore, discipline to ship"

**Present Recommendation to User:**

\`\`\`
════════════════════════════════════════════════════════════
📊 LESSON ELEVATION ANALYSIS
════════════════════════════════════════════════════════════

I've analyzed the lesson and identified the following recommendation:

[Recommendation Type]: STANDARD | PATTERN | DECISION | PRINCIPLE | NONE

**What to Elevate**:
[Specific insight from the lesson]

**Why**:
[Reasoning - why this should be elevated]

**Where**:
[Target file - .hodge/standards.md, .hodge/patterns/, .hodge/decisions.md, .hodge/principles.md]

**Proposed Addition**:
[Show the exact text that would be added]

════════════════════════════════════════════════════════════

Would you like to:
(a) ✅ Approve - Add this to {{target_file}}
(b) ✏️ Modify - Let me adjust the recommendation
(c) ⏭️ Skip - Keep it as a lesson only
(d) 💭 Discuss - I have questions or want to explore this more

Your choice [a/b/c/d]:
\`\`\`

**Based on User Choice:**

**If (a) Approve:**
- Use Edit or Write tool to add the content to the appropriate file
- Commit the change immediately (separate commit from feature)
- Confirm: "✅ Elevated to {{type}} in {{file}}"

**If (b) Modify:**
- Ask: "What would you like to change about the recommendation?"
- Iterate on the proposed text
- Present again for approval

**If (c) Skip:**
- Confirm: "Keeping as lesson only. You can elevate it later if needed."
- Proceed to ship

**If (d) Discuss:**
- Engage in conversation about the recommendation
- Answer questions, explore alternatives
- Eventually circle back to approve/modify/skip

**Important Notes**:
- Not every lesson needs elevation - most are feature-specific insights
- Elevation should happen when the insight has **project-wide applicability**
- Standards are mandatory (enforced), patterns are guidance (suggested)
- Multiple elevations possible (e.g., both a standard AND a pattern)

## Step 4: Ship Quality Checks & Commit

The ship command will:
- ✅ Run all tests
- ✅ Check code coverage
- ✅ Verify documentation
- ✅ Stage all files (including lessons if created) with \`git add -A\`
- ✅ Create git commit with approved message
- ✅ Update PM tracking
- ✅ Learn patterns from shipped code

## Post-Ship Actions
After successful shipping:
1. Push to remote: \`git push\`
2. Create PR if needed
3. Monitor production metrics
4. Review and document lessons learned
5. Start next feature with \`/explore\`

## Troubleshooting
- **Tests failing?** Fix them first with \`/build {{feature}}\`
- **Not hardened?** Run \`/harden {{feature}}\` first
- **Need to skip tests?** Add \`--skip-tests\` (not recommended)`,
    },
    {
      name: 'status',
      content: `# Hodge Status - Feature Overview and Context Management

## Command Execution

### For Overall Status
\`\`\`bash
hodge status
\`\`\`

### For Feature-Specific Status
\`\`\`bash
hodge status {{feature}}
\`\`\`

## What This Does

### Overall Status (\`hodge status\`)
1. Checks Hodge initialization
2. Displays project configuration
3. Shows statistics:
   - Total features
   - Active features (not shipped)
   - Pattern count
   - Decision count
4. Lists active features
5. Provides AI context summary

### Feature Status (\`hodge status {{feature}}\`)
1. Shows feature progress:
   - ✓/○ Exploration
   - ✓/○ Decision
   - ✓/○ Build
   - ✓/○ Harden
   - ✓/○ Production Ready
2. PM integration status
3. Suggests next step for the feature

## After Command Execution
The CLI will output either:
- Overall project status with context
- Specific feature progress and next steps

## Using Status Information

### If Viewing Overall Status
Review the context and decide:
- Which feature to work on next
- Whether to start a new feature
- If any features need attention

### If Viewing Feature Status
Based on progress shown:
- **No exploration**: Start with \`/explore {{feature}}\`
- **No decision**: Review and use \`/decide\`
- **No build**: Continue with \`/build {{feature}}\`
- **No harden**: Proceed to \`/harden {{feature}}\`
- **Not production ready**: Fix issues and re-harden
- **Ready to ship**: Use \`/ship {{feature}}\`

## Quick Feature Switch
To switch between features:
1. Check current status: \`hodge status\`
2. Save current work: \`/save\`
3. Switch to new feature: \`/explore\` or \`/build {{new-feature}}\`

## Context Management
The status command helps you:
- Keep track of multiple features
- Understand project progress
- Maintain context when switching tasks
- See what needs attention

## Next Steps Menu
After checking status:
\`\`\`
### Next Steps
Choose your next action:
a) Continue with suggested feature
b) Start new feature → \`/explore\`
c) Resume active feature → \`/build {{feature}}\`
d) Review decisions → \`hodge decide\`
e) Check specific feature → \`/status {{feature}}\`
f) Done for now

Enter your choice (a-f):
\`\`\`

Remember: The CLI tracks all feature progress automatically. Use status to stay oriented and make informed decisions about what to work on next.`,
    },
  ];
}
