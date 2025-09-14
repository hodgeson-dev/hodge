# Approach 1: Minimal One-Question Setup

## Implementation Sketch

Ask only one essential question and derive everything else intelligently:

```typescript
// src/commands/init.ts
import { prompt } from 'inquirer';
import { detectProjectType, detectPMTool, generateDefaults } from '../lib/detectors';

export async function initCommand(options: InitOptions) {
  // Detect existing project context
  const detected = {
    projectType: await detectProjectType(), // node, python, etc.
    pmTool: await detectPMTool(),          // linear, github, jira
    hasGit: await detectGit(),
    packageManager: await detectPackageManager()
  };

  // One question only
  const { projectName } = await prompt([{
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    default: detected.projectName || path.basename(process.cwd())
  }]);

  // Smart defaults based on detection
  const config = {
    name: projectName,
    pmTool: detected.pmTool || 'none',
    standards: generateStandardsForType(detected.projectType),
    patterns: [],
    decisions: []
  };

  // Create .hodge structure
  await createHodgeStructure(config);
}
```

### Directory Structure Created
```
.hodge/
├── config.json         # Minimal config with smart defaults
├── standards.md        # Auto-detected from project
├── patterns/           # Empty, will learn
├── decisions.md        # Template with examples
└── features/           # Ready for exploration
```

### Detection Logic
```typescript
// Auto-detect from:
// - package.json (Node.js)
// - requirements.txt/pyproject.toml (Python)
// - Cargo.toml (Rust)
// - .git/config (Git remotes → GitHub/GitLab)
// - Environment variables (LINEAR_API_KEY, etc.)
```

## Pros
- **Minimal friction**: One question to get started
- **Smart defaults**: Detects and adapts to existing project
- **Fast onboarding**: <10 seconds to initialize
- **Non-intrusive**: Works with existing structure
- **Progressive disclosure**: Advanced config available later

## Cons
- **May miss preferences**: User might want different PM tool
- **Hidden complexity**: Magic detection might confuse
- **Less customization**: Initial setup less tailored
- **Detection failures**: Might guess wrong

## Compatibility with Current Stack
- ✅ Works with Commander.js structure
- ✅ Can use existing PM adapter detection
- ✅ Minimal new dependencies (inquirer)
- ✅ Follows TypeScript patterns