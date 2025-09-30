import * as fs from 'fs/promises';
import * as path from 'path';
import { sessionManager, type LightSession } from './session-manager.js';

export interface HodgeMDSection {
  title: string;
  content: string;
  priority: number;
}

export interface HodgeMDContext {
  feature: string;
  mode: string;
  decisions: Array<{ date: string; decision: string }>;
  standards: Array<{ category: string; rules: string[] }>;
  principles?: Array<{ title: string; description: string }>;
  recentCommands: string[];
  workingFiles: string[];
  nextSteps: string[];
  pmIssue?: string;
  session?: LightSession;
}

/**
 * Generates HODGE.md files for cross-tool AI compatibility
 * Provides context about current Hodge workflow state to any AI assistant
 */
export class HodgeMDGenerator {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();
  }

  /**
   * Generate HODGE.md content for a specific feature
   * @param feature - The feature name to generate context for
   * @returns Markdown content for HODGE.md file
   * @throws Error if feature name is invalid
   */
  async generate(feature: string): Promise<string> {
    if (!feature || typeof feature !== 'string') {
      throw new Error('Feature name must be a non-empty string');
    }
    const context = await this.gatherContext(feature);
    return this.formatAsMarkdown(context);
  }

  private async gatherContext(feature: string): Promise<HodgeMDContext> {
    const mode = await this.getCurrentMode(feature);
    const decisions = await this.getRecentDecisions(feature);
    const standards = await this.getActiveStandards();
    const principles = await this.getCorePrinciples();
    const recentCommands = await this.getCommandHistory();
    const workingFiles = await this.getWorkingFiles(feature);
    const nextSteps = this.getNextSteps(feature, mode);
    const session = await sessionManager.load();
    const pmIssue = await this.getPMIssue(feature);

    return {
      feature,
      mode,
      decisions,
      standards,
      principles,
      recentCommands,
      workingFiles,
      nextSteps,
      pmIssue,
      session: session || undefined,
    };
  }

  private async getCurrentMode(feature: string): Promise<string> {
    // Check feature directory for current mode
    const featurePath = path.join(this.basePath, '.hodge', 'features', feature);

    try {
      // Check for mode indicators in order
      if (await this.fileExists(path.join(featurePath, 'ship'))) {
        return 'ship';
      }
      if (await this.fileExists(path.join(featurePath, 'harden'))) {
        return 'harden';
      }
      if (await this.fileExists(path.join(featurePath, 'build'))) {
        return 'build';
      }
      if (await this.fileExists(path.join(featurePath, 'explore'))) {
        return 'explore';
      }
    } catch {
      // Feature doesn't exist yet
    }

    return 'explore'; // Default mode
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getRecentDecisions(
    feature: string
  ): Promise<Array<{ date: string; decision: string }>> {
    const decisionsPath = path.join(this.basePath, '.hodge', 'decisions.md');
    const decisions: Array<{ date: string; decision: string }> = [];

    try {
      const content = await fs.readFile(decisionsPath, 'utf-8');
      const lines = content.split('\n');

      // Parse decisions from markdown
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for date headers like "### 2025-01-16 - Decision text"
        const match = line.match(/^###\s+(\d{4}-\d{2}-\d{2})\s+-\s+(.+)/);
        if (match) {
          decisions.push({
            date: match[1],
            decision: match[2],
          });
        }
      }

      // Filter for feature-specific decisions if available
      const featureDecisions = decisions.filter((d: { date: string; decision: string }) =>
        d.decision.toLowerCase().includes(feature.toLowerCase())
      );

      // Return feature decisions if found, otherwise return recent 20 (HODGE-297 decision)
      const result = featureDecisions.length > 0 ? featureDecisions : decisions.slice(0, 20);
      return result;
    } catch {
      return [];
    }
  }

  private async getActiveStandards(): Promise<Array<{ category: string; rules: string[] }>> {
    const standardsPath = path.join(this.basePath, '.hodge', 'standards.md');

    try {
      const content = await fs.readFile(standardsPath, 'utf-8');
      return this.parseStandards(content);
    } catch {
      // Return default standards if file doesn't exist
      return [
        {
          category: 'Code Quality',
          rules: [
            'Use TypeScript for type safety',
            'Follow ESLint rules',
            'Write tests for critical paths',
          ],
        },
      ];
    }
  }

  private parseStandards(content: string): Array<{ category: string; rules: string[] }> {
    const standards: Array<{ category: string; rules: string[] }> = [];
    const sections = content.split(/^##\s+/m);

    for (const section of sections) {
      const lines = section.trim().split('\n');
      if (lines.length === 0) continue;

      const category = lines[0].trim();
      const rules = lines
        .slice(1)
        .filter((line) => line.trim().startsWith('- '))
        .map((line) => line.replace(/^-\s*/, '').trim());

      if (rules.length > 0) {
        standards.push({ category, rules });
      }
    }

    return standards;
  }

  private async getCommandHistory(): Promise<string[]> {
    const historyPath = path.join(this.basePath, '.hodge', 'command-history.json');

    try {
      const content = await fs.readFile(historyPath, 'utf-8');
      const history = JSON.parse(content) as { commands?: string[] };
      return history.commands?.slice(-5) ?? [];
    } catch {
      return [];
    }
  }

  private async getWorkingFiles(feature: string): Promise<string[]> {
    const featurePath = path.join(this.basePath, '.hodge', 'features', feature);
    const files: string[] = [];

    try {
      // Check for files in explore directory
      const explorePath = path.join(featurePath, 'explore');
      const exploreFiles = await this.listFiles(explorePath);
      files.push(...exploreFiles.map((f) => path.join('explore', f)));

      // Check for files in build directory
      const buildPath = path.join(featurePath, 'build');
      const buildFiles = await this.listFiles(buildPath);
      files.push(...buildFiles.map((f) => path.join('build', f)));

      // Check for files in ship directory
      const shipPath = path.join(featurePath, 'ship');
      const shipFiles = await this.listFiles(shipPath);
      files.push(...shipFiles.map((f) => path.join('ship', f)));
    } catch {
      // Directory might not exist yet
    }

    return files;
  }

  private async listFiles(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath);
      return entries.filter((entry) => !entry.startsWith('.'));
    } catch {
      return [];
    }
  }

  private getNextSteps(feature: string, mode: string): string[] {
    const steps: string[] = [];

    switch (mode) {
      case 'explore':
        steps.push(
          'Review exploration approaches',
          'Make decision with `hodge decide`',
          'Start building with `hodge build ' + feature + '`'
        );
        break;
      case 'build':
        steps.push(
          'Complete implementation',
          'Run tests with `npm test`',
          'Harden with `hodge harden ' + feature + '`'
        );
        break;
      case 'harden':
        steps.push(
          'Fix all linting issues',
          'Ensure 100% test coverage',
          'Ship with `hodge ship ' + feature + '`'
        );
        break;
      case 'ship':
        steps.push('Commit changes', 'Create pull request', 'Update documentation');
        break;
      default:
        steps.push('Start exploring with `hodge explore ' + feature + '`');
    }

    return steps;
  }

  private async getPMIssue(feature: string): Promise<string | undefined> {
    const issueIdPath = path.join(this.basePath, '.hodge', 'features', feature, 'issue-id.txt');

    try {
      const issueId = await fs.readFile(issueIdPath, 'utf-8');
      return issueId.trim();
    } catch {
      return undefined;
    }
  }

  private async getCorePrinciples(): Promise<
    Array<{ title: string; description: string }> | undefined
  > {
    const principlesPath = path.join(this.basePath, '.hodge', 'principles.md');

    try {
      const content = await fs.readFile(principlesPath, 'utf-8');
      const principles: Array<{ title: string; description: string }> = [];

      // Parse the Core Principles section
      const corePrinciplesMatch = content.match(/## Core Principles\n\n([\s\S]*?)(?=\n##|$)/);
      if (!corePrinciplesMatch) return undefined;

      const principlesText = corePrinciplesMatch[1];
      const principleBlocks = principlesText.split(/\n### /).filter(Boolean);

      for (const block of principleBlocks) {
        const lines = block.split('\n');
        const title = lines[0].replace('### ', '');
        const description = lines.slice(1).join('\n').trim().split('\n')[0]; // Get first line of description

        if (title && description) {
          principles.push({ title, description });
        }
      }

      return principles.length > 0 ? principles : undefined;
    } catch {
      return undefined;
    }
  }

  private formatAsMarkdown(context: HodgeMDContext): string {
    const sections: HodgeMDSection[] = [
      this.createStatusSection(context),
      this.createSessionSection(context),
      this.createPrinciplesSection(context),
      this.createDecisionsSection(context),
      this.createStandardsSection(context),
      this.createFilesSection(context),
      this.createCommandsSection(context),
      this.createNextStepsSection(context),
    ];

    // Sort by priority and filter out empty sections
    const sortedSections = sections
      .filter((s) => s.content.trim())
      .sort((a, b) => a.priority - b.priority);

    // Build the final markdown
    const markdown = [
      '# HODGE.md',
      '',
      'This file provides AI assistants with context about the current Hodge workflow state.',
      '',
      ...sortedSections.map((s) => s.content),
      '',
      '---',
      '_Generated by Hodge for cross-tool AI compatibility_',
    ].join('\n');

    return markdown;
  }

  private createStatusSection(context: HodgeMDContext): HodgeMDSection {
    const content = [
      '## Current Status',
      '',
      `**Feature**: ${context.feature}`,
      `**Mode**: ${context.mode}`,
      context.pmIssue ? `**PM Issue**: ${context.pmIssue}` : '',
      `**Last Updated**: ${new Date().toISOString()}`,
      '',
    ]
      .filter((line) => line !== '')
      .join('\n');

    return { title: 'Status', content, priority: 1 };
  }

  private createSessionSection(context: HodgeMDContext): HodgeMDSection {
    if (!context.session) {
      return { title: 'Session', content: '', priority: 2 };
    }

    const session = context.session;
    const age = Date.now() - session.ts;
    const ageMinutes = Math.floor(age / 60000);
    const ageHours = Math.floor(ageMinutes / 60);

    let ageStr = `${ageMinutes} minutes ago`;
    if (ageHours > 0) {
      ageStr = `${ageHours} hours ago`;
    }

    const content = [
      '## Current Session',
      '',
      `**Resumed**: ${ageStr}`,
      session.summary ? `**Progress**: ${session.summary}` : '',
      `**Working on**: ${session.feature} (${session.mode} mode)`,
      '',
      '## AI Context Restoration',
      `You were helping with ${session.feature}. ${session.summary || 'Continue from where we left off.'}`,
      session.nextAction ? `Suggested next: ${session.nextAction}` : '',
      '',
    ]
      .filter((line) => line !== '')
      .join('\n');

    return { title: 'Session', content, priority: 2 };
  }

  private createDecisionsSection(context: HodgeMDContext): HodgeMDSection {
    if (context.decisions.length === 0) {
      return { title: 'Decisions', content: '', priority: 3 };
    }

    const content = [
      '## Recent Decisions',
      '',
      ...context.decisions.map((d) => `- **${d.date}**: ${d.decision}`),
      '',
    ].join('\n');

    return { title: 'Decisions', content, priority: 2 };
  }

  private createStandardsSection(context: HodgeMDContext): HodgeMDSection {
    if (context.standards.length === 0) {
      return { title: 'Standards', content: '', priority: 3 };
    }

    const content = [
      '## Active Standards',
      '',
      ...context.standards.flatMap((s) => [
        `### ${s.category}`,
        ...s.rules.map((r) => `- ${r}`),
        '',
      ]),
    ].join('\n');

    return { title: 'Standards', content, priority: 3 };
  }

  private createFilesSection(context: HodgeMDContext): HodgeMDSection {
    if (context.workingFiles.length === 0) {
      return { title: 'Files', content: '', priority: 4 };
    }

    const content = [
      '## Working Files',
      '',
      ...context.workingFiles.map((f) => `- \`.hodge/features/${context.feature}/${f}\``),
      '',
    ].join('\n');

    return { title: 'Files', content, priority: 4 };
  }

  private createCommandsSection(context: HodgeMDContext): HodgeMDSection {
    if (context.recentCommands.length === 0) {
      return { title: 'Commands', content: '', priority: 5 };
    }

    const content = [
      '## Recent Commands',
      '',
      '```bash',
      ...context.recentCommands,
      '```',
      '',
    ].join('\n');

    return { title: 'Commands', content, priority: 5 };
  }

  private createNextStepsSection(context: HodgeMDContext): HodgeMDSection {
    const content = [
      '## Next Steps',
      '',
      ...context.nextSteps.map((s, i) => `${i + 1}. ${s}`),
      '',
    ].join('\n');

    return { title: 'Next Steps', content, priority: 6 };
  }

  private createPrinciplesSection(context: HodgeMDContext): HodgeMDSection {
    if (!context.principles || context.principles.length === 0) {
      return { title: 'Principles', content: '', priority: 2 };
    }

    const content = [
      '## Core Principles',
      '',
      ...context.principles.map((p) => `- **${p.title}**: ${p.description}`),
      '',
    ].join('\n');

    return { title: 'Principles', content, priority: 2 };
  }

  /**
   * Save generated HODGE.md to file system
   * @param feature - The feature to generate context for
   * @param outputPath - Optional custom output path (defaults to {basePath}/.hodge/HODGE.md)
   */
  async saveToFile(feature: string, outputPath?: string): Promise<void> {
    const markdown = await this.generate(feature);
    const filePath = outputPath ?? path.join(this.basePath, '.hodge', 'HODGE.md');

    await fs.writeFile(filePath, markdown, 'utf-8');
  }

  /**
   * Detect which AI tool is being used based on file markers
   * @returns Tool name: 'claude', 'cursor', 'copilot', or 'generic'
   */
  async detectAITool(): Promise<string> {
    // Check for various AI tool indicators
    try {
      await fs.access('.claude');
      return 'claude';
    } catch {
      // Not Claude
    }

    try {
      await fs.access('.cursorrules');
      return 'cursor';
    } catch {
      // Not Cursor
    }

    try {
      await fs.access('.github/copilot');
      return 'copilot';
    } catch {
      // Not Copilot
    }

    return 'generic';
  }

  /**
   * Add tool-specific optimizations based on detected AI tool
   * @param hodgeMDPath - Path to the HODGE.md file
   */
  async addToolSpecificEnhancements(hodgeMDPath: string): Promise<void> {
    const tool = await this.detectAITool();

    switch (tool) {
      case 'claude':
        // Create symlink for Claude compatibility
        try {
          const claudePath = path.join('.claude', 'CLAUDE.md');
          await fs.mkdir('.claude', { recursive: true });
          await fs.symlink(path.resolve(hodgeMDPath), claudePath);
        } catch {
          // Symlink might already exist or not be supported
        }
        break;

      case 'cursor':
        // Add cursor-specific rules
        try {
          await fs.readFile(hodgeMDPath, 'utf-8');
          const cursorRules = this.extractCursorRules();
          await fs.writeFile('.cursorrules', cursorRules, 'utf-8');
        } catch {
          // Cursor rules generation failed
        }
        break;

      default:
        // No specific enhancements for generic tools
        break;
    }
  }

  private extractCursorRules(): string {
    // Extract key rules for Cursor from HODGE.md
    const rules = [
      'You are working with Hodge, an AI development framework.',
      'Current mode and context are defined in .hodge/HODGE.md',
      'Follow the standards and patterns documented there.',
      'Use the suggested next steps as guidance.',
    ];

    return rules.join('\n');
  }
}
