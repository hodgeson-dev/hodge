#!/usr/bin/env node

/**
 * @fileoverview Test workspace generator for local Hodge development and testing
 *
 * This script creates a temporary directory with sample files to test Hodge locally.
 * It follows the Result<T, E> pattern for error handling and implements comprehensive
 * input validation, logging, and security measures.
 *
 * @author Hodge Development Team
 * @version 1.0.0
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { z } from 'zod';

/**
 * Result type for handling operations that can fail
 * @template T Success type
 * @template E Error type
 */
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Configuration options for test workspace creation
 */
interface WorkspaceConfig {
  /** Base directory for workspace creation (defaults to system temp dir) */
  readonly baseDir?: string;
  /** Custom workspace name prefix */
  readonly namePrefix?: string;
  /** Whether to include TypeScript sample files */
  readonly includeTypeScript?: boolean;
  /** Whether to include JavaScript sample files */
  readonly includeJavaScript?: boolean;
  /** Whether to create a git repository */
  readonly initGit?: boolean;
}

/**
 * Information about the created workspace
 */
interface WorkspaceInfo {
  /** Absolute path to the created workspace */
  readonly path: string;
  /** List of files created in the workspace */
  readonly files: readonly string[];
  /** Timestamp when workspace was created */
  readonly createdAt: Date;
}

/**
 * Error types that can occur during workspace creation
 */
class WorkspaceCreationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'WorkspaceCreationError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Validation schema for workspace configuration
 */
const WorkspaceConfigSchema = z.object({
  baseDir: z
    .string()
    .optional()
    .refine(
      (dir) => {
        if (!dir) return true;
        return path.isAbsolute(dir) && !dir.includes('..');
      },
      { message: 'Base directory must be absolute and not contain ..' }
    ),
  namePrefix: z
    .string()
    .optional()
    .refine(
      (name) => {
        if (!name) return true;
        return /^[a-zA-Z0-9-_]+$/.test(name);
      },
      { message: 'Name prefix must contain only alphanumeric characters, hyphens, and underscores' }
    ),
  includeTypeScript: z.boolean().optional().default(true),
  includeJavaScript: z.boolean().optional().default(true),
  initGit: z.boolean().optional().default(false),
});

/**
 * Logger utility for structured logging
 */
class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log an informational message
   * @param message - The message to log
   * @param data - Optional additional data
   */
  public info(message: string, data?: unknown): void {
    console.log(`ℹ️  ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Log a success message
   * @param message - The message to log
   * @param data - Optional additional data
   */
  public success(message: string, data?: unknown): void {
    console.log(`✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param data - Optional additional data
   */
  public warn(message: string, data?: unknown): void {
    console.warn(`⚠️  ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param error - Optional error object
   */
  public error(message: string, error?: Error): void {
    console.error(`❌ ${message}`, error ? error.stack || error.message : '');
  }

  /**
   * Log a debug message (only in development)
   * @param message - The message to log
   * @param data - Optional additional data
   */
  public debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

/**
 * Security utilities for validating paths and inputs
 */
class SecurityValidator {
  /**
   * Validate that a path is safe for file operations
   * @param filePath - The path to validate
   * @returns Result indicating whether path is safe
   */
  public static validatePath(filePath: string): Result<string, SecurityError> {
    try {
      // Check for path traversal attempts
      if (filePath.includes('..')) {
        return {
          success: false,
          error: new SecurityError('Path contains path traversal sequences (..)'),
        };
      }

      // Check for null bytes
      if (filePath.includes('\0')) {
        return {
          success: false,
          error: new SecurityError('Path contains null bytes'),
        };
      }

      // Resolve and normalize the path
      const resolved = path.resolve(filePath);

      // Ensure path is within allowed directories (temp dir or current working directory)
      const tempDir = os.tmpdir();
      const cwd = process.cwd();

      if (!resolved.startsWith(tempDir) && !resolved.startsWith(cwd)) {
        return {
          success: false,
          error: new SecurityError('Path is outside of allowed directories'),
        };
      }

      return { success: true, data: resolved };
    } catch (error) {
      return {
        success: false,
        error: new SecurityError(
          `Path validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      };
    }
  }

  /**
   * Sanitize a string for safe use in file names
   * @param input - The string to sanitize
   * @returns Sanitized string
   */
  public static sanitizeFileName(input: string): string {
    return input.replace(/[^a-zA-Z0-9-_\.]/g, '_');
  }
}

/**
 * Test workspace generator class
 */
export class TestWorkspaceGenerator {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Create a test workspace with the specified configuration
   * @param config - Configuration options for workspace creation
   * @returns Result containing workspace information or error
   */
  public async createTestWorkspace(
    config: WorkspaceConfig = {}
  ): Promise<Result<WorkspaceInfo, Error>> {
    this.logger.info('🚀 Starting test workspace creation', config);

    try {
      // Validate configuration
      const validationResult = this.validateConfig(config);
      if (!validationResult.success) {
        return { success: false, error: validationResult.error };
      }

      const validatedConfig = validationResult.data;

      // Generate workspace path
      const workspacePathResult = this.generateWorkspacePath(validatedConfig);
      if (!workspacePathResult.success) {
        return { success: false, error: workspacePathResult.error };
      }

      const workspacePath = workspacePathResult.data;

      // Create workspace directory
      const createDirResult = await this.createWorkspaceDirectory(workspacePath);
      if (!createDirResult.success) {
        return { success: false, error: createDirResult.error };
      }

      // Generate workspace files
      const filesResult = await this.generateWorkspaceFiles(workspacePath, validatedConfig);
      if (!filesResult.success) {
        return { success: false, error: filesResult.error };
      }

      const workspaceInfo: WorkspaceInfo = {
        path: workspacePath,
        files: filesResult.data,
        createdAt: new Date(),
      };

      this.logger.success('Test workspace created successfully', {
        path: workspacePath,
        fileCount: filesResult.data.length,
      });

      return { success: true, data: workspaceInfo };
    } catch (error) {
      const workspaceError = new WorkspaceCreationError(
        'Unexpected error during workspace creation',
        error instanceof Error ? error : new Error(String(error))
      );

      this.logger.error('Failed to create test workspace', workspaceError);
      return { success: false, error: workspaceError };
    }
  }

  /**
   * Validate the workspace configuration
   * @param config - Configuration to validate
   * @returns Result containing validated config or error
   */
  private validateConfig(config: WorkspaceConfig): Result<WorkspaceConfig, ValidationError> {
    try {
      const validated = WorkspaceConfigSchema.parse(config);
      this.logger.debug('Configuration validated successfully', validated);
      return { success: true, data: validated };
    } catch (error) {
      const validationError = new ValidationError(
        `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'config'
      );
      this.logger.error('Configuration validation failed', validationError);
      return { success: false, error: validationError };
    }
  }

  /**
   * Generate a safe workspace path
   * @param config - Validated workspace configuration
   * @returns Result containing workspace path or error
   */
  private generateWorkspacePath(config: WorkspaceConfig): Result<string, SecurityError> {
    const baseDir = config.baseDir || os.tmpdir();
    const namePrefix = SecurityValidator.sanitizeFileName(config.namePrefix || 'hodge-test');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    const workspaceName = `${namePrefix}-${timestamp}-${randomSuffix}`;
    const workspacePath = path.join(baseDir, workspaceName);

    // Validate the generated path
    const pathValidation = SecurityValidator.validatePath(workspacePath);
    if (!pathValidation.success) {
      return pathValidation;
    }

    this.logger.debug('Generated workspace path', { path: workspacePath });
    return { success: true, data: workspacePath };
  }

  /**
   * Create the workspace directory
   * @param workspacePath - Path where workspace should be created
   * @returns Result indicating success or failure
   */
  private async createWorkspaceDirectory(workspacePath: string): Promise<Result<void, Error>> {
    try {
      await fs.ensureDir(workspacePath);
      this.logger.debug('Workspace directory created', { path: workspacePath });
      return { success: true, data: undefined };
    } catch (error) {
      const creationError = new WorkspaceCreationError(
        `Failed to create workspace directory: ${workspacePath}`,
        error instanceof Error ? error : new Error(String(error))
      );
      return { success: false, error: creationError };
    }
  }

  /**
   * Generate all workspace files based on configuration
   * @param workspacePath - Path to the workspace directory
   * @param config - Validated workspace configuration
   * @returns Result containing list of created files or error
   */
  private async generateWorkspaceFiles(
    workspacePath: string,
    config: WorkspaceConfig
  ): Promise<Result<readonly string[], Error>> {
    const createdFiles: string[] = [];

    try {
      // Create package.json
      const packageJsonResult = await this.createPackageJson(workspacePath);
      if (!packageJsonResult.success) {
        return { success: false, error: packageJsonResult.error };
      }
      createdFiles.push('package.json');

      // Create source directory
      const srcDir = path.join(workspacePath, 'src');
      await fs.ensureDir(srcDir);

      // Create JavaScript files if enabled
      if (config.includeJavaScript) {
        const jsResult = await this.createJavaScriptFiles(srcDir);
        if (!jsResult.success) {
          return { success: false, error: jsResult.error };
        }
        createdFiles.push(...jsResult.data);
      }

      // Create TypeScript files if enabled
      if (config.includeTypeScript) {
        const tsResult = await this.createTypeScriptFiles(srcDir);
        if (!tsResult.success) {
          return { success: false, error: tsResult.error };
        }
        createdFiles.push(...tsResult.data);
      }

      // Create README
      const readmeResult = await this.createReadme(workspacePath);
      if (!readmeResult.success) {
        return { success: false, error: readmeResult.error };
      }
      createdFiles.push('README.md');

      // Create .gitignore
      const gitignoreResult = await this.createGitignore(workspacePath);
      if (!gitignoreResult.success) {
        return { success: false, error: gitignoreResult.error };
      }
      createdFiles.push('.gitignore');

      this.logger.debug('All workspace files generated successfully', {
        fileCount: createdFiles.length,
        files: createdFiles,
      });

      return { success: true, data: createdFiles };
    } catch (error) {
      const fileError = new WorkspaceCreationError(
        'Failed to generate workspace files',
        error instanceof Error ? error : new Error(String(error))
      );
      return { success: false, error: fileError };
    }
  }

  /**
   * Create package.json file
   * @param workspacePath - Path to workspace directory
   * @returns Result indicating success or failure
   */
  private async createPackageJson(workspacePath: string): Promise<Result<void, Error>> {
    try {
      const packageJson = {
        name: 'hodge-test-workspace',
        version: '1.0.0',
        description: 'Test workspace for Hodge development',
        main: 'index.js',
        scripts: {
          test: 'echo "Error: no test specified" && exit 1',
          lint: 'eslint .',
          format: 'prettier --write .',
        },
        keywords: ['hodge', 'test', 'workspace'],
        author: 'Hodge Development Team',
        license: 'MIT',
      };

      const filePath = path.join(workspacePath, 'package.json');
      await fs.writeJson(filePath, packageJson, { spaces: 2 });

      this.logger.debug('package.json created successfully', { path: filePath });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new WorkspaceCreationError(
          'Failed to create package.json',
          error instanceof Error ? error : new Error(String(error))
        ),
      };
    }
  }

  /**
   * Create JavaScript sample files
   * @param srcDir - Path to source directory
   * @returns Result containing list of created files or error
   */
  private async createJavaScriptFiles(srcDir: string): Promise<Result<readonly string[], Error>> {
    try {
      const files: string[] = [];

      // Sample JavaScript file
      const sampleJS = `/**
 * Sample JavaScript file for testing Hodge functionality
 * This file contains basic functions to test various Hodge features
 */

/**
 * Greet a user by name
 * @param {string} name - The name to greet
 * @returns {string} Greeting message
 */
function greet(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Name must be a non-empty string');
  }
  return \`Hello, \${name}!\`;
}

/**
 * Calculate the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function calculate(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both parameters must be numbers');
  }
  return a + b;
}

/**
 * Asynchronous function for testing async operations
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise<string>} Promise that resolves after delay
 */
async function asyncOperation(delay = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Async operation completed');
    }, delay);
  });
}

module.exports = { greet, calculate, asyncOperation };
`;

      const jsFilePath = path.join(srcDir, 'sample.js');
      await fs.writeFile(jsFilePath, sampleJS);
      files.push('src/sample.js');

      this.logger.debug('JavaScript files created successfully', { files });
      return { success: true, data: files };
    } catch (error) {
      return {
        success: false,
        error: new WorkspaceCreationError(
          'Failed to create JavaScript files',
          error instanceof Error ? error : new Error(String(error))
        ),
      };
    }
  }

  /**
   * Create TypeScript sample files
   * @param srcDir - Path to source directory
   * @returns Result containing list of created files or error
   */
  private async createTypeScriptFiles(srcDir: string): Promise<Result<readonly string[], Error>> {
    try {
      const files: string[] = [];

      // Sample TypeScript file
      const sampleTS = `/**
 * Sample TypeScript file for testing Hodge functionality
 * This file demonstrates TypeScript features and best practices
 */

/**
 * User interface definition
 */
export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly isActive?: boolean;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * User service for managing user operations
 */
export class UserService {
  private readonly users: Map<number, User> = new Map();

  /**
   * Add a new user to the service
   * @param user - User to add
   * @returns Result indicating success or failure
   */
  public addUser(user: User): Result<void, string> {
    if (this.users.has(user.id)) {
      return { success: false, error: \`User with ID \${user.id} already exists\` };
    }

    this.users.set(user.id, user);
    return { success: true, data: undefined };
  }

  /**
   * Get a user by ID
   * @param id - User ID to search for
   * @returns Result containing user or error
   */
  public getUser(id: number): Result<User, string> {
    const user = this.users.get(id);
    
    if (!user) {
      return { success: false, error: \`User with ID \${id} not found\` };
    }

    return { success: true, data: user };
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  public getAllUsers(): readonly User[] {
    return Array.from(this.users.values());
  }

  /**
   * Get active users only
   * @returns Array of active users
   */
  public getActiveUsers(): readonly User[] {
    return this.getAllUsers().filter(user => user.isActive !== false);
  }

  /**
   * Update user information
   * @param id - User ID to update
   * @param updates - Partial user updates
   * @returns Result indicating success or failure
   */
  public updateUser(id: number, updates: Partial<Omit<User, 'id'>>): Result<User, string> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      return { success: false, error: \`User with ID \${id} not found\` };
    }

    const updatedUser: User = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);

    return { success: true, data: updatedUser };
  }

  /**
   * Delete a user
   * @param id - User ID to delete
   * @returns Result indicating success or failure
   */
  public deleteUser(id: number): Result<void, string> {
    if (!this.users.has(id)) {
      return { success: false, error: \`User with ID \${id} not found\` };
    }

    this.users.delete(id);
    return { success: true, data: undefined };
  }

  /**
   * Get user count
   * @returns Number of users in the service
   */
  public getUserCount(): number {
    return this.users.size;
  }
}
`;

      const tsFilePath = path.join(srcDir, 'UserService.ts');
      await fs.writeFile(tsFilePath, sampleTS);
      files.push('src/UserService.ts');

      this.logger.debug('TypeScript files created successfully', { files });
      return { success: true, data: files };
    } catch (error) {
      return {
        success: false,
        error: new WorkspaceCreationError(
          'Failed to create TypeScript files',
          error instanceof Error ? error : new Error(String(error))
        ),
      };
    }
  }

  /**
   * Create README.md file
   * @param workspacePath - Path to workspace directory
   * @returns Result indicating success or failure
   */
  private async createReadme(workspacePath: string): Promise<Result<void, Error>> {
    try {
      const readme = `# Hodge Test Workspace

This is a temporary test workspace created for local Hodge development and testing.

## Purpose

This workspace provides a safe environment to test Hodge functionality without affecting your actual projects.

## Testing Hodge Commands

You can test various Hodge commands in this workspace:

\`\`\`bash
# Initialize Hodge in this workspace
hodge init

# Enter explore mode for rapid prototyping
hodge explore

# Enter ship mode for production-ready code
hodge ship

# Record architectural decisions
hodge decide

# Extract and learn from code patterns
hodge learn

# Manage and validate coding standards
hodge standards
\`\`\`

## Files in this workspace

- \`src/sample.js\` - Sample JavaScript file with functions and error handling
- \`src/UserService.ts\` - Sample TypeScript file with interfaces, classes, and Result types
- \`package.json\` - Basic Node.js project configuration
- \`.gitignore\` - Standard Node.js gitignore file

## Development Workflow

1. **Explore Mode**: Use this mode to experiment with new features and approaches
2. **Build Mode**: Implement features following established patterns
3. **Harden Mode**: Apply all standards and prepare for production

## Code Quality Features

- TypeScript support with strict typing
- Result<T, E> pattern for error handling
- Comprehensive JSDoc documentation
- Security validations and input sanitization
- Structured logging

## Cleanup

This workspace is temporary and should be cleaned up after testing:

\`\`\`bash
rm -rf "${workspacePath}"
\`\`\`

---

Generated by Hodge Test Workspace Generator v1.0.0
`;

      const filePath = path.join(workspacePath, 'README.md');
      await fs.writeFile(filePath, readme);

      this.logger.debug('README.md created successfully', { path: filePath });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new WorkspaceCreationError(
          'Failed to create README.md',
          error instanceof Error ? error : new Error(String(error))
        ),
      };
    }
  }

  /**
   * Create .gitignore file
   * @param workspacePath - Path to workspace directory
   * @returns Result indicating success or failure
   */
  private async createGitignore(workspacePath: string): Promise<Result<void, Error>> {
    try {
      const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
lib/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Coverage directory used by tools like istanbul
coverage/

# Temporary files
tmp/
temp/

# Hodge specific
.hodge/cache/
.hodge/temp/
`;

      const filePath = path.join(workspacePath, '.gitignore');
      await fs.writeFile(filePath, gitignore);

      this.logger.debug('.gitignore created successfully', { path: filePath });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new WorkspaceCreationError(
          'Failed to create .gitignore',
          error instanceof Error ? error : new Error(String(error))
        ),
      };
    }
  }

  /**
   * Display usage instructions for the created workspace
   * @param workspaceInfo - Information about the created workspace
   */
  public displayUsageInstructions(workspaceInfo: WorkspaceInfo): void {
    const { path: workspacePath, files } = workspaceInfo;

    console.log('\n🎉 Test workspace created successfully!');
    console.log(`📁 Location: ${workspacePath}`);
    console.log(`📊 Files created: ${files.length}`);
    console.log();
    console.log('📋 Next steps:');
    console.log(`1. cd "${workspacePath}"`);
    console.log('2. Ensure Hodge is linked: npm run link:local (from Hodge project directory)');
    console.log('3. Test Hodge commands:');
    console.log('   • hodge init     - Initialize Hodge in workspace');
    console.log('   • hodge explore  - Enter explore mode');
    console.log('   • hodge ship     - Enter ship mode');
    console.log('   • hodge decide   - Record decisions');
    console.log('   • hodge learn    - Extract patterns');
    console.log('   • hodge standards - Validate standards');
    console.log();
    console.log('💡 Tips:');
    console.log('   • Run this script multiple times to create fresh test environments');
    console.log('   • Each workspace is isolated and can be safely deleted');
    console.log('   • Modify the sample files to test different Hodge features');
    console.log();
    console.log(`🗑️  Cleanup: rm -rf "${workspacePath}"`);
  }
}

/**
 * Main function to create a test workspace
 * @param config - Optional configuration for workspace creation
 * @returns Promise resolving to workspace information or error
 */
export async function createTestWorkspace(
  config?: WorkspaceConfig
): Promise<Result<WorkspaceInfo, Error>> {
  const generator = new TestWorkspaceGenerator();
  return generator.createTestWorkspace(config);
}

/**
 * CLI entry point
 */
async function main(): Promise<void> {
  const logger = Logger.getInstance();

  try {
    const result = await createTestWorkspace();

    if (!result.success) {
      logger.error('Failed to create test workspace', result.error);
      process.exit(1);
    }

    const generator = new TestWorkspaceGenerator();
    generator.displayUsageInstructions(result.data);
  } catch (error) {
    logger.error(
      'Unexpected error in main function',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
