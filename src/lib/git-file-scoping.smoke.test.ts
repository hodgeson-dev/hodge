import { describe, it, expect } from 'vitest';
import {
  FileScopingError,
  validateFile,
  getFilesInDirectory,
  getFilesFromLastNCommits,
} from './git-utils.js';
import { smokeTest } from '../test/helpers.js';

describe('Git File Scoping Utilities - Smoke Tests', () => {
  smokeTest('FileScopingError should be a custom error class', () => {
    const error = new FileScopingError('test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FileScopingError);
    expect(error.name).toBe('FileScopingError');
    expect(error.message).toBe('test message');
  });

  smokeTest('validateFile should be a function', () => {
    expect(typeof validateFile).toBe('function');
    expect(validateFile.length).toBe(1); // Takes 1 parameter
  });

  smokeTest('validateFile should return Promise', async () => {
    // Test with a file we know exists (this test file itself)
    const result = validateFile('src/lib/git-utils.ts');
    expect(result).toBeInstanceOf(Promise);

    // Verify it resolves to an array
    const files = await result;
    expect(Array.isArray(files)).toBe(true);
  });

  smokeTest('getFilesInDirectory should be a function', () => {
    expect(typeof getFilesInDirectory).toBe('function');
    expect(getFilesInDirectory.length).toBe(1); // Takes 1 parameter
  });

  smokeTest('getFilesInDirectory should return Promise', async () => {
    // Test with a directory we know exists
    const result = getFilesInDirectory('src/lib');
    expect(result).toBeInstanceOf(Promise);

    // Verify it resolves to an array
    const files = await result;
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0); // src/lib should have files
  });

  smokeTest('getFilesFromLastNCommits should be a function', () => {
    expect(typeof getFilesFromLastNCommits).toBe('function');
    expect(getFilesFromLastNCommits.length).toBe(1); // Takes 1 parameter
  });

  smokeTest('getFilesFromLastNCommits should return Promise', async () => {
    // Test with small number of commits
    const result = getFilesFromLastNCommits(1);
    expect(result).toBeInstanceOf(Promise);

    // Verify it resolves to an array
    const files = await result;
    expect(Array.isArray(files)).toBe(true);
  });

  smokeTest('validateFile should reject with FileScopingError for non-existent file', async () => {
    await expect(validateFile('this-file-does-not-exist.ts')).rejects.toThrow(FileScopingError);
  });

  smokeTest(
    'getFilesInDirectory should reject with FileScopingError for empty directory',
    async () => {
      // Try a path that's unlikely to have git-tracked files
      await expect(getFilesInDirectory('nonexistent-directory-path')).rejects.toThrow(
        FileScopingError
      );
    }
  );
});
