import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import chalk from 'chalk';

import { createCommandLogger } from './logger.js';
/**
 * Feature specification structure
 */
export interface FeatureSpec {
  version: string;
  metadata?: {
    extracted_at?: string;
    extracted_by?: string;
    session_id?: string;
  };
  feature: {
    name: string;
    description: string;
    decisions?: Array<{
      text: string;
      date?: string;
    }>;
    rationale?: string;
    scope?: {
      included?: string[];
      excluded?: string[];
    };
    dependencies?: string[];
    effort?: string;
    priority?: number;
    exploration_areas?: Array<{
      area: string;
      questions: string[];
    }>;
    risks?: string[];
  };
}

/**
 * Loads and validates feature specifications from YAML files
 */
export class FeatureSpecLoader {
  private logger = createCommandLogger('feature-spec-loader', { enableConsole: false });

  /**
   * Load a feature specification from a YAML file
   */
  async loadSpec(filePath: string): Promise<FeatureSpec> {
    try {
      // Read the file
      const content = await fs.readFile(filePath, 'utf-8');

      // Parse YAML
      const spec = yaml.load(content) as FeatureSpec;

      // Validate structure
      this.validateSpec(spec);

      this.logger.info(chalk.gray(`✓ Loaded feature spec from ${filePath}`));
      return spec;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load feature spec: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate the feature specification structure
   */
  private validateSpec(spec: unknown): void {
    const typedSpec = this.validateTopLevelStructure(spec);
    const feature = typedSpec.feature as Record<string, unknown>;

    this.validateRequiredFields(feature);
    this.validateOptionalFields(feature);
  }

  /**
   * Validate top-level spec structure and version
   */
  private validateTopLevelStructure(spec: unknown): Record<string, unknown> {
    if (!spec || typeof spec !== 'object') {
      throw new Error('Spec is empty or invalid');
    }

    const typedSpec = spec as Record<string, unknown>;

    if (!typedSpec.version) {
      throw new Error('Missing version field');
    }

    if (!typedSpec.feature || typeof typedSpec.feature !== 'object') {
      throw new Error('Missing or invalid feature field');
    }

    return typedSpec;
  }

  /**
   * Validate required feature fields (name, description)
   */
  private validateRequiredFields(feature: Record<string, unknown>): void {
    if (!feature.name) {
      throw new Error('Missing feature.name');
    }

    if (typeof feature.name !== 'string') {
      throw new Error('feature.name must be a string');
    }

    if (!feature.description) {
      throw new Error('Missing feature.description');
    }

    if (typeof feature.description !== 'string') {
      throw new Error('feature.description must be a string');
    }
  }

  /**
   * Validate optional feature fields (decisions, scope, exploration_areas, priority)
   */
  private validateOptionalFields(feature: Record<string, unknown>): void {
    this.validateDecisions(feature);
    this.validateScope(feature);
    this.validateExplorationAreas(feature);
    this.validatePriority(feature);
  }

  /**
   * Validate decisions array if present
   */
  private validateDecisions(feature: Record<string, unknown>): void {
    if (!feature.decisions) {
      return;
    }

    if (!Array.isArray(feature.decisions)) {
      throw new Error('feature.decisions must be an array');
    }

    feature.decisions.forEach((decision: unknown, index: number) => {
      if (!decision || typeof decision !== 'object') {
        throw new Error(`Decision ${index} is invalid`);
      }
      const typedDecision = decision as Record<string, unknown>;
      if (!typedDecision.text) {
        throw new Error(`Decision ${index} is missing text field`);
      }
    });
  }

  /**
   * Validate scope field if present
   */
  private validateScope(feature: Record<string, unknown>): void {
    if (!feature.scope || typeof feature.scope !== 'object') {
      return;
    }

    const scope = feature.scope as Record<string, unknown>;
    if (scope.included && !Array.isArray(scope.included)) {
      throw new Error('feature.scope.included must be an array');
    }
    if (scope.excluded && !Array.isArray(scope.excluded)) {
      throw new Error('feature.scope.excluded must be an array');
    }
  }

  /**
   * Validate exploration areas array if present
   */
  private validateExplorationAreas(feature: Record<string, unknown>): void {
    if (!feature.exploration_areas) {
      return;
    }

    if (!Array.isArray(feature.exploration_areas)) {
      throw new Error('feature.exploration_areas must be an array');
    }

    feature.exploration_areas.forEach((area: unknown, index: number) => {
      if (!area || typeof area !== 'object') {
        throw new Error(`Exploration area ${index} is invalid`);
      }
      const typedArea = area as Record<string, unknown>;
      if (!typedArea.area) {
        throw new Error(`Exploration area ${index} is missing area field`);
      }
      if (!typedArea.questions || !Array.isArray(typedArea.questions)) {
        throw new Error(`Exploration area ${index} questions must be an array`);
      }
    });
  }

  /**
   * Validate priority field if present
   */
  private validatePriority(feature: Record<string, unknown>): void {
    if (feature.priority === undefined) {
      return;
    }

    if (typeof feature.priority !== 'number') {
      throw new Error('feature.priority must be a number');
    }
    if (feature.priority < 1 || feature.priority > 5) {
      throw new Error('feature.priority must be between 1 and 5');
    }
  }

  /**
   * Convert a FeatureSpec to the format needed by FeaturePopulator
   */
  toPopulatorMetadata(spec: FeatureSpec) {
    const feature = spec.feature;

    return {
      description: feature.description,
      scope: feature.scope,
      dependencies: feature.dependencies,
      effort: feature.effort,
      rationale: feature.rationale,
      explorationAreas: feature.exploration_areas,
    };
  }

  /**
   * Extract decision texts from the spec
   */
  extractDecisions(spec: FeatureSpec): string[] {
    if (!spec.feature.decisions) {
      return [];
    }

    return spec.feature.decisions.map((d) => d.text);
  }

  /**
   * Generate a filename for a new feature spec
   */
  static generateFilename(featureName: string): string {
    const date = new Date();
    const timestamp = date.toISOString().replace(/T/, '-').replace(/:/g, '').replace(/\..+/, '');

    // Sanitize feature name for filename
    const safeName = featureName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    return `${timestamp}-${safeName}.yaml`;
  }
}
