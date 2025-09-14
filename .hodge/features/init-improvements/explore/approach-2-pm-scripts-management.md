# Approach 2: PM Scripts Distribution and Management

## Implementation Sketch

Create a comprehensive PM scripts system that gets deployed during init:

```typescript
// src/lib/pm-scripts-manager.ts
interface PMScriptsConfig {
  tool: string;
  scripts: PMScript[];
  customizable: boolean;
}

interface PMScript {
  name: string;
  description: string;
  file: string;
  permissions: string;
  dependencies?: string[];
}

class PMScriptsManager {
  private scriptsManifest = {
    linear: {
      scripts: [
        { name: 'create-project', description: 'Create a new Linear project' },
        { name: 'create-issue', description: 'Create a Linear issue' },
        { name: 'fetch-issue', description: 'Fetch issue details' },
        { name: 'update-issue', description: 'Update issue status/labels' },
        { name: 'list-teams', description: 'List available teams' },
        { name: 'create-epic', description: 'Create an epic/project' },
        { name: 'bulk-import', description: 'Import issues from CSV' },
        { name: 'sync-status', description: 'Sync issue status with git' }
      ],
      dependencies: ['@linear/sdk']
    },
    github: {
      scripts: [
        { name: 'create-issue', description: 'Create GitHub issue' },
        { name: 'create-milestone', description: 'Create milestone' },
        { name: 'update-issue', description: 'Update issue/PR' },
        { name: 'create-project', description: 'Create GitHub project' },
        { name: 'sync-labels', description: 'Sync labels with config' },
        { name: 'generate-changelog', description: 'Generate changelog from issues' }
      ],
      dependencies: ['@octokit/rest']
    },
    jira: {
      scripts: [
        { name: 'create-issue', description: 'Create Jira issue' },
        { name: 'create-epic', description: 'Create epic' },
        { name: 'update-status', description: 'Transition issue status' },
        { name: 'create-sprint', description: 'Create new sprint' },
        { name: 'bulk-update', description: 'Bulk update issues' },
        { name: 'generate-report', description: 'Generate sprint report' }
      ],
      dependencies: ['jira-client']
    },
    trello: {
      scripts: [
        { name: 'create-board', description: 'Create Trello board' },
        { name: 'create-card', description: 'Create card' },
        { name: 'move-card', description: 'Move card between lists' },
        { name: 'add-checklist', description: 'Add checklist to card' },
        { name: 'archive-cards', description: 'Archive completed cards' }
      ],
      dependencies: ['node-trello']
    }
  };

  async deployScripts(pmTool: string, targetDir: string) {
    const manifest = this.scriptsManifest[pmTool];
    if (!manifest) return;

    // Create PM scripts directory
    const scriptsDir = path.join(targetDir, '.hodge', 'pm-scripts');
    await fs.mkdir(scriptsDir, { recursive: true });

    // Copy script templates
    for (const script of manifest.scripts) {
      const source = path.join(__dirname, 'templates', 'pm', pmTool, `${script.name}.js`);
      const dest = path.join(scriptsDir, `${pmTool}-${script.name}.js`);
      
      if (await this.scriptExists(source)) {
        await this.copyAndCustomize(source, dest, pmTool);
      } else {
        await this.generateScriptTemplate(script, dest, pmTool);
      }
    }

    // Create package.json for PM scripts
    await this.createScriptsPackageJson(scriptsDir, manifest);

    // Create README with usage instructions
    await this.createScriptsReadme(scriptsDir, pmTool, manifest);

    // Create configuration file
    await this.createConfigFile(scriptsDir, pmTool);
  }

  private async generateScriptTemplate(script: PMScript, dest: string, tool: string) {
    const template = `#!/usr/bin/env node
/**
 * ${script.description}
 * PM Tool: ${tool}
 * 
 * Usage: node ${path.basename(dest)} [options]
 */

const { ${tool}Client } = require('./lib/${tool}-client');

async function main() {
  const client = new ${tool}Client();
  
  try {
    // TODO: Implement ${script.name} functionality
    console.log('${script.description} - Not yet implemented');
    
    // Example structure:
    // const result = await client.${script.name}({
    //   title: process.argv[2],
    //   description: process.argv[3]
    // });
    // console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
`;
    await fs.writeFile(dest, template);
    await fs.chmod(dest, '755');
  }

  private async createScriptsPackageJson(dir: string, manifest: any) {
    const packageJson = {
      name: '@hodge/pm-scripts',
      version: '1.0.0',
      private: true,
      scripts: manifest.scripts.reduce((acc, script) => {
        acc[script.name] = `node ${script.name}.js`;
        return acc;
      }, {}),
      dependencies: manifest.dependencies.reduce((acc, dep) => {
        acc[dep] = 'latest';
        return acc;
      }, {})
    };
    
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }
}
```

### Directory Structure Created
```
.hodge/
├── pm-scripts/
│   ├── package.json           # Dependencies for PM scripts
│   ├── README.md             # Usage documentation
│   ├── config.json           # PM tool configuration
│   ├── lib/
│   │   ├── linear-client.js # Shared Linear client
│   │   ├── github-client.js # Shared GitHub client
│   │   └── jira-client.js   # Shared Jira client
│   ├── linear-create-issue.js
│   ├── linear-fetch-issue.js
│   ├── linear-update-issue.js
│   └── ... (other PM scripts)
```

### Script Template Example (linear-create-issue.js)
```javascript
#!/usr/bin/env node
const { LinearClient } = require('@linear/sdk');
const { program } = require('commander');

program
  .option('-t, --title <title>', 'Issue title')
  .option('-d, --description <desc>', 'Issue description')
  .option('-p, --priority <priority>', 'Priority (0-4)', '3')
  .option('-l, --labels <labels>', 'Comma-separated labels')
  .option('-a, --assignee <assignee>', 'Assignee email')
  .option('--team-id <teamId>', 'Team ID', process.env.LINEAR_TEAM_ID)
  .parse(process.argv);

async function createIssue() {
  const client = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
  
  try {
    const issueData = {
      title: program.opts().title,
      description: program.opts().description,
      priority: parseInt(program.opts().priority),
      teamId: program.opts().teamId
    };

    if (program.opts().labels) {
      const labels = program.opts().labels.split(',');
      // Add label logic
    }

    const issue = await client.createIssue(issueData);
    console.log(`✅ Created issue: ${issue.identifier}`);
    console.log(`   URL: ${issue.url}`);
  } catch (error) {
    console.error('❌ Error creating issue:', error.message);
    process.exit(1);
  }
}

createIssue();
```

### Integration with Init Command
```typescript
// During init, after PM tool selection:
if (config.pmTool && config.pmTool !== 'none') {
  const { deployScripts } = await inquirer.prompt([{
    type: 'confirm',
    name: 'deployScripts',
    message: `Deploy ${config.pmTool} management scripts to .hodge/pm-scripts?`,
    default: true
  }]);
  
  if (deployScripts) {
    const spinner = ora('Deploying PM scripts...').start();
    const manager = new PMScriptsManager();
    await manager.deployScripts(config.pmTool, process.cwd());
    spinner.succeed(`PM scripts deployed to .hodge/pm-scripts/`);
    
    console.log(chalk.cyan('\n📝 Available PM commands:'));
    const manifest = manager.getManifest(config.pmTool);
    manifest.scripts.forEach(script => {
      console.log(`  • ${script.name}: ${script.description}`);
    });
    
    console.log(chalk.gray('\nRun: cd .hodge/pm-scripts && npm install'));
  }
}
```

## Pros
- **Comprehensive tooling**: Full PM integration out of the box
- **Customizable**: Users can modify scripts for their needs
- **Self-contained**: Scripts are in project, not global
- **Educational**: Templates show how to use PM APIs
- **Extensible**: Easy to add new PM tools

## Cons
- **Maintenance burden**: Need to maintain scripts for all PM tools
- **Dependencies**: Each PM tool needs its SDK
- **Complexity**: Lots of scripts to manage
- **Duplication**: Each project gets copy of scripts
- **Updates**: Hard to update scripts across projects

## Compatibility with Current Stack
- ✅ Uses existing PM adapter pattern
- ✅ Scripts similar to existing ones
- ⚠️ Need to create templates for all PM tools
- ⚠️ Increases project size with scripts