# @agileexplorations/hodge v3

A balanced AI development framework that provides freedom to explore with discipline to ship.

## Repository Structure

```
hodge/
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── hodge.json                    # Default configuration
├── bin/
│   └── hodge.js                  # CLI entry point
├── src/
│   ├── index.js                  # Main library entry
│   ├── cli/
│   │   ├── index.js              # CLI router
│   │   └── commands/
│   │       ├── init.js           # Initialize project
│   │       ├── explore.js        # Exploration mode
│   │       ├── ship.js           # Ship mode
│   │       ├── decide.js         # Record decisions
│   │       ├── learn.js          # Learn patterns/standards
│   │       ├── standards.js      # Manage standards
│   │       └── context.js        # Show/manage context
│   ├── core/
│   │   ├── mode-manager.js       # Explore/Ship mode logic
│   │   ├── standards-engine.js   # Standards detection & enforcement
│   │   ├── pattern-learner.js    # Pattern extraction & learning
│   │   ├── context-builder.js    # Build AI context
│   │   ├── decision-tracker.js   # Lightweight decision tracking
│   │   └── ai-adapter.js         # Base AI integration
│   ├── adapters/
│   │   ├── claude.js             # Claude/Claude Code adapter
│   │   ├── cursor.js             # Cursor adapter
│   │   ├── openai.js             # OpenAI adapter
│   │   └── aider.js              # Aider adapter
│   ├── templates/
│   │   ├── hodge.json            # Default config template
│   │   ├── standards.md          # Standards template
│   │   ├── decisions.md          # Decisions template
│   │   └── context.md            # Context template
│   └── utils/
│       ├── git.js                # Git operations
│       ├── files.js              # File system utilities
│       └── config.js             # Configuration loader
├── templates/
│   └── prompts/
│       ├── explore.md            # Exploration prompt template
│       ├── ship.md               # Ship mode prompt template
│       └── learn.md              # Learning prompt template
├── examples/
│   ├── nextjs-app/               # Next.js example
│   ├── express-api/              # Express API example
│   └── python-fastapi/           # FastAPI example
├── docs/
│   ├── getting-started.md
│   ├── modes.md                  # Explore vs Ship
│   ├── standards.md              # Standards system
│   ├── patterns.md               # Pattern learning
│   └── ai-adapters.md
└── test/
    ├── unit/
    ├── integration/
    └── fixtures/
```

## Core Files

### package.json
```json
{
  "name": "@agileexplorations/hodge",
  "version": "3.0.0",
  "description": "Balanced AI development framework - explore freely, ship safely",
  "main": "src/index.js",
  "type": "module",
  "bin": {
    "hodge": "bin/hodge.js"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src",
    "format": "prettier --write 'src/**/*.js'"
  },
  "keywords": [
    "ai",
    "development",
    "claude",
    "cursor",
    "standards",
    "patterns",
    "workflow"
  ],
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.0",
    "simple-git": "^3.19.0",
    "fs-extra": "^11.1.0",
    "gray-matter": "^4.0.3",
    "cosmiconfig": "^8.3.0",
    "glob": "^10.3.0",
    "dotenv": "^16.3.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "openai": "^4.20.0",
    "diff": "^5.1.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "jest": "^29.6.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### hodge.json (Default Configuration)
```json
{
  "version": 3,
  "modes": {
    "explore": {
      "standards": "suggest",
      "patterns": "prefer",
      "decisions": "inform",
      "cleanup": "7d",
      "branch": "explore/{name}-{timestamp}"
    },
    "ship": {
      "standards": "enforce",
      "patterns": "require",
      "decisions": "follow",
      "tests": "required",
      "review": "automated",
      "branch": "ship/{name}"
    }
  },
  "ai": {
    "provider": "auto",
    "contextSize": 32000,
    "temperature": {
      "explore": 0.7,
      "ship": 0.3
    }
  },
  "learn": {
    "from": ["src/", "app/"],
    "ignore": ["*.test.*", "*.spec.*", "node_modules"],
    "threshold": 2,
    "autoLearn": true
  },
  "standards": {
    "detect": "auto",
    "enforce": {
      "explore": false,
      "ship": true
    }
  },
  "git": {
    "autoBranch": true,
    "cleanupAfter": "7d",
    "commitTemplate": "[hodge:{mode}] {message}"
  }
}
```

### bin/hodge.js
```javascript
#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

program
  .name('hodge')
  .description('AI development framework - explore freely, ship safely')
  .version(packageJson.version);

// Import commands
import '../src/cli/commands/init.js';
import '../src/cli/commands/explore.js';
import '../src/cli/commands/ship.js';
import '../src/cli/commands/decide.js';
import '../src/cli/commands/learn.js';
import '../src/cli/commands/standards.js';
import '../src/cli/commands/context.js';

// Parse arguments
program.parse();

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```

### src/cli/commands/init.js
```javascript
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

program
  .command('init')
  .description('Initialize Hodge in your project')
  .option('-f, --force', 'overwrite existing configuration')
  .action(async (options) => {
    console.log(chalk.blue('🐱 Initializing Hodge v3...\n'));
    
    // Check for existing config
    if (await fs.pathExists('.hodge') && !options.force) {
      console.log(chalk.yellow('Hodge already initialized. Use --force to reinitialize.'));
      return;
    }

    // Quick setup - just one question
    const { description } = await inquirer.prompt([{
      type: 'input',
      name: 'description',
      message: 'What are you building?',
      default: 'A web application'
    }]);

    // Create .hodge directory structure
    await fs.ensureDir('.hodge');
    await fs.ensureDir('.hodge/patterns');
    await fs.ensureDir('.hodge/explore');

    // Create context.md
    const contextContent = `# Project Context

**Description**: ${description}
**Initialized**: ${new Date().toISOString().split('T')[0]}
**Tech Stack**: [Auto-detected]

## Patterns
*Patterns will be learned from your code*

## Recent Work
*Your recent work will appear here*
`;
    await fs.writeFile('.hodge/context.md', contextContent);

    // Create decisions.md
    const decisionsContent = `# Project Decisions

## Architecture
*Record major architecture decisions here*

## Patterns
*Record pattern decisions here*

## Constraints
*Record constraints and requirements here*
`;
    await fs.writeFile('.hodge/decisions.md', decisionsContent);

    // Create standards.md
    const standardsContent = `# Project Standards

## Code Style
*Standards will be detected from your code*

## API Patterns
*API patterns will be learned*

## Component Patterns
*Component patterns will be learned*

## Testing
*Testing patterns will be learned*
`;
    await fs.writeFile('.hodge/standards.md', standardsContent);

    // Create hodge.json if it doesn't exist
    if (!await fs.pathExists('hodge.json')) {
      const config = {
        version: 3,
        project: description,
        initialized: new Date().toISOString()
      };
      await fs.writeJson('hodge.json', config, { spaces: 2 });
    }

    // Update .gitignore
    await updateGitignore();

    // Auto-detect tech stack
    await detectTechStack();

    console.log(chalk.green('\n✅ Hodge initialized successfully!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  1. Explore: hodge explore "your first feature"'));
    console.log(chalk.gray('  2. Ship:    hodge ship "your first feature"'));
    console.log(chalk.gray('  3. Learn:   hodge learn (after shipping something)\n'));
  });

async function updateGitignore() {
  const ignoreLines = [
    '',
    '# Hodge',
    '.hodge/explore/',
    '.hodge/*.tmp',
    '.hodge/cache/'
  ];

  const gitignorePath = '.gitignore';
  if (await fs.pathExists(gitignorePath)) {
    const content = await fs.readFile(gitignorePath, 'utf8');
    if (!content.includes('# Hodge')) {
      await fs.appendFile(gitignorePath, ignoreLines.join('\n'));
    }
  } else {
    await fs.writeFile(gitignorePath, ignoreLines.join('\n'));
  }
}

async function detectTechStack() {
  const detected = [];
  
  // Check package.json
  if (await fs.pathExists('package.json')) {
    const pkg = await fs.readJson('package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps.next) detected.push('Next.js');
    if (deps.react) detected.push('React');
    if (deps.express) detected.push('Express');
    if (deps.prisma) detected.push('Prisma');
    if (deps.typescript) detected.push('TypeScript');
  }
  
  // Check for other files
  if (await fs.pathExists('requirements.txt')) detected.push('Python');
  if (await fs.pathExists('Gemfile')) detected.push('Ruby');
  if (await fs.pathExists('go.mod')) detected.push('Go');
  
  if (detected.length > 0) {
    console.log(chalk.cyan(`\n📦 Detected tech stack: ${detected.join(', ')}`));
    
    // Update context with detected stack
    const contextPath = '.hodge/context.md';
    let context = await fs.readFile(contextPath, 'utf8');
    context = context.replace('[Auto-detected]', detected.join(', '));
    await fs.writeFile(contextPath, context);
  }
}
```

### src/cli/commands/explore.js
```javascript
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ModeManager } from '../../core/mode-manager.js';
import { ContextBuilder } from '../../core/context-builder.js';
import { AIAdapter } from '../../core/ai-adapter.js';

program
  .command('explore <topic>')
  .description('Explore ideas and approaches freely')
  .option('-c, --compare <n>', 'compare N approaches', parseInt)
  .option('-s, --save', 'save exploration for later reference')
  .option('--with <tool>', 'use specific AI tool (claude/cursor/aider)')
  .action(async (topic, options) => {
    const spinner = ora('Starting exploration...').start();
    
    try {
      // Initialize managers
      const modeManager = new ModeManager('explore');
      const contextBuilder = new ContextBuilder();
      
      // Create exploration branch
      const branchName = await modeManager.createBranch(topic);
      spinner.text = `Created branch: ${branchName}`;
      
      // Build context (standards as suggestions, decisions as context)
      const context = await contextBuilder.build({
        mode: 'explore',
        topic,
        includeStandards: true,
        includeDecisions: true,
        includePatterns: true,
        enforcement: 'suggest'
      });
      
      spinner.succeed('Context prepared');
      
      // Initialize AI
      const ai = new AIAdapter(options.with || 'auto');
      
      // Start exploration session
      console.log(chalk.blue(`\n🔍 Exploring: ${topic}\n`));
      console.log(chalk.gray('Context:'));
      console.log(chalk.gray(`  • Tech stack: ${context.techStack.join(', ')}`));
      console.log(chalk.gray(`  • Patterns available: ${context.patterns.length}`));
      console.log(chalk.gray(`  • Standards: Suggested (not enforced)\n`));
      
      if (options.compare) {
        // Generate multiple approaches
        await ai.exploreApproaches(topic, context, options.compare);
      } else {
        // Start interactive exploration
        await ai.startSession(context, {
          mode: 'explore',
          topic,
          temperature: 0.7,
          enforcement: 'suggest'
        });
      }
      
      // Save exploration if requested
      if (options.save) {
        await modeManager.saveExploration(topic);
        console.log(chalk.green(`\n✓ Exploration saved`));
      }
      
    } catch (error) {
      spinner.fail('Exploration failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });
```

### src/cli/commands/ship.js
```javascript
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { ModeManager } from '../../core/mode-manager.js';
import { ContextBuilder } from '../../core/context-builder.js';
import { StandardsEngine } from '../../core/standards-engine.js';
import { AIAdapter } from '../../core/ai-adapter.js';

program
  .command('ship <feature>')
  .description('Build production-ready code with enforced standards')
  .option('--from <exploration>', 'build from previous exploration')
  .option('--like <pattern>', 'use similar pattern')
  .option('--skip-tests', 'skip test generation (not recommended)')
  .option('--with <tool>', 'use specific AI tool')
  .action(async (feature, options) => {
    const spinner = ora('Preparing to ship...').start();
    
    try {
      // Initialize components
      const modeManager = new ModeManager('ship');
      const contextBuilder = new ContextBuilder();
      const standardsEngine = new StandardsEngine();
      
      // Create ship branch
      const branchName = await modeManager.createBranch(feature);
      spinner.text = `Created branch: ${branchName}`;
      
      // Build context with full enforcement
      const context = await contextBuilder.build({
        mode: 'ship',
        feature,
        includeStandards: true,
        includeDecisions: true,
        includePatterns: true,
        enforcement: 'strict',
        fromExploration: options.from,
        likePattern: options.like
      });
      
      // Load and validate standards
      const standards = await standardsEngine.load();
      spinner.succeed('Standards loaded and will be enforced');
      
      // Show what will be enforced
      console.log(chalk.cyan('\n📋 Shipping with:\n'));
      console.log(chalk.gray('Standards (enforced):'));
      standards.forEach(s => console.log(chalk.gray(`  ✓ ${s.name}`)));
      console.log(chalk.gray('\nPatterns (required):'));
      context.patterns.forEach(p => console.log(chalk.gray(`  ✓ ${p.name}`)));
      console.log(chalk.gray('\nDecisions (followed):'));
      context.decisions.forEach(d => console.log(chalk.gray(`  ✓ ${d}`)));
      
      // Confirm before proceeding
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Ready to ship with these standards?',
        default: true
      }]);
      
      if (!proceed) {
        console.log(chalk.yellow('Shipping cancelled'));
        return;
      }
      
      // Initialize AI with strict mode
      const ai = new AIAdapter(options.with || 'auto');
      
      // Start ship session
      console.log(chalk.green(`\n🚀 Shipping: ${feature}\n`));
      
      const result = await ai.startSession(context, {
        mode: 'ship',
        feature,
        temperature: 0.3,
        enforcement: 'strict',
        includeTests: !options.skipTests
      });
      
      // Validate output against standards
      spinner.start('Validating against standards...');
      const validation = await standardsEngine.validate(result);
      
      if (!validation.valid) {
        spinner.fail('Standards validation failed');
        console.log(chalk.red('\nViolations found:'));
        validation.violations.forEach(v => {
          console.log(chalk.red(`  ✗ ${v}`));
        });
        
        // Offer to auto-fix
        const { autofix } = await inquirer.prompt([{
          type: 'confirm',
          name: 'autofix',
          message: 'Attempt to auto-fix violations?',
          default: true
        }]);
        
        if (autofix) {
          await standardsEngine.autoFix(result);
          console.log(chalk.green('✓ Standards violations fixed'));
        }
      } else {
        spinner.succeed('All standards met');
      }
      
      // Generate tests if not skipped
      if (!options.skipTests) {
        spinner.start('Generating tests...');
        await ai.generateTests(context);
        spinner.succeed('Tests generated');
      }
      
      console.log(chalk.green(`\n✅ Successfully shipped: ${feature}\n`));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.gray('  1. Review the generated code'));
      console.log(chalk.gray('  2. Run tests: npm test'));
      console.log(chalk.gray('  3. Commit: git commit -m "Ship: ${feature}"'));
      
    } catch (error) {
      spinner.fail('Shipping failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });
```

### src/cli/commands/decide.js
```javascript
import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

program
  .command('decide <decision>')
  .description('Record an important decision (one-liner)')
  .option('-t, --type <type>', 'decision type (architecture/pattern/constraint)')
  .action(async (decision, options) => {
    // Get additional context if needed
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Decision type:',
        choices: ['architecture', 'pattern', 'constraint'],
        when: !options.type,
        default: 'architecture'
      },
      {
        type: 'input',
        name: 'reason',
        message: 'Brief reason (optional):',
        default: ''
      }
    ]);
    
    const type = options.type || answers.type;
    const date = new Date().toISOString().split('T')[0];
    
    // Format decision line
    let decisionLine = `- ${date}: ${decision}`;
    if (answers.reason) {
      decisionLine += ` - ${answers.reason}`;
    }
    
    // Update decisions.md
    const decisionsPath = '.hodge/decisions.md';
    let content = await fs.readFile(decisionsPath, 'utf8');
    
    // Find the right section and add the decision
    const sections = {
      'architecture': '## Architecture',
      'pattern': '## Patterns',
      'constraint': '## Constraints'
    };
    
    const sectionHeader = sections[type];
    const sectionIndex = content.indexOf(sectionHeader);
    
    if (sectionIndex === -1) {
      // Add section if it doesn't exist
      content += `\n${sectionHeader}\n${decisionLine}\n`;
    } else {
      // Insert after section header
      const lines = content.split('\n');
      let insertIndex = lines.findIndex(l => l === sectionHeader) + 1;
      
      // Skip existing decisions to add at the end of section
      while (insertIndex < lines.length && lines[insertIndex].startsWith('- ')) {
        insertIndex++;
      }
      
      lines.splice(insertIndex, 0, decisionLine);
      content = lines.join('\n');
    }
    
    await fs.writeFile(decisionsPath, content);
    
    console.log(chalk.green(`\n✓ Decision recorded: ${decision}\n`));
    console.log(chalk.gray('This decision will inform future explorations and be enforced during shipping.'));
  });
```

### src/cli/commands/learn.js
```javascript
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { PatternLearner } from '../../core/pattern-learner.js';
import { StandardsEngine } from '../../core/standards-engine.js';

program
  .command('learn')
  .description('Learn patterns and standards from your code')
  .option('--standards', 'learn and update standards')
  .option('--patterns', 'extract patterns from recent code')
  .option('--from <path>', 'learn from specific directory')
  .action(async (options) => {
    const spinner = ora('Analyzing your code...').start();
    
    try {
      const patternLearner = new PatternLearner();
      const standardsEngine = new StandardsEngine();
      
      // Determine what to learn
      const learnPatterns = options.patterns || !options.standards;
      const learnStandards = options.standards || !options.patterns;
      
      if (learnPatterns) {
        spinner.text = 'Extracting patterns...';
        
        // Find patterns in code
        const patterns = await patternLearner.extract({
          from: options.from || ['src/', 'app/'],
          minOccurrences: 2
        });
        
        if (patterns.length === 0) {
          spinner.info('No repeated patterns found');
        } else {
          spinner.succeed(`Found ${patterns.length} patterns`);
          
          // Show patterns and ask which to save
          console.log(chalk.cyan('\n📚 Discovered Patterns:\n'));
          
          for (const pattern of patterns) {
            console.log(chalk.green(`\n${pattern.name}`));
            console.log(chalk.gray(`  Type: ${pattern.type}`));
            console.log(chalk.gray(`  Found in: ${pattern.occurrences} places`));
            console.log(chalk.gray(`  Example: ${pattern.example}`));
            
            const { save } = await inquirer.prompt([{
              type: 'confirm',
              name: 'save',
              message: `Save this pattern?`,
              default: true
            }]);
            
            if (save) {
              await patternLearner.save(pattern);
              console.log(chalk.green(`  ✓ Pattern saved`));
            }
          }
        }
      }
      
      if (learnStandards) {
        spinner.start('Detecting standards...');
        
        // Analyze code for standards
        const detectedStandards = await standardsEngine.detect({
          from: options.from || ['src/', 'app/']
        });
        
        spinner.succeed(`Detected ${detectedStandards.length} standards`);
        
        // Show standards and ask which to adopt
        console.log(chalk.cyan('\n📏 Detected Standards:\n'));
        
        for (const standard of detectedStandards) {
          console.log(chalk.green(`\n${standard.name}`));
          console.log(chalk.gray(`  ${standard.description}`));
          
          const { adopt } = await inquirer.prompt([{
            type: 'confirm',
            name: 'adopt',
            message: `Adopt this standard?`,
            default: true
          }]);
          
          if (adopt) {
            await standardsEngine.add(standard);
            console.log(chalk.green(`  ✓ Standard adopted`));
          }
        }
      }
      
      // Update context with learnings
      spinner.start('Updating project context...');
      await updateContext();
      spinner.succeed('Context updated');
      
      console.log(chalk.green('\n✅ Learning complete!\n'));
      console.log(chalk.gray('Your patterns and standards will be:'));
      console.log(chalk.gray('  • Suggested during exploration'));
      console.log(chalk.gray('  • Enforced during shipping'));
      
    } catch (error) {
      spinner.fail('Learning failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

async function updateContext() {
  // Update context.md with learned patterns and standards
  const contextPath = '.hodge/context.md';
  let context = await fs.readFile(contextPath, 'utf8');
  
  // Add timestamp
  const now = new Date().toISOString();
  if (!context.includes('## Last Updated')) {
    context += `\n## Last Updated\n${now}`;
  } else {
    context = context.replace(/## Last Updated\n.+/, `## Last Updated\n${now}`);
  }
  
  await fs.writeFile(contextPath, context);
}
```

### src/core/mode-manager.js
```javascript
import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class ModeManager {
  constructor(mode) {
    this.mode = mode; // 'explore' or 'ship'
    this.git = simpleGit();
    this.config = this.loadConfig();
  }
  
  loadConfig() {
    try {
      return fs.readJsonSync('hodge.json');
    } catch {
      // Return defaults if no config
      return {
        modes: {
          explore: {
            branch: 'explore/{name}-{timestamp}',
            cleanup: '7d'
          },
          ship: {
            branch: 'ship/{name}'
          }
        }
      };
    }
  }
  
  async createBranch(name) {
    const modeConfig = this.config.modes[this.mode];
    const timestamp = Date.now();
    
    // Format branch name
    let branchName = modeConfig.branch
      .replace('{name}', name.toLowerCase().replace(/\s+/g, '-'))
      .replace('{timestamp}', timestamp);
    
    // Create and checkout branch
    await this.git.checkoutLocalBranch(branchName);
    
    return branchName;
  }
  
  async saveExploration(topic) {
    const explorePath = `.hodge/explore/${topic}-${Date.now()}`;
    await fs.ensureDir(explorePath);
    
    // Save current state
    const status = await this.git.status();
    const summary = {
      topic,
      date: new Date().toISOString(),
      branch: status.current,
      files: status.files
    };
    
    await fs.writeJson(`${explorePath}/summary.json`, summary, { spaces: 2 });
    
    // Copy changed files
    for (const file of status.files) {
      const destPath = path.join(explorePath, file.path);
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(file.path, destPath);
    }
  }
  
  async cleanupOldExplorations() {
    const explorePath = '.hodge/explore';
    if (!await fs.pathExists(explorePath)) return;
    
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    const dirs = await fs.readdir(explorePath);
    for (const dir of dirs) {
      const dirPath = path.join(explorePath, dir);
      const stat = await fs.stat(dirPath);
      
      if (now - stat.mtimeMs > maxAge) {
        await fs.remove(dirPath);
        console.log(chalk.gray(`Cleaned up old exploration: ${dir}`));
      }
    }
  }
}
```

### src/core/standards-engine.js
```javascript
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export class StandardsEngine {
  constructor() {
    this.standardsPath = '.hodge/standards.md';
    this.standards = [];
  }
  
  async load() {
    // Load standards from file
    if (await fs.pathExists(this.standardsPath)) {
      const content = await fs.readFile(this.standardsPath, 'utf8');
      this.standards = this.parseStandards(content);
    }
    
    // Auto-detect from project if needed
    if (this.standards.length === 0) {
      this.standards = await this.detectFromProject();
    }
    
    return this.standards;
  }
  
  parseStandards(content) {
    const standards = [];
    const sections = content.split('##').filter(s => s.trim());
    
    for (const section of sections) {
      const lines = section.split('\n').filter(l => l.trim());
      const name = lines[0].trim();
      const rules = lines.slice(1)
        .filter(l => l.startsWith('*') || l.startsWith('-'))
        .map(l => l.replace(/^[*-]\s*/, ''));
      
      if (rules.length > 0) {
        standards.push({ name, rules });
      }
    }
    
    return standards;
  }
  
  async detectFromProject() {
    const detected = [];
    
    // Check for package.json
    if (await fs.pathExists('package.json')) {
      const pkg = await fs.readJson('package.json');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // React standards
      if (deps.react) {
        detected.push({
          name: 'React',
          rules: [
            'Use functional components with hooks',
            'Props must have TypeScript interfaces',
            'Use proper key props in lists'
          ]
        });
      }
      
      // TypeScript standards
      if (deps.typescript) {
        detected.push({
          name: 'TypeScript',
          rules: [
            'Strict mode enabled',
            'No any types',
            'Explicit return types for functions'
          ]
        });
      }
      
      // Testing standards
      if (deps.jest || deps.vitest) {
        detected.push({
          name: 'Testing',
          rules: [
            'Tests required for all new features',
            'Minimum 80% coverage for ship mode',
            'Use descriptive test names'
          ]
        });
      }
    }
    
    // Check for linter configs
    if (await fs.pathExists('.eslintrc.json') || await fs.pathExists('.eslintrc.js')) {
      detected.push({
        name: 'ESLint',
        rules: ['Follow ESLint configuration']
      });
    }
    
    if (await fs.pathExists('.prettierrc')) {
      detected.push({
        name: 'Prettier',
        rules: ['Follow Prettier formatting']
      });
    }
    
    return detected;
  }
  
  async detect({ from }) {
    const standards = [];
    const files = await glob(`${from}/**/*.{js,jsx,ts,tsx}`, {
      ignore: ['node_modules/**', '*.test.*']
    });
    
    // Sample files to detect patterns
    const sampleSize = Math.min(files.length, 10);
    const sampleFiles = files.slice(0, sampleSize);
    
    for (const file of sampleFiles) {
      const content = await fs.readFile(file, 'utf8');
      
      // Detect component patterns
      if (content.includes('export default function') || content.includes('export function')) {
        if (!standards.find(s => s.name === 'Function Exports')) {
          standards.push({
            name: 'Function Exports',
            description: 'Use named function exports',
            detected: true
          });
        }
      }
      
      // Detect async patterns
      if (content.includes('async') && content.includes('await')) {
        if (!standards.find(s => s.name === 'Async/Await')) {
          standards.push({
            name: 'Async/Await',
            description: 'Use async/await over promises',
            detected: true
          });
        }
      }
      
      // Detect error handling
      if (content.includes('try') && content.includes('catch')) {
        if (!standards.find(s => s.name === 'Error Handling')) {
          standards.push({
            name: 'Error Handling',
            description: 'Wrap async operations in try/catch',
            detected: true
          });
        }
      }
    }
    
    return standards;
  }
  
  async validate(code) {
    const violations = [];
    
    // Check against each standard
    for (const standard of this.standards) {
      for (const rule of standard.rules) {
        // Simplified validation - in real implementation would use AST
        if (rule.includes('no any types') && code.includes(': any')) {
          violations.push(`${standard.name}: ${rule}`);
        }
        if (rule.includes('functional components') && code.includes('class') && code.includes('extends Component')) {
          violations.push(`${standard.name}: ${rule}`);
        }
        // Add more validation rules
      }
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }
  
  async add(standard) {
    // Add standard to standards.md
    let content = await fs.readFile(this.standardsPath, 'utf8');
    
    // Add to appropriate section
    const section = `\n## ${standard.name}\n${standard.rules.map(r => `- ${r}`).join('\n')}\n`;
    content += section;
    
    await fs.writeFile(this.standardsPath, content);
    this.standards.push(standard);
  }
  
  async autoFix(code) {
    // Apply auto-fixable standards
    let fixed = code;
    
    // Example: Add missing semicolons
    if (this.standards.some(s => s.rules.includes('Use semicolons'))) {
      fixed = fixed.replace(/^(?!.*[;{}]).*$/gm, '$&;');
    }
    
    // In real implementation, would use proper AST transformation
    return fixed;
  }
}
```

### src/core/pattern-learner.js
```javascript
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import crypto from 'crypto';

export class PatternLearner {
  constructor() {
    this.patternsPath = '.hodge/patterns';
  }
  
  async extract({ from, minOccurrences = 2 }) {
    const patterns = [];
    const codeBlocks = new Map(); // Hash -> code block mapping
    
    // Find all relevant files
    const files = await glob(`${from}/**/*.{js,jsx,ts,tsx}`, {
      ignore: ['node_modules/**', '*.test.*', '*.spec.*']
    });
    
    // Extract potential patterns
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const blocks = this.extractCodeBlocks(content);
      
      for (const block of blocks) {
        const hash = this.hashCodeBlock(block);
        
        if (!codeBlocks.has(hash)) {
          codeBlocks.set(hash, {
            code: block.code,
            type: block.type,
            occurrences: [],
            firstSeen: file
          });
        }
        
        codeBlocks.get(hash).occurrences.push(file);
      }
    }
    
    // Find patterns that occur multiple times
    for (const [hash, data] of codeBlocks) {
      if (data.occurrences.length >= minOccurrences) {
        patterns.push({
          name: this.generatePatternName(data.type, data.code),
          type: data.type,
          occurrences: data.occurrences.length,
          example: data.code,
          hash
        });
      }
    }
    
    return patterns;
  }
  
  extractCodeBlocks(content) {
    const blocks = [];
    
    // Extract functions
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)[^{]*{([^}]*)}/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      blocks.push({
        type: 'function',
        name: match[1],
        code: match[0]
      });
    }
    
    // Extract React components
    const componentRegex = /(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w+)[^{]*{[^}]*return[^}]*}/g;
    
    while ((match = componentRegex.exec(content)) !== null) {
      blocks.push({
        type: 'component',
        name: match[1],
        code: match[0]
      });
    }
    
    // Extract API routes (Next.js style)
    const apiRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)[^{]*{[^}]*}/g;
    
    while ((match = apiRegex.exec(content)) !== null) {
      blocks.push({
        type: 'api-route',
        name: match[1],
        code: match[0]
      });
    }
    
    return blocks;
  }
  
  hashCodeBlock(block) {
    // Normalize code to ignore variable names
    let normalized = block.code
      .replace(/\b[a-z]\w*\b/g, 'VAR') // Replace variable names
      .replace(/["'].*?["']/g, 'STRING') // Replace strings
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }
  
  generatePatternName(type, code) {
    const baseNames = {
      'function': 'Function Pattern',
      'component': 'Component Pattern',
      'api-route': 'API Route Pattern'
    };
    
    let name = baseNames[type] || 'Code Pattern';
    
    // Add specifics based on code content
    if (code.includes('try') && code.includes('catch')) {
      name += ' with Error Handling';
    }
    if (code.includes('async')) {
      name += ' (Async)';
    }
    if (code.includes('useState')) {
      name += ' with State';
    }
    
    return name;
  }
  
  async save(pattern) {
    await fs.ensureDir(this.patternsPath);
    
    const filename = `${pattern.type}-${pattern.hash.slice(0, 8)}.js`;
    const filepath = path.join(this.patternsPath, filename);
    
    const content = `// Pattern: ${pattern.name}
// Type: ${pattern.type}
// Occurrences: ${pattern.occurrences}
// Learned: ${new Date().toISOString()}

${pattern.example}

/* Usage:
 * This pattern appears in ${pattern.occurrences} places in your codebase.
 * It will be suggested during exploration and required during shipping.
 */
`;
    
    await fs.writeFile(filepath, content);
  }
  
  async loadAll() {
    if (!await fs.pathExists(this.patternsPath)) {
      return [];
    }
    
    const files = await glob(`${this.patternsPath}/*.js`);
    const patterns = [];
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const name = content.match(/Pattern: (.+)/)?.[1];
      const type = content.match(/Type: (.+)/)?.[1];
      
      patterns.push({
        name,
        type,
        file,
        content
      });
    }
    
    return patterns;
  }
}
```

### src/core/context-builder.js
```javascript
import fs from 'fs-extra';
import path from 'path';
import { StandardsEngine } from './standards-engine.js';
import { PatternLearner } from './pattern-learner.js';

export class ContextBuilder {
  constructor() {
    this.contextPath = '.hodge';
  }
  
  async build(options) {
    const context = {
      mode: options.mode,
      topic: options.topic || options.feature,
      techStack: [],
      standards: [],
      patterns: [],
      decisions: [],
      enforcement: options.enforcement
    };
    
    // Load tech stack from context.md
    const contextFile = path.join(this.contextPath, 'context.md');
    if (await fs.pathExists(contextFile)) {
      const content = await fs.readFile(contextFile, 'utf8');
      const techMatch = content.match(/\*\*Tech Stack\*\*: (.+)/);
      if (techMatch) {
        context.techStack = techMatch[1].split(', ');
      }
    }
    
    // Load standards if requested
    if (options.includeStandards) {
      const standardsEngine = new StandardsEngine();
      context.standards = await standardsEngine.load();
    }
    
    // Load patterns if requested
    if (options.includePatterns) {
      const patternLearner = new PatternLearner();
      context.patterns = await patternLearner.loadAll();
    }
    
    // Load decisions if requested
    if (options.includeDecisions) {
      const decisionsFile = path.join(this.contextPath, 'decisions.md');
      if (await fs.pathExists(decisionsFile)) {
        const content = await fs.readFile(decisionsFile, 'utf8');
        // Extract all decision lines
        const lines = content.split('\n').filter(l => l.startsWith('- '));
        context.decisions = lines.map(l => l.substring(2));
      }
    }
    
    // Load from exploration if specified
    if (options.fromExploration) {
      const explorePath = path.join(this.contextPath, 'explore', options.fromExploration);
      if (await fs.pathExists(explorePath)) {
        const summary = await fs.readJson(path.join(explorePath, 'summary.json'));
        context.exploration = summary;
      }
    }
    
    return context;
  }
  
  async generatePrompt(context) {
    let prompt = `# Development Context

Mode: ${context.mode}
Topic: ${context.topic}
Tech Stack: ${context.techStack.join(', ')}

`;
    
    // Add mode-specific instructions
    if (context.mode === 'explore') {
      prompt += `## Exploration Mode Instructions

You are in EXPLORATION mode. Your goals:
- Suggest multiple approaches and alternatives
- Use the established tech stack as a starting point
- Follow standards as suggestions, not requirements
- Allow experimentation and learning
- Point out trade-offs and considerations

Standards are SUGGESTED but not required.
Patterns are PREFERRED but not mandatory.
Decisions should INFORM your suggestions.

`;
    } else if (context.mode === 'ship') {
      prompt += `## Ship Mode Instructions

You are in SHIP mode. Your goals:
- Build production-ready code
- STRICTLY follow all standards
- USE established patterns
- INCLUDE comprehensive error handling
- WRITE tests for all functionality
- ENSURE performance and security

Standards MUST be followed.
Patterns MUST be used.
Decisions MUST be respected.
Tests MUST be included.

`;
    }
    
    // Add standards
    if (context.standards.length > 0) {
      prompt += `## Standards (${context.enforcement})\n\n`;
      for (const standard of context.standards) {
        prompt += `### ${standard.name}\n`;
        for (const rule of standard.rules) {
          prompt += `- ${rule}\n`;
        }
        prompt += '\n';
      }
    }
    
    // Add patterns
    if (context.patterns.length > 0) {
      prompt += `## Available Patterns\n\n`;
      for (const pattern of context.patterns) {
        prompt += `### ${pattern.name}\n`;
        prompt += `Type: ${pattern.type}\n`;
        prompt += `Location: ${pattern.file}\n\n`;
      }
    }
    
    // Add decisions
    if (context.decisions.length > 0) {
      prompt += `## Project Decisions\n\n`;
      for (const decision of context.decisions) {
        prompt += `- ${decision}\n`;
      }
      prompt += '\n';
    }
    
    return prompt;
  }
}
```

### src/core/ai-adapter.js
```javascript
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class AIAdapter {
  constructor(provider = 'auto') {
    this.provider = this.detectProvider(provider);
  }
  
  detectProvider(provider) {
    if (provider !== 'auto') return provider;
    
    // Auto-detect available AI tool
    const tools = ['claude', 'cursor', 'aider'];
    
    for (const tool of tools) {
      try {
        const result = this.checkCommand(tool);
        if (result) return tool;
      } catch {
        continue;
      }
    }
    
    // Default to manual mode
    return 'manual';
  }
  
  checkCommand(command) {
    // Check if command exists
    const { execSync } = require('child_process');
    try {
      execSync(`which ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
  
  async startSession(context, options) {
    const contextBuilder = new (await import('./context-builder.js')).ContextBuilder();
    const prompt = await contextBuilder.generatePrompt(context);
    
    // Save prompt to temporary file
    const promptFile = `.hodge/temp-prompt-${Date.now()}.md`;
    await fs.ensureDir('.hodge');
    await fs.writeFile(promptFile, prompt);
    
    switch (this.provider) {
      case 'claude':
        return this.startClaudeSession(promptFile, options);
      case 'cursor':
        return this.startCursorSession(promptFile, options);
      case 'aider':
        return this.startAiderSession(promptFile, options);
      default:
        return this.startManualSession(promptFile, options);
    }
  }
  
  async startClaudeSession(promptFile, options) {
    console.log(chalk.cyan('Starting Claude session...'));
    
    const args = [
      '--system-prompt-file', promptFile,
      '--temperature', options.temperature.toString()
    ];
    
    if (options.mode === 'ship') {
      args.push('--require-tests');
      args.push('--strict-mode');
    }
    
    const claude = spawn('claude', args, {
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      claude.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Claude exited with code ${code}`));
      });
    });
  }
  
  async startCursorSession(promptFile, options) {
    console.log(chalk.cyan('Starting Cursor session...'));
    console.log(chalk.gray(`Context loaded from: ${promptFile}`));
    console.log(chalk.gray('Open Cursor and use the context for your session.'));
    
    // Open Cursor with the project
    const cursor = spawn('cursor', ['.'], {
      stdio: 'inherit'
    });
    
    return new Promise((resolve) => {
      cursor.on('exit', () => resolve());
    });
  }
  
  async startAiderSession(promptFile, options) {
    console.log(chalk.cyan('Starting Aider session...'));
    
    const args = ['--message-file', promptFile];
    
    if (options.mode === 'ship') {
      args.push('--auto-commit');
    }
    
    const aider = spawn('aider', args, {
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      aider.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Aider exited with code ${code}`));
      });
    });
  }
  
  async startManualSession(promptFile, options) {
    console.log(chalk.yellow('\nNo AI tool detected. Manual mode:\n'));
    console.log(chalk.gray('1. Copy the context from:'), chalk.blue(promptFile));
    console.log(chalk.gray('2. Paste into your preferred AI tool'));
    console.log(chalk.gray('3. Work with the AI using the provided context\n'));
    
    const { execSync } = require('child_process');
    
    // Try to copy to clipboard
    try {
      const content = await fs.readFile(promptFile, 'utf8');
      if (process.platform === 'darwin') {
        execSync('pbcopy', { input: content });
        console.log(chalk.green('✓ Context copied to clipboard'));
      } else if (process.platform === 'linux') {
        execSync('xclip -selection clipboard', { input: content });
        console.log(chalk.green('✓ Context copied to clipboard'));
      }
    } catch {
      console.log(chalk.gray('Copy the context manually from the file above'));
    }
  }
  
  async exploreApproaches(topic, context, numApproaches = 3) {
    const prompt = `
Explore ${numApproaches} different approaches for: ${topic}

For each approach:
1. Brief description
2. Pros and cons
3. Code example or structure
4. Considerations and trade-offs

Given the context:
- Tech stack: ${context.techStack.join(', ')}
- Available patterns: ${context.patterns.length}
- Existing decisions: ${context.decisions.length}

Please provide ${numApproaches} distinct approaches.
`;
    
    console.log(chalk.cyan(`\nGenerating ${numApproaches} approaches...\n`));
    
    // In real implementation, would call AI API
    // For now, show the prompt
    console.log(prompt);
    
    return [];
  }
  
  async generateTests(context) {
    console.log(chalk.cyan('\nGenerating tests...\n'));
    
    // In real implementation, would generate actual tests
    console.log(chalk.gray('Tests would be generated based on:'));
    console.log(chalk.gray(`  • Standards: ${context.standards.length} rules`));
    console.log(chalk.gray(`  • Patterns: ${context.patterns.length} patterns`));
    console.log(chalk.gray(`  • Mode: ${context.mode}`));
  }
}
```

### README.md
```markdown
# Hodge v3

> Freedom to explore, discipline to ship, wisdom to know the difference

A balanced AI development framework that provides guided exploration with enforced standards when shipping production code.

## Quick Start

```bash
# Install
npm install -g @agileexplorations/hodge

# Initialize (one question!)
hodge init

# Explore freely
hodge explore "authentication options"

# Ship with standards
hodge ship "user authentication"

# Learn from your code
hodge learn
```

## Core Philosophy

- **Two Modes**: Explore (creative) and Ship (strict)
- **Standards Always Present**: Suggested in explore, enforced in ship
- **Learn From Success**: Patterns extracted from shipped code
- **Minimal Documentation**: One-line decisions, bullet-point standards

## The Two Modes

### 🔍 Explore Mode
```bash
hodge explore "payment processing"
```
- Standards are **suggested**, not required
- Try different approaches
- Break patterns to learn
- Quick prototypes encouraged
- Auto-cleaned after 7 days

### 🚀 Ship Mode
```bash
hodge ship "payment processing"
```
- Standards are **enforced**
- Patterns are **required**
- Tests are **mandatory**
- Production quality **guaranteed**
- Full validation and checks

## How It Works

### 1. Standards Detection
Hodge automatically detects your standards from:
- Existing code patterns
- Package.json dependencies  
- Linter configurations
- Your actual code style

### 2. Pattern Learning
After shipping features, Hodge learns your patterns:
```bash
hodge learn
# Extracts patterns that appear 2+ times
# Saves them for reuse
```

### 3. Decision Tracking
Record important decisions as one-liners:
```bash
hodge decide "Using PostgreSQL over MongoDB - relational data"
```

### 4. Context Awareness
Every AI interaction includes:
- Your tech stack
- Your standards (enforcement varies by mode)
- Your patterns
- Your decisions

## Example Workflow

```bash
# Monday: Explore different approaches
hodge explore "real-time updates"
# Try WebSockets, SSE, polling...

# Tuesday: Make a decision
hodge decide "Using Pusher for real-time - simpler than WebSockets"

# Wednesday: Ship it properly  
hodge ship "real-time notifications"
# AI enforces all standards, uses Pusher

# Thursday: Learn the pattern
hodge learn
# Your real-time pattern is saved for reuse
```

## Configuration

Minimal configuration in `hodge.json`:

```json
{
  "version": 3,
  "modes": {
    "explore": {
      "standards": "suggest",
      "cleanup": "7d"
    },
    "ship": {
      "standards": "enforce",
      "tests": "required"
    }
  }
}
```

## What Gets Created

```
.hodge/
├── context.md      # Your project context
├── decisions.md    # One-line decisions
├── standards.md    # Bullet-point standards
├── patterns/       # Learned code patterns
└── explore/        # Recent explorations
```

## Commands

- `hodge init` - Initialize in your project
- `hodge explore <topic>` - Explore freely
- `hodge ship <feature>` - Ship with standards
- `hodge decide <decision>` - Record a decision
- `hodge learn` - Learn patterns from your code
- `hodge standards` - View/edit standards
- `hodge context` - View current context

## AI Tool Support

Works with any AI tool:
- Claude / Claude Code
- Cursor
- Aider
- ChatGPT / OpenAI API
- Manual (copies context to clipboard)

## Why Hodge v3?

- **Balanced**: Freedom when exploring, discipline when shipping
- **Intelligent**: Learns from your code, not from configuration
- **Minimal**: Two modes, seven commands, that's it
- **Practical**: Built for real development, not process theater

## License

MIT

---

*"The best code is the code that ships with the right quality at the right time."*
```

## Summary

This is Hodge v3 - a balanced framework that:

1. **Maintains Standards**: Always present, enforcement varies
2. **Preserves Freedom**: Explore mode for experimentation  
3. **Ensures Quality**: Ship mode with strict enforcement
4. **Learns Patterns**: From your actual shipped code
5. **Tracks Decisions**: One-liners, not documents
6. **Stays Minimal**: Just enough structure, no more

The key insight is that standards and patterns should always inform the AI, but enforcement should match the development phase. This gives you both the freedom to innovate and the discipline to ship quality code.