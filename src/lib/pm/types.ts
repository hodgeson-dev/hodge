/**
 * PM Tool Integration Types
 */

export type PMTool = 'linear' | 'github' | 'jira' | 'trello' | 'asana' | 'custom';
export type StateType = 'unstarted' | 'started' | 'completed' | 'canceled' | 'unknown';
export type HodgeMode = 'explore' | 'build' | 'harden' | 'ship';

export interface PMState {
  id: string;
  name: string;
  type: StateType;
  color?: string;
  description?: string;
}

export interface PMIssue {
  id: string;
  title: string;
  description?: string;
  state: PMState;
  url?: string;
  acceptanceCriteria?: string[];
  labels?: string[];
  assignee?: string;
}

export interface PMTransition {
  fromMode: HodgeMode;
  toMode: HodgeMode;
  targetStateType: StateType;
  targetStateId?: string; // Override specific state ID
}

export interface PMConfig {
  tool: PMTool;
  apiKey?: string;
  teamId?: string;
  projectId?: string;
  baseUrl?: string;
}

export interface PMOverrides {
  transitions?: Record<string, string>; // e.g., "explore->build": "state-id"
  customPatterns?: Record<string, (string | RegExp)[]>; // StateType as key, patterns as strings or RegExp
  issueUrlPattern?: string;
}

export interface ConventionPattern {
  type: StateType;
  patterns: RegExp[];
  priority: number;
}

export interface PMAdapterOptions {
  config: PMConfig;
  overrides?: PMOverrides;
  cacheTimeout?: number;
}
