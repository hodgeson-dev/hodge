/**
 * Template for PM scripts README file
 * Extracted from structure-generator.ts to reduce file length
 */

export const PM_SCRIPTS_README = `# Project Management Scripts

This directory contains comprehensive scripts for integrating Hodge with your project management tool.

## Available Scripts

### Common Scripts
- \`pm-status.js\` - Check PM integration status
- \`install-dependencies.js\` - Install required npm packages

### Tool-Specific Scripts
Based on your selected PM tool, you'll have scripts for:
- Creating issues/tasks/cards
- Updating issue status
- Fetching issue details
- Creating projects/epics/milestones
- And more...

## Usage

First, check your PM tool configuration:
\`\`\`bash
node .hodge/pm-scripts/pm-status.js
\`\`\`

If needed, install dependencies:
\`\`\`bash
node .hodge/pm-scripts/install-dependencies.js
\`\`\`

Then use the scripts for your PM tool:
\`\`\`bash
# Create an issue
node .hodge/pm-scripts/create-issue.js "Issue Title" "Description"

# Update issue status
node .hodge/pm-scripts/update-issue.js <issue-id> <status>

# Fetch issue details
node .hodge/pm-scripts/fetch-issue.js <issue-id>
\`\`\`

## Environment Variables

Set the appropriate variables for your PM tool:

- **Linear**: \`LINEAR_API_KEY\`, \`LINEAR_TEAM_ID\`
- **GitHub**: \`GITHUB_TOKEN\`
- **Jira**: \`JIRA_API_TOKEN\`, \`JIRA_EMAIL\`, \`JIRA_DOMAIN\`
- **Trello**: \`TRELLO_API_KEY\`, \`TRELLO_TOKEN\`
- **Asana**: \`ASANA_TOKEN\`

## Getting API Keys

- **Linear**: https://linear.app/settings/api
- **GitHub**: https://github.com/settings/tokens
- **Jira**: https://id.atlassian.com/manage-profile/security/api-tokens
- **Trello**: https://trello.com/app-key
- **Asana**: https://app.asana.com/0/developer-console

## Customization

These scripts are designed to work out of the box, but you can customize them based on your specific workflow and PM tool configuration.
`;
