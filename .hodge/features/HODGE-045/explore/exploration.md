# HODGE-045: PM Auto-Update After Ship

## Problem Statement
The ship command currently has a "Post-Ship Checklist" that mentions "PM issue marked as Done" but doesn't actually execute any PM updates. We need automatic project management updates after successful ship commands that work across different PM tools (local, Linear, Jira, Trello, etc.).

## Current State Analysis

### What's Missing
1. **No update methods in PM adapters** - BasePMAdapter has no `updateIssueStatus` or similar methods
2. **Ship command doesn't call PM updates** - The ship.ts file has no PM integration
3. **No local PM adapter** - project_management.md updates are manual
4. **Checklist is passive** - It's just documentation, not executable

### Existing Infrastructure
- PM adapter system exists with BasePMAdapter
- Linear adapter partially implemented
- ID management links local HODGE-xxx to external IDs
- Ship command has clear success/failure states

## Approach 1: Extend PM Adapter Interface

### Implementation
```typescript
// Add to BasePMAdapter
abstract updateIssueStatus(issueId: string, status: 'done' | 'shipped'): Promise<void>;
abstract addComment(issueId: string, comment: string): Promise<void>;

// In ShipCommand.execute()
if (shipSuccessful) {
  const pmAdapter = await getPMAdapter();
  const issueId = await idManager.getExternalId(feature);
  if (issueId && pmAdapter) {
    await pmAdapter.updateIssueStatus(issueId, 'shipped');
    await pmAdapter.addComment(issueId, `Shipped in ${commitHash}`);
  }
}
```

### Pros
- Clean extension of existing architecture
- Works with any PM tool that implements the interface
- Maintains separation of concerns

### Cons
- Requires implementing update methods for each adapter
- No fallback if PM tool is unavailable

## Approach 2: Event-Driven PM Updates

### Implementation
```typescript
// Create PMEventBus
class PMEventBus {
  emit(event: 'ship.success' | 'ship.failed', data: any) {
    // Notify all registered PM adapters
  }
}

// PM adapters register handlers
class LinearAdapter {
  onShipSuccess(data) {
    await this.updateIssue(data.issueId, { state: 'Done' });
  }
}

// Ship command emits events
pmEventBus.emit('ship.success', { feature, commitHash });
```

### Pros
- Decoupled architecture
- Multiple PM tools can react to same event
- Extensible for other commands (build, harden)

### Cons
- More complex initial setup
- Potential for missed events if handlers fail

## Approach 3: Local-First with Sync

### Implementation
```typescript
// Always update local project_management.md first
class LocalPMAdapter extends BasePMAdapter {
  async updateIssueStatus(feature: string, status: string) {
    const pmFile = '.hodge/project_management.md';
    // Parse markdown, find feature, update status
    // Move from Active to Completed sections
  }
}

// Then sync to external if available
class PMManager {
  async shipComplete(feature: string) {
    // Always update local
    await localAdapter.updateIssueStatus(feature, 'shipped');

    // Try external if configured
    if (externalAdapter) {
      try {
        await externalAdapter.updateIssueStatus(feature, 'shipped');
      } catch (error) {
        console.warn('External PM update failed, local updated successfully');
      }
    }
  }
}
```

### Pros
- Always have local record of project state
- Resilient to external PM failures
- Single source of truth locally

### Cons
- Potential for sync conflicts
- Need to parse/update markdown files

## Recommendation

**Approach 3: Local-First with Sync** is the best solution because:

1. **Reliability** - Always updates local state even if external PM is down
2. **Compatibility** - Works immediately without PM tool configuration
3. **Transparency** - project_management.md is human-readable and git-trackable
4. **Progressive Enhancement** - External PM sync is additive, not required
5. **Aligns with Hodge philosophy** - Local-first, with external tools as enhancement

### Implementation Plan
1. Create LocalPMAdapter that updates project_management.md
2. Add `updateIssueStatus()` method to BasePMAdapter interface
3. Implement in LinearAdapter (and stub for future adapters)
4. Add PM update call to ship command after successful ship
5. Handle both HODGE-xxx and external IDs correctly

## Implementation Details: LocalPMAdapter

### Markdown Parsing Strategy
```typescript
class LocalPMAdapter extends BasePMAdapter {
  private readonly pmFile = '.hodge/project_management.md';

  async updateIssueStatus(featureId: string, status: 'shipped' | 'completed'): Promise<void> {
    const content = await fs.readFile(this.pmFile, 'utf-8');
    const lines = content.split('\n');

    let inActiveSection = false;
    let inCompletedSection = false;
    let featureBlock: string[] = [];
    let featureStartIdx = -1;

    // Find the feature in Active Features
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('## Active Features')) {
        inActiveSection = true;
        inCompletedSection = false;
      } else if (lines[i].includes('## Completed Features')) {
        inActiveSection = false;
        inCompletedSection = true;
      }

      if (inActiveSection && lines[i].startsWith(`### ${featureId}`)) {
        featureStartIdx = i;
        // Capture the feature block until next ### or ##
        while (i < lines.length && !lines[i+1]?.match(/^###? /)) {
          featureBlock.push(lines[i]);
          i++;
        }
        featureBlock.push(lines[i]); // Add last line
        break;
      }
    }

    if (featureBlock.length > 0) {
      // Update the feature block
      featureBlock = this.updateFeatureBlock(featureBlock, status);

      // Remove from Active section
      lines.splice(featureStartIdx, featureBlock.length);

      // Add to Completed section
      const completedIdx = lines.findIndex(l => l.includes('## Completed Features'));
      lines.splice(completedIdx + 2, 0, ...featureBlock, '');

      // Update activity log
      this.addActivityLogEntry(lines, featureId, status);

      await fs.writeFile(this.pmFile, lines.join('\n'));
    }
  }

  private updateFeatureBlock(block: string[], status: string): string[] {
    const today = new Date().toISOString().split('T')[0];

    return block.map(line => {
      if (line.includes('**Status**:')) {
        return `- **Status**: ${status === 'shipped' ? 'Shipped' : 'Completed'}`;
      }
      if (line.includes('**Updated**:')) {
        return `- **Completed**: ${today}`;
      }
      return line;
    });
  }

  private addActivityLogEntry(lines: string[], featureId: string, status: string): void {
    const today = new Date().toISOString().split('T')[0];
    const logIdx = lines.findIndex(l => l.includes('## Activity Log'));

    // Find today's section or create it
    let todayIdx = -1;
    for (let i = logIdx; i < lines.length; i++) {
      if (lines[i].includes(`### ${today}`)) {
        todayIdx = i;
        break;
      }
    }

    if (todayIdx === -1) {
      // Create today's section
      lines.splice(logIdx + 2, 0, `### ${today}`, '');
      todayIdx = logIdx + 2;
    }

    // Add entry
    const entry = `- ${status === 'shipped' ? 'Shipped' : 'Completed'} ${featureId}`;
    lines.splice(todayIdx + 1, 0, entry);
  }
}
```

### Integration with Ship Command
```typescript
// In src/commands/ship.ts
import { LocalPMAdapter } from '../lib/pm/local-adapter';
import { getPMAdapter } from '../lib/pm';

class ShipCommand {
  async execute(feature: string, options: ShipOptions): Promise<void> {
    // ... existing ship logic ...

    if (shipSuccessful) {
      await this.updateProjectManagement(feature);
    }
  }

  private async updateProjectManagement(feature: string): Promise<void> {
    try {
      // Always update local PM
      const localAdapter = new LocalPMAdapter({
        config: { tool: 'local' }
      });
      await localAdapter.updateIssueStatus(feature, 'shipped');
      console.log(chalk.green('✓ Updated project_management.md'));

      // Try external PM if configured
      const externalAdapter = await getPMAdapter();
      if (externalAdapter) {
        try {
          const externalId = await this.idManager.getExternalId(feature);
          if (externalId) {
            await externalAdapter.updateIssueStatus(externalId, 'shipped');
            console.log(chalk.green(`✓ Updated ${externalAdapter.tool} issue`));
          }
        } catch (error) {
          console.warn(chalk.yellow('⚠ External PM update failed, local updated successfully'));
        }
      }
    } catch (error) {
      console.error(chalk.red('✗ Failed to update project management:'), error);
      // Don't fail the ship, just warn
    }
  }
}
```

## Test Intentions
- [ ] LocalPMAdapter updates project_management.md correctly
- [ ] Ship command calls PM updates on success
- [ ] External PM failures don't break ship flow
- [ ] Status transitions are correct (Active → Shipped)
- [ ] Timestamps and activity log updated
- [ ] Works with both HODGE-xxx and external IDs

## Next Steps
Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build HODGE-045`
d) Save progress and switch context → `/save`
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):