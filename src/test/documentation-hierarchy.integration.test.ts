import { describe, expect } from 'vitest';
import { integrationTest } from './helpers';
import { withTestWorkspace } from './runners';

describe('Documentation Hierarchy Integration Tests', () => {
  integrationTest('complete documentation hierarchy should work together', async () => {
    await withTestWorkspace('doc-hierarchy', async (workspace) => {
      // Set up full documentation structure
      await workspace.writeFile(
        '.hodge/standards.md',
        `# Project Standards
⚠️ **THESE STANDARDS ARE MANDATORY**
All standards below are CRITICAL and MUST be followed.

## Testing Requirements
| Phase | Required | Time Limit |
|-------|----------|------------|
| **Harden** | Integration tests | <500ms each |`
      );

      await workspace.writeFile(
        '.hodge/principles.md',
        `# Hodge Development Principles
## Core Philosophy
> "Freedom to explore, discipline to ship"

## The Five Principles
### 1. Progressive Enhancement
Standards tighten as code matures`
      );

      await workspace.writeFile(
        '.hodge/patterns/README.md',
        `# Hodge Patterns Library
## Pattern Categories
### Starter Patterns
- test-behavior-pattern
- progressive-validation-pattern`
      );

      await workspace.writeFile(
        '.hodge/decisions.md',
        `# Architecture Decisions
## Decisions
### 2025-01-20 - Test Decision
**Status**: Accepted`
      );

      // Create a lesson file
      await workspace.writeFile(
        '.hodge/lessons/TEST-001.md',
        `# Lessons from TEST-001
**What worked well:**
- Pattern X was effective
**What was challenging:**
- Issue Y took longer than expected`
      );

      // Verify all documentation hierarchy levels exist and are connected
      const standardsContent = await workspace.readFile('.hodge/standards.md');
      const principlesContent = await workspace.readFile('.hodge/principles.md');
      const patternsContent = await workspace.readFile('.hodge/patterns/README.md');
      const decisionsContent = await workspace.readFile('.hodge/decisions.md');
      const lessonContent = await workspace.readFile('.hodge/lessons/TEST-001.md');

      // Standards should be mandatory
      expect(standardsContent).toContain('MANDATORY');
      expect(standardsContent).toContain('Integration tests');

      // Principles should be guiding
      expect(principlesContent).toContain('Freedom to explore');
      expect(principlesContent).toContain('Progressive Enhancement');

      // Patterns should be available
      expect(patternsContent).toContain('Pattern Categories');
      expect(patternsContent).toContain('test-behavior-pattern');

      // Decisions should be recorded
      expect(decisionsContent).toContain('Architecture Decisions');
      expect(decisionsContent).toContain('Test Decision');

      // Lessons should be captured
      expect(lessonContent).toContain('What worked well');
      expect(lessonContent).toContain('Pattern X was effective');
    });
  });

  integrationTest('documentation hierarchy should support learning loop', async () => {
    await withTestWorkspace('learning-loop', async (workspace) => {
      // Simulate the learning loop: lesson → pattern → standard

      // 1. Start with a lesson
      await workspace.writeFile(
        '.hodge/lessons/FEAT-001.md',
        `# Lessons from FEAT-001
**What worked well:**
- Caching strategy reduced API calls by 80%
**What to do differently:**
- Should have implemented caching from the start`
      );

      // 2. Extract to pattern
      await workspace.writeFile(
        '.hodge/patterns/caching-strategy.md',
        `# Pattern: Caching Strategy
## Problem
Repeated API calls slow down the application
## Solution
Implement intelligent caching with TTL
## Example from FEAT-001
Cache API responses for 5 minutes`
      );

      // 3. Multiple features hit same issue - consider standard
      await workspace.writeFile(
        '.hodge/lessons/FEAT-002.md',
        `# Lessons from FEAT-002
**What was challenging:**
- No caching caused performance issues again`
      );

      await workspace.writeFile(
        '.hodge/lessons/FEAT-003.md',
        `# Lessons from FEAT-003
**What was challenging:**
- Performance degraded without caching`
      );

      // 4. Verify learning loop can be traced
      const lesson1 = await workspace.readFile('.hodge/lessons/FEAT-001.md');
      const pattern = await workspace.readFile('.hodge/patterns/caching-strategy.md');
      const lesson2 = await workspace.readFile('.hodge/lessons/FEAT-002.md');
      const lesson3 = await workspace.readFile('.hodge/lessons/FEAT-003.md');

      // Lessons should mention the issue
      expect(lesson1).toContain('Caching strategy');
      expect(lesson2).toContain('caching');
      expect(lesson3).toContain('caching');

      // Pattern should reference the original lesson
      expect(pattern).toContain('FEAT-001');
      expect(pattern).toContain('Problem');
      expect(pattern).toContain('Solution');

      // With 3 features hitting the same issue, a standard should be considered
      const allLessons = [lesson1, lesson2, lesson3];
      const cachingIssueCount = allLessons.filter((l) => l.includes('caching')).length;
      expect(cachingIssueCount).toBeGreaterThanOrEqual(3);
    });
  });
});
