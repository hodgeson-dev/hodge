# Exploration: Context-Aware Workflow Commands (HODGE-054)

## Feature Overview
Make all workflow commands (explore, build, harden, ship) context-aware by reading the current feature from context.json, with optional override parameter.

## Context
- **Date**: 9/18/2025
- **Mode**: Explore (Enhanced with AI)
- **Standards**: Suggested (loaded)
- **Related Features**: HODGE-052 (auto-save context), HODGE-051 (slash commands)

## Implementation Approaches

### Approach 1: Implicit Context Reading (Recommended)
**Description**: Commands read current feature from context.json by default, with optional override

**Implementation Sketch**:
```typescript
// In each command's execute method
async execute(featureArg?: string, options: CommandOptions = {}) {
  // Read current context
  const context = await this.loadContext();

  // Use argument if provided, otherwise use context
  const feature = featureArg || context?.feature;

  if (!feature) {
    throw new Error('No feature specified and no current context found');
  }

  // Auto-save if switching features
  if (context?.feature && context.feature !== feature) {
    await autoSave.checkAndSave(feature);
  }

  // Continue with command execution...
}
```

**Pros**:
- Seamless workflow - users can just run `hodge build` after explore
- Maintains backward compatibility with explicit feature argument
- Reduces repetition and typing
- Natural progression through workflow phases

**Cons**:
- Implicit behavior might confuse new users
- Need clear error messages when no context exists

### Approach 2: Explicit Context Flag
**Description**: Add --use-context flag to explicitly read from context

**Implementation Sketch**:
```typescript
// Command definition with new flag
program
  .command('build [feature]')
  .option('--use-context', 'Use current feature from context')
  .action(async (feature, options) => {
    if (options.useContext) {
      const context = await loadContext();
      feature = context?.feature;
    }
    // Continue with feature...
  });
```

**Pros**:
- Explicit intent, no surprises
- Clear when context is being used
- Easier to debug

**Cons**:
- More verbose, users need to remember flag
- Less seamless workflow
- Doesn't leverage context by default

### Approach 3: Interactive Prompt
**Description**: If no feature specified, prompt user with current context as default

**Implementation Sketch**:
```typescript
async execute(featureArg?: string, options: CommandOptions = {}) {
  let feature = featureArg;

  if (!feature) {
    const context = await this.loadContext();
    const { selectedFeature } = await inquirer.prompt([{
      type: 'input',
      name: 'selectedFeature',
      message: 'Which feature?',
      default: context?.feature || '',
      validate: (input) => !!input || 'Feature is required'
    }]);
    feature = selectedFeature;
  }
  // Continue...
}
```

**Pros**:
- User-friendly for beginners
- Shows current context visually
- Allows easy override

**Cons**:
- Breaks automation and scripts
- Adds friction to workflow
- Not suitable for CI/CD environments

## Recommendation
**Approach 1: Implicit Context Reading** is recommended because:
- Provides the smoothest workflow experience
- Maintains backward compatibility
- Aligns with the progressive development model
- Supports both explicit (with argument) and implicit (from context) usage

## Implementation Details

### Files to Modify:
- `src/commands/explore.ts` - Already saves context
- `src/commands/build.ts` - Add context reading
- `src/commands/harden.ts` - Add context reading
- `src/commands/ship.ts` - Add context reading
- `src/commands/status.ts` - Show current context
- `src/lib/context-manager.ts` - Create centralized context management

### Context Manager Design:
```typescript
export class ContextManager {
  private contextPath = '.hodge/context.json';

  async load(): Promise<Context | null> {
    if (!existsSync(this.contextPath)) return null;
    return JSON.parse(await readFile(this.contextPath, 'utf-8'));
  }

  async save(context: Partial<Context>): Promise<void> {
    const current = await this.load() || {};
    const updated = { ...current, ...context, timestamp: new Date().toISOString() };
    await writeFile(this.contextPath, JSON.stringify(updated, null, 2));
  }

  async clear(): Promise<void> {
    if (existsSync(this.contextPath)) {
      await unlink(this.contextPath);
    }
  }
}
```

### Usage Pattern:
```bash
# Start exploring a feature (sets context)
hodge explore HODGE-055

# Continue to build (uses context automatically)
hodge build

# Continue to harden (uses context automatically)
hodge harden

# Ship it (uses context automatically)
hodge ship

# Or override at any time
hodge build HODGE-056  # Switches context to HODGE-056
```

## Next Steps
- [x] Review the recommended approaches
- [x] Document implementation details
- [ ] Make decision with `/decide`
- [ ] Proceed to `/build HODGE-054`

---
*Generated with AI-enhanced exploration (2025-09-17T00:51:49.747Z)*
