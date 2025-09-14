# Init Improvements Context

## Decisions Made
- **PM Tool Selection**: Ask only when not detected
- **PM Scripts**: Deploy to .hodge/pm-scripts/ during init
- **Pattern Learning**: Ask in interactive mode (default), skip with --quick
- **Date**: 2025-09-13

## Implementation Plan

### Phase 1: Update Init Command Flow
1. Make interactive mode the default behavior
2. Add `--quick` flag for minimal/fast init
3. Add PM tool selection when not detected
4. Add pattern learning prompt for existing codebases
5. Deploy PM scripts when PM tool is selected

### Phase 2: Create PM Scripts System
1. Organize existing Linear scripts as templates
2. Create script templates for GitHub, Jira
3. Build deployment system for .hodge/pm-scripts/
4. Include dependencies and documentation

### Phase 3: Implement Pattern Learning
1. Create `hodge learn` command
2. Add pattern extraction logic
3. Integrate with init flow for existing codebases

## Key Changes from Current Implementation

### Init Command Defaults
```typescript
// Current: Minimal by default
hodge init              // Minimal questions
hodge init --interactive // Full setup

// New: Interactive by default  
hodge init              // Interactive (PM, patterns, etc.)
hodge init --quick      // Minimal questions
hodge init --yes        // Accept all defaults
```

### PM Tool Selection
```typescript
// Add to init flow when PM not detected
if (!detected.pmTool && mode === 'interactive') {
  const { pmTool } = await prompt([{
    type: 'list',
    name: 'pmTool',
    message: 'Project management tool:',
    choices: [
      'Linear',
      'GitHub Issues', 
      'Jira',
      'None'
    ]
  }]);
}
```

### PM Scripts Deployment
```typescript
// After PM tool selection
if (config.pmTool !== 'none') {
  await deployPMScripts(config.pmTool, '.hodge/pm-scripts');
  console.log('PM scripts deployed to .hodge/pm-scripts/');
}
```

### Pattern Learning Prompt
```typescript
// For existing codebases in interactive mode
if (hasExistingCode && mode === 'interactive') {
  const { learn } = await prompt([{
    type: 'confirm',
    name: 'learn',
    message: 'Learn patterns from existing code?',
    default: true
  }]);
  
  if (learn) {
    await runCommand('hodge', ['learn', '--auto']);
  }
}
```

## Files to Create/Modify
- `src/commands/init.ts` - Update with new flow
- `src/lib/pm-scripts/` - PM script templates
- `src/lib/pm-scripts-deployer.ts` - Deployment logic
- `src/commands/learn.ts` - Pattern learning command
- `src/lib/pattern-extractor.ts` - Pattern extraction logic

## Next Steps
Ready for `/build init-improvements` to implement these enhancements