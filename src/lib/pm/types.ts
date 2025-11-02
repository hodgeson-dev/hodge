/**
 * PM Tool Integration Types
 */

export type PMTool = 'local' | 'linear' | 'github' | 'jira' | 'trello' | 'asana' | 'custom';
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
  enabled?: boolean; // Master switch for PM integration (HODGE-377.1)
  tool: PMTool;
  apiKey?: string;
  teamId?: string; // Required for Linear
  projectId?: string;
  baseUrl?: string;
  statusMap?: Record<string, string>; // Mode to PM state mapping
  verbosity?: 'minimal' | 'normal' | 'detailed' | 'essential';
  queueOfflineRequests?: boolean; // Graceful degradation (HODGE-377.1)
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

export interface ShipContext {
  feature: string;
  commitHash?: string;
  commitMessage?: string;
  branch?: string;
  filesChanged?: number;
  linesAdded?: number;
  linesRemoved?: number;
  testsResults?: { passed: number; total: number };
  patterns?: string[];
  coverage?: number;
  hodgeVersion?: string;
}
