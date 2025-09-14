# Approach 1: Interactive PM Tool Selection During Init

## Implementation Sketch

Enhance `hodge init` to always ask about PM tool selection, even if one is detected:

```typescript
// src/commands/init.ts enhancement
async function selectPMTool(detected: DetectedConfig): Promise<PMToolConfig> {
  const detectedPM = detected.pmTool;
  
  // Always ask, but show detected as default
  const { pmChoice } = await inquirer.prompt([{
    type: 'list',
    name: 'pmChoice',
    message: 'Which project management tool do you use?',
    default: detectedPM || 'none',
    choices: [
      { name: '📋 Linear', value: 'linear' },
      { name: '🐙 GitHub Issues', value: 'github' },
      { name: '🎯 Jira', value: 'jira' },
      { name: '📑 Trello', value: 'trello' },
      { name: '📌 Asana', value: 'asana' },
      { name: '🚫 None', value: 'none' },
      { name: '➕ Other (manual configuration)', value: 'other' }
    ]
  }]);

  // If PM tool selected, ask for configuration
  if (pmChoice !== 'none') {
    return await configurePMTool(pmChoice);
  }
  
  return { tool: 'none' };
}

async function configurePMTool(tool: string): Promise<PMToolConfig> {
  const config: PMToolConfig = { tool };
  
  switch(tool) {
    case 'linear':
      const { hasLinearKey } = await inquirer.prompt([{
        type: 'confirm',
        name: 'hasLinearKey',
        message: 'Do you have a Linear API key?',
        default: !!process.env.LINEAR_API_KEY
      }]);
      
      if (!hasLinearKey) {
        console.log(chalk.yellow('\n📝 To get a Linear API key:'));
        console.log('  1. Go to https://linear.app/settings/api');
        console.log('  2. Create a personal API key');
        console.log('  3. Add to .env: LINEAR_API_KEY=your_key\n');
      } else if (!process.env.LINEAR_API_KEY) {
        const { apiKey } = await inquirer.prompt([{
          type: 'password',
          name: 'apiKey',
          message: 'Enter your Linear API key:',
          validate: (input) => input.length > 0 || 'API key is required'
        }]);
        config.apiKey = apiKey;
      }
      
      // Ask for team selection
      if (hasLinearKey) {
        const teams = await fetchLinearTeams(config.apiKey || process.env.LINEAR_API_KEY);
        if (teams.length > 0) {
          const { teamId } = await inquirer.prompt([{
            type: 'list',
            name: 'teamId',
            message: 'Select your Linear team:',
            choices: teams.map(t => ({ name: t.name, value: t.id }))
          }]);
          config.teamId = teamId;
        }
      }
      break;
      
    case 'github':
      // Similar flow for GitHub
      const { hasGitHubToken } = await inquirer.prompt([{
        type: 'confirm',
        name: 'hasGitHubToken',
        message: 'Do you have a GitHub personal access token?',
        default: !!process.env.GITHUB_TOKEN
      }]);
      
      if (!hasGitHubToken) {
        console.log(chalk.yellow('\n📝 To create a GitHub token:'));
        console.log('  1. Go to https://github.com/settings/tokens');
        console.log('  2. Generate new token (classic)');
        console.log('  3. Select "repo" scope');
        console.log('  4. Add to .env: GITHUB_TOKEN=your_token\n');
      }
      break;
      
    case 'jira':
      // Jira configuration
      const jiraAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'domain',
          message: 'Jira domain (e.g., yourcompany.atlassian.net):',
          validate: (input) => /^[a-z0-9-]+\.atlassian\.net$/.test(input) || 'Invalid Jira domain'
        },
        {
          type: 'input',
          name: 'email',
          message: 'Your Jira email:',
          validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Invalid email'
        },
        {
          type: 'password',
          name: 'apiToken',
          message: 'Jira API token:',
          validate: (input) => input.length > 0 || 'API token is required'
        }
      ]);
      Object.assign(config, jiraAnswers);
      break;
  }
  
  return config;
}
```

### Modified Init Flow
```typescript
export async function initCommand(options: InitOptions) {
  // 1. Detection phase
  const detected = await detectEverything();
  
  // 2. Show detection results
  showDetectionSummary(detected);
  
  // 3. Confirm or customize
  const { proceedWithDetected } = await inquirer.prompt([{
    type: 'confirm',
    name: 'proceedWithDetected',
    message: 'Use detected configuration?',
    default: true
  }]);
  
  let config = detected;
  
  if (!proceedWithDetected || !detected.pmTool) {
    // 4. PM Tool selection (always shown if not proceeding with detected)
    config.pmTool = await selectPMTool(detected);
  }
  
  // 5. Pattern learning prompt
  if (hasExistingCode(detected)) {
    const { learnPatterns } = await inquirer.prompt([{
      type: 'confirm',
      name: 'learnPatterns',
      message: 'Would you like Hodge to learn patterns from your existing codebase?',
      default: true
    }]);
    
    if (learnPatterns) {
      config.autoLearn = true;
      console.log(chalk.cyan('  Patterns will be extracted after initialization'));
    }
  }
  
  // 6. Create structure
  await createHodgeStructure(config);
  
  // 7. Copy PM scripts if PM tool selected
  if (config.pmTool.tool !== 'none') {
    await copyPMScripts(config.pmTool);
  }
  
  // 8. Run pattern learning if requested
  if (config.autoLearn) {
    console.log(chalk.cyan('\n🔍 Learning patterns from your codebase...'));
    await runCommand('hodge', ['learn', '--auto']);
  }
}
```

## Pros
- **User control**: Always gives option to select PM tool
- **Guided setup**: Helps users configure PM tools correctly
- **Educational**: Shows how to get API keys
- **Flexible**: Supports multiple PM tools
- **Complete**: Includes pattern learning prompt

## Cons
- **More questions**: Not truly "one-question" anymore
- **Complexity**: More code to maintain
- **API calls during init**: May slow down initialization
- **Credentials handling**: Need secure storage solution

## Compatibility with Current Stack
- ✅ Extends existing init command
- ✅ Uses inquirer (already installed)
- ✅ Reuses PM adapter patterns
- ⚠️ Need to implement PM tool configurations for Trello, Asana