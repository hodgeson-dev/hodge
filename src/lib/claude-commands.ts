/**
 * Claude Code slash command definitions for Hodge
 */

export interface ClaudeCommand {
  name: string;
  content: string;
}

export function getClaudeCommands(): ClaudeCommand[] {
  return [
    {
      name: 'explore',
      content: `# Hodge Explore Mode

## Command Execution
Execute the portable Hodge CLI command:
\`\`\`bash
hodge explore {{feature}}
\`\`\`

## What This Does
1. Creates exploration directory: \`.hodge/features/{{feature}}/explore/\`
2. Checks for PM issue and links if found
3. Displays AI context for exploration mode
4. Shows available patterns and decisions
5. Creates exploration template for you to fill in

## After Command Execution
The CLI will output:
- AI context guidelines for exploration mode
- PM issue linking status
- Project context (patterns, decisions)
- Created files location
- Next steps

## Your Tasks After CLI Command
1. Review the exploration template at \`.hodge/features/{{feature}}/explore/exploration.md\`
2. Generate 2-3 different implementation approaches
3. For each approach:
   - Create a quick prototype or code sketch
   - Note pros/cons
   - Consider integration with existing stack
4. Document your recommendation

## Exploration Guidelines
- Standards are **suggested** but not enforced
- Multiple approaches encouraged
- Focus on rapid prototyping and idea validation
- Be creative and explore alternatives

## Next Steps Menu
After exploration is complete, suggest:
\`\`\`
### Next Steps
Choose your next action:
a) Record decision → \`/decide "chosen approach" --feature {{feature}}\`
b) Continue exploring another aspect
c) Start building → \`/build {{feature}}\`
d) Save progress → \`/save\`
e) Check status → \`/status {{feature}}\`
f) Done for now

Enter your choice (a-f):
\`\`\`

Remember: The CLI handles all the file creation and PM integration. Focus on generating creative solutions and documenting approaches.`,
    },
    {
      name: 'build',
      content: `# Hodge Build Mode

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge build {{feature}}
\`\`\`

## What This Does
1. Transitions from explore to build mode
2. Creates build directory: \`.hodge/features/{{feature}}/build/\`
3. Enforces standards from \`.hodge/standards.md\`
4. Applies patterns from \`.hodge/patterns/\`
5. Generates build plan template

## Your Tasks After CLI Command
1. Review the build plan
2. Implement following standards (enforced)
3. Apply established patterns
4. Ensure production quality

## Build Guidelines
- Standards are **enforced** - follow them strictly
- Use existing patterns when applicable
- Focus on production-ready code
- Write comprehensive tests

## Next Steps
- Run quality checks → \`/harden\`
- Ship the feature → \`/ship\`
- Save progress → \`/save\``,
    },
    {
      name: 'ship',
      content: `# Hodge Ship Mode

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge ship {{feature}}
\`\`\`

## What This Does
1. Runs quality checks (tests, linting, types)
2. Extracts patterns for reuse
3. Creates git commit with detailed message
4. Updates PM tool if configured
5. Records in \`.hodge/features/{{feature}}/ship/\`

## Prerequisites
- Feature must be built
- Tests should pass
- Code meets standards

## Git Integration
The command will:
- Stage all changes
- Create comprehensive commit
- Extract learned patterns
- Update PM issue status

## Next Steps
- Check status → \`/status\`
- Start new feature → \`/explore\``,
    },
    {
      name: 'status',
      content: `# Hodge Status

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge status
\`\`\`
Or for a specific feature:
\`\`\`bash
hodge status {{feature}}
\`\`\`

## What This Shows
1. Current feature status
2. Mode (explore/build/ship)
3. Standards compliance
4. Recent decisions
5. Pattern library size
6. PM integration status

## Output Includes
- Features in progress
- Completed features
- Pending decisions
- Standards violations (if any)

## Next Steps
Based on status, continue with appropriate command`,
    },
    {
      name: 'decide',
      content: `# Hodge Decide

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge decide "{{decision}}" --feature {{feature}}
\`\`\`

## What This Does
1. Records decision in \`.hodge/decisions.md\`
2. Updates PM tool if configured
3. Links to feature/exploration
4. Timestamps the decision

## Decision Format
- **Context**: Why this decision is needed
- **Decision**: What was decided
- **Rationale**: Why this approach was chosen
- **Consequences**: Impact and trade-offs

## Example
\`\`\`bash
hodge decide "Use JWT for authentication" --feature user-auth
\`\`\`

## Next Steps
- Continue building → \`/build\`
- Review decisions → view \`.hodge/decisions.md\``,
    },
    {
      name: 'harden',
      content: `# Hodge Harden

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge harden
\`\`\`

## What This Does
1. Runs all tests
2. Checks linting rules
3. Validates TypeScript types
4. Checks standards compliance
5. Optionally fixes issues (with --fix)

## Options
- \`--fix\` - Auto-fix what can be fixed
- \`--skip-tests\` - Skip test execution
- \`--verbose\` - Show detailed output

## Quality Checks
- Unit and integration tests
- ESLint rules
- TypeScript compilation
- Project standards

## Next Steps
- Fix any issues found
- Ship when ready → \`/ship\``,
    },
    {
      name: 'save',
      content: `# Hodge Save

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge save "{{context-name}}"
\`\`\`

## What This Does
1. Saves current work context
2. Creates snapshot in \`.hodge/saves/\`
3. Includes:
   - Current feature state
   - Open decisions
   - Work in progress
   - Context for resuming

## Usage
Save your current context when:
- Switching to another task
- End of work session
- Before major changes
- Creating checkpoint

## Example
\`\`\`bash
hodge save "auth-implementation-wip"
\`\`\`

## Next Steps
- Load saved context → \`/load\`
- List saves → \`hodge saves list\``,
    },
    {
      name: 'load',
      content: `# Hodge Load

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge load "{{context-name}}"
\`\`\`

## What This Does
1. Restores saved work context
2. Loads from \`.hodge/saves/\`
3. Restores:
   - Feature state
   - Open decisions
   - Work context
   - File references

## Usage
Load a saved context to:
- Resume previous work
- Switch between features
- Restore after interruption
- Continue from checkpoint

## Example
\`\`\`bash
hodge load "auth-implementation-wip"
\`\`\`

## Next Steps
- Continue where you left off
- Check status → \`/status\``,
    },
    {
      name: 'review',
      content: `# Hodge Review

## Command Execution
Execute the Hodge CLI command:
\`\`\`bash
hodge review {{feature}}
\`\`\`

## What This Does
1. Reviews feature implementation
2. Checks against standards
3. Validates patterns usage
4. Generates review report
5. Suggests improvements

## Review Covers
- Code quality
- Standards compliance
- Pattern application
- Test coverage
- Documentation

## Output Includes
- Compliance report
- Improvement suggestions
- Pattern recommendations
- Quality metrics

## Next Steps
- Address review feedback
- Run quality checks → \`/harden\`
- Ship when ready → \`/ship\``,
    },
  ];
}