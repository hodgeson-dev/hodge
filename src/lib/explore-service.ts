/**
 * Explore Service
 * Handles business logic for exploration command
 * Extracted from ExploreCommand to reduce complexity and file length
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { cacheManager } from './cache-manager.js';
import { FeaturePopulator } from './feature-populator.js';
import { FeatureSpecLoader } from './feature-spec-loader.js';
import { sessionManager } from './session-manager.js';
import { contextManager } from './context-manager.js';
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
  force?: boolean;
  verbose?: boolean;
  fromSpec?: string;
  prePopulate?: boolean;
  decisions?: string[];
}

/**
 * Service handling exploration business logic
 */
export class ExploreService {
  private cache = cacheManager;

  /**
   * Handle from-spec mode (create feature from YAML specification)
   */
  async handleFromSpec(
    featureName: string,
    specPath: string
  ): Promise<{ success: boolean; message: string }> {
    const specLoader = new FeatureSpecLoader();
    const spec = await specLoader.loadSpec(specPath);

    // Override feature name from spec if provided
    let finalFeatureName = featureName;
    if (spec.feature.name && spec.feature.name !== featureName) {
      finalFeatureName = spec.feature.name;
    }

    const populator = new FeaturePopulator();
    const decisions = specLoader.extractDecisions(spec);
    const metadata = specLoader.toPopulatorMetadata(spec);

    await populator.populateFromDecisions(finalFeatureName, decisions, metadata);

    // Update session context
    await sessionManager.updateContext(finalFeatureName, 'explore');
    await sessionManager.suggestNext('Complete exploration and make decisions');

    return {
      success: true,
      message: `Feature created from specification: ${finalFeatureName}`,
    };
  }

  /**
   * Handle pre-populate mode (legacy approach with decisions)
   */
  async handlePrePopulate(
    featureName: string,
    decisions: string[] = []
  ): Promise<{ success: boolean; message: string }> {
    const populator = new FeaturePopulator();
    await populator.populateFromDecisions(featureName, decisions);

    // Update session context
    await sessionManager.updateContext(featureName, 'explore');
    await sessionManager.suggestNext('Complete exploration and make decisions');

    return {
      success: true,
      message: `Feature pre-populated: ${featureName}`,
    };
  }

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
      content: content || undefined,
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
        const intents: Record<string, FeatureIntent> = {
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
   * Find similar features with caching
   */
  async findSimilarFeatures(feature: string): Promise<string[]> {
    return this.cache.getOrLoad(
      `similar:${feature}`,
      async () => {
        const featuresDir = path.join('.hodge', 'features');
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
    intent: FeatureIntent,
    pmIssue: PMIssue | null,
    featureID: FeatureID | null
  ): Promise<void> {
    // Create directory structure
    await fs.mkdir(exploreDir, { recursive: true });

    // Create exploration.md
    await fs.writeFile(path.join(exploreDir, 'exploration.md'), template.content);

    // Create test-intentions.md
    const testIntentions = this.generateTestIntentions(featureName, intent);
    await fs.writeFile(path.join(exploreDir, 'test-intentions.md'), testIntentions);

    // Write issue ID file if we have one
    if (pmIssue?.id || featureID?.externalID) {
      const issueId = pmIssue?.id || featureID?.externalID || '';
      const featureDir = path.join('.hodge', 'features', featureName);
      await fs.writeFile(path.join(featureDir, 'issue-id.txt'), issueId);
    }
  }

  /**
   * Update session and context managers
   */
  async updateSession(featureName: string, _executionTime: number): Promise<void> {
    await sessionManager.updateContext(featureName, 'explore');
    await sessionManager.addCommand(`hodge explore ${featureName}`);
    await sessionManager.setSummary(
      `Explored ${featureName} - template ready for AI approach generation`
    );
    await sessionManager.suggestNext(`Review exploration and decide with 'hodge decide'`);

    await contextManager.updateForCommand('explore', featureName, 'explore');
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

    // Header
    sections.push(`# Exploration: ${feature}\n`);
    sections.push(`**Created**: ${new Date().toISOString().split('T')[0]}`);
    sections.push(`**Status**: Exploring\n`);

    // User description if provided
    if (userDescription) {
      sections.push(`## Problem Statement\n`);
      sections.push(`${userDescription}\n`);
    }

    // PM Integration
    if (pmIssue) {
      sections.push(`## PM Integration\n`);
      sections.push(`- **Issue**: [${pmIssue.id}](${pmIssue.url})`);
      sections.push(`- **Title**: ${pmIssue.title}\n`);
    }

    // Context
    sections.push(`## Context\n`);
    sections.push(`**Project Type**: ${_projectContext.projectType}`);
    if (_projectContext.technologies.length > 0) {
      sections.push(`**Technologies**: ${_projectContext.technologies.join(', ')}`);
    }
    sections.push('');

    // Intent analysis
    if (intent.type !== 'general') {
      sections.push(`## Feature Analysis\n`);
      sections.push(`**Detected Intent**: ${intent.type}`);
      sections.push(`**Suggested Patterns**: ${intent.suggestedPatterns.join(', ')}\n`);
    }

    // Similar features
    if (similarFeatures.length > 0) {
      sections.push(`## Related Features\n`);
      similarFeatures.forEach((f) => sections.push(`- ${f}`));
      sections.push('');
    }

    // Existing patterns
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

    // Placeholder sections
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

    return sections.join('\n');
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

  /**
   * Generate test intentions template
   */
  private generateTestIntentions(feature: string, intent: FeatureIntent): string {
    const sections: string[] = [];

    sections.push(`# Test Intentions for ${feature}\n`);
    sections.push(`## Purpose`);
    sections.push(`Document what we intend to test when this feature moves to build mode.`);
    sections.push(`These are not actual tests, but a checklist of behaviors to verify.\n`);

    sections.push(`## Core Requirements`);
    sections.push(`- [ ] Should not crash when executed`);
    sections.push(`- [ ] Should complete within reasonable time (<500ms)`);
    sections.push(`- [ ] Should handle invalid input gracefully`);
    sections.push(`- [ ] Should integrate with existing systems\n`);

    // Intent-specific test intentions
    if (intent.type === 'authentication') {
      sections.push(`## Authentication-Specific Tests`);
      sections.push(`- [ ] Should validate credentials correctly`);
      sections.push(`- [ ] Should reject invalid credentials`);
      sections.push(`- [ ] Should handle token expiration`);
      sections.push(`- [ ] Should maintain session state\n`);
    }

    if (intent.type === 'caching') {
      sections.push(`## Caching-Specific Tests`);
      sections.push(`- [ ] Should cache values correctly`);
      sections.push(`- [ ] Should respect TTL settings`);
      sections.push(`- [ ] Should handle cache misses`);
      sections.push(`- [ ] Should invalidate when needed\n`);
    }

    sections.push(`## Integration Tests`);
    sections.push(`- [ ] Should work with current authentication system`);
    sections.push(`- [ ] Should respect user permissions`);
    sections.push(`- [ ] Should handle database transactions properly`);
    sections.push(`- [ ] Should emit appropriate events/logs\n`);

    sections.push(`## Notes`);
    sections.push(`Add any specific test scenarios or edge cases discovered during exploration:\n`);
    sections.push(`-`);
    sections.push(`-`);
    sections.push(`-\n`);

    sections.push(`---`);
    sections.push(
      `*Generated during exploration phase. Convert to actual tests during build phase.*`
    );

    return sections.join('\n');
  }
}
