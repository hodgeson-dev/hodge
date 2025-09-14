# Approach 2: Guided Interactive Wizard

## Implementation Sketch

Interactive wizard with smart defaults but allowing customization:

```typescript
// src/commands/init.ts
import { prompt } from 'inquirer';
import ora from 'ora';

export async function initCommand(options: InitOptions) {
  console.log(chalk.blue('Welcome to Hodge! Let\'s set up your project.\n'));
  
  // Step 1: Essential question
  const { projectName } = await prompt([{
    type: 'input',
    name: 'projectName',
    message: 'What\'s your project name?',
    default: path.basename(process.cwd())
  }]);

  // Step 2: Quick or Custom setup
  const { setupMode } = await prompt([{
    type: 'list',
    name: 'setupMode',
    message: 'Setup mode:',
    choices: [
      { name: '⚡ Quick (recommended defaults)', value: 'quick' },
      { name: '⚙️  Custom (choose everything)', value: 'custom' }
    ]
  }]);

  let config;
  if (setupMode === 'quick') {
    // Auto-detect and use defaults
    const spinner = ora('Detecting project configuration...').start();
    config = await autoDetectConfig(projectName);
    spinner.succeed('Configuration detected!');
  } else {
    // Custom setup - ask more questions
    config = await customSetup(projectName);
  }

  // Show summary
  console.log('\n📋 Configuration Summary:');
  console.log(`  Project: ${config.name}`);
  console.log(`  PM Tool: ${config.pmTool || 'None'}`);
  console.log(`  Standards: ${config.standardsMode}`);
  
  const { confirm } = await prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Initialize with this configuration?',
    default: true
  }]);

  if (confirm) {
    await createHodgeStructure(config);
  }
}

async function customSetup(projectName: string) {
  const answers = await prompt([
    {
      type: 'list',
      name: 'pmTool',
      message: 'Project management tool:',
      choices: [
        { name: 'Linear', value: 'linear' },
        { name: 'GitHub Issues', value: 'github' },
        { name: 'Jira', value: 'jira' },
        { name: 'None', value: 'none' }
      ]
    },
    {
      type: 'list',
      name: 'standardsMode',
      message: 'Code standards:',
      choices: [
        { name: 'Strict (enforce all standards)', value: 'strict' },
        { name: 'Balanced (recommended)', value: 'balanced' },
        { name: 'Relaxed (suggestions only)', value: 'relaxed' }
      ]
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Enable features:',
      choices: [
        { name: 'Git integration', value: 'git', checked: true },
        { name: 'AI context building', value: 'ai', checked: true },
        { name: 'Pattern learning', value: 'patterns', checked: true },
        { name: 'Decision tracking', value: 'decisions', checked: true }
      ]
    }
  ]);
  
  return { name: projectName, ...answers };
}
```

### Progressive Disclosure Flow
```
1. Project name? → my-app
2. Quick or Custom? → [Quick/Custom]
   
If Quick:
  → Auto-detect everything
  → Show summary
  → Confirm

If Custom:
  → PM tool?
  → Standards mode?
  → Features to enable?
  → Show summary
  → Confirm
```

## Pros
- **Flexible**: Quick for most, custom for power users
- **Educational**: Teaches features during setup
- **Transparent**: Shows what's being configured
- **Confirmable**: Review before committing
- **Good UX**: Progress indicators, colors, spinners

## Cons
- **More steps**: Not truly "one question"
- **Decision fatigue**: Custom mode has many options
- **Slower**: Takes 30-60 seconds vs 10 seconds
- **More dependencies**: ora, inquirer, chalk

## Compatibility with Current Stack
- ✅ Extends existing Commander setup
- ✅ Uses established patterns
- ✅ Integrates with PM adapter system
- ✅ TypeScript friendly