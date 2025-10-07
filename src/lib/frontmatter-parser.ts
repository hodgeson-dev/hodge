/**
 * Frontmatter Parser
 *
 * Parses and validates YAML frontmatter from markdown files.
 * Used for markdown-based review profiles with versioned schemas.
 */

import matter from 'gray-matter';

/**
 * Frontmatter data for review profiles
 */
export interface FrontmatterData {
  /** Frontmatter schema version (e.g., "1.0.0") */
  frontmatter_version: string;

  /** Profile scope: reusable or project-specific */
  scope: 'reusable' | 'project';

  /** Profile type (e.g., "universal", "language-specific") */
  type: string;

  /** File patterns this profile applies to */
  applies_to?: string[];

  /** Profile version (e.g., "1.0.0") */
  version: string;

  /** Maintainer (e.g., "hodge-framework", "project-team") */
  maintained_by?: string;

  /** Profile name (optional, defaults to filename) */
  name?: string;

  /** Profile description (optional) */
  description?: string;
}

/**
 * Result of frontmatter parsing
 */
export interface ParsedFrontmatter {
  /** Frontmatter data */
  data: FrontmatterData;

  /** Markdown content (without frontmatter) */
  content: string;
}

/**
 * Parse YAML frontmatter from markdown content
 *
 * @param content - Markdown file content with YAML frontmatter
 * @returns Parsed frontmatter data and content
 * @throws Error if frontmatter is missing or invalid
 */
export function parseFrontmatter(content: string): ParsedFrontmatter {
  if (!content || content.trim().length === 0) {
    throw new Error('Cannot parse frontmatter from empty content');
  }

  let parsed;
  try {
    parsed = matter(content);
  } catch (error) {
    throw new Error(
      `Malformed YAML frontmatter: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Check if frontmatter exists
  if (!parsed.data || Object.keys(parsed.data).length === 0) {
    throw new Error('Missing YAML frontmatter (expected --- delimiter at start of file)');
  }

  const data = parsed.data as FrontmatterData;

  // Validate required fields
  validateFrontmatter(data);

  return {
    data,
    content: parsed.content,
  };
}

/**
 * Validate frontmatter schema
 *
 * @param data - Frontmatter data to validate
 * @throws Error if validation fails
 */
function validateFrontmatter(data: FrontmatterData): void {
  // Required fields
  if (!data.frontmatter_version) {
    throw new Error('Missing required frontmatter field: frontmatter_version');
  }

  if (!data.scope) {
    throw new Error('Missing required frontmatter field: scope');
  }

  if (!data.type) {
    throw new Error('Missing required frontmatter field: type');
  }

  if (!data.version) {
    throw new Error('Missing required frontmatter field: version');
  }

  // Validate frontmatter_version matches expected version
  if (data.frontmatter_version !== '1.0.0') {
    throw new Error(
      `Unsupported frontmatter_version: ${data.frontmatter_version} (expected "1.0.0")`
    );
  }

  // Validate scope enum
  const validScopes: Array<'reusable' | 'project'> = ['reusable', 'project'];
  if (!validScopes.includes(data.scope)) {
    throw new Error(`Invalid scope: ${String(data.scope)} (must be "reusable" or "project")`);
  }

  // Validate version format (basic semver check)
  const versionPattern = /^\d+\.\d+\.\d+$/;
  if (!versionPattern.test(data.version)) {
    throw new Error(
      `Invalid version format: ${data.version} (expected semver format like "1.0.0")`
    );
  }
}
