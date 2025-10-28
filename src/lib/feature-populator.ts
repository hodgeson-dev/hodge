import { promises as fs } from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { PMManager } from './pm-manager.js';

import { createCommandLogger } from './logger.js';
/**
 * Populates feature directories with context from decisions
 * Used by explore command with --pre-populate flag
 */
export class FeaturePopulator {
  private logger = createCommandLogger('feature-populator', { enableConsole: false });

  private pmManager = new PMManager();

  /**
   * Populate a feature from related decisions and optional metadata
   */
  async populateFromDecisions(
    featureName: string,
    decisions: string[] = [],
    metadata?: {
      description?: string;
      scope?: { included?: string[]; excluded?: string[] };
      dependencies?: string[];
      effort?: string;
      rationale?: string;
      explorationAreas?: Array<{
        area: string;
        questions: string[];
      }>;
    }
  ): Promise<void> {
    // Create feature directory structure
    await this.createFeatureStructure(featureName);

    // Link decisions to feature
    await this.linkDecisions(featureName, decisions);

    // Generate initial exploration.md with metadata if provided
    await this.generateExploration(featureName, decisions, metadata);

    // Create test-intentions.md skeleton
    await this.createTestIntentions(featureName);

    // Update context.json
    await this.updateContext(featureName, decisions);

    // Generate feature HODGE.md for context aggregation
    await this.generateFeatureHodgeMD(featureName);

    // Add to PM tracking
    await this.pmManager.addFeature(featureName, {
      status: 'Exploring',
      description: metadata?.description || `Feature extracted from ${decisions.length} decisions`,
      decisions,
      dependencies: metadata?.dependencies,
      priority: metadata?.dependencies?.length ? 2 : 3, // Higher priority if has dependencies
    });

    this.logger.info(
      chalk.green(`✓ Feature ${featureName} pre-populated from ${decisions.length} decisions`)
    );
  }

  /**
   * Create the feature directory structure
   */
  private async createFeatureStructure(feature: string): Promise<void> {
    const featureDir = path.join('.hodge', 'features', feature);
    const exploreDir = path.join(featureDir, 'explore');

    await fs.mkdir(exploreDir, { recursive: true });
  }

  /**
   * Link decisions to the feature
   */
  private async linkDecisions(feature: string, decisions: string[]): Promise<void> {
    if (decisions.length === 0) return;

    const featureDir = path.join('.hodge', 'features', feature);
    const decisionsFile = path.join(featureDir, 'linked-decisions.md');

    const content = `# Linked Decisions for ${feature}

## Origin
This feature was extracted from the following decisions:

${decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## Context
These decisions were made during the exploration and design phase and form the foundation for this feature's implementation.
`;

    await fs.writeFile(decisionsFile, content, 'utf-8');
  }

  /**
   * Generate initial exploration.md
   */
  private async generateExploration(
    feature: string,
    decisions: string[],
    metadata?: {
      description?: string;
      scope?: { included?: string[]; excluded?: string[] };
      dependencies?: string[];
      effort?: string;
      rationale?: string;
      explorationAreas?: Array<{
        area: string;
        questions: string[];
      }>;
    }
  ): Promise<void> {
    const exploreDir = path.join('.hodge', 'features', feature, 'explore');
    const explorationFile = path.join(exploreDir, 'exploration.md');

    const content = metadata?.description
      ? this.generateRichExploration(feature, decisions, metadata)
      : this.generateGenericExploration(feature, decisions);

    await fs.writeFile(explorationFile, content, 'utf-8');
  }

  private generateRichExploration(
    feature: string,
    decisions: string[],
    metadata: NonNullable<Parameters<typeof this.generateExploration>[2]>
  ): string {
    const overview = this.buildFeatureOverview(metadata);
    const origin = this.buildOriginSection(decisions);
    const rationale = metadata.rationale
      ? `## Why This Is a Coherent Feature\n${metadata.rationale}\n`
      : '';
    const scope = this.buildScopeSection(metadata.scope);
    const dependencies = this.buildDependenciesSection(metadata.dependencies);
    const explorationAreas = this.buildExplorationAreas(metadata.explorationAreas);

    return `# ${feature} Exploration

${overview}

${origin}

${rationale}

${scope}

${dependencies}

${explorationAreas}

## Next Steps
1. Complete exploration of identified areas
2. Make architectural decisions based on findings
3. Update test intentions with specific scenarios
4. Proceed to build phase with chosen approach
`;
  }

  private buildFeatureOverview(metadata: { description?: string; effort?: string }): string {
    const effort = metadata.effort ? `\n**Estimated Effort**: ${metadata.effort}` : '';
    return `## Feature Overview\n**Description**: ${metadata.description}${effort}`;
  }

  private buildOriginSection(decisions: string[]): string {
    const decisionList =
      decisions.length > 0
        ? decisions.map((d) => `- ${d}`).join('\n')
        : '- No specific decisions linked';
    return `## Origin\nThis feature was extracted from the following decisions:\n${decisionList}`;
  }

  private buildScopeSection(scope?: { included?: string[]; excluded?: string[] }): string {
    const includedList = scope?.included?.map((item) => `- ${item}`).join('\n') ?? '';
    const included = scope?.included ? `### Included\n${includedList}\n` : '';
    const excludedList = scope?.excluded?.map((item) => `- ${item}`).join('\n') ?? '';
    const excluded = scope?.excluded ? `\n### Excluded\n${excludedList}` : '';
    return `## Scope\n${included}${excluded}`;
  }

  private buildDependenciesSection(dependencies?: string[]): string {
    const depList = dependencies
      ? dependencies.map((dep) => `- ${dep}`).join('\n')
      : '- [To be identified during exploration]';
    return `## Dependencies\n${depList}`;
  }

  private buildExplorationAreas(
    explorationAreas?: Array<{ area: string; questions: string[] }>
  ): string {
    if (explorationAreas) {
      const areas = explorationAreas
        .map((area) => ['### ' + area.area, ...area.questions.map((q) => `- ${q}`)].join('\n'))
        .join('\n\n');
      return `## Exploration Areas\n${areas}`;
    }

    return `## Exploration Areas
### 1. Technical Requirements
- [To be explored] Core functionality needed
- [To be explored] Integration points with existing system

### 2. Implementation Approach
- [To be explored] Architecture design
- [To be explored] Technology choices`;
  }

  private generateGenericExploration(feature: string, decisions: string[]): string {
    const origin = this.buildOriginSection(decisions);

    return `# ${feature} Exploration

${origin}

## Context
This feature was identified through AI-driven analysis of project decisions and represents a cohesive unit of work.

## Exploration Areas

### 1. Technical Requirements
- [To be explored] Core functionality needed
- [To be explored] Integration points with existing system
- [To be explored] Performance considerations

### 2. Implementation Approach
- [To be explored] Architecture design
- [To be explored] Technology choices
- [To be explored] Code organization

### 3. Testing Strategy
- [To be explored] Unit test approach
- [To be explored] Integration test needs
- [To be explored] Acceptance criteria

## Dependencies
- [To be identified during exploration]

## Risks and Challenges
- [To be identified during exploration]

## Success Criteria
- [To be defined based on exploration]

## Next Steps
1. Complete exploration of technical requirements
2. Make architectural decisions
3. Define test intentions
4. Proceed to build phase
`;
  }

  /**
   * Create test-intentions.md skeleton
   */
  private async createTestIntentions(feature: string): Promise<void> {
    const exploreDir = path.join('.hodge', 'features', feature, 'explore');
    const testIntentionsFile = path.join(exploreDir, 'test-intentions.md');

    const content = `# Test Intentions: ${feature}

## Test Strategy
Progressive testing model: Smoke → Integration → Acceptance

## Smoke Tests (Build Phase)
- [ ] Feature doesn't crash when initialized
- [ ] Basic happy path works
- [ ] [Add specific smoke tests based on exploration]

## Integration Tests (Harden Phase)
- [ ] Feature integrates with existing system
- [ ] Error handling works correctly
- [ ] [Add specific integration tests based on implementation]

## Acceptance Tests (Ship Phase)
- [ ] Feature meets all requirements
- [ ] Performance is acceptable
- [ ] [Add specific acceptance tests based on requirements]

## Edge Cases to Test
- [To be identified during exploration]

## Performance Benchmarks
- [To be defined based on requirements]
`;

    await fs.writeFile(testIntentionsFile, content, 'utf-8');
  }

  /**
   * Generate feature-level HODGE.md for context aggregation
   * This creates a lightweight aggregation of all feature files
   */
  async generateFeatureHodgeMD(feature: string): Promise<void> {
    const featureDir = path.join('.hodge', 'features', feature);
    const hodgeMDPath = path.join(featureDir, 'HODGE.md');

    // Aggregate content from various sources
    const exploration = await this.readFileIfExists(
      path.join(featureDir, 'explore', 'exploration.md')
    );
    const testIntentions = await this.readFileIfExists(
      path.join(featureDir, 'explore', 'test-intentions.md')
    );
    const linkedDecisions = await this.readFileIfExists(
      path.join(featureDir, 'linked-decisions.md')
    );
    const buildPlan = await this.readFileIfExists(path.join(featureDir, 'build', 'build-plan.md'));
    const hardenReport = await this.readFileIfExists(
      path.join(featureDir, 'harden', 'harden-report.md')
    );
    const shipSummary = await this.readFileIfExists(
      path.join(featureDir, 'ship', 'ship-summary.md')
    );

    // Detect current phase
    const phase = await this.detectPhase(feature);

    // Build aggregated content
    const content = `# Feature: ${feature}

## Status
**Phase**: ${phase}
**Last Updated**: ${new Date().toISOString()}

## Exploration
${exploration ? this.extractSection(exploration, '## Feature Overview', 500) : '_Not started_'}

## Test Intentions
${testIntentions ? this.extractSection(testIntentions, '## Smoke Tests', 300) : '_Not defined_'}

## Build Plan
${buildPlan ? this.extractSection(buildPlan, '## Implementation', 400) : '_Not started_'}

## Linked Decisions
${linkedDecisions ? this.extractSection(linkedDecisions, '## Origin', 300) : '_None linked_'}

${hardenReport ? `## Harden Results\n${this.extractSection(hardenReport, '## Validation Results', 200)}\n` : ''}
${shipSummary ? `## Ship Summary\n${this.extractSection(shipSummary, '## Summary', 200)}\n` : ''}

## Phase Progress
- ${phase === 'explore' ? '🔄' : '✅'} Exploration
- ${this.getBuildStatus(phase)} Build
- ${this.getHardenStatus(phase)} Harden
- ${this.getShipStatus(phase)} Ship

---
_Generated by Hodge Feature Auto-Population_
`;

    await fs.writeFile(hodgeMDPath, content, 'utf-8');
  }

  /**
   * Helper to read file if it exists
   */
  private async readFileIfExists(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Get build phase status emoji
   */
  private getBuildStatus(phase: string): string {
    if (phase === 'build') {
      return '🔄';
    } else if (phase === 'explore') {
      return '⏸️';
    } else {
      return '✅';
    }
  }

  /**
   * Get harden phase status emoji
   */
  private getHardenStatus(phase: string): string {
    if (phase === 'harden') {
      return '🔄';
    } else if (['explore', 'build'].includes(phase)) {
      return '⏸️';
    } else {
      return '✅';
    }
  }

  /**
   * Get ship phase status emoji
   */
  private getShipStatus(phase: string): string {
    if (phase === 'ship') {
      return '🔄';
    } else if (phase !== 'shipped') {
      return '⏸️';
    } else {
      return '✅';
    }
  }

  /**
   * Extract a section from markdown content
   */
  private extractSection(content: string, startMarker: string, maxLength: number): string {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
      // If marker not found, return first part of content
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    const section = content.substring(startIndex);
    const nextHeaderIndex = section.indexOf('\n##', 10); // Find next section
    const extractedContent = nextHeaderIndex > -1 ? section.substring(0, nextHeaderIndex) : section;

    return (
      extractedContent.substring(0, maxLength) + (extractedContent.length > maxLength ? '...' : '')
    );
  }

  /**
   * Detect current phase of the feature
   */
  private async detectPhase(feature: string): Promise<string> {
    const featurePath = path.join('.hodge', 'features', feature);

    // Check directories in reverse order (ship → harden → build → explore)
    try {
      const shipDir = path.join(featurePath, 'ship');
      const stats = await fs.stat(shipDir);
      if (stats.isDirectory()) {
        const files = await fs.readdir(shipDir);
        if (files.includes('ship-summary.md')) return 'shipped';
        return 'ship';
      }
    } catch {
      /* directory doesn't exist */
    }

    try {
      const hardenDir = path.join(featurePath, 'harden');
      const stats = await fs.stat(hardenDir);
      if (stats.isDirectory()) return 'harden';
    } catch {
      /* directory doesn't exist */
    }

    try {
      const buildDir = path.join(featurePath, 'build');
      const stats = await fs.stat(buildDir);
      if (stats.isDirectory()) return 'build';
    } catch {
      /* directory doesn't exist */
    }

    return 'explore';
  }

  /**
   * Update or create context.json
   */
  private async updateContext(feature: string, decisions: string[]): Promise<void> {
    const exploreDir = path.join('.hodge', 'features', feature, 'explore');
    const contextFile = path.join(exploreDir, 'context.json');

    const context = {
      feature,
      mode: 'explore',
      createdAt: new Date().toISOString(),
      origin: 'extracted-from-decisions',
      linkedDecisions: decisions,
      status: 'pre-populated',
      nextSteps: [
        'Review and refine exploration areas',
        'Complete technical analysis',
        'Make architectural decisions',
        'Define concrete test intentions',
      ],
    };

    await fs.writeFile(contextFile, JSON.stringify(context, null, 2), 'utf-8');
  }
}
