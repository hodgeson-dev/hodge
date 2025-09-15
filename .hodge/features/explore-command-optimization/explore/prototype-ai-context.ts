/**
 * Prototype: AI-Enhanced Context Generation for Explore Command
 *
 * Demonstrates intelligent feature analysis and context generation
 * for improved AI tool integration.
 */

interface FeatureIntent {
  type: string;
  keywords: string[];
  suggestedPatterns: string[];
  relatedCommands: string[];
}

interface AIContext {
  mode: string;
  feature: string;
  intent: FeatureIntent;
  suggestedApproaches: Approach[];
  relatedCode: CodeExample[];
  constraints: Constraint[];
  projectContext: ProjectContext;
}

interface Approach {
  name: string;
  description: string;
  relevance: number; // 0-100
  pros: string[];
  cons: string[];
  examples?: CodeExample[];
}

interface CodeExample {
  file: string;
  lines: string;
  description: string;
  pattern: string;
}

interface Constraint {
  type: 'technical' | 'business' | 'security' | 'performance';
  description: string;
  severity: 'critical' | 'important' | 'nice-to-have';
}

interface ProjectContext {
  language: string;
  framework: string;
  testingFramework: string;
  patterns: string[];
  recentDecisions: string[];
}

export class AIContextGenerator {
  /**
   * Analyze feature name to understand intent
   */
  analyzeFeatureIntent(feature: string): FeatureIntent {
    const intents: Record<string, FeatureIntent> = {
      auth: {
        type: 'authentication',
        keywords: ['login', 'logout', 'session', 'token', 'oauth'],
        suggestedPatterns: ['middleware', 'jwt', 'session-manager'],
        relatedCommands: ['login', 'logout', 'verify', 'refresh']
      },
      api: {
        type: 'api-endpoint',
        keywords: ['REST', 'GraphQL', 'endpoint', 'route', 'controller'],
        suggestedPatterns: ['controller', 'router', 'validation'],
        relatedCommands: ['get', 'post', 'put', 'delete', 'patch']
      },
      ui: {
        type: 'user-interface',
        keywords: ['component', 'view', 'template', 'style', 'responsive'],
        suggestedPatterns: ['component', 'state-management', 'styling'],
        relatedCommands: ['render', 'mount', 'update', 'destroy']
      },
      perf: {
        type: 'performance',
        keywords: ['optimization', 'cache', 'speed', 'memory', 'profiling'],
        suggestedPatterns: ['caching', 'lazy-loading', 'memoization'],
        relatedCommands: ['profile', 'benchmark', 'optimize', 'cache']
      },
      test: {
        type: 'testing',
        keywords: ['unit', 'integration', 'e2e', 'mock', 'coverage'],
        suggestedPatterns: ['test-factory', 'mock-builder', 'fixture'],
        relatedCommands: ['test', 'mock', 'assert', 'coverage']
      },
      db: {
        type: 'database',
        keywords: ['query', 'migration', 'schema', 'model', 'transaction'],
        suggestedPatterns: ['repository', 'orm', 'migration'],
        relatedCommands: ['migrate', 'seed', 'query', 'transaction']
      }
    };

    // Find matching intent
    const featureLower = feature.toLowerCase();
    for (const [key, intent] of Object.entries(intents)) {
      if (featureLower.includes(key)) {
        return intent;
      }
    }

    // Check for command patterns (e.g., "add-user", "delete-post")
    const commandPattern = /^(add|create|update|delete|get|list|fetch|sync|import|export)-(.+)$/;
    const match = featureLower.match(commandPattern);
    if (match) {
      const [, action, entity] = match;
      return {
        type: 'crud-operation',
        keywords: [action, entity, 'crud', 'data'],
        suggestedPatterns: ['repository', 'service', 'controller'],
        relatedCommands: ['create', 'read', 'update', 'delete']
      };
    }

    // Default intent
    return {
      type: 'general',
      keywords: [feature],
      suggestedPatterns: ['service', 'utility', 'helper'],
      relatedCommands: ['execute', 'process', 'handle']
    };
  }

  /**
   * Generate intelligent approaches based on intent
   */
  generateApproaches(feature: string, intent: FeatureIntent): Approach[] {
    const approaches: Approach[] = [];

    // Always include a standard approach
    approaches.push({
      name: 'Standard Implementation',
      description: `Implement ${feature} following existing patterns`,
      relevance: 70,
      pros: [
        'Consistent with codebase',
        'Well-understood patterns',
        'Easy to maintain'
      ],
      cons: [
        'May not be optimal for specific use case',
        'Could miss optimization opportunities'
      ]
    });

    // Add intent-specific approaches
    switch (intent.type) {
      case 'performance':
        approaches.push({
          name: 'Cache-First Architecture',
          description: 'Implement with aggressive caching at all layers',
          relevance: 95,
          pros: [
            'Maximum performance gains',
            'Reduced resource usage',
            'Better scalability'
          ],
          cons: [
            'Cache invalidation complexity',
            'Memory overhead',
            'Potential stale data issues'
          ]
        });
        approaches.push({
          name: 'Lazy Loading Strategy',
          description: 'Load resources only when needed',
          relevance: 85,
          pros: [
            'Reduced initial load time',
            'Lower memory footprint',
            'Better perceived performance'
          ],
          cons: [
            'Complex state management',
            'Potential loading delays',
            'Harder to test'
          ]
        });
        break;

      case 'authentication':
        approaches.push({
          name: 'JWT Token-Based',
          description: 'Stateless authentication using JSON Web Tokens',
          relevance: 90,
          pros: [
            'Stateless and scalable',
            'Works across services',
            'Standard implementation'
          ],
          cons: [
            'Token size overhead',
            'Cannot revoke easily',
            'Requires secure storage'
          ]
        });
        approaches.push({
          name: 'Session-Based',
          description: 'Traditional server-side session management',
          relevance: 75,
          pros: [
            'Easy to revoke',
            'Smaller client payload',
            'Server has full control'
          ],
          cons: [
            'Requires session store',
            'Harder to scale',
            'Stateful'
          ]
        });
        break;

      case 'api-endpoint':
        approaches.push({
          name: 'RESTful Design',
          description: 'Standard REST API with resource-based URLs',
          relevance: 85,
          pros: [
            'Well understood',
            'Standard HTTP methods',
            'Easy to cache'
          ],
          cons: [
            'Multiple requests for related data',
            'Over/under fetching',
            'Versioning challenges'
          ]
        });
        approaches.push({
          name: 'GraphQL Schema',
          description: 'Flexible query language for precise data fetching',
          relevance: 75,
          pros: [
            'Precise data fetching',
            'Single endpoint',
            'Strong typing'
          ],
          cons: [
            'Learning curve',
            'Complex caching',
            'N+1 query problems'
          ]
        });
        break;
    }

    return approaches.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Find similar features in the codebase
   */
  async findSimilarFeatures(feature: string): Promise<string[]> {
    // This would search .hodge/features/ for similar names
    // For prototype, return mock data
    const allFeatures = [
      'user-authentication',
      'api-gateway',
      'cache-manager',
      'performance-monitor',
      'test-runner'
    ];

    return allFeatures
      .filter(f => this.calculateSimilarity(feature, f) > 0.5)
      .slice(0, 3);
  }

  /**
   * Calculate similarity between two feature names
   */
  private calculateSimilarity(a: string, b: string): number {
    const aTokens = a.toLowerCase().split(/[-_\s]+/);
    const bTokens = b.toLowerCase().split(/[-_\s]+/);

    const commonTokens = aTokens.filter(t => bTokens.includes(t));
    const similarity = (commonTokens.length * 2) / (aTokens.length + bTokens.length);

    return similarity;
  }

  /**
   * Generate complete AI context
   */
  async generateAIContext(feature: string): Promise<AIContext> {
    const intent = this.analyzeFeatureIntent(feature);
    const approaches = this.generateApproaches(feature, intent);
    const similarFeatures = await this.findSimilarFeatures(feature);

    return {
      mode: 'explore',
      feature,
      intent,
      suggestedApproaches: approaches,
      relatedCode: await this.findCodeExamples(intent, similarFeatures),
      constraints: this.detectConstraints(intent),
      projectContext: await this.loadProjectContext()
    };
  }

  /**
   * Find relevant code examples
   */
  private async findCodeExamples(
    intent: FeatureIntent,
    similarFeatures: string[]
  ): Promise<CodeExample[]> {
    // Mock implementation
    return [
      {
        file: 'src/lib/cache-manager.ts',
        lines: '45-128',
        description: 'Example of caching implementation',
        pattern: 'singleton-cache'
      }
    ];
  }

  /**
   * Detect project constraints
   */
  private detectConstraints(intent: FeatureIntent): Constraint[] {
    const constraints: Constraint[] = [];

    // Add intent-specific constraints
    if (intent.type === 'authentication') {
      constraints.push({
        type: 'security',
        description: 'Must implement secure token storage',
        severity: 'critical'
      });
    }

    if (intent.type === 'performance') {
      constraints.push({
        type: 'performance',
        description: 'Must achieve <100ms response time',
        severity: 'important'
      });
    }

    // Add general constraints
    constraints.push({
      type: 'technical',
      description: 'Must maintain backward compatibility',
      severity: 'critical'
    });

    return constraints;
  }

  /**
   * Load project context
   */
  private async loadProjectContext(): Promise<ProjectContext> {
    // This would load from package.json, tsconfig, etc.
    return {
      language: 'TypeScript',
      framework: 'Node.js',
      testingFramework: 'Vitest',
      patterns: ['singleton', 'factory', 'repository'],
      recentDecisions: ['use-cache-layer', 'parallel-operations']
    };
  }
}

/**
 * Smart template generator
 */
export class SmartTemplateGenerator {
  /**
   * Generate an intelligent exploration template
   */
  generateTemplate(feature: string, context: AIContext): string {
    const { intent, suggestedApproaches, constraints, projectContext } = context;

    return `# Exploration: ${feature}

## Feature Analysis
**Type**: ${intent.type}
**Keywords**: ${intent.keywords.join(', ')}
**Suggested Patterns**: ${intent.suggestedPatterns.join(', ')}

## Project Context
- **Language**: ${projectContext.language}
- **Framework**: ${projectContext.framework}
- **Testing**: ${projectContext.testingFramework}
- **Recent Decisions**: ${projectContext.recentDecisions.join(', ')}

## Constraints
${constraints.map(c => `- **${c.type}**: ${c.description} (${c.severity})`).join('\n')}

## Recommended Approaches

${suggestedApproaches.map((approach, i) => `
### Approach ${i + 1}: ${approach.name} (${approach.relevance}% relevant)
**Description**: ${approach.description}

**Pros**:
${approach.pros.map(p => `- ${p}`).join('\n')}

**Cons**:
${approach.cons.map(c => `- ${c}`).join('\n')}
`).join('\n')}

## Similar Features in Codebase
${context.relatedCode.map(ex => `- ${ex.file}:${ex.lines} - ${ex.description}`).join('\n')}

## Next Steps
1. Review the suggested approaches
2. Consider the constraints and project context
3. Make a decision with \`/decide\`
4. Proceed to \`/build ${feature}\`

---
*Generated with AI-enhanced context analysis*
`;
  }
}