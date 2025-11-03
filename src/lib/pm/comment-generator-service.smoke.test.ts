/**
 * Smoke tests for CommentGeneratorService
 * HODGE-377.4: Tests for decision/ship/blocker comment generation
 */

import { describe, expect } from 'vitest';
import {
  CommentGeneratorService,
  type Decision,
  type QualityGate,
} from './comment-generator-service.js';
import { smokeTest } from '../../test/helpers.js';

describe('CommentGeneratorService - Decision Comments (HODGE-377.4)', () => {
  const service = new CommentGeneratorService();

  smokeTest('should generate decision comment with emoji and count', () => {
    const decisions: Decision[] = [
      { title: 'Use PostgreSQL', rationale: 'Better performance', timestamp: '2025-11-03' },
      { title: 'OAuth2 flow', rationale: 'Industry standard', timestamp: '2025-11-03' },
    ];

    const comment = service.generateDecisionComment(decisions, true);

    expect(comment).toContain('📋');
    expect(comment).toContain('Finalized');
    expect(comment).toContain('2 decisions');
    expect(comment).toContain('Use PostgreSQL');
    expect(comment).toContain('OAuth2 flow');
    expect(comment).toContain('Status: Ready to build');
  });

  smokeTest('should distinguish between finalized and reviewed decisions', () => {
    const decisions: Decision[] = [{ title: 'Test', rationale: 'Test', timestamp: '2025-11-03' }];

    const finalizedComment = service.generateDecisionComment(decisions, true);
    const reviewedComment = service.generateDecisionComment(decisions, false);

    expect(finalizedComment).toContain('Finalized');
    expect(reviewedComment).toContain('Reviewed');
  });

  smokeTest('should handle singular vs plural decision count', () => {
    const singleDecision: Decision[] = [
      { title: 'Test', rationale: 'Test', timestamp: '2025-11-03' },
    ];
    const multipleDecisions: Decision[] = [
      { title: 'Test 1', rationale: 'Test', timestamp: '2025-11-03' },
      { title: 'Test 2', rationale: 'Test', timestamp: '2025-11-03' },
    ];

    const singleComment = service.generateDecisionComment(singleDecision, true);
    const multipleComment = service.generateDecisionComment(multipleDecisions, true);

    expect(singleComment).toContain('1 decision');
    expect(singleComment).not.toContain('decisions');
    expect(multipleComment).toContain('2 decisions');
  });
});

describe('CommentGeneratorService - Ship Comments (HODGE-377.4)', () => {
  const service = new CommentGeneratorService();

  smokeTest('should generate ship comment with emoji and commit SHA', () => {
    const qualityGates: QualityGate[] = [
      { name: 'All tests passing', passed: true },
      { name: 'No lint errors', passed: true },
    ];

    const comment = service.generateShipComment(
      'abc123def456',
      qualityGates,
      new Date('2025-11-03T12:00:00Z')
    );

    expect(comment).toContain('🚀');
    expect(comment).toContain('Shipped in commit abc123d');
    expect(comment).toContain('✓ All tests passing');
    expect(comment).toContain('✓ No lint errors');
    expect(comment).toContain('Shipped: 2025-11-03');
  });

  smokeTest('should include commit link when provided', () => {
    const comment = service.generateShipComment(
      'abc123',
      [],
      new Date(),
      'https://github.com/user/repo/commit/abc123'
    );

    expect(comment).toContain('https://github.com/user/repo/commit/abc123');
  });

  smokeTest('should show passed and failed quality gates differently', () => {
    const qualityGates: QualityGate[] = [
      { name: 'Tests', passed: true },
      { name: 'Types', passed: false, details: '3 errors' },
    ];

    const comment = service.generateShipComment('abc123', qualityGates, new Date());

    expect(comment).toContain('✓ Tests');
    expect(comment).toContain('✗ Types (3 errors)');
  });
});

describe('CommentGeneratorService - Blocker Comments (HODGE-377.4)', () => {
  const service = new CommentGeneratorService();

  smokeTest('should generate blocker comment with warning emoji', () => {
    const comment = service.generateBlockerComment('Waiting for API endpoint implementation');

    expect(comment).toContain('⚠️');
    expect(comment).toContain('Blocked');
    expect(comment).toContain('Waiting for API endpoint implementation');
  });

  smokeTest('should preserve blocker details formatting', () => {
    const details =
      'Dependencies:\n- Feature X must be shipped first\n- Database migration pending';
    const comment = service.generateBlockerComment(details);

    expect(comment).toContain(details);
    expect(comment).toContain('Feature X');
    expect(comment).toContain('Database migration');
  });
});
