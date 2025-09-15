# Claude Code Slash Commands for Hodge

This directory contains Claude Code slash command configurations that integrate with the portable Hodge CLI.

## How It Works

Claude Code slash commands are markdown files in `.claude/commands/` that instruct Claude to execute specific actions. These have been configured to call the portable `hodge` CLI commands directly, providing a seamless integration between Claude Code and the Hodge development framework.

## Available Slash Commands

### `/explore <feature>`
- **What it does**: Starts exploration mode for a new feature
- **CLI command**: `hodge explore <feature>`
- **Creates**: Exploration directory with templates
- **PM integration**: Links to Linear/GitHub/Jira issues automatically

### `/build <feature>`
- **What it does**: Enters build mode with recommended standards
- **CLI command**: `hodge build <feature>`
- **Creates**: Build plan and context
- **Options**: Add `--skip-checks` to bypass exploration checks

### `/harden <feature>`
- **What it does**: Validates feature for production readiness
- **CLI command**: `hodge harden <feature>`
- **Runs**: Tests, linting, type checking, build validation
- **Options**: `--skip-tests`, `--auto-fix`

### `/ship <feature>`
- **What it does**: Ships feature to production
- **CLI command**: `hodge ship <feature>`
- **Validates**: All quality gates
- **Generates**: Commit message, release notes
- **PM integration**: Marks issue as Done

### `/decide <decision>`
- **What it does**: Records a project decision
- **CLI command**: `hodge decide "<decision>" --feature <feature>`
- **Stores**: In `.hodge/decisions.md`
- **PM integration**: Adds decision comment to issue

### `/status [feature]`
- **What it does**: Shows project or feature status
- **CLI command**: `hodge status [feature]`
- **Shows**: Progress, next steps, context

### `/save`
- **What it does**: Saves current session context
- **Creates**: Snapshot in `.hodge/saves/`

### `/load [name]`
- **What it does**: Restores previous session
- **Loads**: Context from `.hodge/saves/`

### `/review`
- **What it does**: Reviews current changes
- **Mode-aware**: Different standards for explore/build/harden

## Setup

### 1. Permissions
The `.claude/settings.local.json` file includes permissions for all hodge commands:
```json
{
  "permissions": {
    "allow": [
      "Bash(hodge:*)",
      "Bash(hodge explore:*)",
      "Bash(hodge build:*)",
      "Bash(hodge harden:*)",
      "Bash(hodge ship:*)",
      "Bash(hodge decide:*)",
      "Bash(hodge status:*)"
    ]
  }
}
```

### 2. CLI Installation
Ensure Hodge CLI is installed and accessible:
```bash
npm install -g @agileexplorations/hodge
# or for local development
npm link
```

### 3. PM Configuration
Set environment variables for PM tool integration:
```bash
export HODGE_PM_TOOL=linear  # or github, jira
export LINEAR_API_KEY=your_key
export LINEAR_TEAM_ID=your_team_id
```

## Workflow Example

```bash
# Start exploring a new feature
/explore USER-AUTH

# After exploration, record decision
/decide "Using JWT with refresh tokens" --feature USER-AUTH

# Start building
/build USER-AUTH

# Validate for production
/harden USER-AUTH

# Ship to production
/ship USER-AUTH

# Check overall status
/status
```

## How Commands Work

1. **Claude receives slash command**: When you type `/explore FEATURE` in Claude Code
2. **Markdown file is loaded**: Claude reads `.claude/commands/explore.md`
3. **CLI command is executed**: Claude runs `hodge explore FEATURE`
4. **Output is displayed**: CLI output appears in Claude Code
5. **Claude provides guidance**: Based on the markdown instructions and CLI output
6. **You implement**: Claude helps with the actual coding
7. **Next steps menu**: Claude presents options for what to do next

## Benefits

- **Consistent workflow**: Same commands work in terminal and Claude Code
- **Automatic context**: CLI provides AI-specific context for each mode
- **PM integration**: Automatic issue tracking and updates
- **Progress tracking**: Always know where you are in the development cycle
- **Mode enforcement**: Appropriate standards for explore/build/harden/ship

## Troubleshooting

### Command not executing
- Check that Hodge CLI is installed: `which hodge`
- Verify permissions in `.claude/settings.local.json`
- Ensure you're in a Hodge-initialized project: `hodge status`

### PM integration not working
- Verify environment variables are set
- Check PM tool credentials
- Run `node .hodge/pm-scripts/pm-status.js` to test

### Features not found
- Initialize project first: `hodge init`
- Check feature status: `hodge status FEATURE`

## Development

To modify slash commands:
1. Edit the markdown files in `.claude/commands/`
2. Update CLI commands in `src/commands/`
3. Build: `npm run build`
4. Test: `npm test`

## Support

- Documentation: See `/podge` directory for specifications
- Issues: GitHub issues for bug reports
- PM: Linked issues for feature tracking