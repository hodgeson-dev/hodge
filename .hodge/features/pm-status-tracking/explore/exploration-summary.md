# PM Status Tracking Exploration

## The Challenge

When and how should Hodge move PM issues through their workflow states? How does Hodge know what states exist and their sequence?

## Approach 1: Explicit Configuration

**Concept**: User creates `.hodge/pm-config.json` with complete workflow definition

```javascript
// User defines states and transitions explicitly
{
  "tool": "linear",
  "workflows": {
    "states": ["backlog", "in_progress", "review", "done"],
    "transitions": {
      "start": ["backlog->in_progress"],
      "complete": ["review->done"]
    }
  }
}
```

**Pros:**
- Full control over workflow mapping
- Works with any PM tool
- Can version control the config
- Explicit and debuggable

**Cons:**
- Requires manual setup
- Config can drift from PM tool reality
- Maintenance burden

## Approach 2: Auto-Discovery via API

**Concept**: Query PM tool API to discover available states dynamically

```javascript
// Hodge fetches and infers state mappings
const states = await linearClient.workflowStates();
const inProgressState = states.find(s => 
  s.type === 'started' || s.name.match(/progress/i)
);
```

**Pros:**
- Always in sync with PM tool
- No manual configuration
- Adapts to workflow changes automatically
- Discovers custom workflows

**Cons:**
- Requires API calls (network dependency)
- Inference might not be perfect
- Different implementation per PM tool
- Need offline fallback

## Approach 3: Convention-Based with Smart Defaults

**Concept**: Use naming conventions that work across PM tools, with override capability

```javascript
// Smart pattern matching with optional overrides
const patterns = {
  inProgress: [/in.?progress/i, /doing/i, /active/i],
  done: [/done/i, /complete/i, /shipped/i]
};
```

**Pros:**
- Works across PM tools with same code
- No config required to start
- Smart defaults that usually work
- Optional overrides for edge cases
- Could learn from usage patterns

**Cons:**
- Pattern matching might miss edge cases
- Conventions might not fit all workflows
- Still needs PM tool API access

## Recommendation

**Recommended Approach: #3 - Convention-Based with Smart Defaults**

### Why?

1. **Best Developer Experience**: Works out of the box for 80% of cases
2. **Flexibility**: Supports overrides when conventions don't match
3. **PM Tool Agnostic**: Same code works for Linear, Jira, GitHub Issues, etc.
4. **Progressive Enhancement**: Start simple, add overrides as needed
5. **Aligns with Hodge Philosophy**: "Freedom to explore" (conventions), "discipline to build" (overrides)

### Implementation Strategy

```javascript
class PMAdapter {
  constructor() {
    this.conventions = new ConventionMatcher();
    this.overrides = this.loadOverrides();
    this.pmClient = this.detectPMTool();
  }

  async transitionIssue(issueId, fromMode, toMode) {
    // Try override first
    if (this.overrides[`${fromMode}->${toMode}`]) {
      return this.applyOverride(issueId, this.overrides[`${fromMode}->${toMode}`]);
    }
    
    // Fall back to conventions
    const states = await this.pmClient.getStates();
    const targetState = this.conventions.findTargetState(states, toMode);
    
    if (!targetState) {
      // Prompt user to configure override
      console.log(`No state found for ${toMode}. Please configure in .hodge/pm-overrides.json`);
      return false;
    }
    
    return this.pmClient.updateIssue(issueId, targetState);
  }
}
```

### Mode-to-State Mapping

| Hodge Mode | Common PM States | Action |
|------------|-----------------|--------|
| `explore` | Backlog, Todo, Planned | Issue created/refined |
| `build` | In Progress, Doing, Active | Move to active development |
| `harden` | Review, Testing, QA | Ready for review |
| `ship` | Done, Complete, Deployed | Mark as complete |

### Triggering Transitions

```bash
# Automatic transitions with PM context
hodge explore feature-x  # Pulls PM issue data as exploration context
hodge build feature-x    # Moves linked issue to "In Progress"
hodge harden feature-x   # Moves to "Review"
hodge ship feature-x     # Moves to "Done"

# Manual transitions
hodge pm move in-progress
hodge pm move done --issue=LIN-123
```

### PM Issue as Context Source

When running `hodge explore feature-x`, Hodge will:
1. Check if feature-x matches a PM issue (by ID or title)
2. Pull issue description, acceptance criteria, and comments
3. Use this as context for AI-assisted exploration
4. Link the exploration to the PM issue
5. Update issue status to reflect mode transitions

This ensures development stays aligned with PM requirements while maintaining flexibility to explore solutions.

## Next Steps

To move to build mode: `/build pm-status-tracking`

This will:
1. Create structured implementation based on Approach 3
2. Build adapters for Linear (first) and GitHub Issues
3. Implement override system
4. Add tests for pattern matching
5. Create documentation for users