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
      name: 'codify',
      content: `# Codify - Add Rules to Project

## Purpose

Universal command for adding any type of rule to the project. AI analyzes your input and recommends whether it belongs as a standard, principle, decision, pattern, or profile.

## Usage

\`\`\`bash
/codify "Your rule or practice here"
\`\`\`

## Examples

\`\`\`bash
/codify "Always use discriminated unions for state machines"
/codify "Review profiles should be compressed YAML"
/codify "We decided to use Prisma over TypeORM"
/codify "Never use console.log in production code"
/codify "Use React hooks over class components"
\`\`\`

## Workflow

### Step 1: Analyze Input

Read the user's input and determine which rule type fits best:

**Standard** (\`.hodge/standards.md\`):
- Applies to application code
- Prescriptive practice or requirement
- Ongoing enforcement (not one-time decision)
- Example: "Never use console.log in production code"

**Principle** (\`.hodge/principles.md\`):
- Project philosophy or values
- "Why" behind standards
- Guides decision-making
- Example: "Favor composition over inheritance"

**Decision** (\`.hodge/decisions.md\` or feature-specific):
- One-time architectural choice
- Has alternatives that were rejected
- Context about why this was chosen
- Example: "Use Prisma over TypeORM for better type safety"

**Pattern** (\`.hodge/patterns/*.md\`):
- Template or guide for common task
- Shows "how to" do something
- Reusable across features
- Example: "How to structure integration tests"

**Profile** (\`.hodge/review-profiles/**/*.yaml\`):
- Language or framework-specific rule
- Part of code review process
- Tied to specific technology version
- Example: "Use React hooks over class components (React 18+)"

### Step 2: Load Relevant Context

Based on your determination, load the appropriate authoring guidelines:

**For Standards**:
\`\`\`bash
cat .hodge/standards.md | head -100  # See current format and structure
\`\`\`

**For Principles**:
\`\`\`bash
cat .hodge/principles.md | head -100
\`\`\`

**For Decisions**:
\`\`\`bash
cat .hodge/decisions.md | head -50  # See decision format
# Check if this is feature-specific
ls -la .hodge/features/*/decisions.md 2>/dev/null | tail -5
\`\`\`

**For Patterns**:
\`\`\`bash
ls -la .hodge/patterns/  # See existing patterns
cat .hodge/patterns/test-pattern.md  # Example pattern format
\`\`\`

**For Profiles**:
\`\`\`bash
cat .hodge/patterns/review-profile-pattern.md  # Load compression standards
ls -la .hodge/review-profiles/  # See profile organization
# Check which profile to update
find .hodge/review-profiles/ -name "*.yaml" | head -10
\`\`\`

### Step 3: Present Recommendation

Show your analysis:

\`\`\`
I recommend this as a **[TYPE]** in \`[FILE PATH]\`

Rationale:
- [Why this type and not others]
- [How it fits into existing structure]
- [Benefits of this placement]

Proposed content:
[Show what you would add, following the format for that type]

Approve? Or would you prefer:
a) Store as [alternative type] instead
b) Different wording/structure
c) Ask me clarifying questions first
\`\`\`

### Step 4: Handle User Response

**If approved**: Use Write or Edit tool to add the rule to the appropriate file

**If user suggests different type**: Reload context for that type and present new proposal

**If user wants different wording**: Revise and present again

**If user asks questions**: Answer, then refine proposal

### Step 5: Confirm Completion

After writing the rule:

\`\`\`
✅ Added to [file path]

The rule is now part of the project's [standards/principles/decisions/patterns/profiles].

Next steps:
- Standards/Principles: Will be loaded during code review automatically
- Decisions: Recorded for future context
- Patterns: Load with \`cat .hodge/patterns/[name].md\` when needed
- Profiles: Will be loaded during code review when relevant
\`\`\`

## Decision Guidelines

### When Input is Ambiguous

If the user's input could fit multiple types, present options:

\`\`\`
Your input could be either:

**Option A: Standard** - "Never use any in production code"
- Prescriptive, applies to all TypeScript code
- Would add to .hodge/standards.md TypeScript section

**Option B: Profile Rule** - Add to typescript-5.x.yaml
- More nuanced (allowed in explore phase)
- Part of code review workflow

Which placement do you prefer?
\`\`\`

### When User Disagrees

If user says "actually, this should be a [different type]":

\`\`\`
Good point! Let me reconsider this as a [different type].

[Load new context]
[Present new proposal]
\`\`\`

Don't argue - adapt to user's intent.

## Edge Cases

### Feature-Specific Decisions

If decision relates to specific feature, ask: "Should this go in \`.hodge/decisions.md\` (project-wide) or \`.hodge/features/[feature]/decisions.md\` (feature-specific)?"

### Cross-Type Rules

Some rules might belong in multiple places (e.g., principle + standard). Ask user: "Should I add this to both, or just one?"

### Updating Existing Rules

If rule already exists in different form, mention it: "Note: Similar rule exists in [location]. Should I update that one or add a new entry?"

### Profile Updates

When adding to profiles:
- Determine which profile(s) apply (language/framework/version)
- Load the review-profile-pattern.md for compression standards
- Follow the compressed YAML format
- Ask if rule should be in multiple profiles (e.g., TypeScript + React)

## Profile-Specific Workflow

When recommending a **Profile** placement:

1. **Identify applicable profile(s)**:
   - Language: TypeScript, JavaScript, Python, etc.
   - Framework: React, Vue, Express, etc.
   - Version-specific: Does rule apply to specific version?

2. **Load compression standards**:
   \`\`\`bash
   cat .hodge/patterns/review-profile-pattern.md
   \`\`\`

3. **Load target profile**:
   \`\`\`bash
   cat .hodge/review-profiles/[category]/[profile-name].yaml
   \`\`\`

4. **Propose rule in compressed format**:
   \`\`\`yaml
   - id: rule-identifier
     name: "Human Readable Rule Name"
     enforcement: MANDATORY | SUGGESTED
     severity: BLOCKER | WARNING | SUGGESTION
     desc: "One sentence description (max 20 words)"
     guidance: "Optional 1-2 sentence context"  # If needed
     example: "optional minimal code pattern"    # If needed
     xref: "optional/cross/reference"            # If needed
   \`\`\`

5. **Validate against compression standards**:
   - Required fields present?
   - Description max 20 words?
   - Guidance max 2 sentences (or omitted)?
   - Example inline format (or omitted)?

## Important Notes

- This is an AI-only workflow command (no \`hodge codify\` CLI command)
- Always load context before proposing placement
- Present rationale, don't just write blindly
- Respect user's intent if they disagree with your recommendation
- For profiles, automatically load review-profile-pattern.md for compression standards
- Use Edit tool when adding to existing files
- Use Write tool only when creating new pattern files

## Examples of Good Recommendations

### Example 1: Standard

\`\`\`
User: /codify "Always validate user input before processing"

AI: I recommend this as a **Standard** in \`.hodge/standards.md\`

Rationale:
- Applies to all application code (not philosophy)
- Prescriptive security practice (not one-time decision)
- Ongoing enforcement across project (not task template)

Would add to Security section:
"Validate all user input before processing to prevent injection attacks
and ensure data integrity."

Approve? Or would you prefer:
a) Store as principle instead
b) Different wording
c) Add to specific profile
\`\`\`

### Example 2: Principle

\`\`\`
User: /codify "Prefer explicit over implicit"

AI: I recommend this as a **Principle** in \`.hodge/principles.md\`

Rationale:
- Project philosophy (not specific practice)
- Guides decision-making (not enforced rule)
- "Why" behind many standards (explicit types, explicit returns, etc.)

Would add:
"## Prefer Explicit Over Implicit

Make intentions clear through explicit declarations rather than relying on
implicit behavior. Explicit code is easier to understand, debug, and maintain.

Examples:
- Explicit function return types over inference
- Explicit error handling over silent failures
- Explicit dependencies over global state"

Approve? Or would you prefer:
a) Store as standard instead
b) Simpler wording
\`\`\`

### Example 3: Decision

\`\`\`
User: /codify "Use Vitest instead of Jest for faster test execution"

AI: I recommend this as a **Decision** in \`.hodge/decisions.md\`

Rationale:
- One-time architectural choice (not ongoing practice)
- Has alternatives that were considered (Jest)
- Explains why this was chosen (performance)

Would add:
"### 2025-10-12 - Use Vitest instead of Jest

**Status**: Accepted

**Context**: Need faster test execution for CI/CD pipeline

**Decision**: Adopt Vitest as test framework, replacing Jest

**Rationale**:
- 10x faster test execution (ESM native, no transpilation)
- Compatible with Jest API (minimal migration)
- Better Vite integration for our build setup

**Consequences**:
- Migrate existing Jest tests to Vitest
- Update CI/CD configuration
- Team needs to learn minor API differences"

Approve? Or would you prefer:
a) Store as standard instead
b) Different rationale
\`\`\`

### Example 4: Pattern

\`\`\`
User: /codify "How to structure CLI commands with proper separation of concerns"

AI: I recommend this as a **Pattern** in \`.hodge/patterns/cli-command-pattern.md\`

Rationale:
- Template for reusable task (not single rule)
- Shows "how to" structure (not what/why)
- Reusable across multiple commands

Would create new pattern file with:
- Command class structure
- Service extraction pattern
- Error handling template
- Testing approach
- Example implementation

This is a larger template. Should I create the full pattern file?

a) Yes, create full pattern
b) Add to existing structure-pattern.md instead
c) Make it a standard instead
\`\`\`

### Example 5: Profile

\`\`\`
User: /codify "Always specify dependency arrays in useEffect hooks"

AI: I recommend this as a **Profile Rule** in \`.hodge/review-profiles/frameworks/react-18.x.yaml\`

Rationale:
- React-specific rule (not general coding practice)
- Part of code review process (not one-time decision)
- Tied to React version (hooks are React 16.8+)

Loading compression standards from review-profile-pattern.md...

Would add to react-18.x.yaml rules array:
\`\`\`yaml
- id: useeffect-deps
  name: "UseEffect Dependency Arrays"
  enforcement: SUGGESTED
  severity: WARNING
  desc: "Always specify dependency arrays in useEffect to prevent stale closures"
  guidance: "Empty array [] = run once. Omit array = run every render. Include all dependencies."
\`\`\`

Approve? Or would you prefer:
a) Store as standard instead
b) Different wording
c) Change enforcement to MANDATORY
\`\`\`

---

*Command created: 2025-10-12*
*Part of HODGE-341.4: AI Review Profile Compression*
`,
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

## Step 0: Auto-Fix Simple Issues (HODGE-341.6)

**Run auto-fix FIRST to fix simple formatting and linting issues automatically.**

### Stage Your Changes
\`\`\`bash
git add .
\`\`\`

### Run Auto-Fix
\`\`\`bash
hodge harden {{feature}} --fix
\`\`\`

**What this does**:
- Runs formatters first: prettier, black, ktlint, google-java-format
- Then runs linters: eslint --fix, ruff --fix
- Automatically re-stages modified files
- Saves report to \`.hodge/features/{{feature}}/harden/auto-fix-report.json\`

**Communication flow**: Tools → CLI → AI → User

**What gets auto-fixed**:
- Code formatting issues
- Simple linting violations (unused imports, trailing whitespace, etc.)
- Style inconsistencies

**What requires manual fixing**:
- Type errors (handled in review step)
- Test failures (handled in review step)
- Complex logic errors (AI assists via Edit tool)
- Architectural issues (AI assists via Edit tool)

### Review Auto-Fix Results
\`\`\`bash
git diff
\`\`\`

Check what was changed. If auto-fix made unexpected changes, you can:
- Revert specific changes: \`git checkout -- <file>\`
- Stage additional fixes manually: \`git add <file>\`

**After auto-fix completes, proceed to Step 1 (Generate Review Manifest).**

---

## ⚠️ REQUIRED: Pre-Harden Code Review

**STOP! You MUST complete this AI Code Review BEFORE running the harden command.**

## Critical Workflow Rule

**ERRORS MUST BE FIXED BEFORE VALIDATION**

This workflow has a hard gate at Step 6:
- If quality checks show ERRORS → STOP, fix them, re-run from Step 0 (auto-fix)
- If only WARNINGS → Proceed to validation (address warnings before ship)
- If clean → Proceed to validation

The CLI validation will fail on errors anyway. Catching them in pre-check saves time.

### Step 1: Generate Review Manifest
**Analyze changes and generate tiered review manifest:**

\`\`\`bash
hodge harden {{feature}} --review
\`\`\`

This command will:
1. Analyze changed files (via git diff with line counts)
2. Run quality checks (lint, typecheck, tests, etc.) and generate quality-checks.md
3. Select critical files for deep review and generate critical-files.md
4. Classify changes into review tier (SKIP/QUICK/STANDARD/FULL)
5. Filter relevant patterns and review profiles
6. Generate review-manifest.yaml with:
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

### Step 2.5: Read Quality Checks Report (REQUIRED)
\`\`\`bash
# Read tool diagnostics (optimized for conciseness)
cat .hodge/features/{{feature}}/harden/quality-checks.md
\`\`\`

This contains output from all quality checks. The toolchain has been configured to minimize noise:
- **Concise formats**: ESLint uses compact format (one issue per line), Vitest uses dot reporter
- **Minimal verbosity**: Tools suppress progress bars and extra formatting
- **Organized by check type**: Type checking, linting, testing, formatting, etc.

**Your task**: Parse this output to identify:
- **ERRORS**: Type errors, failing tests, ESLint errors that must be fixed before proceeding
- **WARNINGS**: ESLint warnings, code quality issues to address before ship

The file may be ~500 lines with issues, or very short when clean. Read the entire file to assess status.

### Step 2.6: Read Critical Files Manifest (HODGE-341.3)
\`\`\`bash
# Read critical file analysis
cat .hodge/features/{{feature}}/harden/critical-files.md
\`\`\`

This shows which files the algorithm scored as highest risk based on:
- **Tool diagnostics**: Blockers, warnings, errors from quality checks
- **Import fan-in**: Architectural impact (how many files import this file)
- **Change size**: Lines modified
- **Critical paths**: Configured + inferred critical infrastructure

The report shows:
- Top N files (default 10) ranked by risk score
- Risk factors for each file
- Inferred critical paths (files with >20 imports)
- Configured critical paths (from .hodge/toolchain.yaml)

### Step 3: Choose Review Tier
Based on the manifest's \`recommended_tier\`, choose your review tier:

**Tier Options:**
- **SKIP**: Pure documentation changes (no code review needed)
- **QUICK**: Test/config only, ≤3 files, ≤50 lines (~1K lines of context)
- **STANDARD**: Implementation changes, ≤10 files, ≤200 lines (~3K lines of context)
- **FULL**: Major changes or critical paths (~8K lines of context)

**Default**: Use the recommended tier unless you have a reason to override.

### Step 4: Load Context Files (MANDATORY)

**IMPORTANT**: You MUST load the context files listed in review-manifest.yaml before conducting your review. These files define the standards you're reviewing against.

#### Step 4a: Parse the Manifest

Identify which files to load from the review-manifest.yaml you read in Step 2.

**For ALL tiers**, load:
1. \`.hodge/standards.md\` (from \`project_standards.path\`)
2. \`.hodge/principles.md\` (from \`project_principles.path\`)
3. Each file in \`matched_patterns.files[]\` (prepend \`.hodge/patterns/\`)
4. Each file in \`matched_profiles.files[]\` (prepend \`.hodge/review-profiles/\`)

**For FULL tier ONLY**, also load:
5. \`.hodge/decisions.md\` (from \`project_decisions.path\`)
6. Each file in \`lessons_learned.files[]\` (prepend \`.hodge/lessons/\`)

#### Step 4b: Load Files Using Read Tool

**Example from HODGE-341.3 manifest** (yours will be different):

The manifest shows:
\`\`\`yaml
matched_patterns:
  files:
    - test-pattern.md
    - error-boundary.md
matched_profiles:
  files:
    - testing/vitest-3.x.md
    - languages/typescript-5.x.md
\`\`\`

So you would load:
\`\`\`
Read: .hodge/standards.md
Read: .hodge/principles.md
Read: .hodge/patterns/test-pattern.md
Read: .hodge/patterns/error-boundary.md
Read: .hodge/review-profiles/testing/vitest-3.x.md
Read: .hodge/review-profiles/languages/typescript-5.x.md
Read: .hodge/decisions.md  # (FULL tier only)
\`\`\`

**Note**: Extract the file list from YOUR review-manifest.yaml. Don't hardcode these paths - they change per feature.

#### Step 4c: Verification Checklist

Before proceeding to Step 5, confirm you loaded:
- [ ] standards.md
- [ ] principles.md
- [ ] All files from \`matched_patterns.files[]\`
- [ ] All files from \`matched_profiles.files[]\`
- [ ] (FULL only) decisions.md
- [ ] (FULL only) All files from \`lessons_learned.files[]\`

**Precedence Rules** (when conflicts arise):
1. **standards.md** = HIGHEST - Always takes precedence
2. **principles.md** = Guide interpretation of standards
3. **decisions.md** = Project-specific choices
4. **patterns/** = Reference implementations
5. **review-profiles/** = External best practices (lowest precedence)

**Example**: If a review profile suggests "always use async", but standards.md says "only use async when necessary", the standard wins.

### Step 5: Conduct AI Code Review

**Review Strategy**: Use the context files you loaded in Step 4 to assess the code.

**How to apply context during review**:
1. **Check standards.md first** - Does code violate any project standards?
2. **Apply principles.md** - Does code align with project philosophy?
3. **Reference patterns/** - Does code follow established patterns?
4. **Consider profiles/** - Does code follow language/framework best practices?
5. **Learn from lessons/** (FULL tier) - Have we made this mistake before?

**For HODGE-341.3 Risk-Based Review**:
- **Critical files** (from critical-files.md): Deep review against ALL loaded context
- **Files with tool issues** (from quality-checks.md): Check specific violations
- **Other changed files**: Scan for obvious standards violations

**What to look for**:
- Standards violations (especially BLOCKER severity)
- Test isolation violations (CRITICAL - see standards.md)
- TODO format violations (see standards.md)
- Cognitive complexity (see standards.md + profiles)
- File/function length standards
- Progressive enforcement rules (depends on phase)

**When you find an issue**:
1. Determine severity using standards.md definitions (BLOCKER/WARNING/SUGGESTION)
2. Note which standard/principle/profile it violates
3. Consider precedence if multiple sources conflict
4. Document in your review report with file:line reference

### Step 5.5: Verify Context Application

Before moving to Step 6, confirm you actually USED the context files:

**Self-Check Questions**:
- Did I reference specific standards from standards.md in my findings?
- Did I check for Test Isolation violations (mandatory standard)?
- Did I apply progressive enforcement rules based on current phase?
- Did I consider precedence when conflicts arose?
- Can I cite which standard/profile each issue violates?

**If you can't answer YES to these questions, return to Step 4 and re-load context.**

The purpose of loading context is to APPLY it, not just read it.

### Step 6: Assess Review Findings

After reviewing all files, determine if there are blocking issues.

**Question**: Did you find any ERRORS (not warnings) in quality-checks.md or during code review?

#### If YES (Errors Found) → STOP HERE 🚫

\`\`\`
🚫 STANDARDS PRE-CHECK FAILED - Blocking Issues Found

[List all errors with file:line references]

**MANDATORY**: Fix ALL errors before proceeding to harden validation.

Next steps:
1. Fix each error listed above
2. Re-run quality checks: \`hodge harden {{feature}} --review\`
3. Verify errors are resolved
4. Return to Step 2 of this workflow

DO NOT proceed to Step 7 until all errors are resolved.
\`\`\`

**Why this blocks**: Harden phase is "discipline mode". Errors indicate code that doesn't meet basic standards. The CLI validation will fail anyway, so catching errors early saves time.

#### If NO (Only Warnings or Clean) → Proceed to Step 7 ✅

Choose the appropriate status:

**Option A: No Issues Found**
\`\`\`
✅ STANDARDS PRE-CHECK PASSED
All standards requirements appear to be met.
No errors or warnings found. Ready to proceed with validation.
\`\`\`

**Option B: Warnings Only**
\`\`\`
⚠️ STANDARDS PRE-CHECK - Warnings Found:

[List specific warnings, e.g.:]
1. File length warnings in src/commands/harden.ts:445
2. Cognitive complexity in src/lib/critical-file-selector.ts:127
3. TODO comments need phase markers

These are WARNINGS (not blockers). Proceeding with harden validation.
Should address before ship phase.
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
- If you found ERRORS in Step 6, document them in the report and STOP - do not proceed to Command Execution
- If you found only warnings (Option B) or no issues (Option A), generate the report and proceed to Command Execution

## Command Execution (Only After Errors Are Fixed)

**CHECKPOINT**: Before running this command, confirm:
- [ ] Quality-checks.md shows 0 errors (warnings are OK)
- [ ] Your Step 6 assessment was "Option A" or "Option B" (no blocking issues)
- [ ] All error-level issues have been fixed

**If you found errors in Step 6, DO NOT PROCEED. Return to fix them first.**

Ready to proceed? Execute the Hodge CLI command:
\`\`\`bash
hodge harden {{feature}}
\`\`\`

Options:
\`\`\`bash
hodge harden {{feature}} --skip-tests  # Skip test execution (not recommended)
hodge harden {{feature}} --fix         # Auto-fix staged files (see Step 0)
\`\`\`

**Note**: The \`--fix\` flag should be run as Step 0 (before review). See the top of this file for the complete auto-fix workflow.

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
      content: `# Hodge Review Mode (HODGE-344.4)

## Overview

The \`/review\` command provides AI-orchestrated advisory code reviews for arbitrary file scopes with a review-first workflow. Unlike \`/harden\` which focuses on production readiness, \`/review\` helps you understand code quality issues before deciding what to fix.

**Supported Scopes:**
- \`--file <path>\` - Review single file
- \`--directory <path>\` - Review directory (all git-tracked files recursively)
- \`--last <N>\` - Review files from last N commits

**Workflow:**
1. **Review First**: CLI generates manifest and runs quality checks
2. **AI Interprets**: You read findings and explain issues conversationally
3. **Optional Fixes**: User chooses what to fix (if anything)
4. **Verify**: Re-run checks after fixes to confirm they worked

## Step 1: Execute Review Command

Parse the user's scope flags and execute the appropriate command:

**For single file review:**
\`\`\`bash
hodge review --file src/lib/config.ts
\`\`\`

**For directory review:**
\`\`\`bash
hodge review --directory src/commands/
\`\`\`

**For recent commits review:**
\`\`\`bash
hodge review --last 3
\`\`\`

The CLI will:
- Discover files using git utilities (validates tracked files)
- Generate review manifest with FULL tier and scope metadata
- Run quality checks (scoped where possible, project-wide for tools like tsc)
- Create review directory at \`.hodge/reviews/review-{scope}-{target}-{timestamp}/\`
- Write \`review-manifest.yaml\` and \`quality-checks.md\`
- Output directory path for you to read

## Step 2: Read Review Files

The CLI outputs the review directory path. Read the generated files:

\`\`\`bash
cat .hodge/reviews/review-{scope}-{target}-{timestamp}/review-manifest.yaml
cat .hodge/reviews/review-{scope}-{target}-{timestamp}/quality-checks.md
\`\`\`

**Important**: The exact directory name will be in the CLI output. Use that path.

## Step 3: Load Context Files (Based on Manifest)

The review manifest includes context files to load. For \`/review\`, always use **FULL tier** context:

**MUST load (from manifest)**:
1. \`.hodge/standards.md\` (project standards)
2. \`.hodge/principles.md\` (project principles)
3. \`.hodge/decisions.md\` (project decisions)
4. Each file in \`matched_patterns.files[]\` (prepend \`.hodge/patterns/\`)
5. Each file in \`matched_profiles.files[]\` (prepend \`.hodge/review-profiles/\`)
6. Each file in \`lessons_learned.files[]\` (prepend \`.hodge/lessons/\`)

**Context Application Precedence** (when conflicts arise):
1. **standards.md** = HIGHEST - Always takes precedence
2. **principles.md** = Guide interpretation of standards
3. **decisions.md** = Project-specific choices
4. **patterns/** = Reference implementations
5. **review-profiles/** = External best practices (lowest precedence)

## Step 4: Interpret Findings and Present to User

Parse \`quality-checks.md\` to understand what tools found:

**Your Analysis**:
- Identify issues by severity (errors vs warnings)
- Explain what each issue means in plain language
- Reference relevant standards/patterns/profiles
- Distinguish auto-fixable issues (formatters, linters) from manual issues (type errors, logic bugs)
- Consider scope context (user chose these specific files for a reason)

**Present Findings Conversationally**:
\`\`\`
I reviewed {N} files in {scope} and found:

**Blockers** (must fix):
- {issue 1} in {file}:{line} - {explanation}
- {issue 2} in {file}:{line} - {explanation}

**Warnings** (should address):
- {issue 3} in {file}:{line} - {explanation}

**Suggestions** (optional improvements):
- {issue 4} in {file}:{line} - {explanation}

{Provide context about why these issues matter, reference standards/patterns}
\`\`\`

**No Issues Found**:
If quality checks show all tools passed with no output, celebrate!
\`\`\`
✅ No issues found! All {N} files in {scope} meet quality standards.

- Type checking: ✓ Passed
- Linting: ✓ Passed
- Testing: ✓ Passed
- Formatting: ✓ Passed

{Brief summary of what was checked}
\`\`\`

## Step 5: Facilitate Fix Selection

Ask the user which issues they want to fix:

\`\`\`
Would you like to fix any of these issues?

You can:
a) Fix all auto-fixable issues (formatters + linters)
b) Select specific issues to fix
c) Skip fixes and just document findings

Your choice (or ask questions for more detail):
\`\`\`

**Handle User Response**:
- **Option (a)**: Proceed to Step 6 with all auto-fixable issues
- **Option (b)**: Let user specify (e.g., "1, 3, 5" or "issues in config.ts" or "just the blockers")
- **Option (c)**: Skip to Step 8 (write report, no fixes)
- **Questions**: If user asks for clarification, provide detailed analysis conversationally, then return to this question

## Step 6: Apply Fixes (If User Chooses)

### Step 6a: Auto-Fix First

Run auto-fix for formatters and linters:

\`\`\`bash
hodge review --file src/lib/config.ts --fix
\`\`\`

Use the **same scope flags** as Step 1. The \`--fix\` flag runs:
- Formatters first (prettier, black, google-java-format, ktlint)
- Then linters (eslint --fix, ruff --fix)

**Note**: Auto-fix modifies files but doesn't stage them (non-intrusive).

### Step 6b: Manual Fixes (If Needed)

For issues that can't be auto-fixed (type errors, logic bugs, complex refactoring):

Use the **Edit tool** to apply fixes:
\`\`\`typescript
// Example: Fix type error
Edit({
  file_path: "src/lib/config.ts",
  old_string: "const value: string = 123;",
  new_string: "const value: number = 123;"
});
\`\`\`

**Important**: Apply fixes thoughtfully. Explain changes to the user as you make them.

## Step 7: Re-run Quality Checks

After applying fixes, verify they worked:

\`\`\`bash
hodge review --file src/lib/config.ts
\`\`\`

Use the **same scope flags** as Step 1 (without \`--fix\`).

This will:
- Create a new review directory with fresh results
- Show updated quality check output
- Confirm fixes resolved the issues

Read the new results and report back to the user:
\`\`\`
✅ Fixes verified! Re-running quality checks shows:

{Summary of what changed}
- Type errors: {N} → 0
- Linting issues: {N} → 0

{Confirmation that specific issues are resolved}
\`\`\`

## Step 8: Write Review Report

Use the **Write tool** to create a review report documenting findings and fixes:

\`\`\`markdown
# Code Review Report: {scope} - {target}

**Reviewed**: {ISO timestamp}
**Scope**: {scope type} - {target}
**Files Reviewed**: {N} files

## Summary
- 🚫 **{N} Blockers** (must fix)
- ⚠️ **{N} Warnings** (should address)
- 💡 **{N} Suggestions** (optional improvements)

## Findings

### Blockers

[List blocker issues found, with file:line references]

### Warnings

[List warning issues found]

### Suggestions

[List suggestion-level issues]

## Fixes Applied

{If fixes were applied:}
- Auto-fixed: {list of formatter/linter fixes}
- Manual fixes: {list of Edit tool changes}
- Verification: All fixes verified via re-run

{If no fixes applied:}
No fixes applied at user's request. Issues documented for future reference.

## Conclusion

{Overall assessment of code quality}
{Recommendations for next steps if any issues remain}
\`\`\`

Save the report to the review directory:

\`\`\`typescript
Write({
  file_path: ".hodge/reviews/review-{scope}-{target}-{timestamp}/review-report.md",
  content: "{report content from above}"
});
\`\`\`

## Step 9: Conclude Review

Inform the user that the review is complete:

\`\`\`
✅ Review complete!

**Summary**:
- Reviewed {N} files in {scope}: {target}
- {Issues summary}
- {Fixes summary if applicable}

**Review report saved** to:
.hodge/reviews/review-{scope}-{target}-{timestamp}/review-report.md

You can reference this review later or delete the directory if no longer needed.

{If issues remain, provide guidance on next steps}
\`\`\`

## Important Notes

### Review vs Harden

\`/review\` is **advisory** (understand → optionally fix):
- Review first, fix optionally
- All files reviewed equally (no critical selection)
- Always FULL tier (comprehensive analysis)
- User controls what gets fixed

\`/harden\` is **production validation** (fix → validate):
- Auto-fix first, then validate
- Critical files prioritized by risk
- Tier varies based on change size
- Errors must be fixed before shipping

### Edge Cases

**Empty File Lists**:
If CLI reports "No files to review", explain why:
- File not found or not git-tracked → Suggest \`git add\`
- Directory has no tracked files → Check \`.gitignore\`
- No commits in range → Verify git history

**Large Scope Warnings**:
If CLI warns about large scope (e.g., \`--last 100\` with 500 files), acknowledge:
- Processing may take time
- Consider reducing scope if it's too much
- User explicitly chose this scope, so respect their decision

**Tool Failures**:
If quality-checks.md shows tools skipped or failed:
- Explain what happened (tool not found, configuration issue)
- Note that findings may be incomplete
- Suggest installing missing tools if needed

### Quality Check Scoping

Some tools receive scoped file lists, others run project-wide:

**Scoped** (only check specified files):
- eslint
- prettier
- black
- ruff

**Project-wide** (always check entire project):
- tsc (TypeScript)
- vitest (tests need full context)

This is documented in quality-checks.md for each tool.

## Error Handling

If the command fails:
- Check error message for specific issue
- Common causes: invalid path, file not tracked, git command failed
- Provide guidance based on error type
- Don't crash the conversation - help user recover

ARGUMENTS: {{flags}}
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
