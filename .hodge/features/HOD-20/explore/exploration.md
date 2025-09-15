# HOD-20 Exploration: Core Mode Commands

## Feature: explore/build/harden commands
**Linear Issue**: HOD-20 - Create explore/build/harden commands
**Description**: Implement the three core mode commands

## Context Analysis

### Current State
- `hodge init` command is fully implemented with smart detection and PM integration
- Commands are stubbed in `src/bin/hodge.ts` with TODO placeholders
- Strong foundation with TypeScript, Commander.js, and test infrastructure
- PM integration already working via Linear SDK

### Relevant Standards
- TypeScript with strict typing
- Commander.js for CLI
- Comprehensive unit testing with Vitest
- PM integration pattern established in init command

### Key Decisions to Reference
- PM scripts distribution to `.hodge/pm-scripts/`
- Pattern learning only in interactive mode
- Minimal prompts philosophy by default

## Approach 1: Stateful Mode Manager

### Implementation Sketch
```typescript
// src/lib/mode-manager.ts
class ModeManager {
  private currentMode: 'explore' | 'build' | 'harden' | null = null;
  private featureContext: Map<string, FeatureState> = new Map();

  async enterMode(mode: Mode, feature: string) {
    this.currentMode = mode;
    await this.saveState();
    await this.applyModeRules(mode);
  }

  async applyModeRules(mode: Mode) {
    switch(mode) {
      case 'explore':
        await this.relaxStandards();
        await this.enableCreativeTools();
        break;
      case 'build':
        await this.suggestStandards();
        await this.trackProgress();
        break;
      case 'harden':
        await this.enforceStandards();
        await this.runValidation();
        break;
    }
  }
}

// src/commands/explore.ts
export class ExploreCommand {
  async execute(feature: string, options: ExploreOptions) {
    const modeManager = new ModeManager();
    await modeManager.enterMode('explore', feature);

    // PM integration
    const pmAdapter = await this.getPMAdapter();
    const issue = await pmAdapter?.findIssue(feature);

    // Context building
    const context = await this.buildExploreContext(feature, issue);

    // Generate AI-friendly output
    await this.generateExploreGuide(context);
  }
}
```

### Pros
- Clean separation of concerns with dedicated ModeManager
- Stateful tracking allows mode transitions and history
- Reusable mode logic across commands
- Clear mode-specific rules and behaviors

### Cons
- More complex architecture with state management
- Potential for state synchronization issues
- Requires careful handling of mode transitions
- Additional abstraction layer may be overkill for MVP

### Compatibility
- ✅ Fits well with existing TypeScript patterns
- ✅ Aligns with PM integration approach
- ✅ Follows established testing patterns
- ⚠️ Introduces new stateful component

---

## Approach 2: Lightweight Command Pattern

### Implementation Sketch
```typescript
// src/commands/explore.ts
export class ExploreCommand {
  async execute(feature: string, options: ExploreOptions) {
    // Simple, direct implementation
    const exploreDir = `.hodge/features/${feature}/explore`;
    await fs.mkdir(exploreDir, { recursive: true });

    // Check PM if configured
    if (process.env.HODGE_PM_TOOL) {
      const issue = await this.fetchPMIssue(feature);
      if (issue) {
        await fs.writeFile(`${exploreDir}/issue.json`, JSON.stringify(issue));
      }
    }

    // Generate context file for AI
    const context = {
      mode: 'explore',
      feature,
      timestamp: new Date().toISOString(),
      standards: 'suggested',
      validation: 'optional',
      pmIssue: issue?.identifier || null
    };

    await fs.writeFile(`${exploreDir}/context.json`, JSON.stringify(context));

    // Output guidance for AI/user
    console.log(chalk.cyan('🔍 Explore Mode Activated'));
    console.log(`Feature: ${feature}`);
    console.log('\nIn explore mode:');
    console.log('• Standards are suggested, not enforced');
    console.log('• Multiple approaches encouraged');
    console.log('• Focus on rapid prototyping');

    if (issue) {
      console.log(`\n📋 PM Issue: ${issue.identifier} - ${issue.title}`);
    }

    console.log('\nExploration saved to:', exploreDir);
  }
}

// Similar pattern for build and harden
```

### Pros
- Simple and straightforward implementation
- Minimal abstraction, easy to understand
- Quick to implement and test
- Direct mapping to command requirements
- Follows existing init command pattern

### Cons
- Some code duplication across commands
- Less flexible for future enhancements
- Mode transitions less explicit
- Limited reusability of mode logic

### Compatibility
- ✅ Perfect fit with existing codebase style
- ✅ Follows init command patterns exactly
- ✅ Easy to test with existing infrastructure
- ✅ Minimal new concepts introduced

---

## Approach 3: Plugin-Based Architecture

### Implementation Sketch
```typescript
// src/lib/plugins/base-plugin.ts
export abstract class ModePlugin {
  abstract name: string;
  abstract beforeExecute(context: ModeContext): Promise<void>;
  abstract execute(context: ModeContext): Promise<void>;
  abstract afterExecute(context: ModeContext): Promise<void>;
}

// src/lib/plugins/standards-plugin.ts
export class StandardsPlugin extends ModePlugin {
  name = 'standards';

  async execute(context: ModeContext) {
    switch(context.mode) {
      case 'explore':
        await this.suggestStandards(context);
        break;
      case 'build':
        await this.recommendStandards(context);
        break;
      case 'harden':
        await this.enforceStandards(context);
        break;
    }
  }
}

// src/commands/explore.ts
export class ExploreCommand {
  private plugins: ModePlugin[] = [
    new StandardsPlugin(),
    new PMIntegrationPlugin(),
    new ContextBuilderPlugin(),
    new AIOutputPlugin()
  ];

  async execute(feature: string, options: ExploreOptions) {
    const context = new ModeContext('explore', feature, options);

    for (const plugin of this.plugins) {
      await plugin.beforeExecute(context);
    }

    for (const plugin of this.plugins) {
      await plugin.execute(context);
    }

    for (const plugin of this.plugins) {
      await plugin.afterExecute(context);
    }

    await context.save();
  }
}
```

### Pros
- Highly extensible and modular
- Easy to add new functionality via plugins
- Clear separation of concerns
- Testable individual plugins
- Future-proof architecture

### Cons
- Over-engineered for current requirements
- More complex to understand initially
- Requires more boilerplate code
- May slow down initial development

### Compatibility
- ✅ TypeScript-friendly with good typing
- ✅ Testable with existing infrastructure
- ⚠️ Introduces new architectural pattern
- ⚠️ More complex than existing patterns

---

## Recommendation

Based on exploration, **Approach 2: Lightweight Command Pattern** seems best because:

1. **Consistency**: Matches the existing init command pattern perfectly
2. **Simplicity**: Minimal abstraction, easy to understand and maintain
3. **Speed**: Fastest to implement and ship
4. **Pragmatic**: Solves the immediate need without over-engineering
5. **Iterative**: Can evolve to Approach 1 later if needed

The lightweight approach aligns with Hodge's philosophy of "ship fast, iterate often" and maintains the codebase's current clean, straightforward style.

## Implementation Plan

### Phase 1: Core Commands
1. Implement ExploreCommand with basic PM integration
2. Implement BuildCommand with standards suggestions
3. Implement HardenCommand with validation enforcement

### Phase 2: Shared Utilities
1. Extract common PM integration logic
2. Create shared context builder
3. Add mode transition helpers

### Phase 3: Testing & Polish
1. Comprehensive unit tests for each command
2. Integration tests for mode transitions
3. Documentation and help text

## Next Steps
Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build HOD-20`
d) Save progress and switch context → `/save`
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):