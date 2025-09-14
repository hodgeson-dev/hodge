# PM Integration for Claude Code Commands

## How PM Integration Works

When you use Hodge slash commands in Claude Code, they now automatically integrate with your PM tool (Linear, GitHub Issues, etc.) to:

1. **Fetch issue context** when exploring
2. **Update issue status** as you progress through modes
3. **Link work to issues** for traceability

## Command Flow

### `/explore <feature>` 
1. Searches for PM issue matching `<feature>`
   - If `LIN-123` format → treats as issue ID
   - Otherwise → searches by title
2. Fetches issue details if found:
   - Description
   - Acceptance criteria
   - Comments/discussions
3. Saves issue ID to `.hodge/features/<feature>/issue-id.txt`
4. Uses issue context to guide exploration

### `/build <feature>`
1. Checks for saved issue ID in `.hodge/features/<feature>/issue-id.txt`
2. If found, transitions issue to "In Progress"
3. Shows issue link in build output
4. Implementation guided by acceptance criteria

### `/harden <feature>`
1. Transitions linked issue to "In Review"
2. Ensures acceptance criteria are tested
3. Adds review checklist to issue (if supported by PM tool)

### `/ship <feature>`
1. Transitions linked issue to "Done"
2. Creates commit message with issue reference
3. Adds ship summary to issue
4. Closes issue automatically

## Environment Setup

For PM integration to work, you need these environment variables in `.env`:

```bash
# Required
HODGE_PM_TOOL=linear  # or github, jira
LINEAR_API_KEY=lin_api_xxxxx
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Optional
LINEAR_PROJECT_ID=project-id  # Specific project
```

## Testing PM Integration

1. **Check configuration**:
   ```bash
   node scripts/test-pm-connection.js
   ```

2. **List available teams** (Linear):
   ```bash
   node scripts/list-linear-teams.js
   ```

## Manual PM Operations

If needed, you can manually interact with PM:

```javascript
// In your code or Claude Code
const { getPMAdapterFromEnv } = require('./dist/src/lib');

const adapter = getPMAdapterFromEnv();
if (adapter) {
  // Search for issues
  const issues = await adapter.searchIssues('payment');
  
  // Get specific issue
  const issue = await adapter.getIssue('LIN-123');
  
  // Transition issue
  await adapter.transitionIssue('LIN-123', 'explore', 'build');
}
```

## Convention-Based State Mapping

The PM adapter uses smart pattern matching to map states:

| Hodge Mode | Common PM States |
|------------|------------------|
| explore | Backlog, Todo, Planned |
| build | In Progress, Doing, Active |
| harden | In Review, Testing, QA |
| ship | Done, Complete, Deployed |

## Customizing State Mappings

If your PM tool uses different state names, create `.hodge/pm-overrides.json`:

```json
{
  "transitions": {
    "explore->build": "state-id-for-in-progress",
    "build->harden": "state-id-for-review",
    "harden->ship": "state-id-for-done"
  }
}
```

## Benefits

1. **No Context Switching**: Stay in Claude Code while PM updates automatically
2. **Traceability**: All work linked to PM issues
3. **Team Visibility**: Non-technical stakeholders see progress in their tool
4. **Requirements Alignment**: AI uses issue requirements to guide implementation
5. **Automatic Documentation**: Ship summaries added to issues

## Troubleshooting

### Issue not found
- Check feature name matches issue title
- Try using issue ID directly (e.g., `LIN-123`)
- Verify API key has read access to the issue

### State transition fails
- Check your PM workflow allows the transition
- Create overrides file if state names don't match conventions
- Verify API key has write permissions

### No PM integration
- Run `node scripts/test-pm-connection.js` to verify setup
- Check environment variables are set
- Ensure `.env` file is loaded

## Future Enhancements

- Automatic PR linking to issues
- Time tracking integration
- Sprint/iteration awareness
- Automatic issue creation from explore mode
- Comment threads from Claude Code conversations