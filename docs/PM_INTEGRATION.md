# PM Tool Integration Guide

## Overview

Hodge integrates with project management tools to automatically track and update issue statuses as you move through development modes (explore → build → harden → ship).

## Supported PM Tools

Currently supported:
- **Linear** ✅ (fully implemented)
- **GitHub Issues** 🚧 (coming soon)
- **Jira** 🚧 (coming soon)

## Quick Start

### 1. Configure Environment Variables

```bash
# Required for all PM integrations
export HODGE_PM_TOOL="linear"  # or "github", "jira"

# Linear-specific
export LINEAR_API_KEY="lin_api_xxxxx"
export LINEAR_TEAM_ID="team-id"
export LINEAR_PROJECT_ID="project-id"  # optional
```

### 2. Test Connection

```bash
# Verify PM tool connection
hodge pm test

# List available workflow states
hodge pm states
```

### 3. Use Mode Transitions

When you change modes, Hodge automatically updates the linked issue:

```bash
# Start exploring (issue → Backlog/Todo)
hodge explore payment-processing

# Start building (issue → In Progress)
hodge build payment-processing

# Start hardening (issue → In Review)
hodge harden payment-processing

# Ship feature (issue → Done)
hodge ship payment-processing
```

## Configuration

### Convention-Based Defaults

Hodge uses smart pattern matching to detect state types:

| State Pattern | Detected Type | Hodge Mode |
|--------------|---------------|------------|
| Backlog, Todo, Upcoming | `unstarted` | explore |
| In Progress, Doing, Active | `started` | build |
| In Review, Testing, QA | `started` | harden |
| Done, Complete, Shipped | `completed` | ship |
| Canceled, Abandoned | `canceled` | - |

### Custom Overrides

Create `.hodge/pm-overrides.json` for custom workflows:

```json
{
  "transitions": {
    "explore->build": "state-id-123",
    "build->harden": "state-id-456",
    "harden->ship": "state-id-789"
  },
  "customPatterns": {
    "started": ["Sprint Active", "Development"]
  },
  "issueUrlPattern": "https://linear.app/team/issue/{{id}}"
}
```

## Linear Integration

### Setup

1. **Get API Key**: Settings → API → Personal API keys → Create new

2. **Find Your Team ID** (choose one method):
   
   **Option A - Use the helper script:**
   ```bash
   # First, add your API key to .env
   echo 'LINEAR_API_KEY="lin_api_xxxxx"' >> .env
   
   # List available teams and their IDs
   node scripts/list-linear-teams.js
   ```
   
   **Option B - Manual lookup:**
   - Go to Linear Settings → General
   - Copy the Team ID (UUID format)

3. **Configure .env**:
   ```bash
   HODGE_PM_TOOL=linear
   LINEAR_API_KEY="lin_api_xxxxx"
   LINEAR_TEAM_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

4. **Test Connection**:
   ```bash
   node scripts/test-pm-connection.js
   ```

### Features

- Automatic state transitions
- Issue search by ID or title
- Create issues from CLI
- Fetch issue context for exploration

### Using Existing Projects

If you already have a Linear project, just configure the team ID - no need to create a new project:

```bash
# Your existing Linear issues will work immediately
hodge explore LIN-123  # Uses existing issue
hodge build LIN-456    # Updates existing issue status
```

### Creating a New Hodge Project (Optional)

If you want to create a dedicated Hodge project with weekly epics:

```bash
# This creates "Hodge 0.1.0 Alpha" project with 7 weekly epics
node scripts/create-linear-project.js
```

### Example Workflow

```bash
# 1. Use existing issue or create new one
hodge explore LIN-123  # Existing issue
# OR
hodge pm create "Add payment processing"  # New issue

# 2. Hodge fetches issue context automatically

# 3. Hodge fetches issue details and uses them as context
# - Title, description, acceptance criteria
# - Comments and discussions
# - Labels and metadata

# 4. As you progress, issue auto-updates
hodge build LIN-123   # → "In Progress"
hodge harden LIN-123  # → "In Review"
hodge ship LIN-123    # → "Done"
```

## Programmatic Usage

### TypeScript/JavaScript

```typescript
import { createPMAdapter, transitionIssueForMode } from '@agile-explorations/hodge';

// Create adapter
const adapter = createPMAdapter('linear', {
  tool: 'linear',
  apiKey: process.env.LINEAR_API_KEY,
  teamId: process.env.LINEAR_TEAM_ID
});

// Transition issue
await adapter.transitionIssue('LIN-123', 'explore', 'build');

// Detect current mode from issue
const currentMode = await adapter.detectModeFromIssue('LIN-123');

// Search for issues
const issues = await adapter.searchIssues('payment');
```

### Environment-based

```typescript
import { getPMAdapterFromEnv, transitionIssueForMode } from '@agile-explorations/hodge';

// Get adapter from environment
const adapter = getPMAdapterFromEnv();

if (adapter) {
  // Helper function for mode transitions
  const success = await transitionIssueForMode('LIN-123', 'explore', 'build');
}
```

## Troubleshooting

### Connection Issues

```bash
# Test PM tool connection
hodge pm test --verbose

# Check configuration
hodge pm config
```

### State Mapping Issues

1. List available states:
   ```bash
   hodge pm states
   ```

2. Check detected mappings:
   ```bash
   hodge pm mappings
   ```

3. Create overrides if needed:
   ```bash
   hodge pm override --generate > .hodge/pm-overrides.json
   ```

### Common Errors

| Error | Solution |
|-------|----------|
| "Linear API key is required" | Set `LINEAR_API_KEY` environment variable |
| "No state found for transition" | Create override in `.hodge/pm-overrides.json` |
| "Failed to fetch Linear states" | Check API key and network connection |
| "Invalid issue ID" | Verify issue exists and you have access |

## Security

- **Never commit API keys**: Add `.env` to `.gitignore`
- **Use environment variables**: Don't hardcode credentials
- **Minimal permissions**: Use read/write access only for required projects
- **Rotate keys regularly**: Update API keys periodically

## Advanced Configuration

### Multiple Projects

```json
{
  "projects": {
    "frontend": {
      "tool": "linear",
      "teamId": "team-1",
      "transitions": {
        "explore->build": "state-1"
      }
    },
    "backend": {
      "tool": "github",
      "repo": "org/backend",
      "transitions": {
        "explore->build": "in-progress-label"
      }
    }
  }
}
```

### Custom State Detection

```javascript
// In .hodge/pm-patterns.js
module.exports = {
  patterns: {
    started: [
      /^sprint\s+active$/i,
      /^dev\s+work$/i
    ],
    review: [
      /^pending\s+review$/i,
      /^awaiting\s+approval$/i
    ]
  }
};
```

## Contributing

To add support for a new PM tool:

1. Extend `BasePMAdapter` class
2. Implement required methods:
   - `fetchStates()`
   - `getIssue()`
   - `updateIssueState()`
   - `searchIssues()`
   - `createIssue()`
3. Add to factory in `src/lib/pm/index.ts`
4. Write tests
5. Update documentation

See `src/lib/pm/linear-adapter.ts` for reference implementation.