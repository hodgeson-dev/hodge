import { existsSync } from 'fs';

/**
 * Represents the capabilities of an execution environment
 */
export interface EnvironmentCapabilities {
  tty: boolean;
  fileEdit: boolean;
  prompts: boolean;
  gitIntegration: boolean;
  customCommands: boolean;
  aiAssistance: boolean;
  workflows?: boolean;
  markdown?: boolean;
}

/**
 * Represents a detected execution environment
 */
export interface Environment {
  name: string;
  type: 'claude-code' | 'warp' | 'aider' | 'continue' | 'cursor' | 'terminal' | 'non-interactive';
  capabilities: EnvironmentCapabilities;
  metadata?: Record<string, unknown>;
}

/**
 * Detects and classifies the execution environment for optimal UX
 * Implements the Progressive Enhancement pattern
 */
export class EnvironmentDetector {
  /**
   * Detect the current execution environment
   */
  detect(): Environment {
    // 1. Claude Code - Check for .claude directory or specific env vars
    if (this.isClaudeCode()) {
      return {
        name: 'Claude Code',
        type: 'claude-code',
        capabilities: {
          tty: false,
          fileEdit: true,
          prompts: false,
          gitIntegration: true,
          customCommands: true,
          aiAssistance: true,
          markdown: true,
        },
        metadata: {
          uiType: 'markdown',
          interaction: 'file-based',
        },
      };
    }

    // 2. Aider - Has specific env markers
    if (this.isAider()) {
      return {
        name: 'Aider',
        type: 'aider',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,
          customCommands: false,
          aiAssistance: true,
        },
        metadata: {
          gitMode: 'integrated',
          cooperation: 'recommended',
        },
      };
    }

    // 3. Continue.dev - VS Code extension environment
    if (this.isContinue()) {
      return {
        name: 'Continue.dev',
        type: 'continue',
        capabilities: {
          tty: false,
          fileEdit: true,
          prompts: false,
          gitIntegration: true,
          customCommands: true,
          aiAssistance: false,
        },
        metadata: {
          ide: 'vscode',
          interaction: 'file-based',
        },
      };
    }

    // 4. Cursor - Modified VS Code with AI
    if (this.isCursor()) {
      return {
        name: 'Cursor',
        type: 'cursor',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,
          customCommands: true,
          aiAssistance: true,
        },
        metadata: {
          aiProvider: 'cursor',
          enhancedMessages: true,
        },
      };
    }

    // 5. Warp - Check for Warp terminal
    if (this.isWarp()) {
      return {
        name: 'Warp Terminal',
        type: 'warp',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,
          customCommands: true,
          aiAssistance: true,
          workflows: true,
        },
        metadata: {
          workflows: true,
          aiCommands: true,
        },
      };
    }

    // 6. Standard terminal with TTY
    if (this.isInteractiveTerminal()) {
      return {
        name: 'Terminal',
        type: 'terminal',
        capabilities: {
          tty: true,
          fileEdit: true,
          prompts: true,
          gitIntegration: true,
          customCommands: false,
          aiAssistance: false,
        },
      };
    }

    // 7. Non-interactive fallback (CI, pipes, etc.)
    return {
      name: 'Non-interactive',
      type: 'non-interactive',
      capabilities: {
        tty: false,
        fileEdit: false,
        prompts: false,
        gitIntegration: true,
        customCommands: false,
        aiAssistance: false,
      },
      metadata: {
        ci: process.env.CI === 'true',
        automated: true,
      },
    };
  }

  /**
   * Check if running in Claude Code environment
   */
  private isClaudeCode(): boolean {
    return !!(
      existsSync('.claude/') ||
      process.env.CLAUDE_WORKSPACE ||
      process.env.CLAUDE_CODE ||
      // Check for Claude-specific command execution patterns
      (process.env._ && process.env._.includes('claude'))
    );
  }

  /**
   * Check if running in Aider environment
   */
  private isAider(): boolean {
    return !!(
      process.env.AIDER_CHAT_HISTORY_FILE ||
      process.env.AIDER_MODEL ||
      process.argv.includes('--aider') ||
      existsSync('.aider')
    );
  }

  /**
   * Check if running in Continue.dev environment
   */
  private isContinue(): boolean {
    return !!(
      process.env.CONTINUE_WORKSPACE ||
      process.env.CONTINUE_SESSION ||
      // Continue runs in VS Code
      (process.env.VSCODE_PID && !this.isCursor())
    );
  }

  /**
   * Check if running in Cursor environment
   */
  private isCursor(): boolean {
    return !!(
      process.env.CURSOR_WORKSPACE ||
      process.env.CURSOR_IDE ||
      process.env.CURSOR_SESSION ||
      // Cursor has specific env patterns
      (process.env.VSCODE_PID && process.env.CURSOR_CHANNEL)
    );
  }

  /**
   * Check if running in Warp terminal
   */
  private isWarp(): boolean {
    return !!(
      process.env.TERM_PROGRAM === 'WarpTerminal' ||
      process.env.WARP_SESSION ||
      process.env.WARP_TERMINAL
    );
  }

  /**
   * Check if running in interactive terminal
   */
  private isInteractiveTerminal(): boolean {
    return !!(
      process.stdin.isTTY &&
      process.stdout.isTTY &&
      !this.isClaudeCode() &&
      !this.isContinue()
    );
  }

  /**
   * Get human-readable description of capabilities
   */
  describeCapabilities(env: Environment): string[] {
    const caps: string[] = [];
    const c = env.capabilities;

    if (c.tty) caps.push('Interactive terminal');
    if (c.fileEdit) caps.push('File editing');
    if (c.prompts) caps.push('Interactive prompts');
    if (c.gitIntegration) caps.push('Git integration');
    if (c.customCommands) caps.push('Custom commands');
    if (c.aiAssistance) caps.push('AI assistance');
    if (c.workflows) caps.push('Workflow support');
    if (c.markdown) caps.push('Rich markdown UI');

    return caps;
  }

  /**
   * Get recommended interaction mode for environment
   */
  getInteractionMode(env: Environment): 'interactive' | 'file-based' | 'markdown' | 'auto' {
    switch (env.type) {
      case 'claude-code':
        return 'markdown';
      case 'continue':
        return 'file-based';
      case 'non-interactive':
        return 'file-based';
      case 'warp':
      case 'aider':
      case 'cursor':
      case 'terminal':
        return 'interactive';
      default:
        return 'auto';
    }
  }
}

// Singleton instance for consistent detection
let detector: EnvironmentDetector | null = null;

/**
 * Get or create the singleton EnvironmentDetector instance
 */
export function getEnvironmentDetector(): EnvironmentDetector {
  if (!detector) {
    detector = new EnvironmentDetector();
  }
  return detector;
}

/**
 * Get the current environment
 */
export function getCurrentEnvironment(): Environment {
  return getEnvironmentDetector().detect();
}
