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

## Command Execution

### For Single Decision
Claude will execute the following backend operation:
\`\`\`bash
hodge decide "{{decision}}"
\`\`\`

With feature association:
\`\`\`bash
hodge decide "{{decision}}" --feature {{feature}}
\`\`\`

## What This Does
Records the decision with appropriate context and associations.

## After Command Execution
The decision is recorded and ready for reference.

## Interactive Decision Mode
If you need to make multiple decisions or review pending ones:

1. **Gather pending decisions from**:
   - Code comments (TODO, FIXME, QUESTION)
   - Previous exploration notes
   - Uncommitted changes
   - Open questions in conversation

2. **Present each decision**:
   \`\`\`
   ## Decision {{number}} of {{total}}

   **Topic**: {{decision_topic}}
   **Context**: {{brief_context}}

   Options:
   a) {{option_1}}
      Pros: {{pros}}
      Cons: {{cons}}

   b) {{option_2}}
      Pros: {{pros}}
      Cons: {{cons}}

   c) Skip for now
   d) Need more exploration

   Your choice:
   \`\`\`

3. **For each decision made**:
   \`\`\`bash
   hodge decide "{{chosen_option_description}}" --feature {{feature}}
   \`\`\`

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
Choose your next action:
a) Review and decide on approach → \`/decide\`
b) Continue exploring another aspect
c) Start building with [recommended approach name] → \`/build {{feature}}\`
d) Save progress → \`/save\`
e) Check status → \`/status {{feature}}\`
f) Done for now

Enter your choice (a-f):

Note: Option (c) will use the recommended approach. Use option (a) to choose a different approach.
\`\`\`

Remember: The CLI handles all the file creation and PM integration. Focus on generating creative solutions and documenting approaches.`,
    },
    {
      name: 'harden',
      content: `# Hodge Harden Mode

## Command Execution
Execute the portable Hodge CLI command:
\`\`\`bash
hodge harden {{feature}}
\`\`\`

Options:
\`\`\`bash
hodge harden {{feature}} --skip-tests  # Skip test execution
hodge harden {{feature}} --auto-fix    # Attempt to auto-fix linting issues
\`\`\`

## What This Does
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

## After Command Execution
The CLI will output:
- Strict AI context for production requirements
- Validation results for each check
- Overall pass/fail status
- Detailed report location

## Your Tasks Based on Results

### If Validation Passed ✅
1. Review the harden report
2. Ensure all production requirements are met
3. Consider proceeding to ship

### If Validation Failed ❌
1. Review the detailed output in the report
2. Fix each failing check:
   - **Integration tests failing**: Write or fix integration tests (behavior verification)
   - **Smoke tests failing**: Fix basic functionality issues
   - **Linting errors**: Run with \`--auto-fix\` or fix manually
   - **Type errors**: Fix TypeScript issues
   - **Build errors**: Resolve compilation problems
3. Write integration tests if missing:
   \`\`\`typescript
   import { integrationTest } from '../test/helpers';
   import { withTestWorkspace } from '../test/runners';

   integrationTest('should create expected files', async () => {
     await withTestWorkspace('test', async (workspace) => {
       await workspace.hodge('{{feature}}');
       expect(await workspace.exists('expected-file')).toBe(true);
     });
   });
   \`\`\`
4. Re-run \`hodge harden {{feature}}\`

## Testing Requirements (Progressive Model)
- **Harden Phase**: Integration tests required
- **Test Types**: Smoke + Integration tests
- **Focus**: Does it behave correctly end-to-end?
- **Run Commands**:
  - \`npm run test:integration\` - Behavior verification
  - \`npm run test:smoke\` - Basic functionality
- Use test utilities from \`src/test/helpers.ts\` and \`src/test/runners.ts\`

## Production Checklist
Ensure these are complete:
- [ ] Integration tests passing (behavior verification)
- [ ] Smoke tests passing (basic functionality)
- [ ] No linting errors or warnings
- [ ] TypeScript strict mode passing
- [ ] Build succeeds without errors
- [ ] Error handling comprehensive
- [ ] Input validation complete
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation updated

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

Remember: The CLI runs all validation automatically. Focus on fixing any issues found and ensuring production readiness.`,
    },
    {
      name: 'hodge',
      content: `# Hodge - Session & Context Manager

## Purpose
Initialize or resume your Hodge development session with appropriate context.

## Usage Patterns
- \`/hodge\` - Load project context and offer recent saves
- \`/hodge {{feature}}\` - Load context for specific feature
- \`/hodge --recent\` - Auto-load most recent save
- \`/hodge --list\` - Show all available saved contexts

## Command Execution

{{#if list}}
### Available Saved Sessions
\`\`\`bash
hodge context --list
\`\`\`

This shows all saved sessions with details.

{{else if recent}}
### Loading Most Recent Session
\`\`\`bash
hodge context --recent
\`\`\`

This loads the most recent save and displays the context for resuming work.

{{else if feature}}
### Loading Feature-Specific Context

First, load the project context:
\`\`\`bash
hodge status
\`\`\`

Review \`.hodge/HODGE.md\` for current project state.

Then check for feature-specific saves:
\`\`\`bash
hodge context --feature {{feature}}
\`\`\`

Load feature exploration/build files:
- \`.hodge/features/{{feature}}/explore/exploration.md\`
- \`.hodge/features/{{feature}}/build/build-plan.md\`
- \`.hodge/features/{{feature}}/linked-decisions.md\`

{{else}}
### Standard Session Initialization

1. **Load Current Project State**
   \`\`\`bash
   hodge context
   \`\`\`

   Review the generated \`.hodge/HODGE.md\` file for:
   - Current feature and mode
   - Recent decisions
   - Active standards
   - Working files

2. **Check for Recent Saves**

   The context command will automatically discover and display recent saves.

   Found saved sessions:
   {{#each saves}}
   **{{name}}**
   - Feature: {{feature}}
   - Mode: {{mode}}
   - Saved: {{timestamp}}
   - Summary: {{summary}}
   {{/each}}

3. **Restoration Options**

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

Ready to start development. What would you like to work on?`,
    },
    {
      name: 'load',
      content: `# Hodge Load - Restore Session Context

Load a previously saved session context.

{{#if name}}
## Loading Specific Save: {{name}}

Look for \`.hodge/saves/{{name}}/\` and restore from it.

{{else}}
## Loading Latest Save

### 1. Find Most Recent Save

Scan \`.hodge/saves/\` directory for the most recent save based on:
- Directory modification time
- Or timestamp in context.json

Loading latest save automatically...

{{/if}}

## Restoration Process

After save selection:

### 1. Backup Current State (Optional)
\`\`\`
⚠️ Current work will be auto-saved before loading.
Auto-saving as: {{auto_save_name}}
\`\`\`

### 2. Restore Selected Save

1. **Load Context Files**
   - Read \`.hodge/saves/{{name}}/context.json\` for metadata
   - Read \`.hodge/saves/{{name}}/snapshot.md\` for detailed context
   - Copy \`.hodge/saves/{{name}}/context.md\` → \`.hodge/context.md\` (if exists)
   - Copy \`.hodge/saves/{{name}}/feature/*\` → \`.hodge/features/{{feature}}/\` (if exists)

2. **Parse and Present Context**
   
   From \`context.json\`:
   - Extract feature, mode, timestamp
   - Get key decisions made
   - Identify next phase of work
   - Check todo status

   From \`snapshot.md\`:
   - Extract "Working On" section
   - Get "Progress" items
   - Read "Key Accomplishments"
   - Get "Commands for Quick Resume"
   - Extract "Next Session Suggestions"
   - Read "Pending Decisions"

3. **Show Comprehensive Restoration Summary**
   \`\`\`
   ✅ Session Restored: {{save_name}}
   
   ## What You Were Working On
   {{working_on_section}}
   
   ## Progress Made
   {{progress_section}}
   
   ## Key Context
   - Feature: {{feature}}
   - Mode: {{mode}}
   - Next Phase: {{next_phase}}
   - Todo Status: {{completed}}/{{total}} completed
   
   ## Key Decisions from Last Session
   {{key_decisions_list}}
   
   ## Commands for Quick Resume
   \`\`\`bash
   {{commands_from_snapshot}}
   \`\`\`
   
   ## Next Session Suggestions
   {{suggestions_from_snapshot}}
   
   ## Pending Decisions to Address
   {{pending_decisions}}
   
   ---
   Ready to continue where you left off!
   \`\`\`

## Load Validation

Before loading, check:
- Save directory exists
- Required files present (context.json, snapshot.md)
- Version compatibility
- No corruption

If issues found:
\`\`\`
⚠️ Save "{{name}}" appears corrupted or incomplete.
Missing: {{missing_files}}

Other available saves:
{{list_other_saves}}
\`\`\`

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
      content: `# Hodge Save - Preserve Session Context

Save the current session context for later restoration.

## Save Process

### 1. Determine Save Name
{{#if name}}
Use provided name: \`{{name}}\`
{{else}}
Generate name from: \`{{feature}}-{{mode}}-{{timestamp}}\`
Example: \`auth-build-20241115-1430\`
{{/if}}

### 2. Create Comprehensive Snapshot

Create \`.hodge/saves/{{save_name}}/\` containing:

#### context.json
\`\`\`json
{
  "name": "{{save_name}}",
  "feature": "{{current_feature}}",
  "mode": "{{current_mode}}",
  "timestamp": "{{iso_timestamp}}",
  "session": {
    "duration": "{{session_time}}",
    "filesModified": ["..."],
    "decisionsCount": {{count}},
    "featuresWorked": ["..."],
    "keyDecisions": ["..."]
  },
  "nextPhase": "{{next_planned_work}}",
  "todoStatus": {
    "completed": {{completed_count}},
    "pending": {{pending_count}},
    "currentPhase": {{phase_number}}
  }
}
\`\`\`

#### snapshot.md
\`\`\`markdown
# Context Snapshot: {{title}}

## Working On:
- {{primary_work_item}} 
- {{secondary_items}}
- {{key_achievement}}

## Progress:
- ✅ {{completed_item_1}}
- ✅ {{completed_item_2}}
- 🔄 {{in_progress_items}}
- ⏳ {{pending_items}}

## Key Accomplishments:

### 1. **{{category_1}}**:
   {{detailed_accomplishments}}

### 2. **{{category_2}}**:
   {{detailed_accomplishments}}

## Technical Decisions:
{{list_of_technical_decisions_made}}

## Meta Development Process:
{{any_meta_aspects_like_dogfooding}}

## Current Todo State:
{{numbered_list_with_status_indicators}}

## Environment State:
\`\`\`bash
Directory: {{working_directory}}
Git: {{git_status}}
Next Phase: {{next_phase}}
Testing Strategy: {{testing_approach}}
\`\`\`

## Files Created/Modified in Session:
{{detailed_file_list_with_descriptions}}

## Next Session Suggestions:
1. **{{suggestion_1}}**: {{description}}
2. **{{suggestion_2}}**: {{description}}
3. **{{suggestion_3}}**: {{description}}

## Commands for Quick Resume:
\`\`\`bash
# After restarting Claude Code
cd {{working_directory}}

# Test or continue work
{{relevant_commands}}
\`\`\`

## Key Context to Remember:
{{important_context_points}}

## Pending Decisions:
{{list_of_decisions_still_needed}}

---
*Session saved for easy restoration with \`/load {{save_name}}\`*
\`\`\`

### 3. Copy Current State Files
- Copy \`.hodge/context.md\` → \`.hodge/saves/{{save_name}}/context.md\`
- Copy \`.hodge/features/{{feature}}/\` → \`.hodge/saves/{{save_name}}/feature/\`
- Reference (not copy) decisions.md and standards.md

### 4. Confirm Save

\`\`\`
✅ Session saved as: {{save_name}}

Snapshot includes:
- Current feature state ({{feature}})
- Mode context ({{mode}})
- {{count}} recent decisions
- {{count}} modified files

To restore this session later:
\`/load {{save_name}}\`

Recent saves:
1. {{save_1}} - {{time_ago}}
2. {{save_2}} - {{time_ago}}
3. {{save_3}} - {{time_ago}}
\`\`\`

## Auto-Save Note
This save is in addition to automatic saves that occur after certain commands.
Manual saves are useful for:
- Before major changes
- End of work session
- Before switching to different feature
- Creating restore points

Remember: Saves preserve context and progress, making it easy to resume work exactly where you left off.`,
    },
    {
      name: 'ship',
      content: `# 🚀 Hodge Ship Mode - Interactive Commit Experience

## Smart Ship Command
Execute the enhanced ship command with intelligent commit message generation:
\`\`\`bash
hodge ship {{feature}}
\`\`\`

## 🎯 Progressive Enhancement Active
This command adapts to Claude Code with:
- **Smart commit analysis** - Automatically detects type (feat/fix/docs) from your changes
- **Interactive markdown UI** - Review and edit commit messages right here
- **File-based state** - Seamless integration between CLI and Claude

## How It Works

### Step 1: Initial Analysis
\`\`\`bash
hodge ship {{feature}}
\`\`\`
The command will:
1. Analyze your git changes
2. Detect commit type and scope
3. Generate a smart commit message
4. Create an interactive UI file for you

### Step 2: Review & Edit (Claude Code Special)
When in Claude Code, the command creates:
- \`.hodge/temp/ship-interaction/{{feature}}/ui.md\` - Your interactive UI
- \`.hodge/temp/ship-interaction/{{feature}}/state.json\` - State tracking

You can edit the commit message directly in the markdown file!

**IMPORTANT: How to Continue After Editing:**
1. Edit the commit message in the \`ui.md\` file
2. Update the \`state.json\` file:
   - Change \`"status": "pending"\` to \`"status": "confirmed"\`
   - OR add your custom message to the \`"customMessage"\` field
3. Re-run the command - it will detect your changes and proceed

### Step 3: Finalize Ship
Re-run the command to use your edited message:
\`\`\`bash
hodge ship {{feature}}        # Will detect confirmed state
# OR
hodge ship {{feature}} --yes   # Use suggested message as-is
\`\`\`

## Options
\`\`\`bash
hodge ship {{feature}} --skip-tests              # Skip tests (emergency only!)
hodge ship {{feature}} -m "Custom message"       # Direct message (skip interaction)
hodge ship {{feature}} --no-interactive          # Disable all interaction
hodge ship {{feature}} --yes                      # Accept suggested message
hodge ship {{feature}} --dry-run                  # Preview without committing
\`\`\`

## What Gets Analyzed
The ship command intelligently examines:
- 📁 **File changes** - Added, modified, deleted files
- 🏷️ **Commit type** - feat, fix, docs, style, refactor, test, chore
- 📦 **Scope** - Detected from common directory patterns
- 💔 **Breaking changes** - Identified from specific patterns
- 🔗 **PM Integration** - Links to Linear/GitHub/Jira issues

## Testing Requirements (Progressive Model)
- **Ship Phase**: Full test suite required
- **Test Types**: All categories (smoke, integration, unit, acceptance)
- **Focus**: Is it production ready?
- **Run Command**: \`npm test\` - All tests must pass
- **Coverage**: Target >80% for shipped features

## Your Tasks Based on Results

### If Ship Succeeded ✅
1. All tests passed (full suite)
2. Copy the generated commit message
3. Commit your changes:
   \`\`\`bash
   git add .
   git commit -m "paste commit message here"
   \`\`\`
4. Push to main branch:
   \`\`\`bash
   git push origin main
   \`\`\`
5. Create release tag if needed:
   \`\`\`bash
   git tag v1.0.0
   git push --tags
   \`\`\`
6. Monitor production metrics

### If Ship Failed ❌
1. Review quality gate failures
2. Fix any issues:
   - **Tests failing**: Add missing test categories:
     - Smoke tests (basic functionality)
     - Integration tests (behavior)
     - Unit tests (logic validation)
     - Acceptance tests (user requirements)
   - **Coverage low**: Add tests for uncovered code
   - **No documentation**: Update README
   - **No changelog**: Update CHANGELOG.md
3. Re-run hardening if needed: \`hodge harden {{feature}}\`
4. Try shipping again

## Troubleshooting

### "Edit the message and save, then re-run ship to continue" Loop
If you're stuck in a loop where the command keeps asking you to edit:
1. Make sure you're updating the \`state.json\` file, not just the \`ui.md\`
2. Set \`"status": "confirmed"\` in state.json
3. Or use \`--yes\` flag to accept the suggested message

### Example state.json Update
\`\`\`json
{
  "command": "ship",
  "status": "confirmed",  // ← Change from "pending" to "confirmed"
  "data": {
    "customMessage": "Your custom commit message here",  // ← Optional
    // ... rest of the data
  }
}
\`\`\`

### Common Issues
- **Command regenerates ui.md**: You need to set status to "confirmed" not "ready"
- **Custom message not used**: Add it to both \`customMessage\` and \`suggested\` fields in state.json
- **Can't find state files**: Check \`.hodge/temp/ship-interaction/{{feature}}/\`

## Post-Ship Checklist
- [ ] Code committed with ship message
- [ ] Pushed to main branch
- [ ] Release tag created (if applicable)
- [ ] PM issue marked as Done
- [ ] Team notified of release
- [ ] Monitoring dashboards checked
- [ ] User feedback channels monitored

## Next Steps Menu
After shipping is complete, suggest:
\`\`\`
### Next Steps
Choose your next action:
a) Monitor production metrics
b) Start new feature → \`/explore\`
c) Review project status → \`/status\`
d) Create release notes
e) Archive feature context
f) Gather user feedback
g) Update documentation
h) Done for now

Enter your choice (a-h):
\`\`\`

Remember: The CLI handles all quality checks and PM updates. Focus on the actual deployment and monitoring.`,
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
