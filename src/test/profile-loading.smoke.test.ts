import { describe } from 'vitest';
import { smokeTest } from './helpers.js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

describe('Profile Loading - Smoke Tests', () => {
  const profilesDir = join(process.cwd(), '.hodge', 'review-profiles');

  smokeTest('should find YAML profiles in all categories', async () => {
    const categories = [
      'languages',
      'frameworks',
      'databases',
      'testing',
      'ui-libraries',
      'api-styles',
    ];

    for (const category of categories) {
      const categoryPath = join(profilesDir, category);
      const files = readdirSync(categoryPath).filter((f) => f.endsWith('.yaml'));

      if (files.length === 0) {
        throw new Error(`No YAML profiles found in ${category}`);
      }
    }
  });

  smokeTest('should load and parse YAML profiles without errors', async () => {
    const allProfiles = findAllYamlProfiles(profilesDir);

    if (allProfiles.length === 0) {
      throw new Error('No YAML profiles found');
    }

    for (const profilePath of allProfiles) {
      const content = readFileSync(profilePath, 'utf-8');
      const profile = yaml.load(content);

      if (!profile) {
        throw new Error(`Failed to parse YAML: ${profilePath}`);
      }
    }
  });

  smokeTest('should have valid meta section in all profiles', async () => {
    const allProfiles = findAllYamlProfiles(profilesDir);

    for (const profilePath of allProfiles) {
      const content = readFileSync(profilePath, 'utf-8');
      const profile: any = yaml.load(content);

      if (!profile.meta) {
        throw new Error(`Missing meta section: ${profilePath}`);
      }

      if (!profile.meta.version) {
        throw new Error(`Missing meta.version: ${profilePath}`);
      }
    }
  });

  smokeTest('should have rules array in all profiles', async () => {
    const allProfiles = findAllYamlProfiles(profilesDir);

    for (const profilePath of allProfiles) {
      const content = readFileSync(profilePath, 'utf-8');
      const profile: any = yaml.load(content);

      if (!profile.rules) {
        throw new Error(`Missing rules array: ${profilePath}`);
      }

      if (!Array.isArray(profile.rules)) {
        throw new Error(`rules is not an array: ${profilePath}`);
      }

      if (profile.rules.length === 0) {
        throw new Error(`Empty rules array: ${profilePath}`);
      }
    }
  });

  smokeTest('should have required fields in all rules', async () => {
    const allProfiles = findAllYamlProfiles(profilesDir);
    const requiredFields = ['id', 'name', 'enforcement', 'severity', 'desc'];

    for (const profilePath of allProfiles) {
      const content = readFileSync(profilePath, 'utf-8');
      const profile: any = yaml.load(content);

      for (const rule of profile.rules) {
        for (const field of requiredFields) {
          if (!rule[field]) {
            throw new Error(`Rule missing ${field} in ${profilePath}: ${rule.id || 'unknown'}`);
          }
        }
      }
    }
  });

  smokeTest('should have valid enforcement values', async () => {
    const allProfiles = findAllYamlProfiles(profilesDir);
    const validEnforcement = ['MANDATORY', 'SUGGESTED'];

    for (const profilePath of allProfiles) {
      const content = readFileSync(profilePath, 'utf-8');
      const profile: any = yaml.load(content);

      for (const rule of profile.rules) {
        if (!validEnforcement.includes(rule.enforcement)) {
          throw new Error(
            `Invalid enforcement "${rule.enforcement}" in ${profilePath}: ${rule.id}`
          );
        }
      }
    }
  });

  smokeTest('should have valid severity values', async () => {
    const allProfiles = findAllYamlProfiles(profilesDir);
    const validSeverity = ['BLOCKER', 'WARNING', 'SUGGESTION'];

    for (const profilePath of allProfiles) {
      const content = readFileSync(profilePath, 'utf-8');
      const profile: any = yaml.load(content);

      for (const rule of profile.rules) {
        if (!validSeverity.includes(rule.severity)) {
          throw new Error(`Invalid severity "${rule.severity}" in ${profilePath}: ${rule.id}`);
        }
      }
    }
  });

  smokeTest('should count expected number of profiles', async () => {
    const allProfiles = findAllYamlProfiles(profilesDir);
    const expectedCount = 43;

    if (allProfiles.length !== expectedCount) {
      throw new Error(`Expected ${expectedCount} profiles, found ${allProfiles.length}`);
    }
  });
});

// Helper function to recursively find all YAML files
function findAllYamlProfiles(dir: string): string[] {
  const profiles: string[] = [];

  function walk(directory: string) {
    const entries = readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
        profiles.push(fullPath);
      }
    }
  }

  walk(dir);
  return profiles;
}
