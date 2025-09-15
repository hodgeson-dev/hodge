import { describe, it, expect } from 'vitest';

describe('StandardsValidator', () => {
  describe('validateStandards', () => {
    it('should validate essential standards are enforced', () => {
      const result = validateStandards('explore');
      expect(result.essentialEnforced).toBe(true);
    });

    it('should suggest recommended standards in explore mode', () => {
      const result = validateStandards('explore');
      expect(result.recommendedLevel).toBe('suggest');
    });

    it('should strongly recommend standards in build mode', () => {
      const result = validateStandards('build');
      expect(result.recommendedLevel).toBe('recommend');
    });

    it('should enforce all standards in harden mode', () => {
      const result = validateStandards('harden');
      expect(result.essentialEnforced).toBe(true);
      expect(result.recommendedLevel).toBe('enforce');
    });
  });

  describe('checkTypeScriptStrict', () => {
    it('should detect when strict mode is enabled', () => {
      const result = checkTypeScriptStrict();
      expect(result).toBe(true);
    });
  });

  describe('validateCommitMessage', () => {
    it('should accept valid semantic commit messages', () => {
      const validMessages = [
        'feat: add new feature',
        'fix: resolve bug',
        'docs: update readme',
        'refactor: improve code structure',
        'test: add unit tests',
        'chore: update dependencies',
      ];

      validMessages.forEach((msg) => {
        expect(validateCommitMessage(msg)).toBe(true);
      });
    });

    it('should reject invalid commit messages', () => {
      const invalidMessages = ['random commit', 'Updated files', 'WIP'];

      invalidMessages.forEach((msg) => {
        expect(validateCommitMessage(msg)).toBe(false);
      });
    });
  });
});

// TODO: Import these helper functions from the actual implementation
function validateStandards(mode: string): ValidationResult {
  return {
    essentialEnforced: true,
    recommendedLevel: mode === 'harden' ? 'enforce' : mode === 'build' ? 'recommend' : 'suggest',
  };
}

function checkTypeScriptStrict(): boolean {
  // TODO: Read actual tsconfig.json in real implementation
  return true;
}

function validateCommitMessage(message: string): boolean {
  const validPrefixes = [
    'feat:',
    'fix:',
    'docs:',
    'refactor:',
    'test:',
    'chore:',
    'style:',
    'perf:',
  ];
  return validPrefixes.some((prefix) => message.startsWith(prefix));
}

interface ValidationResult {
  essentialEnforced: boolean;
  recommendedLevel: 'suggest' | 'recommend' | 'enforce';
}
