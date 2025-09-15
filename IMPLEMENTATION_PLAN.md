# Hodge Implementation Plan

## Overview
Hodge is a balanced AI development framework that provides "Freedom to explore, discipline to build, confidence to ship." It will be published as an NPM package at `@agile-explorations/hodge`.

## Core Philosophy
- **Three Modes**: Explore (creative), Build (structured), Harden (production-ready)
- **Progressive Standards**: Suggested → Recommended → Enforced
- **Learn From Code**: Patterns extracted from actual implementations
- **Minimal Documentation**: One-line decisions, bullet-point standards

## Command Structure (Finalized)

### Core Commands
```bash
# Initialization
hodge init                          # One-question setup

# Core workflow
hodge explore "feature"             # Start exploration
hodge decide                        # Interactive batch decisions
hodge decide "specific"             # Single decision
hodge decide --quick                # Quick inline mode
hodge decisions                     # Manage past decisions (interactive)
hodge review                        # Smart checkpoint (auto-triggered)
hodge review --pending              # Show only pending decisions
hodge review --all                  # Complete history
hodge build "feature"               # Build mode (can start here)
hodge harden "feature"              # Production mode
hodge ship                          # Complete, learn patterns, archive

# Status & Context
hodge status                        # List all features (interactive load)
hodge status "feature"              # Show specific feature (with load prompt)
hodge context                       # View current session context
hodge context --save                # Save session checkpoint
hodge context --load                # Restore session checkpoint
hodge context --list                # List saved sessions

# Management commands
hodge reset "feature"               # Start feature over (current work only)
hodge learn                         # Extract patterns (auto during ship)
hodge standards                     # View/manage standards
hodge patterns                      # View learned patterns

# Integration
hodge warp setup                    # Generate Warp workflows
```

### Key Design Decisions

#### Context & Session Management
- **Feature state**: Stored in `.hodge/features/{name}/` directories
- **Session context**: One active context for current work session
- **Auto-save strategy**: Command-based (no background timers)
- **Save triggers**: After commands, opportunistic time checks
- **Context includes**: Feature, mode, todos, test status, conversation history

#### Status Command Behavior
- **`hodge status`**: Lists all features with interactive load prompt
- **`hodge status "feature"`**: Shows specific feature with load option
- **Loading**: Can load via status prompts or direct mode commands

#### Mode Progression
- **Direct entry allowed**: Can start at any mode
- **Auto-context**: Minimal context created if missing
- **Smart gaps**: Review command identifies missing decisions

#### Review Triggers
- **Auto-suggest**: After time/activity threshold
- **Required**: Before mode advancement
- **Future**: Configurable triggers (backlog)

#### Decision System
- **Making decisions**: `hodge decide` for new decisions (batch or single)
- **Quick mode**: Inline decisions via `--quick`
- **Selection + documentation**: Single command for both
- **Managing decisions**: `hodge decisions` for interactive management
- **Actions**: View, amend, revert, filter, search past decisions

#### Reset & Rollback
- **`hodge reset "feature"`**: Start feature over
- **Scope**: Current work only, not learned patterns
- **Pattern modification**: Separate workflow (future)

#### Collaboration
- **Approach**: Git-based sharing via `.hodge/features/`
- **Commands**: Use standard git workflow
- **Future**: Export/import based on feedback

#### Configuration Philosophy
- **Start minimal**: Basic config only
- **Expand on feedback**: Add options based on user needs
- **Defaults**: Auto-save on, minimal config required

#### Claude Code Development Integration
- **Core slash commands**: /explore, /build, /harden, /review
- **Prototype first**: Simple implementations for testing
- **Gradual migration**: Switch to real hodge commands as available
- **Dogfooding**: Use commands while developing Hodge

## Development Testing Strategy

### Local Development Setup
```bash
# In the hodge project directory
npm link  # Creates global symlink

# In a test project directory
npm link @agile-explorations/hodge  # Uses local version (note the hyphen!)
hodge init  # Test the command

# For development iteration
npm run dev  # Watch mode for changes
```

### Testing During Development

#### Phase 1 Testing (CLI Foundation)
```bash
# Test basic CLI
node bin/hodge.js --help
node bin/hodge.js init

# Test in fresh project
mkdir test-project && cd test-project
hodge init
# Should create .hodge/ directory structure

# Test with different Node versions
nvm use 18 && hodge init
nvm use 20 && hodge init
```

#### Phase 2 Testing (Mode System)
```bash
# Create test scenarios
mkdir mode-test && cd mode-test
hodge init

# Test explore mode
hodge explore "authentication options"
git branch  # Should show explore branch

# Test build mode
hodge build "user authentication"
git branch  # Should show build branch

# Test harden mode
hodge harden "user authentication"
# Should enforce all standards
```

#### Phase 3 Testing (Learning Engine)
```bash
# Seed project with patterns
cp -r examples/nextjs-patterns test-learn/
cd test-learn
hodge init

# Test pattern detection
hodge learn
# Should find repeated patterns

# Test standards detection
hodge standards detect
# Should find ESLint, TypeScript, etc.
```

### Test Harness Script
Create `scripts/test-local.js`:
```javascript
#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const testDir = './test-sandbox';

async function runTest(name, commands) {
  console.log(chalk.blue(`\n📦 Testing: ${name}`));
  
  // Clean and create test directory
  await fs.remove(testDir);
  await fs.ensureDir(testDir);
  process.chdir(testDir);
  
  try {
    for (const cmd of commands) {
      console.log(chalk.gray(`  $ ${cmd}`));
      execSync(cmd, { stdio: 'inherit' });
    }
    console.log(chalk.green(`  ✓ ${name} passed`));
    return true;
  } catch (error) {
    console.log(chalk.red(`  ✗ ${name} failed`));
    return false;
  } finally {
    process.chdir('..');
  }
}

// Test suite
const tests = [
  {
    name: 'Init Command',
    commands: [
      'hodge init --force',
      'ls -la .hodge',
      'cat hodge.json'
    ]
  },
  {
    name: 'Explore Mode',
    commands: [
      'hodge init --force',
      'hodge explore "test feature"',
      'git branch | grep explore'
    ]
  },
  {
    name: 'Build Mode',
    commands: [
      'hodge init --force',
      'hodge build "test feature"',
      'git branch | grep build'
    ]
  },
  {
    name: 'Decision Tracking',
    commands: [
      'hodge init --force',
      'hodge decide "Use TypeScript for type safety"',
      'cat .hodge/decisions.md | grep TypeScript'
    ]
  }
];

// Run all tests
async function runAllTests() {
  const results = [];
  for (const test of tests) {
    const passed = await runTest(test.name, test.commands);
    results.push({ name: test.name, passed });
  }
  
  // Summary
  console.log(chalk.cyan('\n📊 Test Summary:'));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(chalk.green(`  ✓ Passed: ${passed}`));
  if (failed > 0) {
    console.log(chalk.red(`  ✗ Failed: ${failed}`));
  }
  
  // Cleanup
  await fs.remove(testDir);
}

runAllTests();
```

### Integration Testing

#### Mock AI Responses
Create `test/mocks/ai-responses.js`:
```javascript
export const mockResponses = {
  explore: {
    authentication: `
      Here are three approaches for authentication:
      1. NextAuth.js - Full-featured
      2. Clerk - Managed service
      3. Custom JWT - Full control
    `
  },
  build: {
    authentication: `
      Implementing authentication with Clerk:
      - Following your React patterns
      - Using your API structure
      - Including error handling
    `
  },
  harden: {
    authentication: `
      Production-ready authentication:
      ✓ All standards enforced
      ✓ Comprehensive tests included
      ✓ Security best practices applied
      ✓ Performance optimized
    `
  }
};
```

#### E2E Test Flow
```javascript
// test/e2e/full-workflow.test.js
import { execSync } from 'child_process';
import fs from 'fs-extra';

describe('Full Hodge Workflow', () => {
  const testDir = './test-e2e-temp';
  
  beforeEach(() => {
    fs.removeSync(testDir);
    fs.ensureDirSync(testDir);
    process.chdir(testDir);
  });
  
  afterEach(() => {
    process.chdir('..');
    fs.removeSync(testDir);
  });
  
  test('complete feature development cycle', () => {
    // Initialize
    execSync('hodge init --test-mode');
    expect(fs.existsSync('.hodge')).toBe(true);
    
    // Explore
    execSync('hodge explore "payments" --mock');
    const branches = execSync('git branch').toString();
    expect(branches).toContain('explore/payments');
    
    // Decide
    execSync('hodge decide "Use Stripe for payments"');
    const decisions = fs.readFileSync('.hodge/decisions.md', 'utf8');
    expect(decisions).toContain('Stripe');
    
    // Build
    execSync('hodge build "payment processing" --mock');
    expect(branches).toContain('build/payment');
    
    // Learn
    execSync('hodge learn --mock');
    expect(fs.existsSync('.hodge/patterns')).toBe(true);
    
    // Harden
    execSync('hodge harden "payment processing" --mock');
    // Should enforce all standards
  });
});
```

## Mode System (Revised)

### Three Progressive Modes

#### 🔍 Explore Mode
```bash
hodge explore "payment processing"
```
- **Standards**: Suggested as guidelines
- **Patterns**: Available but optional
- **Quality**: Prototype-level acceptable
- **Testing**: Not required
- **Branch**: `explore/{topic}-{timestamp}`
- **Cleanup**: Auto-delete after 7 days

#### 🔨 Build Mode
```bash
hodge build "payment processing"
```
- **Standards**: Recommended, with warnings
- **Patterns**: Preferred for consistency
- **Quality**: Development-level required
- **Testing**: Basic tests encouraged
- **Branch**: `build/{feature}`
- **Review**: Automated suggestions

#### 🛡️ Harden Mode
```bash
hodge harden "payment processing"
```
- **Standards**: Strictly enforced
- **Patterns**: Required for consistency
- **Quality**: Production-ready mandatory
- **Testing**: Comprehensive tests required (>80% coverage)
- **Branch**: `harden/{feature}` or `main/master`
- **Review**: Automated validation with blocking

### Mode Progression
```
explore → build → harden
   ↓        ↓        ↓
 Learn   Refine   Deploy
```

## Warp Code Integration Details

### Warp Workflow Implementation

#### 1. Workflow Generator (`src/warp/workflow-generator.js`)
```javascript
export class WorkflowGenerator {
  generateExploreWorkflow() {
    return {
      name: 'Hodge Explore',
      description: 'Explore implementation approaches with AI guidance',
      icon: '🔍',
      tags: ['hodge', 'ai', 'exploration'],
      parameters: [
        {
          name: 'topic',
          description: 'What to explore',
          required: true,
          placeholder: 'authentication, payment processing, etc.'
        },
        {
          name: 'approaches',
          description: 'Number of approaches to compare',
          default: '3',
          options: ['2', '3', '4', '5']
        },
        {
          name: 'ai_tool',
          description: 'AI assistant to use',
          default: 'claude',
          options: ['claude', 'cursor', 'aider', 'manual']
        }
      ],
      commands: [
        {
          command: 'hodge explore "{{topic}}" --compare {{approaches}} --with {{ai_tool}}',
          description: 'Start exploration with AI'
        },
        {
          command: 'hodge context --mode explore',
          description: 'Show current exploration context'
        }
      ]
    };
  }

  generateCompleteWorkflow() {
    return {
      name: 'Hodge Complete Feature Cycle',
      description: 'Full explore → build → harden workflow',
      icon: '🚀',
      tags: ['hodge', 'feature', 'complete'],
      parameters: [
        {
          name: 'feature',
          description: 'Feature to implement',
          required: true
        }
      ],
      commands: [
        // Exploration
        {
          name: 'Step 1: Explore',
          command: 'hodge explore "{{feature}}"',
          continueOnError: false
        },
        // Decision
        {
          name: 'Step 2: Decide',
          command: 'echo "Record your decision:" && read decision && hodge decide "$decision"',
          description: 'Record architectural decision'
        },
        // Build
        {
          name: 'Step 3: Build',
          command: 'hodge build "{{feature}}"',
          description: 'Build with recommended standards'
        },
        // Learn
        {
          name: 'Step 4: Learn',
          command: 'hodge learn --auto',
          description: 'Extract patterns from code'
        },
        // Harden
        {
          name: 'Step 5: Harden',
          command: 'hodge harden "{{feature}}"',
          description: 'Production-ready with all standards'
        },
        // Test
        {
          name: 'Step 6: Test',
          command: 'npm test && npm run lint',
          description: 'Run tests and linting'
        }
      ]
    };
  }
}
```

#### 2. Warp Setup Command (`src/cli/commands/warp.js`)
```javascript
program
  .command('warp')
  .description('Set up Warp Code integration')
  .command('setup')
  .action(async () => {
    const spinner = ora('Setting up Warp workflows...').start();
    
    // Create .warp directory
    await fs.ensureDir('.warp/workflows');
    
    // Generate all workflows
    const generator = new WorkflowGenerator();
    const workflows = [
      'explore',
      'build', 
      'harden',
      'complete',
      'learn',
      'decide',
      'status'
    ];
    
    for (const workflow of workflows) {
      const config = generator[`generate${capitalize(workflow)}Workflow`]();
      await fs.writeFile(
        `.warp/workflows/hodge-${workflow}.yaml`,
        yaml.stringify(config)
      );
    }
    
    spinner.succeed('Warp workflows created');
    
    console.log(chalk.cyan('\n📋 Warp Setup Complete!\n'));
    console.log('Available workflows:');
    workflows.forEach(w => {
      console.log(chalk.gray(`  • hodge-${w}`));
    });
    console.log(chalk.gray('\nUse Cmd+P in Warp to access workflows'));
  });
```

#### 3. Warp Terminal Detection (`src/utils/terminal.js`)
```javascript
export function detectTerminal() {
  const term = process.env.TERM_PROGRAM;
  
  return {
    isWarp: term === 'WarpTerminal',
    isTerm2: term === 'iTerm.app',
    isVSCode: process.env.TERM_PROGRAM === 'vscode',
    isHyper: process.env.TERM_PROGRAM === 'Hyper'
  };
}

export function formatForTerminal(output) {
  const { isWarp } = detectTerminal();
  
  if (isWarp) {
    // Use Warp's block formatting
    return `\`\`\`\n${output}\n\`\`\``;
  }
  
  return output;
}
```

### Example Warp Workflows

#### Quick Decision Recording
```yaml
name: Hodge Quick Decision
description: Record a project decision in one line
icon: 📝
parameters:
  - name: decision
    description: Decision to record
    required: true
    placeholder: "Use PostgreSQL for better relational queries"
commands:
  - command: hodge decide "{{decision}}"
  - command: cat .hodge/decisions.md | tail -5
    description: Show recent decisions
```

#### Pattern Learning
```yaml
name: Hodge Learn Patterns
description: Extract and save patterns from your code
icon: 🧠
commands:
  - command: hodge learn --interactive
    description: Interactively select patterns to save
  - command: ls -la .hodge/patterns/
    description: Show saved patterns
```

## Implementation Roadmap (Updated)

### Week 1: Foundation & CLI
**Goal**: Basic CLI structure with core commands and local testing

#### Tasks
- [ ] Initialize NPM package structure
- [ ] Set up Commander.js CLI framework
- [ ] Implement `hodge init` command (one-question setup)
- [ ] Create `.hodge/` directory structure
- [ ] Implement basic configuration system (`hodge.json`)
- [ ] Set up `npm link` for local testing
- [ ] Create test harness script

#### Testing Checklist
```bash
# After each feature
npm link
cd ../test-project
hodge [new-command]
# Verify expected behavior
```

### Week 2: Three-Mode System
**Goal**: Explore, Build, and Harden modes with context building

#### Tasks
- [ ] Implement `ModeManager` class with three modes
- [ ] Create `hodge explore` command
- [ ] Create `hodge build` command
- [ ] Create `hodge harden` command
- [ ] Add progressive standards enforcement
- [ ] Implement `ContextBuilder` with mode awareness
- [ ] Create mode-specific prompt templates

#### Testing Scenarios
1. **Mode Transitions**
   ```bash
   hodge explore "feature"
   hodge build "feature"  # Should carry context
   hodge harden "feature" # Should enforce everything
   ```

2. **Standards Progression**
   - Explore: Should suggest but allow violations
   - Build: Should warn on violations
   - Harden: Should block on violations

### Week 3: Learning Engine
**Goal**: Pattern extraction and standards detection

#### Tasks
- [ ] Implement `PatternLearner` class
- [ ] Add code block extraction (AST parsing)
- [ ] Create pattern hashing/normalization
- [ ] Implement `StandardsEngine` with three levels
- [ ] Add auto-detection from package.json
- [ ] Create `hodge learn` command
- [ ] Test with real codebases

#### Test Projects
- Next.js app with TypeScript
- Express API with JavaScript
- Python FastAPI project
- Mixed codebase

### Week 4: AI Integration
**Goal**: Connect with AI tools with mock mode for testing

#### Tasks
- [ ] Create base `AIAdapter` class
- [ ] Add mock mode for testing without AI
- [ ] Implement `ClaudeAdapter` (CLI & API modes)
- [ ] Add Cursor integration
- [ ] Add Aider integration
- [ ] Implement manual mode (clipboard)
- [ ] Create AI response mocking system

#### Testing Without AI
```javascript
// Mock mode for development
hodge explore "feature" --mock
# Uses predefined responses

hodge build "feature" --ai=manual
# Copies context to clipboard
```

### Week 5: Warp Code Integration
**Goal**: Deep integration with Warp terminal and workflows

#### Tasks
- [ ] Create `WarpCodeAdapter` class
- [ ] Implement workflow generation system
- [ ] Add `hodge warp setup` command
- [ ] Create workflow templates for all modes
- [ ] Add Warp terminal detection
- [ ] Optimize output for Warp blocks
- [ ] Create parameterized workflows
- [ ] Add workflow sharing capabilities
- [ ] Generate team-shareable workflow library

#### Warp Workflows to Create
```yaml
# .warp/workflows/
├── hodge-explore.yaml       # Exploration workflow
├── hodge-build.yaml         # Building workflow
├── hodge-harden.yaml        # Hardening workflow
├── hodge-complete.yaml      # Full cycle workflow
├── hodge-learn.yaml         # Pattern learning
├── hodge-decide.yaml        # Quick decision recording
└── hodge-status.yaml        # Context and status check
```

#### Warp-Specific Features
- **Workflow Parameters**: Let Warp handle input collection
- **Command Chaining**: Multi-step workflows
- **Block Formatting**: Optimized output for Warp
- **Terminal Detection**: Auto-detect Warp environment

### Week 6: Advanced Features
**Goal**: Decision tracking, pattern reuse, test generation

#### Tasks
- [ ] Implement `hodge decide` command
- [ ] Add exploration cleanup (7-day auto-delete)
- [ ] Create pattern reuse system (`--like` flag)
- [ ] Add multi-approach exploration
- [ ] Implement test generation
- [ ] Add code review automation
- [ ] Create example projects for testing

### Week 7: Polish & Release
**Goal**: Documentation, testing, and NPM publishing

#### Tasks
- [ ] Write comprehensive documentation
- [ ] Add unit tests (Jest)
- [ ] Create integration tests
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Beta test with real projects
- [ ] Publish to NPM as @agile-explorations/hodge
- [ ] Create video tutorials
- [ ] Create Warp workflow examples
- [ ] Implement saved context cleanup strategy

## Development Workflow

### Daily Development Cycle
```bash
# Morning: Start development
cd hodge
npm run dev  # Watch mode

# Make changes
vim src/cli/commands/explore.js

# Test locally
npm link
cd ../test-project
hodge explore "test"

# Run test suite
cd ../hodge
npm test
npm run test:e2e

# Commit
git add .
git commit -m "feat: implement explore command"
```

### Testing Checklist
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing in fresh project
- [ ] Test with different Node versions
- [ ] Test on different OS (Mac, Linux, Windows via WSL)
- [ ] Test with different package managers (npm, yarn, pnpm)

## Configuration Examples

### hodge.json (Three-Mode System)
```json
{
  "version": 3,
  "modes": {
    "explore": {
      "standards": "suggest",
      "patterns": "optional",
      "tests": "optional",
      "cleanup": "7d",
      "branch": "explore/{name}-{timestamp}"
    },
    "build": {
      "standards": "recommend",
      "patterns": "prefer",
      "tests": "encouraged",
      "branch": "build/{name}"
    },
    "harden": {
      "standards": "enforce",
      "patterns": "require",
      "tests": "mandatory",
      "coverage": 80,
      "branch": "harden/{name}"
    }
  },
  "ai": {
    "provider": "auto",
    "mockMode": false,
    "temperature": {
      "explore": 0.7,
      "build": 0.5,
      "harden": 0.3
    }
  }
}
```

## NPM Scripts for Development

```json
{
  "scripts": {
    "dev": "nodemon --watch src --exec 'npm link'",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "node scripts/test-e2e.js",
    "test:local": "node scripts/test-local.js",
    "lint": "eslint src",
    "format": "prettier --write 'src/**/*.js'",
    "build": "npm run lint && npm test",
    "prepublishOnly": "npm run build"
  }
}
```

## Success Criteria (Updated)

### Functionality
- Three modes working progressively
- Standards enforcement varies by mode
- Pattern learning accurate
- AI integration seamless

### Developer Experience
- `npm link` works flawlessly
- Changes reflected immediately
- Mock mode for testing
- Clear error messages

### Quality
- Test coverage > 80%
- All modes thoroughly tested
- Works on Node 18+
- Cross-platform compatible

## Timeline Summary

| Week | Focus | Testing Focus | Deliverable |
|------|-------|---------------|-------------|
| 1 | Foundation | CLI commands | Basic CLI with init |
| 2 | Three Modes | Mode transitions | Explore/Build/Harden |
| 3 | Learning | Pattern detection | Pattern extraction |
| 4 | AI | Mock & real AI | Claude integration |
| 5 | Warp Code | Workflow generation | Warp integration |
| 6 | Features | Full workflows | Complete feature set |
| 7 | Release | Beta testing | NPM package v3.0.0 |

## Command Behavior Details

### Saved Context Cleanup Strategy

Automatic cleanup of old saved contexts to prevent unbounded growth:

#### Cleanup Triggers
```javascript
// Cleanup runs AFTER successful save operations
async function saveContext(name) {
  const saved = await createSave(name);
  await cleanupOldSaves();  // Run cleanup after each save
  return saved;
}
```

#### Cleanup Rules (Configurable)
```javascript
const CLEANUP_DEFAULTS = {
  strategy: 'count',    // 'count' or 'age'
  maxSaves: 10,        // Keep last 10 saves
  maxAge: 7,           // Or keep saves from last 7 days
  minSaves: 3,         // Always keep at least 3 saves
  protectNamed: true   // Don't delete explicitly named saves
};
```

#### Implementation
```javascript
async function cleanupOldSaves() {
  const config = getCleanupConfig();
  const saves = await getAllSaves();
  
  // Sort by timestamp (newest first)
  saves.sort((a, b) => b.timestamp - a.timestamp);
  
  // Separate protected saves (explicitly named)
  const namedSaves = saves.filter(s => !s.autoGenerated);
  const autoSaves = saves.filter(s => s.autoGenerated);
  
  let toDelete = [];
  
  if (config.strategy === 'count') {
    // Keep only the most recent N saves
    if (autoSaves.length > config.maxSaves) {
      toDelete = autoSaves.slice(config.maxSaves);
    }
  } else if (config.strategy === 'age') {
    // Delete saves older than maxAge days
    const cutoff = Date.now() - (config.maxAge * 24 * 60 * 60 * 1000);
    toDelete = autoSaves.filter(s => s.timestamp < cutoff);
  }
  
  // Ensure we keep minimum number of saves
  const remainingCount = saves.length - toDelete.length;
  if (remainingCount < config.minSaves) {
    toDelete = toDelete.slice(0, saves.length - config.minSaves);
  }
  
  // Delete old saves
  for (const save of toDelete) {
    await fs.remove(`.hodge/saves/${save.name}`);
    console.log(chalk.gray(`  Cleaned up old save: ${save.name}`));
  }
}
```

#### Manual Cleanup Command
```bash
hodge clean                    # Clean with default settings
hodge clean --keep 5           # Keep only 5 most recent
hodge clean --older-than 3d    # Delete saves older than 3 days
hodge clean --dry-run          # Show what would be deleted
```

#### Configuration in hodge.json
```json
{
  "saves": {
    "cleanup": {
      "strategy": "count",     // or "age"
      "maxSaves": 10,          // for count strategy
      "maxAge": 7,             // for age strategy (days)
      "minSaves": 3,           // never delete below this
      "protectNamed": true     // keep explicitly named saves
    }
  }
}
```

### Auto-save Implementation (Realistic)

Since Hodge is command-driven (not a daemon), auto-save works through:

#### Command-Based Triggers
```javascript
// Saves AFTER these commands complete
const AUTO_SAVE_COMMANDS = [
  'explore',    // Mode changes
  'build',      
  'harden',     
  'decide',     // After decisions
  'review',     // After review
  'status',     // After loading feature
  'reset',      // BEFORE reset (safety)
];
```

#### Opportunistic Time-Based Saves
```javascript
// On EVERY command execution:
async function executeCommand(cmd) {
  // Check if > 5 min since last save
  if (timeSinceLastSave() > 5 * 60 * 1000) {
    await autoSave('time-check');
  }
  
  // Execute command
  const result = await cmd.execute();
  
  // Save after specific commands
  if (AUTO_SAVE_COMMANDS.includes(cmd.name)) {
    await autoSave(`after-${cmd.name}`);
  }
  
  return result;
}
```

#### Configuration
```json
{
  "context": {
    "autoSave": {
      "enabled": true,
      "afterCommands": ["decide", "review", "mode changes"],
      "checkInterval": "5m",  // Check elapsed time on each command
      "maxSaves": 20
    }
  }
}
```

**Key limitation**: Cannot interrupt AI conversations to save. Saves only happen when Hodge has control (during command execution).

### Session Context Schema

```json
{
  "version": "1.0.0",
  "session": {
    "id": "auth-build-20240115",
    "startTime": "2024-01-15T10:30:00Z",
    "lastSave": "2024-01-15T11:45:00Z",
    "saveType": "auto",
    "trigger": "after-decide"
  },
  "feature": {
    "name": "auth",
    "mode": "build",
    "branch": "build/auth"
  },
  "decisions": {
    "made": ["Use magic links", "SendGrid for email"],
    "pending": ["Token expiration", "Email template format"],
    "deferred": ["Rate limiting strategy"]
  },
  "conversation": {
    "recentTopics": ["Email failure handling", "Token security"],
    "lastReview": {
      "timestamp": "2024-01-15T11:00:00Z",
      "gaps": ["Error recovery", "Analytics", "Rollback"]
    }
  },
  "todos": [
    {"task": "Fix email validation", "status": "done"},
    {"task": "Add retry logic", "status": "in_progress"},
    {"task": "Write tests", "status": "pending"}
  ],
  "testing": {
    "lastRun": "2024-01-15T11:25:00Z",
    "failures": ["auth.test.js:45", "email.test.js:12"],
    "coverage": 72
  }
}
```

### The `hodge decisions` Command

Interactive decision management with list view:

```bash
hodge decisions

📋 Project Decisions (7 total):

RECENT (last 3 days):
1. auth: Use magic links - simpler UX
2. auth: SendGrid for email - better deliverability
3. payments: Stripe - best API

OLDER:
4. PostgreSQL - relational data
5. Next.js 14 - best DX

Select decision (1-5) or action (all/search/filter/quit): 2

Decision #2: SendGrid for email
├─ Date: 2024-01-15
├─ Feature: auth
├─ Status: Active
└─ Reason: better deliverability

Actions:
  a - Amend this decision
  r - Revert this decision
  h - Show history
  b - Back to list
  
> a

New decision text: Resend for email - better DX, cheaper
✓ Decision amended
```

Key features:
- Interactive list with pagination
- Individual decision management
- History tracking for amendments
- Filter by feature or date
- Search functionality

## Complete Package Architecture

```
@agile-explorations/hodge/
├── package.json                 # NPM package definition
├── README.md
├── LICENSE
├── bin/
│   └── hodge.js                # CLI entry point (#!/usr/bin/env node)
├── src/
│   ├── index.js                # Main library exports
│   ├── cli/
│   │   ├── index.js            # Commander.js setup
│   │   └── commands/           # Individual command implementations
│   │       ├── init.js         # Initialize Hodge
│   │       ├── explore.js      # Exploration mode
│   │       ├── build.js        # Build mode
│   │       ├── harden.js       # Harden mode
│   │       ├── decide.js       # Decision tracking (single & batch)
│   │       ├── review.js       # Review checkpoint with gap detection
│   │       ├── ship.js         # Complete feature & learn patterns
│   │       ├── status.js       # Show current state
│   │       ├── context.js      # View/manage context
│   │       ├── learn.js        # Pattern learning
│   │       ├── standards.js    # Standards management
│   │       └── warp.js         # Warp Code setup
│   ├── core/
│   │   ├── mode-manager.js     # Three-mode system logic
│   │   ├── context-builder.js  # AI context generation
│   │   ├── standards-engine.js # Standards detection/enforcement
│   │   ├── pattern-learner.js  # Pattern extraction & learning
│   │   ├── decision-tracker.js # Decision management
│   │   └── review-engine.js    # Review gaps & suggestions
│   ├── adapters/
│   │   ├── base-adapter.js     # Abstract AI adapter
│   │   ├── claude.js           # Claude/Claude Code integration
│   │   ├── cursor.js           # Cursor integration
│   │   ├── aider.js            # Aider integration
│   │   ├── warp-code.js        # Warp Code adapter
│   │   └── manual.js           # Manual/clipboard mode
│   ├── warp/
│   │   ├── workflow-generator.js # Generate Warp workflows
│   │   ├── templates/          # Workflow template files
│   │   └── formatter.js        # Warp block formatting
│   └── utils/
│       ├── git.js              # Git operations
│       ├── files.js            # File system utilities
│       ├── config.js           # Configuration management
│       └── terminal.js         # Terminal detection & formatting
├── templates/
│   └── prompts/
│       ├── explore.md          # Exploration prompt template
│       ├── build.md            # Build mode prompt template
│       └── harden.md           # Harden mode prompt template
└── test/
    ├── unit/                   # Unit tests
    ├── integration/            # CLI integration tests
    └── fixtures/               # Test fixtures
```

## User's .hodge Directory Structure

```
.hodge/
├── features/                   # Current work context (per feature)
│   └── auth/
│       ├── state.json         # Feature state, mode, decisions
│       ├── explore/           # Exploration artifacts
│       │   ├── oauth/         # Approach 1
│       │   ├── magic-links/   # Approach 2
│       │   └── passkeys/      # Approach 3
│       ├── build/             # Build artifacts
│       └── harden/            # Production artifacts
├── patterns/                   # Learned patterns (from ship)
│   ├── components/            # UI patterns
│   ├── api/                   # API patterns
│   └── tests/                 # Test patterns
├── standards/                  # Project standards
│   ├── detected.json          # Auto-detected standards
│   └── custom.json            # User-defined standards
├── decisions.md               # Global one-line decisions
└── config.json                # Hodge configuration

## Key Integration Points

### Warp Code Benefits
1. **Parameterized Workflows** - Warp handles input collection elegantly
2. **Command Palette Access** - Quick access via Cmd+P
3. **Visual Progress** - Warp's blocks show command progress clearly
4. **Workflow Sharing** - Teams can share `.warp/workflows/` via Git
5. **No Context Switching** - Stay in Warp for entire development flow

### AI Tool Integration Levels
- **Full Integration**: Claude (API + CLI), Aider (CLI)
- **Partial Integration**: Cursor (project opening), Warp Code (workflows)
- **Manual Fallback**: Clipboard with formatted prompts

---

*"Freedom to explore, discipline to build, rigor to harden."*