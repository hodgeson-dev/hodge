# Slash Commands Synchronization Issue Exploration

## Problem Statement
When we update `.claude/commands/*.md` files, those changes are not reflected in `src/lib/claude-commands.ts`. This means:
- `hodge init` installs outdated commands
- New users don't get our progressive testing updates
- Manual updates to `.claude/commands` are lost on reinstall

## Current State Analysis

### How It Works Now
1. **Source of Truth**: `src/lib/claude-commands.ts` contains hardcoded command content
2. **Installation**: `hodge init` calls `installClaudeSlashCommands()` which uses `getClaudeCommands()`
3. **Skip Logic**: If `.claude/commands/*.md` exists, it's skipped (not overwritten)
4. **Manual Updates**: We've been editing `.claude/commands/*.md` directly

### What's Out of Sync
- `explore.md` - Missing test-intentions.md generation
- `build.md` - Missing progressive testing guidance
- `harden.md` - Missing strict testing requirements
- `ship.md` - Missing test coverage requirements

## Approach 1: Dynamic Loading (Read from Files)

### Implementation
```typescript
// src/lib/claude-commands.ts
export async function getClaudeCommands(): Promise<ClaudeCommand[]> {
  const commandsDir = path.join(__dirname, '../../.claude/commands');
  const files = await fs.readdir(commandsDir);

  return Promise.all(
    files
      .filter(f => f.endsWith('.md'))
      .map(async (file) => ({
        name: path.basename(file, '.md'),
        content: await fs.readFile(path.join(commandsDir, file), 'utf8')
      }))
  );
}
```

### Pros
- Single source of truth (`.claude/commands/*.md`)
- No synchronization needed
- Easy to update commands

### Cons
- Requires async change throughout call chain
- Commands must exist in repo for package to work
- Harder to distribute via npm

## Approach 2: Build-Time Synchronization

### Implementation
```typescript
// scripts/sync-commands.js
// Run during build to update src/lib/claude-commands.ts
const commands = fs.readdirSync('.claude/commands');
const code = generateTypeScriptFromCommands(commands);
fs.writeFileSync('src/lib/claude-commands.ts', code);
```

### Pros
- Commands bundled with package
- No async changes needed
- Works with npm distribution

### Cons
- Requires build step
- Could forget to run sync
- Generated code in version control

## Approach 3: Dual Sources with Override

### Implementation
```typescript
// src/lib/claude-commands.ts
export function getClaudeCommands(): ClaudeCommand[] {
  const defaultCommands = getDefaultCommands();

  // Check for overrides in .claude/commands
  if (fs.existsSync('.claude/commands')) {
    return mergeWithOverrides(defaultCommands);
  }

  return defaultCommands;
}
```

### Pros
- Flexible - works with or without local files
- Allows customization
- Backwards compatible

### Cons
- Complex merge logic
- Two sources of truth
- Potential for confusion

## Recommendation

**Approach 2: Build-Time Synchronization** seems best because:

1. **Simplicity**: One source of truth (`.claude/commands/*.md`)
2. **Distribution**: Commands bundled with npm package
3. **Automation**: Can add to pre-commit hook or build script
4. **Reliability**: No runtime file dependencies
5. **Type Safety**: Generated TypeScript maintains types

## Implementation Plan

1. Create `scripts/sync-claude-commands.js` script
2. Add to `package.json` scripts: `"sync:commands": "node scripts/sync-claude-commands.js"`
3. Add to build process: `"build": "npm run sync:commands && tsc ..."`
4. Run sync once to update with current commands
5. Add to pre-commit hook to keep in sync

## Next Steps
- a) Review and decide on approach → `/decide`
- b) Explore alternative solutions
- c) Start building sync script → `/build sync-claude-commands`
- d) Check impact on existing installations
- e) Test with fresh install
- f) Done for now