# Init Improvements Exploration Summary

## Problems Identified
1. **PM Tool Selection**: `hodge init` doesn't ask about PM tool selection when none is detected
2. **PM Scripts**: No PM management scripts are deployed for users to use
3. **Pattern Learning**: No prompt to learn from existing codebase patterns

## Current PM Scripts Inventory

We have these PM-related scripts in `/scripts`:
- `create-linear-project.js` - Creates Linear project
- `list-linear-teams.js` - Lists Linear teams
- `fetch-issue.js` - Fetches issue details
- `update-issue-decision.js` - Updates issue with decision
- `ship-issue.js` - Ships issue to Done
- `test-pm-connection.js` - Tests PM connection

**Missing PM scripts**:
- GitHub Issues scripts
- Jira scripts  
- Trello scripts
- Generic create/update/delete operations
- Bulk operations
- Sprint/milestone management

## Approaches Explored

### Approach 1: Interactive PM Selection
- Always ask about PM tool during init
- Guide users through PM configuration
- Show how to get API keys
- **Best for**: User education and complete setup

### Approach 2: PM Scripts Distribution
- Deploy comprehensive PM scripts to `.hodge/pm-scripts/`
- Include templates for all common operations
- Package with dependencies
- **Best for**: Power users who need full PM integration

### Approach 3: Smart Defaults with Progressive Enhancement
- Keep init fast with minimal questions
- Add `hodge config pm` for later configuration
- Add `hodge pm install-scripts` for script deployment
- Add `hodge learn` for pattern extraction
- **Best for**: Quick start with optional enhancement

## Recommendation

**Hybrid Approach: Smart Init with Optional Interactivity**

```typescript
// Default behavior - smart and fast
hodge init                    // Minimal questions, suggest next steps

// Flags for different preferences  
hodge init --interactive      // Full interactive setup (includes PM)
hodge init --yes             // Accept all defaults
hodge init --pm-tool linear  // Pre-select PM tool

// Post-init commands for enhancement
hodge config pm              // Configure PM tool
hodge pm install-scripts     // Deploy PM scripts
hodge learn                  // Extract patterns
```

### Implementation Priority

#### Phase 1: Enhance Init Command
1. Add PM tool question when not detected
2. Add pattern learning prompt for existing codebases
3. Show clear next steps after init
4. Add `--interactive` flag for full setup

#### Phase 2: Create PM Scripts System
1. Build script templates for Linear (we have most)
2. Add GitHub Issues scripts
3. Create `hodge pm install-scripts` command
4. Package scripts with proper dependencies

#### Phase 3: Add Configuration Commands
1. Implement `hodge config pm` for PM setup
2. Implement `hodge learn` for pattern extraction
3. Add `hodge config standards` for standards customization

### Immediate Actions Needed

1. **For Init Enhancement**:
```typescript
// Add to init flow after detection
if (!detected.pmTool && !options.yes) {
  const { pmTool } = await inquirer.prompt([{
    type: 'list',
    name: 'pmTool',
    message: 'Project management tool:',
    choices: [
      { name: 'Linear', value: 'linear' },
      { name: 'GitHub Issues', value: 'github' },
      { name: 'Jira', value: 'jira' },
      { name: 'None (configure later)', value: 'none' }
    ]
  }]);
  config.pmTool = pmTool;
}

// Add pattern learning prompt
if (detected.hasExistingCode && !options.yes) {
  const { learn } = await inquirer.prompt([{
    type: 'confirm',
    name: 'learn',
    message: 'Learn patterns from existing code?',
    default: true
  }]);
  if (learn) {
    // Queue pattern learning after init
    config.autoLearn = true;
  }
}
```

2. **For PM Scripts**:
- Organize existing scripts into reusable templates
- Create base client classes for each PM tool
- Build script generation system

3. **For Next Steps Display**:
```typescript
function showNextSteps(config) {
  const steps = [];
  
  if (!config.pmConfigured) {
    steps.push(`Configure ${config.pmTool}: hodge config pm`);
  }
  
  if (config.pmTool !== 'none') {
    steps.push('Install PM scripts: hodge pm install-scripts');
  }
  
  if (config.hasExistingCode && !config.learned) {
    steps.push('Learn patterns: hodge learn');
  }
  
  // Display steps...
}
```

## Benefits of Recommended Approach

1. **Maintains "one-question" spirit** - Still fast by default
2. **Progressive disclosure** - Complexity available when needed
3. **Educational** - Shows users what's possible
4. **Flexible** - Multiple paths to same outcome
5. **Backwards compatible** - Doesn't break existing behavior

## Next Steps

The recommended approach balances the original vision of simple init with the practical needs for PM configuration and pattern learning. It provides a fast path for quick starts while offering comprehensive configuration for teams that need it.