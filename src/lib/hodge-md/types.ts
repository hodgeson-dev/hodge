/**
 * Type definitions for HODGE.md generation
 */

import type { WorkflowContext } from '../context-manager.js';

export interface HodgeMDSection {
  title: string;
  content: string;
  priority: number;
}

export interface HodgeMDContext {
  feature: string;
  mode: string;
  decisions: Array<{ date: string; decision: string }>;
  standards: Array<{ category: string; rules: string[] }>;
  principles?: Array<{ title: string; description: string }>;
  recentCommands: string[];
  workingFiles: string[];
  nextSteps: string[];
  pmIssue?: string;
  // HODGE-364: Replaced LightSession with WorkflowContext
  context?: WorkflowContext;
}
