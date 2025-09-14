export const VERSION = '0.1.0-alpha.1';

export interface HodgeConfig {
  version: string;
  features?: string[];
  standards?: {
    enforce?: string[];
    recommend?: string[];
    suggest?: string[];
  };
}

// Export PM module
export * from './pm';
