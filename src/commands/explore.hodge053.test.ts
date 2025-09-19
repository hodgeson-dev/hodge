import { describe, it, expect, beforeEach } from 'vitest';
import { ExploreCommand } from './explore';
import { smokeTest } from '../test/helpers';

// HODGE-053: Test feature vs topic detection
describe('HODGE-053: Feature vs Topic Detection', () => {
  let command: ExploreCommand;

  beforeEach(() => {
    command = new ExploreCommand();
  });

  // Smoke test: Ensure detection doesn't crash
  smokeTest('detectInputType should not crash on various inputs', async () => {
    const inputs = [
      'HODGE-053',
      'auth-123',
      '"authentication"',
      'authentication patterns',
      '#123',
      '!456',
      'feature-1',
      'CAPS-999',
      'lowr-123',
      '',
      '   ',
    ];

    for (const input of inputs) {
      expect(() => (command as any).detectInputType(input)).not.toThrow();
    }
  });

  describe('Feature Detection', () => {
    it('should detect uppercase patterns as features', () => {
      expect((command as any).detectInputType('HODGE-053')).toBe('feature');
      expect((command as any).detectInputType('AUTH-123')).toBe('feature');
      expect((command as any).detectInputType('ABC-999')).toBe('feature');
    });

    it('should detect lowercase patterns as features', () => {
      expect((command as any).detectInputType('auth-123')).toBe('feature');
      expect((command as any).detectInputType('feature-1')).toBe('feature');
      expect((command as any).detectInputType('test-999')).toBe('feature');
    });

    it('should detect mixed case patterns as features', () => {
      expect((command as any).detectInputType('Auth-123')).toBe('feature');
      expect((command as any).detectInputType('FeaTure-999')).toBe('feature');
    });

    it('should detect hash and exclamation patterns as features', () => {
      expect((command as any).detectInputType('#123')).toBe('feature');
      expect((command as any).detectInputType('!456')).toBe('feature');
    });

    it('should allow any non-space characters before hyphen', () => {
      expect((command as any).detectInputType('a-1')).toBe('feature');
      expect((command as any).detectInputType('very_long_feature_name-123')).toBe('feature');
      expect((command as any).detectInputType('with.dots-999')).toBe('feature');
      expect((command as any).detectInputType('under_score-42')).toBe('feature');
    });
  });

  describe('Topic Detection', () => {
    it('should detect quoted strings as topics', () => {
      expect((command as any).detectInputType('"authentication"')).toBe('topic');
      expect((command as any).detectInputType('"HODGE-053"')).toBe('topic');
      expect((command as any).detectInputType("'caching strategy'")).toBe('topic');
    });

    it('should detect natural language as topics', () => {
      expect((command as any).detectInputType('authentication')).toBe('topic');
      expect((command as any).detectInputType('caching strategy')).toBe('topic');
      expect((command as any).detectInputType('how to implement auth')).toBe('topic');
    });

    it('should detect strings with spaces as topics', () => {
      expect((command as any).detectInputType('auth flow')).toBe('topic');
      expect((command as any).detectInputType('user authentication system')).toBe('topic');
    });

    it('should handle edge cases correctly', () => {
      expect((command as any).detectInputType('')).toBe('topic');
      expect((command as any).detectInputType('   ')).toBe('topic');
      expect((command as any).detectInputType('no-numbers-here')).toBe('topic');
      expect((command as any).detectInputType('123-backwards')).toBe('topic');
    });
  });

  describe('Quote Override', () => {
    it('should treat quoted feature patterns as topics', () => {
      // Quotes override the pattern detection
      expect((command as any).detectInputType('"HODGE-053"')).toBe('topic');
      expect((command as any).detectInputType("'AUTH-123'")).toBe('topic');
    });
  });
});
