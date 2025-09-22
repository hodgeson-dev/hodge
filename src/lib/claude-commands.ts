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

## PM Integration
Decisions about features are synchronized with project management tools when configured.

## Feature Extraction from Decisions
After making decisions, review them to identify potential features:

### Extraction Process
1. **Review recent decisions** (last 5-10):
   - Look for related technical choices
   - Identify coherent work boundaries
   - Find natural feature groupings

2. **For each potential feature, present for review**:
   \`\`\`
   ## Proposed Feature {{number}} of {{total}}

   **Feature Name**: {{feature_name}}
   **Description**: {{brief_description}}

   **Related Decisions**:
   - {{decision_1}}
   - {{decision_2}}
   - {{decision_3}}

   **Scope**: {{what_it_includes}}
   **Out of Scope**: {{what_it_excludes}}
   **Dependencies**: {{any_dependencies}}
   **Estimated Effort**: {{small/medium/large}}

   Options:
   a) Accept as-is
   b) Modify (you'll specify changes)
   c) Split into smaller features
   d) Merge with another feature
   e) Skip (not ready for feature)

   Your choice:
   \`\`\`

3. **After user approval/modification**:

   First, create the feature specification file:
   \`\`\`yaml
   # .hodge/tmp/feature-extraction/{{timestamp}}-{{feature_name}}.yaml
   version: "1.0"
   metadata:
     extracted_at: "{{current_iso_timestamp}}"
     extracted_by: "Claude"

   feature:
     name: "{{approved_feature_name}}"
     description: "{{feature_description}}"

     decisions:
       - text: "{{decision_1}}"
         date: "{{decision_1_date}}"
       - text: "{{decision_2}}"
         date: "{{decision_2_date}}"

     rationale: |
       {{why_these_decisions_form_coherent_feature}}

     scope:
       included:
         - "{{included_item_1}}"
         - "{{included_item_2}}"
       excluded:
         - "{{excluded_item_1}}"

     dependencies:
       - "{{dependency_1}}"

     effort: "{{effort_estimate}}"
     priority: {{priority_number}}

     exploration_areas:
       - area: "{{exploration_area_1}}"
         questions:
           - "{{question_1}}"
           - "{{question_2}}"
   \`\`\`

   Save this to: \`.hodge/tmp/feature-extraction/{{timestamp}}-{{feature_name}}.yaml\`

   Then create the feature from the specification:
   \`\`\`bash
   hodge explore "{{approved_feature_name}}" --from-spec .hodge/tmp/feature-extraction/{{timestamp}}-{{feature_name}}.yaml
   \`\`\`

   The feature is now created and ready for exploration. The specification file is preserved for reference.

### Feature Identification Guidelines
- **Cohesive**: Feature should have a single clear purpose
- **Loosely-coupled**: Minimize dependencies on other features
- **Testable**: Clear success criteria from decisions
- **Valuable**: Delivers concrete user or developer value
- **Right-sized**: Can be built in 1-3 days

### Example Feature Extraction Flow
\`\`\`
From decisions:
- "Use TypeScript decorators for command metadata"
- "Implement command registry pattern"
- "Add runtime validation for command options"

Proposed Feature:
Name: command-metadata-system
Description: Decorator-based command registration with validation
Scope: Decorators, registry, runtime validation
Dependencies: None (foundational)
Effort: Medium (2 days)

User chooses: b) Modify
User specifies: "Rename to 'command-decorators' and reduce scope to just decorators"

Updated Feature:
Name: command-decorators
Description: TypeScript decorators for command metadata
Scope: Decorator implementation only
Dependencies: None
Effort: Small (1 day)

# Save specification:
cat > .hodge/tmp/feature-extraction/$(date +%Y%m%d-%H%M%S)-command-decorators.yaml << 'EOF'
version: "1.0"
feature:
  name: "command-decorators"
  description: "TypeScript decorators for command metadata"
  decisions:
    - text: "Use TypeScript decorators for command metadata"
  scope:
    included: ["Decorator implementation only"]
  effort: "1 day"
EOF

# Create feature from spec:
hodge explore "command-decorators" --from-spec .hodge/tmp/feature-extraction/[filename].yaml

Result: Feature created with full context, spec file preserved
\`\`\`

### PM Integration
Features extracted from decisions will be tracked in project management.

## Next Steps Menu
After decisions are recorded and features reviewed:
\`\`\`
### Next Steps
Choose your next action:
a) Start exploring extracted feature → \`/explore {{feature}}\`
b) Start building existing feature → \`/build {{feature}}\`
c) Review all decisions → \`/status\`
d) View project roadmap → \`hodge status\`
e) Continue development
f) Done for now

Enter your choice (a-f):
\`\`\`

Remember: The CLI handles decision recording and PM updates. Focus on making thoughtful technical choices and organizing work into manageable features.`,
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

### 1. Check Lessons from Similar Features
\`\`\`bash
# Search for relevant lessons
ls -la .hodge/lessons/ | grep -i "{{feature-keyword}}"

# Review any relevant lessons found
cat .hodge/lessons/SIMILAR-FEATURE.md
\`\`\`
Consider what worked well and what to avoid based on past experience.

### 2. Review Applicable Patterns
\`\`\`bash
# List available patterns
ls -la .hodge/patterns/

# Review patterns that might apply to {{feature}}
cat .hodge/patterns/relevant-pattern.md
\`\`\`
Consider which patterns might guide your exploration.

### 3. Check Related Principles
\`\`\`bash
# Review principles for exploration phase guidance
grep -A 5 "Explore" .hodge/principles.md
\`\`\`
Remember: "Freedom to explore" - Standards are suggestions only in this phase.

## Your Tasks After CLI Command
1. Review the exploration template at \`.hodge/features/{{feature}}/explore/exploration.md\`
2. Review test intentions at \`.hodge/features/{{feature}}/explore/test-intentions.md\`
3. Generate 2-3 different implementation approaches
4. For each approach:
   - Create a quick prototype or code sketch
   - Note pros/cons
   - Consider integration with existing stack
5. Update test intentions with discoveries
6. Document your recommendation
7. **IMPORTANT: Document Decisions Needed**
   Add a section to exploration.md titled "## Decisions Needed" that lists:
   - Implementation approach decision (which approach to use)
   - Scope decisions (what's in/out of scope)
   - Technical choices (libraries, patterns, architecture)
   - Naming decisions (if any naming conventions need deciding)
   - Testing strategy (how to test this feature)
   - TODO resolutions (which existing TODOs this might address)

   These decisions will be presented by \`/decide\` for resolution.

## Exploration Guidelines
- Standards are **suggested** but not enforced
- Multiple approaches encouraged
- Focus on rapid prototyping and idea validation
- Be creative and explore alternatives
- **No tests required** - only test intentions (what should it do?)

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

## ⚠️ REQUIRED: Pre-Harden Standards Review

**STOP! You MUST complete this AI Standards Review BEFORE running the harden command.**

### Step 1: Review Recent Changes
\`\`\`bash
# Review all changes in this feature
git diff main...HEAD -- . ':(exclude).hodge/features/'

# Or if on main branch
git diff HEAD~5..HEAD -- . ':(exclude).hodge/features/'
\`\`\`

### Step 2: Load Standards for Reference
\`\`\`bash
cat .hodge/standards.md | head -60  # Review key standards
\`\`\`

### Step 3: AI Standards Compliance Checklist
**You MUST check each item below:**

- [ ] **TypeScript Standards**
  - Are there any \`any\` types that should be properly typed?
  - Are all function return types appropriate?
  - Is strict mode being followed?

- [ ] **Testing Requirements**
  - Are there integration tests (not just smoke tests)?
  - Do tests verify behavior, not implementation?
  - Is the Test Isolation Requirement followed (no .hodge modifications)?

- [ ] **Code Comments & TODOs**
  - Are all TODOs in format: \`// TODO: [phase] description\`?
  - Are there any naked TODOs without descriptions?
  - Should any TODOs be resolved before hardening?

- [ ] **Performance Standards**
  - Will CLI commands respond within 500ms?
  - Are there any synchronous operations that should be async?
  - Any unnecessary blocking operations?

- [ ] **Error Handling**
  - Is error handling comprehensive?
  - Are errors logged appropriately?
  - Do errors fail gracefully?

### Step 4: Report Standards Assessment
Based on your review, choose ONE:

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

## Command Execution (After Pre-Check)

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
- Loads existing context for a feature or project
- Shows current state (exploration, decisions, build progress)
- Suggests possible next actions

**What this command does NOT do:**
- Does NOT automatically start building
- Does NOT run any development commands
- Does NOT make assumptions about what you want to do next
- Simply loads context and waits for your direction

## Usage Patterns
- \`/hodge\` - Load project context and offer recent saves
- \`/hodge {{feature}}\` - Load context for specific feature
- \`/hodge --recent\` - Auto-load most recent save
- \`/hodge --list\` - Show all available saved contexts

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

{{#if list}}
### 2. Handle List Mode - Available Saved Sessions (Fast Listing)
\`\`\`bash
# Use optimized load command to list saves
hodge load --list
\`\`\`

This quickly scans manifests to show all saved sessions (20-30x faster than before).

{{else if recent}}
### 2. Handle Recent Mode - Loading Most Recent Session (Optimized)
\`\`\`bash
# Use new optimized load command with lazy loading
hodge load --recent --lazy
\`\`\`

This uses the new 20-30x faster loading system to instantly restore your session.

{{else if feature}}
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

Check for recent saves (Fast Scan):
\`\`\`bash
# Quick manifest scan to find saves
hodge load --list
\`\`\`

Found saved sessions:
{{#each saves}}
**{{name}}**
- Feature: {{feature}}
- Mode: {{mode}}
- Saved: {{timestamp}}
- Summary: {{summary}}
{{/each}}

**Restoration Options:**

{{#if saves}}
Would you like to:
a) Restore most recent: "{{most_recent_save}}"
b) Choose a different save
c) Start fresh without restoring
d) View more details about saves

Your choice:
{{else}}
No saved sessions found. Starting fresh.
{{/if}}

{{/if}}

## Core Principles
Before starting work, remember:
- **AI analyzes, backend executes** - You design, hodge implements
- **Complex data through files** - Use .hodge/tmp/ for structured data
- **Templates guide conversations** - Don't document hodge internals
- **Preserve context** - Spec files and saves are documentation, not trash
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
- \`/save\` - Save current progress

{{else}}
### Available Commands
- \`/explore {{feature}}\` - Start exploring a new feature
- \`/build {{feature}}\` - Build a feature with standards
- \`/decide {{decision}}\` - Record a decision
- \`/ship {{feature}}\` - Ship feature to production
- \`/status\` - Check current status
- \`/save {{name}}\` - Save session context
- \`/review\` - Review current work

### Quick Actions
{{#if current_feature}}
Continue with {{current_feature}}:
- Next: {{suggested_next_command}}
{{else}}
Start with:
- \`/explore {{new_feature}}\` for new work
- \`/hodge --list\` to see saved sessions
{{/if}}

{{/if}}

## Session Best Practices

1. **Start each session with \`/hodge\`** to load context
2. **Use \`/save\` before breaks** to preserve progress
3. **Run \`/hodge {{feature}}\`** when switching features
4. **Check \`/hodge --list\`** if you've lost track

## Implementation Note

The \`/hodge\` command coordinates with the Hodge CLI to:
- Generate fresh context via \`hodge status\`
- Discover saved sessions in \`.hodge/saves/\`
- Load feature-specific files from \`.hodge/features/\`
- Ensure principles and standards are available

## Context Loading Complete

**This command has finished loading context. No actions have been taken.**

What would you like to do next?`,
    },
    {
      name: 'load',
      content: `# Hodge Load - Fast Session Restoration

Load a previously saved session context using optimized lazy loading.

**✨ NEW: Loading is now 20-30x faster with lazy manifest loading!**

## Command Execution

{{#if name}}
### Loading Specific Save: {{name}}

\`\`\`bash
# Use optimized load with lazy loading
hodge load "{{name}}" --lazy
\`\`\`

{{else}}
### Loading Most Recent Save

\`\`\`bash
# Load most recent save automatically
hodge load --recent
\`\`\`

{{/if}}

## Restoration Process

### 1. Auto-Save Current Work (if needed)
\`\`\`bash
# Quick minimal save before switching
hodge save "auto-$(date +%Y%m%d-%H%M%S)" --minimal
\`\`\`

### 2. Execute Optimized Load

\`\`\`bash
{{#if name}}
hodge load "{{name}}" --lazy
{{else}}
hodge load --recent
{{/if}}
\`\`\`

**What gets loaded:**
- Context files from \`.hodge/saves/{{name}}/\`
- Feature-specific files if present
- Session metadata and state

**Present restoration summary:**
\`\`\`
✅ Session Restored: {{save_name}}

## Key Context
- Feature: {{feature}}
- Mode: {{mode}}
- Timestamp: {{timestamp}}

## Quick Resume Commands
{{#if mode === 'explore'}}
- Continue with \`/explore {{feature}}\`
{{else if mode === 'build'}}
- Continue with \`/build {{feature}}\`
{{else if mode === 'harden'}}
- Continue with \`/harden {{feature}}\`
{{else}}
- Continue with \`/ship {{feature}}\`
{{/if}}

---
Ready to continue where you left off!
\`\`\`

## Performance Optimization

The new \`hodge load\` command uses optimized \`SaveManager\`:
- **Manifest-first loading**: <100ms for metadata
- **Lazy loading**: Files loaded only when accessed
- **Smart caching**: Recently accessed data kept in memory
- **Incremental updates**: Apply only changes since last save

### Loading Performance

| What | Old Time | New Time | Improvement |
|------|----------|----------|-------------|
| Manifest only | 2-3s | <100ms | 20-30x faster |
| Full context | 2-3s | 500ms | 4-6x faster |
| Recent save list | 1-2s | <50ms | 20-40x faster |

## Load Validation

Manifest validation is automatic:
\`\`\`bash
# Validates manifest version and structure
hodge context load {{name}} --validate
\`\`\`

If manifest is missing or invalid:
\`\`\`
⚠️ Save "{{name}}" uses old format or is corrupted.
Falling back to legacy load method...
\`\`\`

## Implementation Note

Both \`/load\` and \`/hodge\` commands currently use the same loading mechanism:
- Both delegate to \`hodge context\` CLI command
- Both provide session restoration
- Optimized loading exists in code but awaits CLI integration

Remember: Loading replaces current session context but preserves it in auto-save first.`,
    },
    {
      name: 'review',
      content: `# Hodge Review - Intelligent Checkpoint

Execute a comprehensive review of the current work session.

## Review Scope: {{type || "all"}}

## Review Process

### 1. Analyze Current Context
- Check \`.hodge/context.md\` for session state
- Scan \`.hodge/features/*/\` for active work
- Review recent file modifications

### 2. Decision Analysis
Review \`.hodge/decisions.md\` and categorize:

#### Decisions Made ✓
- List all decisions recorded in this session
- Group by category (architecture, patterns, tools)
- Note impact on current work

#### Pending Decisions ⏳
Scan conversation history and code for:
- Questions raised but not answered
- "Should we..." statements without resolution
- Alternative approaches mentioned but not chosen
- TODOs and FIXMEs in code

#### Gaps Detected 🔍
Proactively identify what hasn't been discussed:
- Missing error handling strategies
- Unaddressed performance considerations
- Security measures not yet considered
- Testing approaches not defined
- Deployment strategy gaps
- Monitoring/observability needs
- Documentation requirements
- Team collaboration aspects

### 3. Feature Progress
For each feature in \`.hodge/features/\`:
- Current mode (explore/build/harden)
- Completion percentage
- Blockers identified
- Next recommended actions

### 4. Standards & Patterns Status
- New patterns detected (candidates for \`hodge learn\`)
- Standards violations found
- Consistency issues across features

## Output Format
\`\`\`
# Hodge Review Report

## Session Summary
- Active Feature: {{current_feature}}
- Mode: {{current_mode}}
- Session Duration: {{time}}
- Files Modified: {{count}}

## Decisions Tracker

### ✓ Decisions Made ({{count}})
1. Architecture: [Decision] - [Rationale]
2. Patterns: [Decision] - [Rationale]
...

### ⏳ Pending Decisions ({{count}})
1. **[Topic]**: [Question/Choice needed]
   - Option A: [Pros/Cons]
   - Option B: [Pros/Cons]
   - Recommendation: [If any]

2. **[Topic]**: [Question/Choice needed]
...

**Quick Decide**: Run \`/decide\` to address these

### 🔍 Gaps Identified ({{count}})
1. **[Area]**: [What's missing]
   - Why it matters: [Impact]
   - Suggested action: [Next step]

2. **[Area]**: [What's missing]
...

## Feature Status
### {{feature_name}}
- Mode: {{mode}}
- Progress: {{progress_bar}} {{percentage}}%
- Next: {{recommended_action}}

## Recommendations
1. **Immediate**: [Most pressing action]
2. **Next Session**: [What to tackle next]
3. **Future Consideration**: [Long-term items]

## Quick Actions
- Address pending decisions: \`/decide\`
- Continue current feature: \`/build\`
- Save session: \`/save\`
\`\`\`

Remember: Review is about providing clarity on where you are, what's been decided, what needs deciding, and what you haven't thought about yet.`,
    },
    {
      name: 'save',
      content: `# 💾 Hodge Save - Optimized Session Management

## Purpose
Save your current work context for fast resumption later.

**NEW: Saves are now 5-10x faster using manifest-based incremental saves!**

## Usage
\`\`\`
/save                     # Quick save with auto-generated name
/save {{name}}           # Save with custom name
/save {{name}} --minimal # Ultra-fast manifest-only save (<100ms)
\`\`\`

## What Gets Saved (AI Context Only)

### Essential Context (Always Saved)
- 📝 **Your understanding** of the problem
- 🎯 **Decisions made** and their rationale
- 💡 **Key insights** discovered
- 🛤️ **Approach** being taken
- ⏭️ **Next steps** planned
- 📊 **Current progress** state

### References (Not Copied)
- 🔗 Links to exploration files
- 🔗 Links to build plans
- 🔗 Links to test results
- 🔗 Git commit references

## What Does NOT Get Saved

### Never Saved (Regeneratable)
- ❌ File contents (git has those)
- ❌ Test outputs (can re-run)
- ❌ Build artifacts (can rebuild)
- ❌ Generated documentation
- ❌ node_modules or dependencies
- ❌ Coverage reports
- ❌ Log files

### Why This Is Faster
Instead of copying entire directories, we now:
1. Create a lightweight manifest (instant)
2. Store only changed references (fast)
3. Use incremental saves when possible
4. Defer file loading until needed

## Save Types

### Minimal Save (Recommended)
\`\`\`bash
hodge save {{name}} --minimal
\`\`\`
- **Speed**: <100ms
- **Size**: ~5KB
- **Contains**: Manifest only with references
- **Use when**: Quick checkpoint needed

### Incremental Save (Default for auto-save)
\`\`\`bash
hodge save {{name}} --incremental
\`\`\`
- **Speed**: <500ms
- **Size**: ~10-50KB
- **Contains**: Manifest + changes since last save
- **Use when**: Regular progress saves

### Full Save (Rarely needed)
\`\`\`bash
hodge save {{name}} --full
\`\`\`
- **Speed**: 1-2s
- **Size**: Variable
- **Contains**: Complete context snapshot
- **Use when**: Major milestone or before risky changes

## Examples

### Quick checkpoint
\`\`\`
/save
\`\`\`
Creates: \`checkpoint-HODGE-123-2025-09-20\`

### Named save
\`\`\`
/save before-refactor
\`\`\`
Creates: \`before-refactor\`

### Ultra-fast save
\`\`\`
/save quick --minimal
\`\`\`
Creates: \`quick\` (manifest only, <100ms)

## Loading Saves

### Fast Load (Manifest + Summary)
\`\`\`
/hodge --recent           # Load most recent (fast)
/hodge {{feature}}        # Load specific feature (fast)
\`\`\`

### Full Load (When needed)
\`\`\`
/hodge {{save}} --full    # Load everything
\`\`\`

## Auto-Save Behavior

Auto-saves now use incremental saves:
- First save: Full snapshot
- Subsequent saves: Incremental (within 30 min)
- After 30 minutes: New full snapshot
- Performance: 50-100ms for incremental

## Command Execution

{{#if name}}
### Saving with name: {{name}}

\`\`\`bash
# Execute optimized save
hodge save "{{name}}" {{#if minimal}}--minimal{{/if}} {{#if incremental}}--incremental{{/if}} {{#if full}}--full{{/if}}
\`\`\`

{{else}}
### Creating auto-save

\`\`\`bash
# Generate timestamp-based name
SAVE_NAME="save-$(date +%Y%m%d-%H%M%S)"
hodge save "$SAVE_NAME" --minimal
\`\`\`

{{/if}}

After the save completes, provide:
1. Save location and size
2. Time taken
3. What was preserved (based on manifest)
4. How to load it later

## Integration with Hodge CLI

The \`/save\` command works with \`hodge save\`:

**Claude Code (\`/save\`)** saves:
- AI context and understanding
- Decision rationale
- Problem-solving approach

**Hodge CLI (\`hodge save\`)** saves:
- File modification state
- Git status
- Technical markers

Both use the same optimized manifest system.

## Performance Comparison

| Operation | Old System | New System | Improvement |
|-----------|------------|------------|-------------|
| Auto-save | 2-3s | 50-100ms | 20-60x faster |
| Manual save | 2-3s | <500ms | 4-6x faster |
| Minimal save | N/A | <100ms | New feature |
| Load manifest | 2-3s | <100ms | 20-30x faster |
| Full load | 2-3s | 500ms-1s | 2-3x faster |

## Tips

1. **Use minimal saves** for quick checkpoints during exploration
2. **Let auto-save handle** incremental progress tracking
3. **Full saves only** before major changes or at milestones
4. **Load lazily** - start with manifest, load files as needed
5. **Trust git** for file contents, save only context

## Advanced Options

\`\`\`bash
# Skip generated files (default behavior)
hodge save {{name}} --no-generated

# Include everything (slow, not recommended)
hodge save {{name}} --include-all

# Clean old auto-saves
hodge save --clean-auto --older-than 7d
\`\`\`

## Troubleshooting

**Save too slow?**
- Use \`--minimal\` for quick saves
- Check if you're accidentally including generated files

**Save too large?**
- Review excluded patterns in manifest
- Use incremental saves more often

**Can't resume properly?**
- Check manifest references are valid
- Ensure git status is clean

---
*Remember: Saves are for context, not backups. Use git for version control.*`,
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
Save the message to the interaction state and proceed with shipping:
\`\`\`bash
# Save the approved message to both ui.md AND state.json for hodge ship to use
mkdir -p .hodge/temp/ship-interaction/{{feature}}

# Save to ui.md for display
cat > .hodge/temp/ship-interaction/{{feature}}/ui.md << 'EOF'
# Ship Commit - {{feature}}

## Approved Commit Message

\`\`\`
[The approved commit message]
\`\`\`
EOF

# Save to state.json with "edited" status so ship command uses it
cat > .hodge/temp/ship-interaction/{{feature}}/state.json << 'EOF'
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
EOF

# Run ship with the message (it will detect and use the edited state)
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
Then save their edited version to state files:
\`\`\`bash
# Save the edited message to both ui.md AND state.json
mkdir -p .hodge/temp/ship-interaction/{{feature}}

cat > .hodge/temp/ship-interaction/{{feature}}/ui.md << 'EOF'
# Ship Commit - {{feature}}

## Edited Commit Message

\`\`\`
[User's edited commit message]
\`\`\`
EOF

cat > .hodge/temp/ship-interaction/{{feature}}/state.json << 'EOF'
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
EOF

# Run ship with the edited message
hodge ship "{{feature}}"
\`\`\`

**If (c) Cancel:**
\`\`\`bash
echo "Ship cancelled. Your changes remain uncommitted."
echo "Run '/ship {{feature}}' when ready to try again."
\`\`\`

## Step 4: Ship Quality Checks
The ship command will:
- ✅ Run all tests
- ✅ Check code coverage
- ✅ Verify documentation
- ✅ Create git commit with approved message
- ✅ Update PM tracking
- ✅ Learn patterns from shipped code

## Step 5: Capture lessons learned
After shipping, reflect on what was learned:

### Consider Global Improvements
- **Pattern Candidate**: Did you create reusable code that could become a pattern?
- **Standards Update**: Should any standards be updated based on this work?
- **Tool Enhancement**: Any workflow improvements to suggest?

### Document Lessons
\`\`\`bash
# Create lessons learned entry
lessons_file=".hodge/lessons/$feature-$(date +%Y%m%d).md"
mkdir -p .hodge/lessons

cat > "$lessons_file" << EOF
# Lessons from $feature

## What Worked Well
- [Document successes]

## Challenges Faced
- [Document challenges and solutions]

## Patterns Discovered
- [Any reusable patterns identified]

## Recommendations
- [Future improvements]

EOF
\`\`\`

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
