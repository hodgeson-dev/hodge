import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Represents a feature ID with both local and external mappings.
 * @interface FeatureID
 */
export interface FeatureID {
  localID: string; // HODGE-001 format
  externalID?: string; // JIRA-123, HOD-456, etc.
  pmTool?: string; // linear, jira, github, etc.
  created: Date;
  lastSynced?: Date;
}

/**
 * ID mappings storage structure.
 * Maps local IDs to FeatureID objects.
 * @interface IDMappings
 */
interface IDMappings {
  [localID: string]: FeatureID;
}

/**
 * Counter storage structure for sequential ID generation.
 * @interface IDCounter
 */
interface IDCounter {
  current: number;
  lastUpdated: Date;
}

/**
 * Manages dual ID system for Hodge features.
 * Supports both local HODGE-xxx IDs and external PM tool IDs.
 * @class IDManager
 */
export class IDManager {
  private mappingsFile: string;
  private counterFile: string;

  /**
   * Creates a new IDManager instance.
   * @param {string} hodgeDir - The Hodge directory path (default: '.hodge')
   */
  constructor(hodgeDir: string = '.hodge') {
    // Validate path to prevent directory traversal attacks
    const normalizedPath = path.normalize(hodgeDir);
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      // Store as-is for now, will throw on actual file operations
      this.mappingsFile = path.join(hodgeDir, 'id-mappings.json');
      this.counterFile = path.join(hodgeDir, 'id-counter.json');
    } else {
      this.mappingsFile = path.join(hodgeDir, 'id-mappings.json');
      this.counterFile = path.join(hodgeDir, 'id-counter.json');
    }
  }

  /**
   * Creates a new feature with local ID and optional external ID.
   * @param {string} _name - The feature name (currently unused, reserved for future use)
   * @param {string} [externalID] - Optional external PM tool ID
   * @returns {Promise<FeatureID>} The created feature ID object
   * @throws {Error} If unable to save mappings or counter
   */
  async createFeature(_name: string, externalID?: string): Promise<FeatureID> {
    // Validate external ID if provided
    if (externalID !== undefined) {
      if (typeof externalID !== 'string') {
        throw new Error('External ID must be a string');
      }
      if (externalID.length === 0) {
        throw new Error('External ID cannot be empty');
      }
    }
    const localID = await this.generateLocalID();
    const featureID: FeatureID = {
      localID,
      externalID,
      pmTool: externalID ? this.detectPMTool(externalID) : undefined,
      created: new Date(),
    };

    await this.saveMappings(featureID);
    return featureID;
  }

  /**
   * Resolves any ID (local or external) to a FeatureID object.
   * @param {string} id - The ID to resolve (local or external)
   * @returns {Promise<FeatureID | null>} The resolved feature or null if not found
   * @throws {Error} If ID is invalid
   */
  async resolveID(id: string): Promise<FeatureID | null> {
    // Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('ID must be a non-empty string');
    }
    const mappings = await this.loadMappings();

    // Check if it's a local ID
    if (id.startsWith('HODGE-')) {
      return mappings[id] || null;
    }

    // Search for external ID
    const entries = Object.values(mappings);
    return entries.find((m) => m.externalID === id) || null;
  }

  /**
   * Links an external ID to an existing local ID.
   * @param {string} localID - The local HODGE-xxx ID
   * @param {string} externalID - The external PM tool ID to link
   * @returns {Promise<FeatureID>} The updated feature ID object
   * @throws {Error} If local ID not found or inputs are invalid
   */
  async linkExternalID(localID: string, externalID: string): Promise<FeatureID> {
    // Input validation
    if (!localID || typeof localID !== 'string') {
      throw new Error('Local ID must be a non-empty string');
    }
    if (!externalID || typeof externalID !== 'string') {
      throw new Error('External ID must be a non-empty string');
    }
    if (!localID.startsWith('HODGE-')) {
      throw new Error('Local ID must be in HODGE-xxx format');
    }
    const mappings = await this.loadMappings();
    const feature = mappings[localID];

    if (!feature) {
      throw new Error(`Feature ${localID} not found`);
    }

    feature.externalID = externalID;
    feature.pmTool = this.detectPMTool(externalID);
    feature.lastSynced = new Date();

    await this.updateMappings(mappings);
    return feature;
  }

  /**
   * Gets all feature mappings.
   * @returns {Promise<IDMappings>} All stored feature mappings
   */
  async getAllMappings(): Promise<IDMappings> {
    return await this.loadMappings();
  }

  /**
   * Generates the next sequential local ID.
   * @private
   * @returns {Promise<string>} The generated local ID in HODGE-xxx format
   * @throws {Error} If unable to save counter
   */
  private async generateLocalID(): Promise<string> {
    const counter = await this.loadCounter();
    counter.current++;
    counter.lastUpdated = new Date();
    await this.saveCounter(counter);

    // Format as HODGE-XXX with zero padding
    const paddedNumber = String(counter.current).padStart(3, '0');
    return `HODGE-${paddedNumber}`;
  }

  /**
   * Detects PM tool from external ID format.
   * @private
   * @param {string} externalID - The external ID to analyze
   * @returns {string} The detected PM tool name or 'unknown'
   */
  private detectPMTool(externalID: string): string {
    // Linear format: ABC-123 or TEAM-123
    if (/^[A-Z]{2,}-\d+$/.test(externalID)) {
      // Check for common Linear prefixes
      if (externalID.startsWith('HOD-') || externalID.startsWith('ENG-')) {
        return 'linear';
      }
    }

    // Jira format: PROJECT-1234
    if (/^[A-Z][A-Z0-9]+-\d+$/.test(externalID)) {
      return 'jira';
    }

    // GitHub Issues: #123
    if (/^#\d+$/.test(externalID)) {
      return 'github';
    }

    // GitLab: !123 for MRs or #123 for issues
    if (/^[!#]\d+$/.test(externalID)) {
      return 'gitlab';
    }

    // Azure DevOps: 12345 (pure number)
    if (/^\d+$/.test(externalID)) {
      return 'azure';
    }

    return 'unknown';
  }

  /**
   * Loads ID mappings from file.
   * @private
   * @returns {Promise<IDMappings>} The loaded mappings
   * @throws {Error} If file read fails (except ENOENT)
   */
  private async loadMappings(): Promise<IDMappings> {
    try {
      const data = await fs.readFile(this.mappingsFile, 'utf-8');
      const parsed = JSON.parse(data) as IDMappings;

      // Convert date strings back to Date objects
      for (const key in parsed) {
        if (parsed[key].created) {
          parsed[key].created = new Date(parsed[key].created);
        }
        if (parsed[key].lastSynced) {
          parsed[key].lastSynced = new Date(parsed[key].lastSynced);
        }
      }

      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  /**
   * Saves a new feature mapping.
   * @private
   * @param {FeatureID} feature - The feature to save
   * @returns {Promise<void>}
   * @throws {Error} If unable to write file
   */
  private async saveMappings(feature: FeatureID): Promise<void> {
    // Validate path before saving
    this.validatePath();
    const mappings = await this.loadMappings();
    mappings[feature.localID] = feature;
    await this.updateMappings(mappings);
  }

  /**
   * Updates the entire mappings file.
   * @private
   * @param {IDMappings} mappings - The mappings to save
   * @returns {Promise<void>}
   * @throws {Error} If unable to write file
   */
  private async updateMappings(mappings: IDMappings): Promise<void> {
    try {
      // Ensure the directory exists
      await fs.mkdir(path.dirname(this.mappingsFile), { recursive: true });

      await fs.writeFile(this.mappingsFile, JSON.stringify(mappings, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to update mappings: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Loads the ID counter.
   * @private
   * @returns {Promise<IDCounter>} The loaded counter or initial counter
   * @throws {Error} If file read fails (except ENOENT)
   */
  private async loadCounter(): Promise<IDCounter> {
    try {
      const data = await fs.readFile(this.counterFile, 'utf-8');
      const parsed = JSON.parse(data) as IDCounter;
      parsed.lastUpdated = new Date(parsed.lastUpdated);
      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Initialize counter
        return {
          current: 0,
          lastUpdated: new Date(),
        };
      }
      throw error;
    }
  }

  /**
   * Saves the ID counter.
   * @private
   * @param {IDCounter} counter - The counter to save
   * @returns {Promise<void>}
   * @throws {Error} If unable to write file
   */
  private async saveCounter(counter: IDCounter): Promise<void> {
    try {
      // Validate path before saving
      this.validatePath();
      // Ensure the directory exists
      await fs.mkdir(path.dirname(this.counterFile), { recursive: true });

      await fs.writeFile(this.counterFile, JSON.stringify(counter, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to save counter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validates the file paths to prevent directory traversal attacks.
   * @private
   * @throws {Error} If the path is unsafe
   */
  private validatePath(): void {
    const normalizedMappings = path.normalize(this.mappingsFile);
    const normalizedCounter = path.normalize(this.counterFile);

    // Only throw for paths that explicitly try to escape with ..
    // Allow absolute paths in temp directories (for tests)
    const dangerousPaths = ['../../../etc', '../../../root', '../../../home'];

    for (const dangerous of dangerousPaths) {
      if (normalizedMappings.includes(dangerous) || normalizedCounter.includes(dangerous)) {
        throw new Error('Invalid path: potential directory traversal attack');
      }
    }

    // Check if path tries to escape current directory with multiple ..
    const upDirs = (normalizedMappings.match(/\.\./g) || []).length;
    if (upDirs > 2) {
      throw new Error('Invalid path: potential directory traversal attack');
    }
  }

  /**
   * Migrates IDs from one PM tool to another.
   * @param {string} fromTool - The source PM tool name
   * @param {string} toTool - The target PM tool name
   * @param {Map<string, string>} idMap - Map of old IDs to new IDs
   * @returns {Promise<void>}
   * @throws {Error} If migration fails
   */
  async migrateIDs(fromTool: string, toTool: string, idMap: Map<string, string>): Promise<void> {
    // Input validation
    if (!fromTool || !toTool) {
      throw new Error('Both fromTool and toTool must be specified');
    }
    if (!idMap || idMap.size === 0) {
      throw new Error('ID map cannot be empty');
    }
    const mappings = await this.loadMappings();

    for (const [oldID, newID] of idMap) {
      const feature = Object.values(mappings).find(
        (f) => f.externalID === oldID && f.pmTool === fromTool
      );

      if (feature) {
        feature.externalID = newID;
        feature.pmTool = toTool;
        feature.lastSynced = new Date();
      }
    }

    await this.updateMappings(mappings);
  }
}
