# Approach 3: Smart Defaults with Progressive Enhancement

## Implementation Sketch

Keep the init fast by default, but allow customization through flags and post-init commands:

```typescript
// Enhanced init with optional flags
interface InitOptions {
  force?: boolean;
  yes?: boolean;          // Accept all defaults
  interactive?: boolean;  // Force interactive mode
  pmTool?: string;       // Pre-select PM tool
  learn?: boolean;       // Auto-learn patterns
}

// src/commands/init.ts
export async function initCommand(options: InitOptions) {
  const detected = await detectEverything();
  
  // Check for flags that override behavior
  if (options.interactive) {
    return await interactiveInit(detected);
  }
  
  if (options.yes) {
    return await quickInit(detected, options);
  }
  
  // Default smart behavior
  return await smartInit(detected, options);
}

async function smartInit(detected: DetectedConfig, options: InitOptions) {
  // Only ask essential questions based on what's missing
  const questions = [];
  
  // 1. Project name - only if empty directory
  if (!detected.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: path.basename(process.cwd())
    });
  }
  
  // 2. PM tool - only if not detected AND not specified
  if (!detected.pmTool && !options.pmTool) {
    // Show condensed PM selection
    questions.push({
      type: 'list',
      name: 'pmTool',
      message: 'Project management tool (can configure later):',
      choices: [
        { name: 'Linear', value: 'linear' },
        { name: 'GitHub', value: 'github' },
        { name: 'None (configure later)', value: 'none' }
      ]
    });
  }
  
  // 3. Pattern learning - only for existing codebases
  if (detected.hasExistingCode && options.learn === undefined) {
    questions.push({
      type: 'confirm',
      name: 'learn',
      message: 'Learn patterns from existing code?',
      default: true
    });
  }
  
  const answers = questions.length > 0 
    ? await inquirer.prompt(questions)
    : {};
  
  const config = {
    ...detected,
    ...answers,
    pmTool: options.pmTool || answers.pmTool || detected.pmTool || 'none'
  };
  
  // Create structure
  await createHodgeStructure(config);
  
  // Show next steps
  showNextSteps(config);
}

function showNextSteps(config: HodgeConfig) {
  console.log(chalk.green('\n✅ Hodge initialized!\n'));
  
  const steps = [];
  
  // PM configuration needed?
  if (!config.pmTool || config.pmTool === 'none') {
    steps.push('Configure PM tool: hodge config pm');
  } else if (!config.pmConfigured) {
    steps.push(`Configure ${config.pmTool}: hodge config pm ${config.pmTool}`);
  }
  
  // Scripts deployment available?
  if (config.pmTool && config.pmTool !== 'none') {
    steps.push(`Deploy PM scripts: hodge pm install-scripts`);
  }
  
  // Pattern learning available?
  if (config.hasExistingCode && !config.learn) {
    steps.push('Learn existing patterns: hodge learn');
  }
  
  if (steps.length > 0) {
    console.log(chalk.cyan('📝 Next steps:'));
    steps.forEach(step => console.log(`  • ${step}`));
  }
  
  console.log(chalk.gray('\nRun: hodge --help for all commands'));
}
```

### New Post-Init Commands

```typescript
// src/commands/config.ts
program
  .command('config <aspect> [value]')
  .description('Configure Hodge settings')
  .action(async (aspect, value) => {
    switch(aspect) {
      case 'pm':
        await configurePM(value);
        break;
      case 'standards':
        await configureStandards(value);
        break;
    }
  });

async function configurePM(tool?: string) {
  if (!tool) {
    // Interactive PM selection
    const { pmTool } = await inquirer.prompt([{
      type: 'list',
      name: 'pmTool',
      message: 'Select PM tool:',
      choices: PM_TOOLS
    }]);
    tool = pmTool;
  }
  
  // Tool-specific configuration
  const config = await collectPMConfig(tool);
  
  // Save to .hodge/config.json
  await updateHodgeConfig({ pmTool: tool, pmConfig: config });
  
  // Offer to deploy scripts
  const { deployScripts } = await inquirer.prompt([{
    type: 'confirm',
    name: 'deployScripts',
    message: 'Deploy PM management scripts?',
    default: true
  }]);
  
  if (deployScripts) {
    await deployPMScripts(tool);
  }
}

// src/commands/pm.ts
program
  .command('pm <action>')
  .description('PM tool management')
  .action(async (action) => {
    switch(action) {
      case 'install-scripts':
        await installPMScripts();
        break;
      case 'update-scripts':
        await updatePMScripts();
        break;
      case 'list':
        await listPMCommands();
        break;
    }
  });

async function installPMScripts() {
  const config = await loadHodgeConfig();
  
  if (!config.pmTool || config.pmTool === 'none') {
    console.log(chalk.yellow('No PM tool configured. Run: hodge config pm'));
    return;
  }
  
  const spinner = ora('Installing PM scripts...').start();
  
  // Create .hodge/pm-scripts directory
  const scriptsDir = path.join('.hodge', 'pm-scripts');
  await fs.mkdir(scriptsDir, { recursive: true });
  
  // Copy appropriate scripts based on PM tool
  const scriptSource = path.join(__dirname, 'templates', 'pm', config.pmTool);
  await copyDirectory(scriptSource, scriptsDir);
  
  // Install dependencies
  await execAsync('npm install', { cwd: scriptsDir });
  
  spinner.succeed('PM scripts installed!');
  
  // Show available commands
  console.log(chalk.cyan('\n📝 Available PM commands:'));
  const scripts = await getAvailableScripts(scriptsDir);
  scripts.forEach(script => {
    console.log(`  • npm run ${script.name} -- ${script.usage}`);
  });
}

// src/commands/learn.ts
program
  .command('learn')
  .description('Learn patterns from existing codebase')
  .option('--auto', 'Automatic pattern extraction')
  .option('--interactive', 'Review each pattern')
  .action(async (options) => {
    const spinner = ora('Analyzing codebase...').start();
    
    // Extract patterns
    const patterns = await extractPatterns();
    
    spinner.succeed(`Found ${patterns.length} patterns`);
    
    if (options.interactive) {
      // Review each pattern
      for (const pattern of patterns) {
        console.log(chalk.cyan(`\n📐 Pattern: ${pattern.name}`));
        console.log(pattern.description);
        console.log(chalk.gray(`Found in: ${pattern.files.length} files`));
        
        const { accept } = await inquirer.prompt([{
          type: 'confirm',
          name: 'accept',
          message: 'Add to patterns library?',
          default: true
        }]);
        
        if (accept) {
          await savePattern(pattern);
        }
      }
    } else {
      // Auto mode - save all patterns
      await saveAllPatterns(patterns);
      console.log(chalk.green(`✅ Saved ${patterns.length} patterns`));
    }
    
    // Update standards based on learned patterns
    await updateStandardsFromPatterns(patterns);
  });
```

### Usage Examples

```bash
# Quick init with defaults
hodge init

# Force interactive mode
hodge init --interactive

# Specify PM tool upfront
hodge init --pm-tool linear

# Auto-accept everything and learn patterns
hodge init --yes --learn

# Post-init configuration
hodge config pm linear
hodge pm install-scripts
hodge learn --auto
```

## Pros
- **Fast by default**: Minimal questions for quick start
- **Progressive**: Can enhance configuration over time
- **Flexible**: Multiple ways to configure
- **Modular**: Separate commands for different aspects
- **Non-blocking**: Can start using Hodge immediately

## Cons
- **Multiple steps**: User needs to run multiple commands
- **Discovery**: Users might not know about post-init commands
- **Fragmented**: Configuration spread across multiple commands
- **Learning curve**: More commands to learn

## Compatibility with Current Stack
- ✅ Minimal changes to existing init
- ✅ New commands follow existing patterns
- ✅ Backwards compatible
- ✅ Uses existing infrastructure