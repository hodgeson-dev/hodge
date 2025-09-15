/**
 * @module pattern-learner
 * @description Intelligent pattern extraction and learning system
 *
 * Analyzes shipped code to extract reusable patterns, detect standards,
 * and build a knowledge base for future development.
 *
 * @example
 * ```typescript
 * import { PatternLearner } from './pattern-learner';
 *
 * const learner = new PatternLearner();
 * const result = await learner.analyzeShippedCode('my-feature');
 *
 * console.log(`Found ${result.patterns.length} patterns`);
 * console.log(`Detected ${result.standards.length} standards`);
 * ```
 *
 * @since 1.0.0
 */

import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Represents a code pattern that can be reused
 */
export interface CodePattern {
  id: string;
  name: string;
  description: string;
  category: 'architecture' | 'testing' | 'error-handling' | 'performance' | 'security' | 'general';
  frequency: number;
  examples: PatternExample[];
  metadata: {
    firstSeen: string;
    lastUsed: string;
    confidence: number; // 0-100
  };
}

/**
 * Example of a pattern in use
 */
export interface PatternExample {
  file: string;
  lines: string;
  context: string;
  feature?: string;
}

/**
 * Detected coding standard
 */
export interface CodingStandard {
  name: string;
  rule: string;
  level: 'strict' | 'recommended' | 'optional';
  examples: string[];
  violations: number;
}

/**
 * Learning result from analysis
 */
export interface LearningResult {
  patterns: CodePattern[];
  standards: CodingStandard[];
  recommendations: string[];
  statistics: {
    filesAnalyzed: number;
    patternsFound: number;
    standardsDetected: number;
    confidence: number;
  };
}

/**
 * Pattern detection rule
 */
interface PatternRule {
  name: string;
  category: CodePattern['category'];
  patterns: RegExp[];
  minOccurrences: number;
  description: string;
}

/**
 * PatternLearner - Extracts patterns and standards from shipped code
 *
 * @class PatternLearner
 * @description Analyzes code to identify reusable patterns, coding standards,
 * and best practices. Builds a knowledge base over time as more code is shipped.
 *
 * @example
 * ```typescript
 * const learner = new PatternLearner();
 *
 * // Analyze shipped code
 * const result = await learner.analyzeShippedCode('user-auth');
 *
 * // Load existing patterns
 * const patterns = await learner.loadExistingPatterns();
 * ```
 */
export class PatternLearner {
  private patterns: Map<string, CodePattern> = new Map();
  private standards: Map<string, CodingStandard> = new Map();
  private readonly patternsDir = '.hodge/patterns';
  private readonly patternRules: PatternRule[] = [
    {
      name: 'Singleton Pattern',
      category: 'architecture',
      patterns: [
        /class\s+\w+\s*{[\s\S]*?private\s+static\s+instance[\s\S]*?getInstance/,
        /let\s+\w+Instance\s*=\s*null[\s\S]*?function\s+get\w+Instance/
      ],
      minOccurrences: 2,
      description: 'Singleton pattern for managing global instances'
    },
    {
      name: 'Error Boundary',
      category: 'error-handling',
      patterns: [
        /try\s*{[\s\S]*?}\s*catch\s*\([^)]+\)\s*{[\s\S]*?console\.(error|warn)/,
        /\.catch\s*\([^)]+\)\s*=>\s*{[\s\S]*?(console|logger)\.(error|warn)/
      ],
      minOccurrences: 3,
      description: 'Consistent error handling with logging'
    },
    {
      name: 'Async Parallel Operations',
      category: 'performance',
      patterns: [
        /Promise\.all\s*\(/,
        /await\s+Promise\.all/,
        /Promise\.allSettled/
      ],
      minOccurrences: 2,
      description: 'Parallel execution for better performance'
    },
    {
      name: 'Input Validation',
      category: 'security',
      patterns: [
        /if\s*\(![\w.]+\)\s*{[\s\S]*?throw\s+new\s+Error/,
        /function\s+validate\w+/,
        /\w+\.validate\(/
      ],
      minOccurrences: 3,
      description: 'Input validation before processing'
    },
    {
      name: 'Factory Pattern',
      category: 'architecture',
      patterns: [
        /function\s+create\w+\s*\([^)]*\)\s*{[\s\S]*?return\s+new/,
        /class\s+\w+Factory/,
        /static\s+create\s*\(/
      ],
      minOccurrences: 2,
      description: 'Factory pattern for object creation'
    },
    {
      name: 'Caching Strategy',
      category: 'performance',
      patterns: [
        /cache\.(get|set|has)\(/,
        /new\s+Map\(\)[\s\S]*?(get|set|has)\(/,
        /memoize/i
      ],
      minOccurrences: 2,
      description: 'Caching for performance optimization'
    }
  ];

  /**
   * Analyze shipped code to extract patterns
   *
   * @param {string} feature - The feature name being shipped
   * @returns {Promise<LearningResult>} Analysis results with patterns and standards
   *
   * @example
   * ```typescript
   * const result = await learner.analyzeShippedCode('user-authentication');
   * console.log(`Found ${result.statistics.patternsFound} patterns`);
   * ```
   */
  async analyzeShippedCode(feature: string): Promise<LearningResult> {
    const shippedFiles = await this.getShippedFiles(feature);
    const filesAnalyzed = shippedFiles.length;

    // Clear previous analysis
    this.patterns.clear();
    this.standards.clear();

    // Analyze each file
    for (const file of shippedFiles) {
      await this.analyzeFile(file, feature);
    }

    // Extract standards from patterns
    this.extractStandards();

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    // Calculate confidence
    const confidence = this.calculateConfidence();

    const result: LearningResult = {
      patterns: Array.from(this.patterns.values()),
      standards: Array.from(this.standards.values()),
      recommendations,
      statistics: {
        filesAnalyzed,
        patternsFound: this.patterns.size,
        standardsDetected: this.standards.size,
        confidence
      }
    };

    // Save patterns for future use
    await this.savePatterns(result.patterns);

    return result;
  }

  /**
   * Get files that were shipped with a feature
   */
  private async getShippedFiles(_feature: string): Promise<string[]> {
    const files: string[] = [];

    // Check git for files changed in this feature
    try {
      const { execSync } = await import('child_process');
      const gitOutput = execSync(`git diff --name-only HEAD~1`, { encoding: 'utf8' });
      const gitFiles = gitOutput
        .split('\n')
        .filter((f: string) => f.endsWith('.ts') || f.endsWith('.js'))
        .filter((f: string) => !f.includes('test'));

      files.push(...gitFiles);
    } catch {
      // Fallback: analyze files in src directory
      files.push(...await this.findSourceFiles('src'));
    }

    return files;
  }

  /**
   * Find source files recursively
   */
  private async findSourceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    if (!existsSync(dir)) return files;

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files.push(...await this.findSourceFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        if (!entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Analyze a single file for patterns
   */
  private async analyzeFile(filePath: string, _feature: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Check each pattern rule
      for (const rule of this.patternRules) {
        for (const pattern of rule.patterns) {
          const matches = content.match(pattern);

          if (matches) {
            this.recordPattern(rule, filePath, matches[0], _feature);
          }
        }
      }

      // Detect coding standards
      this.detectStandardsInFile(content, filePath);
    } catch (error) {
      console.warn(`Failed to analyze ${filePath}:`, error);
    }
  }

  /**
   * Record a found pattern
   */
  private recordPattern(
    rule: PatternRule,
    file: string,
    match: string,
    feature: string
  ): void {
    const patternId = this.generatePatternId(rule.name);

    if (!this.patterns.has(patternId)) {
      this.patterns.set(patternId, {
        id: patternId,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        frequency: 0,
        examples: [],
        metadata: {
          firstSeen: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          confidence: 0
        }
      });
    }

    const pattern = this.patterns.get(patternId)!;
    pattern.frequency++;
    pattern.metadata.lastUsed = new Date().toISOString();

    // Add example if not too many
    if (pattern.examples.length < 3) {
      pattern.examples.push({
        file,
        lines: this.extractLineNumbers(match),
        context: match.substring(0, 200),
        feature
      });
    }

    // Update confidence based on frequency
    pattern.metadata.confidence = Math.min(100, pattern.frequency * 20);
  }

  /**
   * Detect coding standards in file content
   */
  private detectStandardsInFile(content: string, file: string): void {
    const standards = [
      {
        name: 'TypeScript Strict Mode',
        rule: 'Use TypeScript with strict mode enabled',
        pattern: /^\/\*\* @type|interface\s+\w+|type\s+\w+\s*=/m,
        level: 'strict' as const
      },
      {
        name: 'Error Handling',
        rule: 'All promises must have error handling',
        pattern: /\.catch\(|try\s*{[\s\S]*?catch/,
        level: 'strict' as const
      },
      {
        name: 'Input Validation',
        rule: 'Validate all external inputs',
        pattern: /if\s*\(!\w+\)\s*{[\s\S]*?throw/,
        level: 'recommended' as const
      },
      {
        name: 'JSDoc Comments',
        rule: 'Document public APIs with JSDoc',
        pattern: /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(class|function|interface)/,
        level: 'recommended' as const
      },
      {
        name: 'Async/Await',
        rule: 'Prefer async/await over callbacks',
        pattern: /async\s+(function|\w+\s*=>|\w+\s*\()/,
        level: 'recommended' as const
      }
    ];

    for (const std of standards) {
      if (std.pattern.test(content)) {
        this.recordStandard(std, file);
      }
    }
  }

  /**
   * Record a detected standard
   */
  private recordStandard(
    standard: { name: string; rule: string; level: 'strict' | 'recommended' | 'optional' },
    file: string
  ): void {
    if (!this.standards.has(standard.name)) {
      this.standards.set(standard.name, {
        name: standard.name,
        rule: standard.rule,
        level: standard.level,
        examples: [],
        violations: 0
      });
    }

    const std = this.standards.get(standard.name)!;
    if (std.examples.length < 3 && !std.examples.includes(file)) {
      std.examples.push(file);
    }
  }

  /**
   * Extract high-level standards from patterns
   */
  private extractStandards(): void {
    // Infer standards from pattern frequency
    for (const pattern of this.patterns.values()) {
      if (pattern.frequency >= 3 && pattern.metadata.confidence >= 60) {
        this.standards.set(`Use ${pattern.name}`, {
          name: `Use ${pattern.name}`,
          rule: pattern.description,
          level: pattern.frequency >= 5 ? 'strict' : 'recommended',
          examples: pattern.examples.map(e => e.file),
          violations: 0
        });
      }
    }
  }

  /**
   * Generate recommendations based on patterns
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Recommend frequently used patterns
    const frequentPatterns = Array.from(this.patterns.values())
      .filter(p => p.frequency >= 3)
      .sort((a, b) => b.frequency - a.frequency);

    for (const pattern of frequentPatterns.slice(0, 3)) {
      recommendations.push(
        `Consider using ${pattern.name} pattern (used ${pattern.frequency} times)`
      );
    }

    // Recommend missing standards
    if (!this.standards.has('TypeScript Strict Mode')) {
      recommendations.push('Consider enabling TypeScript strict mode');
    }

    if (!this.standards.has('Error Handling')) {
      recommendations.push('Implement consistent error handling');
    }

    // Performance recommendations
    const hasCache = this.patterns.has(this.generatePatternId('Caching Strategy'));
    const hasParallel = this.patterns.has(this.generatePatternId('Async Parallel Operations'));

    if (!hasCache && this.patterns.size > 5) {
      recommendations.push('Consider implementing caching for frequently accessed data');
    }

    if (!hasParallel) {
      recommendations.push('Use Promise.all for parallel operations when possible');
    }

    return recommendations;
  }

  /**
   * Calculate confidence in the analysis
   */
  private calculateConfidence(): number {
    const factors = [
      this.patterns.size > 0 ? 20 : 0,
      this.patterns.size > 3 ? 20 : 0,
      this.standards.size > 0 ? 20 : 0,
      this.standards.size > 3 ? 20 : 0,
      Array.from(this.patterns.values()).some(p => p.frequency >= 3) ? 20 : 0
    ];

    return factors.reduce((sum, val) => sum + val, 0);
  }

  /**
   * Save patterns to file system
   */
  async savePatterns(patterns: CodePattern[]): Promise<void> {
    await fs.mkdir(this.patternsDir, { recursive: true });

    for (const pattern of patterns) {
      if (pattern.metadata.confidence >= 60) {
        const filename = `${pattern.name.toLowerCase().replace(/\s+/g, '-')}.md`;
        const content = this.generatePatternMarkdown(pattern);

        await fs.writeFile(
          path.join(this.patternsDir, filename),
          content
        );
      }
    }

    // Save summary
    const summary = this.generatePatternSummary(patterns);
    await fs.writeFile(
      path.join(this.patternsDir, 'learned-patterns.md'),
      summary
    );
  }

  /**
   * Generate markdown for a pattern
   */
  private generatePatternMarkdown(pattern: CodePattern): string {
    return `# ${pattern.name}

**Category**: ${pattern.category}
**Frequency**: Used ${pattern.frequency} times
**Confidence**: ${pattern.metadata.confidence}%

## Description
${pattern.description}

## Examples
${pattern.examples.map(ex => `
### ${ex.file}
\`\`\`typescript
${ex.context}
\`\`\`
`).join('\n')}

## When to Use
- ${pattern.category === 'performance' ? 'When optimizing for speed' : ''}
- ${pattern.category === 'security' ? 'When handling user input' : ''}
- ${pattern.category === 'architecture' ? 'When structuring large features' : ''}

---
*First seen: ${pattern.metadata.firstSeen}*
*Last used: ${pattern.metadata.lastUsed}*
`;
  }

  /**
   * Generate summary of all patterns
   */
  private generatePatternSummary(patterns: CodePattern[]): string {
    const byCategory = patterns.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {} as Record<string, CodePattern[]>);

    return `# Learned Patterns Summary

## Statistics
- Total patterns detected: ${patterns.length}
- High confidence patterns: ${patterns.filter(p => p.metadata.confidence >= 80).length}
- Most frequent category: ${Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)[0]?.[0]}

## Patterns by Category

${Object.entries(byCategory).map(([category, pats]) => `
### ${category.charAt(0).toUpperCase() + category.slice(1)}
${pats.map(p => `- **${p.name}** (${p.frequency}x, ${p.metadata.confidence}% confidence)`).join('\n')}
`).join('\n')}

## Recommendations
${this.generateRecommendations().map(r => `- ${r}`).join('\n')}

---
*Generated: ${new Date().toISOString()}*
`;
  }

  /**
   * Generate pattern ID
   */
  private generatePatternId(name: string): string {
    return crypto.createHash('md5').update(name.toLowerCase()).digest('hex').substring(0, 8);
  }

  /**
   * Extract line numbers from code match
   */
  private extractLineNumbers(match: string): string {
    // This is a simplified version
    const lines = match.split('\n').length;
    return `${lines} lines`;
  }

  /**
   * Load existing patterns
   */
  async loadExistingPatterns(): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];

    if (!existsSync(this.patternsDir)) {
      return patterns;
    }

    const files = await fs.readdir(this.patternsDir);

    for (const file of files) {
      if (file.endsWith('.md') && file !== 'learned-patterns.md') {
        // Parse pattern from markdown
        // This is simplified - real implementation would parse the markdown
        const content = await fs.readFile(path.join(this.patternsDir, file), 'utf-8');
        const name = content.match(/^# (.+)$/m)?.[1];

        if (name) {
          patterns.push({
            id: this.generatePatternId(name),
            name,
            description: 'Loaded from existing patterns',
            category: 'general',
            frequency: 1,
            examples: [],
            metadata: {
              firstSeen: new Date().toISOString(),
              lastUsed: new Date().toISOString(),
              confidence: 80
            }
          });
        }
      }
    }

    return patterns;
  }
}