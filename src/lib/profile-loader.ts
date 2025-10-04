/**
 * Profile Loader
 *
 * Loads and validates YAML review profiles from .hodge/review-profiles/
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'yaml';
import type { ReviewProfile, SeverityLevel } from '../types/review-profile.js';

export class ProfileLoader {
  private profilesDir: string;

  constructor(basePath: string = process.cwd()) {
    this.profilesDir = join(basePath, '.hodge', 'review-profiles');
  }

  /**
   * Load a review profile by name
   * @param profileName Name of profile (without .yml extension)
   * @returns Parsed and validated profile
   * @throws Error if profile not found or invalid
   */
  loadProfile(profileName: string): ReviewProfile {
    const profilePath = join(this.profilesDir, `${profileName}.yml`);

    if (!existsSync(profilePath)) {
      throw new Error(`Profile not found: ${profilePath}`);
    }

    try {
      const content = readFileSync(profilePath, 'utf-8');
      const profile = yaml.parse(content) as ReviewProfile;

      this.validateProfile(profile, profileName);

      return profile;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Profile not found')) {
        throw error;
      }
      throw new Error(
        `Invalid profile syntax in ${profileName}.yml: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate profile schema
   * @param profile Profile to validate
   * @param profileName Name for error messages
   * @throws Error if validation fails
   */
  private validateProfile(profile: ReviewProfile, profileName: string): void {
    if (!profile.name) {
      throw new Error(`Profile ${profileName} missing required field: name`);
    }

    if (!profile.description) {
      throw new Error(`Profile ${profileName} missing required field: description`);
    }

    if (!Array.isArray(profile.applies_to) || profile.applies_to.length === 0) {
      throw new Error(
        `Profile ${profileName} missing or invalid field: applies_to (must be non-empty array)`
      );
    }

    if (!Array.isArray(profile.criteria) || profile.criteria.length === 0) {
      throw new Error(
        `Profile ${profileName} missing or invalid field: criteria (must be non-empty array)`
      );
    }

    // Validate each criteria
    profile.criteria.forEach((criteria, index) => {
      if (!criteria.name) {
        throw new Error(`Profile ${profileName} criteria[${index}] missing required field: name`);
      }

      if (!criteria.severity) {
        throw new Error(
          `Profile ${profileName} criteria[${index}] missing required field: severity`
        );
      }

      const validSeverities: SeverityLevel[] = ['blocker', 'warning', 'suggestion'];
      if (!validSeverities.includes(criteria.severity)) {
        throw new Error(
          `Profile ${profileName} criteria[${index}] invalid severity: ${criteria.severity} (must be blocker, warning, or suggestion)`
        );
      }

      if (!Array.isArray(criteria.patterns) || criteria.patterns.length === 0) {
        throw new Error(
          `Profile ${profileName} criteria[${index}] missing or invalid field: patterns (must be non-empty array)`
        );
      }
    });
  }
}
