# Approach 2: Extensible Multi-Tool Detection

## Detection System Design

```typescript
// src/lib/ai-tool-detector.ts

export interface AIToolInfo {
  name: string;
  displayName: string;
  detected: boolean;
  confidence: 'high' | 'medium' | 'low';
  markers: string[]; // What was found
}

export interface AIToolsDetectionResult {
  tools: AIToolInfo[];
  primary?: string; // Most likely primary tool
  hasAnyTool: boolean;
}

export class AIToolDetector {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  async detectAll(): Promise<AIToolsDetectionResult> {
    const detections = await Promise.all([
      this.detectClaude(),
      this.detectCursor(),
      this.detectAider(),
      this.detectWarp(),
      this.detectContinue(),
      this.detectWindsurf(),
    ]);

    const detected = detections.filter(d => d.detected);

    return {
      tools: detections,
      primary: this.determinePrimary(detected),
      hasAnyTool: detected.length > 0,
    };
  }

  private async detectClaude(): Promise<AIToolInfo> {
    const markers: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Check for CLAUDE.md
    if (await fs.pathExists(path.join(this.rootPath, 'CLAUDE.md'))) {
      markers.push('CLAUDE.md');
      confidence = 'high';
    }

    // Check environment
    if (process.env.CLAUDE_PROJECT || process.env.CLAUDE_WORKSPACE) {
      markers.push('Environment variables');
      confidence = confidence === 'high' ? 'high' : 'medium';
    }

    return {
      name: 'claude',
      displayName: 'Claude Code',
      detected: markers.length > 0,
      confidence,
      markers,
    };
  }

  private async detectCursor(): Promise<AIToolInfo> {
    const markers: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Check for .cursor directory
    if (await fs.pathExists(path.join(this.rootPath, '.cursor'))) {
      markers.push('.cursor/');
      confidence = 'high';
    }

    // Check for .cursorignore
    if (await fs.pathExists(path.join(this.rootPath, '.cursorignore'))) {
      markers.push('.cursorignore');
      confidence = confidence === 'high' ? 'high' : 'medium';
    }

    // Check for cursor rules
    if (await fs.pathExists(path.join(this.rootPath, '.cursorrules'))) {
      markers.push('.cursorrules');
      confidence = 'high';
    }

    return {
      name: 'cursor',
      displayName: 'Cursor',
      detected: markers.length > 0,
      confidence,
      markers,
    };
  }

  private async detectAider(): Promise<AIToolInfo> {
    const markers: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Check for .aider files
    for (const file of ['.aider', '.aiderignore', '.aider.conf.yml']) {
      if (await fs.pathExists(path.join(this.rootPath, file))) {
        markers.push(file);
        confidence = 'high';
      }
    }

    // Check git commits for aider signature
    try {
      const commits = execSync('git log --oneline -n 20', {
        cwd: this.rootPath,
        encoding: 'utf8',
      });
      if (commits.includes('aider:')) {
        markers.push('Git history');
        confidence = confidence === 'high' ? 'high' : 'medium';
      }
    } catch {}

    return {
      name: 'aider',
      displayName: 'Aider',
      detected: markers.length > 0,
      confidence,
      markers,
    };
  }

  // Similar for other tools...

  private determinePrimary(detected: AIToolInfo[]): string | undefined {
    if (detected.length === 0) return undefined;

    // Prioritize by confidence
    const highConfidence = detected.filter(t => t.confidence === 'high');
    if (highConfidence.length === 1) {
      return highConfidence[0].name;
    }

    // If multiple high confidence, check for active env vars
    if (process.env.CLAUDE_PROJECT) return 'claude';
    if (process.env.CURSOR_API_KEY) return 'cursor';

    // Default to first detected
    return detected[0].name;
  }
}
```

## Integration Installation Manager

```typescript
// src/lib/ai-integration-manager.ts

export class AIIntegrationManager {
  private hodgePath: string;
  private installers: Map<string, IntegrationInstaller>;

  constructor(hodgePath: string) {
    this.hodgePath = hodgePath;
    this.installers = new Map([
      ['claude', new ClaudeInstaller()],
      ['cursor', new CursorInstaller()],
      ['aider', new AiderInstaller()],
    ]);
  }

  async installForTools(tools: string[]): Promise<void> {
    const integrationPath = path.join(this.hodgePath, 'integrations');
    await fs.ensureDir(integrationPath);

    for (const tool of tools) {
      const installer = this.installers.get(tool);
      if (installer) {
        console.log(chalk.blue(`Installing ${tool} integration...`));
        await installer.install(this.hodgePath);
        console.log(chalk.green(`   ✓ ${tool} integration installed`));
      }
    }

    // Create master integration README
    await this.createMasterReadme(tools);
  }

  private async createMasterReadme(tools: string[]): Promise<void> {
    const content = `# AI Tool Integrations

Hodge has detected and installed integrations for the following tools:

${tools.map(t => `- ${this.getToolDisplayName(t)}`).join('\n')}

## Available Integrations

${tools.map(t => `### ${this.getToolDisplayName(t)}
See \`./integrations/${t}/README.md\` for specific instructions.
`).join('\n')}

## General Workflow

All AI tools can leverage Hodge's structure:
1. **Explore**: \`hodge explore <feature>\` - Prototype ideas
2. **Build**: \`hodge build\` - Implement with standards
3. **Ship**: \`hodge ship\` - Commit and integrate

## Context Files

AI tools should reference:
- \`.hodge/standards.md\` - Coding standards
- \`.hodge/decisions.md\` - Architecture decisions
- \`.hodge/patterns/\` - Reusable patterns
- \`.hodge/features/\` - Feature implementations
`;

    await fs.writeFile(
      path.join(this.hodgePath, 'integrations', 'README.md'),
      content
    );
  }
}
```

## User Experience

```
$ hodge init

🎉 Hodge initialized successfully!

🤖 AI Development Tools Detected:
   • Claude Code (high confidence - CLAUDE.md found)
   • Cursor (medium confidence - .cursorignore found)

? Would you like to install Hodge integrations for better AI assistance? (Y/n) › Y

? Select integrations to install: (Press space to select, enter to confirm)
   ◉ Claude Code
   ◯ Cursor
   ◯ All detected tools

Installing claude integration...
   ✓ claude integration installed

✨ AI integrations ready! See .hodge/integrations/README.md for usage.

🚀 Next steps:
   hodge explore <feature>  # Start exploring a new feature
```

## Benefits
- Detects multiple AI tools automatically
- Confidence scoring helps identify primary tool
- Extensible to new tools
- User choice on what to install
- Creates tool-specific integration docs