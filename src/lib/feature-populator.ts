import { promises as fs } from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { PMManager } from './pm-manager.js';

/**
 * Populates feature directories with context from decisions
 * Used by explore command with --pre-populate flag
 */
export class FeaturePopulator {
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

    // Add to PM tracking
    await this.pmManager.addFeature(featureName, {
      status: 'Exploring',
      description: metadata?.description || `Feature extracted from ${decisions.length} decisions`,
      decisions,
      dependencies: metadata?.dependencies,
      priority: metadata?.dependencies?.length ? 2 : 3, // Higher priority if has dependencies
    });

    console.log(
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

    // Generate rich content if metadata provided, otherwise use generic template
    let content: string;

    if (metadata?.description) {
      // Rich exploration from feature extraction
      content = `# ${feature} Exploration

## Feature Overview
**Description**: ${metadata.description}
${metadata.effort ? `**Estimated Effort**: ${metadata.effort}` : ''}

## Origin
This feature was extracted from the following decisions:
${decisions.length > 0 ? decisions.map((d) => `- ${d}`).join('\n') : '- No specific decisions linked'}

${metadata.rationale ? `## Why This Is a Coherent Feature\n${metadata.rationale}\n` : ''}

## Scope
${metadata.scope?.included ? `### Included\n${metadata.scope.included.map((item) => `- ${item}`).join('\n')}` : ''}

${metadata.scope?.excluded ? `### Excluded\n${metadata.scope.excluded.map((item) => `- ${item}`).join('\n')}` : ''}

## Dependencies
${metadata.dependencies ? metadata.dependencies.map((dep) => `- ${dep}`).join('\n') : '- [To be identified during exploration]'}

## Exploration Areas
${
  metadata.explorationAreas
    ? metadata.explorationAreas
        .map((area) => `### ${area.area}\n${area.questions.map((q) => `- ${q}`).join('\n')}`)
        .join('\n\n')
    : `### 1. Technical Requirements
- [To be explored] Core functionality needed
- [To be explored] Integration points with existing system

### 2. Implementation Approach
- [To be explored] Architecture design
- [To be explored] Technology choices`
}

## Next Steps
1. Complete exploration of identified areas
2. Make architectural decisions based on findings
3. Update test intentions with specific scenarios
4. Proceed to build phase with chosen approach
`;
    } else {
      // Generic template (existing behavior)
      content = `# ${feature} Exploration

## Origin
This feature was extracted from the following decisions:
${decisions.length > 0 ? decisions.map((d) => `- ${d}`).join('\n') : '- No specific decisions linked'}

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

    await fs.writeFile(explorationFile, content, 'utf-8');
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
