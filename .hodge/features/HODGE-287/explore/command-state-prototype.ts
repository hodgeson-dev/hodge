/**
 * Generalized Command State Persistence for Hodge Slash Commands
 * Survives context compaction across all workflow commands
 */

import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Generic command state that can handle any slash command
 */
interface CommandState {
  // Core metadata
  command: string;           // e.g., 'explore', 'build', 'harden', 'ship', 'decide', 'save'
  timestamp: string;         // ISO timestamp of last update
  version: string;           // State format version for compatibility

  // Command progress tracking
  currentStep: string;       // Named step identifier (e.g., 'approach-generation', 'user-choice')
  completedSteps: string[];  // List of completed step identifiers

  // User interactions
  userInputs: Record<string, any>;  // Flexible storage for all user choices/inputs

  // Command-specific data (flexible)
  data: Record<string, any>;  // Any command-specific state

  // Recovery information
  lastOutput?: string;       // Last significant output shown to user
  nextPrompt?: string;       // What to ask the user next
}

/**
 * Step definitions for each command
 */
const COMMAND_STEPS = {
  explore: [
    'init',
    'context-review',
    'approach-generation',
    'approach-selection',
    'recommendation',
    'next-steps'
  ],
  build: [
    'init',
    'approach-confirmation',
    'implementation',
    'smoke-tests',
    'validation',
    'next-steps'
  ],
  harden: [
    'init',
    'standards-review',
    'integration-tests',
    'validation',
    'quality-gates',
    'next-steps'
  ],
  ship: [
    'init',
    'quality-checks',
    'commit-generation',
    'commit-approval',
    'git-commit',
    'lessons-capture',
    'pm-update',
    'next-steps'
  ],
  decide: [
    'init',
    'options-presentation',
    'user-selection',
    'decision-recording',
    'next-steps'
  ],
  save: [
    'init',
    'context-gathering',
    'manifest-creation',
    'file-saving',
    'confirmation'
  ],
  load: [
    'init',
    'save-selection',
    'context-restoration',
    'confirmation'
  ],
  status: [
    'init',
    'data-gathering',
    'display',
    'next-steps'
  ]
};

export class CommandStateManager {
  private stateDir = '.hodge/temp/command-state';
  private maxStateAge = 30 * 60 * 1000; // 30 minutes

  /**
   * Save command state with automatic versioning
   */
  async saveState(
    command: string,
    state: Partial<CommandState>
  ): Promise<void> {
    await fs.mkdir(this.stateDir, { recursive: true });

    const fullState: CommandState = {
      command,
      timestamp: new Date().toISOString(),
      version: '2.0',
      currentStep: state.currentStep || 'init',
      completedSteps: state.completedSteps || [],
      userInputs: state.userInputs || {},
      data: state.data || {},
      lastOutput: state.lastOutput,
      nextPrompt: state.nextPrompt
    };

    const statePath = this.getStatePath(command, state.data?.feature);
    await fs.writeFile(
      statePath,
      JSON.stringify(fullState, null, 2),
      'utf-8'
    );
  }

  /**
   * Load and validate state
   */
  async loadState(
    command: string,
    feature?: string
  ): Promise<CommandState | null> {
    const statePath = this.getStatePath(command, feature);

    try {
      const content = await fs.readFile(statePath, 'utf-8');
      const state = JSON.parse(content) as CommandState;

      // Validate state age
      const stateAge = Date.now() - new Date(state.timestamp).getTime();
      if (stateAge > this.maxStateAge) {
        await this.clearState(command, feature);
        return null;
      }

      // Validate version compatibility
      if (!this.isVersionCompatible(state.version)) {
        await this.clearState(command, feature);
        return null;
      }

      return state;
    } catch {
      return null;
    }
  }

  /**
   * Update specific fields without loading full state
   */
  async updateState(
    command: string,
    updates: Partial<CommandState>,
    feature?: string
  ): Promise<void> {
    const existing = await this.loadState(command, feature);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        timestamp: new Date().toISOString()
      };
      await this.saveState(command, updated);
    } else {
      await this.saveState(command, updates);
    }
  }

  /**
   * Mark a step as completed
   */
  async completeStep(
    command: string,
    step: string,
    feature?: string
  ): Promise<void> {
    const state = await this.loadState(command, feature) || {
      completedSteps: [],
      userInputs: {},
      data: { feature }
    };

    if (!state.completedSteps.includes(step)) {
      state.completedSteps.push(step);
    }

    // Find next step
    const steps = COMMAND_STEPS[command as keyof typeof COMMAND_STEPS];
    if (steps) {
      const currentIndex = steps.indexOf(step);
      if (currentIndex >= 0 && currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
      }
    }

    await this.saveState(command, state);
  }

  /**
   * Store user input/choice
   */
  async saveUserInput(
    command: string,
    key: string,
    value: any,
    feature?: string
  ): Promise<void> {
    const state = await this.loadState(command, feature) || {
      completedSteps: [],
      userInputs: {},
      data: { feature }
    };

    state.userInputs[key] = value;
    await this.saveState(command, state);
  }

  /**
   * Clear state when command completes
   */
  async clearState(command: string, feature?: string): Promise<void> {
    const statePath = this.getStatePath(command, feature);
    try {
      await fs.unlink(statePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Clear all stale states
   */
  async clearStaleStates(): Promise<void> {
    try {
      const files = await fs.readdir(this.stateDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.stateDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const state = JSON.parse(content) as CommandState;

          const stateAge = Date.now() - new Date(state.timestamp).getTime();
          if (stateAge > this.maxStateAge) {
            await fs.unlink(filePath);
          }
        }
      }
    } catch {
      // Directory might not exist
    }
  }

  /**
   * Get recovery instructions for a command
   */
  getRecoveryInstructions(state: CommandState): string {
    const steps = COMMAND_STEPS[state.command as keyof typeof COMMAND_STEPS];
    if (!steps) return 'Continue with the command';

    const currentIndex = steps.indexOf(state.currentStep);
    const remainingSteps = steps.slice(currentIndex);

    return `
Recovery Information:
- Command: ${state.command}
- Current Step: ${state.currentStep}
- Completed: ${state.completedSteps.join(', ')}
- Remaining: ${remainingSteps.join(', ')}
${state.lastOutput ? `\nLast Output:\n${state.lastOutput}` : ''}
${state.nextPrompt ? `\nNext Action:\n${state.nextPrompt}` : ''}
    `;
  }

  private getStatePath(command: string, feature?: string): string {
    const filename = feature
      ? `${command}-${feature}.json`
      : `${command}-session.json`;
    return join(this.stateDir, filename);
  }

  private isVersionCompatible(version: string): boolean {
    // Simple major version check
    const [major] = version.split('.');
    return major === '2';
  }
}

// Example usage in slash command markdown:
/*
## Compaction Recovery

Check for saved session state:

```bash
# Check for command state
STATE_FILE=".hodge/temp/command-state/explore-{{feature}}.json"
if [ -f "$STATE_FILE" ]; then
  echo "🔄 Found saved session state"
  cat "$STATE_FILE"

  # Extract current step
  STEP=$(jq -r '.currentStep' "$STATE_FILE")
  echo "Resume from step: $STEP"

  # Show completed steps
  jq -r '.completedSteps[]' "$STATE_FILE" | while read step; do
    echo "  ✓ $step"
  done
fi
```

Based on the current step:
- If `approach-generation`: Show generated approaches and continue
- If `approach-selection`: Show approaches and wait for selection
- If `recommendation`: Show recommendation and next steps
- If no state: Start fresh

## Save Progress After Each Step

After completing approach generation:
```bash
# Update state to mark step complete
jq '. + {
  currentStep: "approach-selection",
  completedSteps: (.completedSteps + ["approach-generation"]),
  data: (.data + {
    approaches: ["Approach 1", "Approach 2", "Approach 3"]
  }),
  lastOutput: "Generated 3 implementation approaches",
  nextPrompt: "Choose an approach (a/b/c)"
}' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
```
*/