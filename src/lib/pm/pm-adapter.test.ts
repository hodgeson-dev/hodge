/**
 * Tests for PM Adapter functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StateConventions } from './conventions';
import { StateType, PMState } from './types';

describe('StateConventions', () => {
  let conventions: StateConventions;

  beforeEach(() => {
    conventions = new StateConventions();
  });

  describe('detectStateType', () => {
    it('should detect unstarted states', () => {
      expect(conventions.detectStateType('Backlog')).toBe('unstarted');
      expect(conventions.detectStateType('TODO')).toBe('unstarted');
      expect(conventions.detectStateType('Upcoming')).toBe('unstarted');
      expect(conventions.detectStateType('Ready')).toBe('unstarted');
    });

    it('should detect started states', () => {
      expect(conventions.detectStateType('In Progress')).toBe('started');
      expect(conventions.detectStateType('Doing')).toBe('started');
      expect(conventions.detectStateType('In Review')).toBe('started');
      expect(conventions.detectStateType('Testing')).toBe('started');
    });

    it('should detect completed states', () => {
      expect(conventions.detectStateType('Done')).toBe('completed');
      expect(conventions.detectStateType('Complete')).toBe('completed');
      expect(conventions.detectStateType('Shipped')).toBe('completed');
      expect(conventions.detectStateType('Deployed')).toBe('completed');
    });

    it('should detect canceled states', () => {
      expect(conventions.detectStateType('Canceled')).toBe('canceled');
      expect(conventions.detectStateType('Cancelled')).toBe('canceled');
      expect(conventions.detectStateType('Abandoned')).toBe('canceled');
      expect(conventions.detectStateType("Won't Fix")).toBe('canceled');
    });

    it('should return unknown for unrecognized states', () => {
      expect(conventions.detectStateType('Random State')).toBe('unknown');
      expect(conventions.detectStateType('Custom')).toBe('unknown');
    });
  });

  describe('findBestMatch', () => {
    const mockStates: PMState[] = [
      { id: '1', name: 'Backlog', type: 'unstarted' },
      { id: '2', name: 'In Progress', type: 'started' },
      { id: '3', name: 'In Review', type: 'started' },
      { id: '4', name: 'Done', type: 'completed' },
    ];

    it('should find exact type match', () => {
      const match = conventions.findBestMatch(mockStates, 'completed');
      expect(match?.name).toBe('Done');
    });

    it('should find by pattern when no exact type', () => {
      const statesWithoutTypes: PMState[] = mockStates.map((s) => ({
        ...s,
        type: 'unknown' as StateType,
      }));

      const match = conventions.findBestMatch(statesWithoutTypes, 'started');
      expect(match?.name).toBe('In Progress');
    });

    it('should return undefined when no match found', () => {
      const match = conventions.findBestMatch(mockStates, 'canceled');
      expect(match).toBeUndefined();
    });
  });

  describe('getTargetStateType', () => {
    it('should return correct state for mode transitions', () => {
      expect(conventions.getTargetStateType('explore', 'build')).toBe('started');
      expect(conventions.getTargetStateType('build', 'harden')).toBe('started');
      expect(conventions.getTargetStateType('harden', 'ship')).toBe('completed');
    });

    it('should return unknown for invalid transitions', () => {
      expect(conventions.getTargetStateType('ship', 'explore')).toBe('unknown');
    });
  });

  describe('isReviewState', () => {
    it('should identify review states', () => {
      expect(conventions.isReviewState('In Review')).toBe(true);
      expect(conventions.isReviewState('PR')).toBe(true);
      expect(conventions.isReviewState('Testing')).toBe(true);
      expect(conventions.isReviewState('QA')).toBe(true);
    });

    it('should not identify non-review states', () => {
      expect(conventions.isReviewState('In Progress')).toBe(false);
      expect(conventions.isReviewState('Done')).toBe(false);
      expect(conventions.isReviewState('Backlog')).toBe(false);
    });
  });

  describe('addCustomPatterns', () => {
    it('should add custom patterns for state detection', () => {
      conventions.addCustomPatterns('started', [/^building$/i]);
      expect(conventions.detectStateType('Building')).toBe('started');
    });

    it('should add patterns for new state type', () => {
      conventions.addCustomPatterns('unknown' as StateType, [/^custom$/i]);
      expect(conventions.detectStateType('Custom')).toBe('unknown');
    });
  });
});
