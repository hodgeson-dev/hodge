/**
 * Explore Service
 * Handles business logic for exploration command
 * Extracted from ExploreCommand to reduce complexity and file length
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { cacheManager } from './cache-manager.js';
import { ContextManager } from './context-manager.js';
import type { FeatureID } from './id-manager.js';

// Type definitions
type IntentType =
  | 'authentication'
  | 'database'
  | 'api'
  | 'ui'
  | 'general'
  | 'api-endpoint'
  | 'caching'
  | 'performance'
  | 'testing';

interface FeatureIntent {
  type: IntentType;
  keywords: string[];
  suggestedPatterns: string[];
  relatedCommands: string[];
}

interface SmartTemplate {
  content: string;
  approaches: Approach[];
  relatedFeatures: string[];
  suggestedPatterns: string[];
}

interface Approach {
  name: string;
  description: string;
  relevance: number;
  pros: string[];
  cons: string[];
}

interface PMIssue {
  id: string;
  title: string;
  url: string;
}

interface ProjectContext {
  projectType: 'library' | 'cli' | 'api' | 'webapp' | 'unknown';
  technologies: string[];
  patterns: string[];
}

interface PackageJson {
  bin?: unknown;
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface ExploreServiceOptions {
  verbose?: boolean;
}

/**
 * Service handling exploration business logic
 */
export class ExploreService {
  private cache = cacheManager;
  private contextManager: ContextManager;
  private readonly basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? process.cwd();
    this.contextManager = new ContextManager(this.basePath);
  }

  // HODGE-371: handleFromSpec() and handlePrePopulate() removed - options not used in slash commands

  /**
   * Check for existing exploration with caching
   */
  async checkExistingExploration(
    exploreDir: string,
    force?: boolean
  ): Promise<{ exists: boolean; content?: string; shouldContinue: boolean }> {
    const exists = await this.cache.getOrLoad(
      `exists:${exploreDir}`,
      () => Promise.resolve(existsSync(exploreDir)),
      { ttl: 1000 }
    );

    if (!exists || force) {
      return { exists: false, shouldContinue: true };
    }

    // Exists and not forcing - load content for preview
    const explorationPath = path.join(exploreDir, 'exploration.md');
    const content = await this.cache.getOrLoad(`file:${explorationPath}`, async () => {
      try {
        return await fs.readFile(explorationPath, 'utf-8');
      } catch {
        return null;
      }
    });

    return {
      exists: true,
      content: content ?? undefined,
      shouldContinue: false,
    };
  }

  /**
   * Load project context with caching
   */
  async loadProjectContext(): Promise<ProjectContext> {
    return this.cache.getOrLoad(
      'project-context',
      async () => {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        let projectType: ProjectContext['projectType'] = 'unknown';
        const technologies: string[] = [];
        const patterns: string[] = [];

        try {
          const packageJson = JSON.parse(
            await fs.readFile(packageJsonPath, 'utf-8')
          ) as PackageJson;

          // Detect project type
          if (packageJson.bin) projectType = 'cli';
          else if (packageJson.main && !packageJson.dependencies?.['express'])
            projectType = 'library';
          else if (packageJson.dependencies?.['express']) projectType = 'api';
          else if (packageJson.dependencies?.['react']) projectType = 'webapp';

          // Extract technologies
          const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
          Object.keys(deps).forEach((dep) => {
            if (dep.includes('typescript')) technologies.push('TypeScript');
            if (dep.includes('react')) technologies.push('React');
            if (dep.includes('vue')) technologies.push('Vue');
            if (dep.includes('express')) technologies.push('Express');
          });
        } catch {
          // Fallback to defaults
        }

        return { projectType, technologies, patterns };
      },
      { ttl: 60000 }
    );
  }

  /**
   * Analyze feature intent using pattern matching
   */
  async analyzeFeatureIntent(feature: string): Promise<FeatureIntent> {
    return this.cache.getOrLoad(
      `intent:${feature}`,
      () => {
        const intents = this.getFeatureIntentDefinitions();
        const featureLower = feature.toLowerCase();

        for (const [key, intent] of Object.entries(intents)) {
          if (
            featureLower.includes(key) ||
            intent.keywords.some((k) => featureLower.includes(k.toLowerCase()))
          ) {
            return Promise.resolve(intent);
          }
        }

        // Default general intent
        return Promise.resolve({
          type: 'general' as IntentType,
          keywords: [],
          suggestedPatterns: [],
          relatedCommands: [],
        });
      },
      { ttl: 300000 }
    );
  }

  /**
   * Get feature intent definitions
   */
  private getFeatureIntentDefinitions(): Record<string, FeatureIntent> {
    return {
      auth: {
        type: 'authentication',
        keywords: ['login', 'logout', 'session', 'token', 'jwt', 'oauth'],
        suggestedPatterns: ['singleton-auth', 'middleware', 'token-manager'],
        relatedCommands: ['login', 'logout', 'verify', 'refresh'],
      },
      api: {
        type: 'api-endpoint',
        keywords: ['REST', 'GraphQL', 'endpoint', 'route', 'controller'],
        suggestedPatterns: ['controller', 'router', 'validation', 'error-handler'],
        relatedCommands: ['get', 'post', 'put', 'delete', 'patch'],
      },
      cache: {
        type: 'caching',
        keywords: ['cache', 'memoize', 'store', 'ttl', 'invalidate'],
        suggestedPatterns: ['singleton-cache', 'cache-manager', 'lazy-loading'],
        relatedCommands: ['get', 'set', 'invalidate', 'clear'],
      },
      perf: {
        type: 'performance',
        keywords: ['optimize', 'performance', 'speed', 'benchmark'],
        suggestedPatterns: ['lazy-loading', 'caching', 'memoization'],
        relatedCommands: ['profile', 'benchmark', 'optimize'],
      },
      db: {
        type: 'database',
        keywords: ['database', 'query', 'migration', 'model', 'schema'],
        suggestedPatterns: ['repository', 'active-record', 'data-mapper'],
        relatedCommands: ['migrate', 'seed', 'query'],
      },
      ui: {
        type: 'ui',
        keywords: ['component', 'view', 'page', 'layout', 'style'],
        suggestedPatterns: ['component', 'container-presenter', 'atomic-design'],
        relatedCommands: ['render', 'update', 'mount'],
      },
    };
  }

  /**
   * Find similar features with caching
   */
  async findSimilarFeatures(feature: string): Promise<string[]> {
    return this.cache.getOrLoad(
      `similar:${feature}`,
      async () => {
        const featuresDir = path.join(this.basePath, '.hodge', 'features');
        if (!existsSync(featuresDir)) {
          return [];
        }

        const allFeatures = await fs.readdir(featuresDir);
        const featureLower = feature.toLowerCase();

        // Simple similarity: shared keywords
        return allFeatures
          .filter((f) => f !== feature)
          .filter((f) => {
            const words = featureLower.split(/[-_\s]/);
            return words.some((word) => f.toLowerCase().includes(word));
          })
          .slice(0, 3);
      },
      { ttl: 60000 }
    );
  }

  /**
   * Generate smart template with AI-like context
   */
  generateSmartTemplate(
    feature: string,
    intent: FeatureIntent,
    similarFeatures: string[],
    existingPatterns: Array<{ name: string; description: string; confidence: number }>,
    projectContext: ProjectContext,
    pmIssue: PMIssue | null,
    userDescription?: string
  ): SmartTemplate {
    const content = this.buildTemplateContent(
      feature,
      intent,
      similarFeatures,
      existingPatterns,
      projectContext,
      pmIssue,
      userDescription
    );

    const approaches = this.generateApproaches(intent, projectContext);

    return {
      content,
      approaches,
      relatedFeatures: similarFeatures,
      suggestedPatterns: intent.suggestedPatterns,
    };
  }

  /**
   * Create exploration structure with all files
   */
  async createExplorationStructure(
    featureName: string,
    exploreDir: string,
    template: SmartTemplate,
    _intent: FeatureIntent,
    pmIssue: PMIssue | null,
    featureID: FeatureID | null
  ): Promise<void> {
    // Create directory structure
    await fs.mkdir(exploreDir, { recursive: true });

    // Create exploration.md
    await fs.writeFile(path.join(exploreDir, 'exploration.md'), template.content);

    // HODGE-377.2: Removed test-intentions.md creation
    // Test intentions are now part of exploration.md (AI writes them during synthesis)
    // This eliminates redundancy and keeps test intentions with exploration content

    // Write issue ID file if we have one
    if (pmIssue?.id ?? featureID?.externalID) {
      const issueId = pmIssue?.id ?? featureID?.externalID ?? '';
      const featureDir = path.join(this.basePath, '.hodge', 'features', featureName);
      await fs.writeFile(path.join(featureDir, 'issue-id.txt'), issueId);
    }
  }

  /**
   * Update context manager (HODGE-364: Consolidated from SessionManager + ContextManager)
   */
  async updateSession(featureName: string, _executionTime: number): Promise<void> {
    // HODGE-364: Removed SessionManager calls (updateContext, addCommand, setSummary, suggestNext)
    // These fields were unused - only ContextManager state is consumed by workflow commands
    await this.contextManager.updateForCommand('explore', featureName, 'explore');
  }

  /**
   * Build template content (private helper)
   */
  private buildTemplateContent(
    feature: string,
    intent: FeatureIntent,
    similarFeatures: string[],
    existingPatterns: Array<{ name: string; description: string; confidence: number }>,
    _projectContext: ProjectContext,
    pmIssue: PMIssue | null,
    userDescription?: string
  ): string {
    const sections: string[] = [];

    // Build all sections
    this.addHeaderSection(sections, feature, userDescription);
    this.addPMIntegrationSection(sections, pmIssue);
    this.addContextSection(sections, _projectContext);
    this.addAnalysisSections(sections, intent, similarFeatures, existingPatterns);
    this.addPlaceholderSections(sections, feature);

    return sections.join('\n');
  }

  /**
   * Add header and description sections
   */
  private addHeaderSection(sections: string[], feature: string, userDescription?: string): void {
    sections.push(`# Exploration: ${feature}\n`);
    sections.push(`**Created**: ${new Date().toISOString().split('T')[0]}`);
    sections.push(`**Status**: Exploring\n`);

    if (userDescription) {
      sections.push(`## Problem Statement\n`);
      sections.push(`${userDescription}\n`);
    }
  }

  /**
   * Add PM integration section
   */
  private addPMIntegrationSection(sections: string[], pmIssue: PMIssue | null): void {
    if (pmIssue) {
      sections.push(`## PM Integration\n`);
      sections.push(`- **Issue**: [${pmIssue.id}](${pmIssue.url})`);
      sections.push(`- **Title**: ${pmIssue.title}\n`);
    }
  }

  /**
   * Add context section
   */
  private addContextSection(sections: string[], projectContext: ProjectContext): void {
    sections.push(`## Context\n`);
    sections.push(`**Project Type**: ${projectContext.projectType}`);
    if (projectContext.technologies.length > 0) {
      sections.push(`**Technologies**: ${projectContext.technologies.join(', ')}`);
    }
    sections.push('');
  }

  /**
   * Add analysis sections (intent, similar features, patterns)
   */
  private addAnalysisSections(
    sections: string[],
    intent: FeatureIntent,
    similarFeatures: string[],
    existingPatterns: Array<{ name: string; description: string; confidence: number }>
  ): void {
    if (intent.type !== 'general') {
      sections.push(`## Feature Analysis\n`);
      sections.push(`**Detected Intent**: ${intent.type}`);
      sections.push(`**Suggested Patterns**: ${intent.suggestedPatterns.join(', ')}\n`);
    }

    if (similarFeatures.length > 0) {
      sections.push(`## Related Features\n`);
      similarFeatures.forEach((f) => sections.push(`- ${f}`));
      sections.push('');
    }

    if (existingPatterns.length > 0) {
      sections.push(`## Learned Patterns\n`);
      existingPatterns
        .filter((p) => p.confidence > 0.3)
        .forEach((p) => {
          sections.push(
            `- **${p.name}**: ${p.description} (${(p.confidence * 100).toFixed(0)}% confidence)`
          );
        });
      sections.push('');
    }
  }

  /**
   * Add placeholder sections for AI to fill
   */
  private addPlaceholderSections(sections: string[], feature: string): void {
    sections.push(`## Implementation Approaches\n`);
    sections.push(`<!-- AI will generate 2-3 approaches here -->\n`);
    sections.push(`_Add your approach analysis here_\n`);
    sections.push(`\n## Recommendation\n`);
    sections.push(`<!-- AI will provide recommendation -->\n`);
    sections.push(`\n## Decisions Needed\n`);
    sections.push(`<!-- AI will list decisions for /decide command -->\n`);
    sections.push(`_List key decisions here_\n`);
    sections.push(`## Next Steps\n`);
    sections.push(`1. Review exploration`);
    sections.push(`2. Make decisions with \`hodge decide\``);
    sections.push(`3. Start building with \`hodge build ${feature}\``);
  }

  /**
   * Generate approaches based on intent and project context
   */
  private generateApproaches(intent: FeatureIntent, _projectContext: ProjectContext): Approach[] {
    // Simple approach generation based on intent type
    const approaches: Approach[] = [];

    if (intent.type === 'authentication') {
      approaches.push({
        name: 'JWT-based Authentication',
        description: 'Use JSON Web Tokens for stateless authentication',
        relevance: 0.9,
        pros: ['Stateless', 'Scalable', 'Industry standard'],
        cons: ['Token refresh complexity', 'Storage considerations'],
      });
    }

    if (intent.type === 'caching') {
      approaches.push({
        name: 'In-Memory Caching',
        description: 'Use in-memory cache with TTL',
        relevance: 0.8,
        pros: ['Fast', 'Simple', 'No external dependencies'],
        cons: ['Limited capacity', 'Not persistent', 'Single instance only'],
      });
    }

    // Add general approach if no specific ones
    if (approaches.length === 0) {
      approaches.push({
        name: 'Incremental Implementation',
        description: 'Start simple, iterate based on requirements',
        relevance: 0.7,
        pros: ['Low risk', 'Fast to start', 'Learn as you go'],
        cons: ['May need refactoring', 'Uncertain final architecture'],
      });
    }

    return approaches;
  }

  // HODGE-377.2: Removed generateTestIntentions() method
  // Test intentions are now written by AI directly in exploration.md
  // This method was only used to create test-intentions.md which has been removed
}
