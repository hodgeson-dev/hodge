# Approach 3: Zero-Config Smart Init

## Implementation Sketch

No questions at all - just run `hodge init` and it figures everything out:

```typescript
// src/commands/init.ts
export async function initCommand(options: InitOptions) {
  const spinner = ora('Initializing Hodge...').start();
  
  // Zero questions - pure detection
  const config = await detectEverything();
  
  // Create structure immediately
  await createHodgeStructure(config);
  
  spinner.succeed('Hodge initialized!');
  
  // Show what was done
  console.log('\n' + chalk.green('✅ Created .hodge/ with:'));
  console.log(`  • Project: ${config.name}`);
  console.log(`  • Type: ${config.projectType}`);
  config.pmTool && console.log(`  • PM: ${config.pmTool}`);
  
  // Offer to customize AFTER init
  console.log('\n' + chalk.gray('Run "hodge config" to customize settings'));
}

async function detectEverything() {
  const detectors = [
    detectFromPackageJson,
    detectFromGitConfig,
    detectFromEnvironment,
    detectFromFileSystem,
    detectFromIDEConfig
  ];
  
  const results = await Promise.all(
    detectors.map(d => d().catch(() => null))
  );
  
  return mergeDetectionResults(results);
}

// Smart detection examples
async function detectFromPackageJson() {
  try {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    return {
      name: pkg.name,
      projectType: 'node',
      testRunner: pkg.scripts?.test?.includes('jest') ? 'jest' : 'vitest',
      hasTypeScript: !!pkg.devDependencies?.typescript,
      dependencies: Object.keys(pkg.dependencies || {})
    };
  } catch {
    return null;
  }
}

async function detectFromEnvironment() {
  return {
    pmTool: process.env.LINEAR_API_KEY ? 'linear' : 
            process.env.GITHUB_TOKEN ? 'github' : 
            process.env.JIRA_TOKEN ? 'jira' : null,
    ci: process.env.CI === 'true',
    editor: process.env.EDITOR || 'unknown'
  };
}
```

### Post-Init Configuration
```typescript
// hodge config command for customization
hodge config pm linear        # Set PM tool
hodge config standards strict  # Set standards mode
hodge config --interactive     # Interactive config wizard
```

### File Structure Generated
```
.hodge/
├── config.json
│   {
│     "name": "auto-detected",
│     "pmTool": "auto-detected or null",
│     "projectType": "auto-detected",
│     "generated": "2024-01-13T10:00:00Z",
│     "version": "0.1.0"
│   }
├── standards.md    # Generated based on detected stack
├── patterns/       # Empty
├── decisions.md    # Template
└── README.md       # Explains what was detected and why
```

### Fallback Behavior
```typescript
// If detection fails completely:
const fallbackConfig = {
  name: path.basename(process.cwd()),
  projectType: 'unknown',
  pmTool: null,
  standards: 'balanced',
  message: 'Could not auto-detect project type. Using defaults.'
};
```

## Pros
- **Truly zero-config**: No questions at all
- **Instant**: <5 seconds to complete
- **Smart**: Uses all available context
- **Non-blocking**: Can always customize later
- **Git-friendly**: Clean initial commit

## Cons
- **Opaque**: User doesn't know what's happening
- **May be wrong**: No chance to correct during init
- **Too magical**: Might create unexpected config
- **Requires config command**: Need separate customization flow

## Compatibility with Current Stack
- ✅ Simple to implement with existing code
- ✅ Reuses PM detection logic
- ✅ No new dependencies required
- ✅ Follows Unix philosophy (do one thing well)