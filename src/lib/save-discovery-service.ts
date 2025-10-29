import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * SavedContext represents a discovered saved session
 */
export interface SavedContext {
  name: string;
  path: string;
  feature: string;
  mode: string;
  timestamp: string;
  summary: string;
}

/**
 * SaveDiscoveryService handles discovery and formatting of saved Hodge contexts
 * Extracted from ContextCommand to reduce file length (HODGE-363 refactoring)
 */
export class SaveDiscoveryService {
  private readonly basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Discover all saved contexts in .hodge/saves directory
   * @returns Array of saved contexts sorted by timestamp (most recent first)
   */
  async discoverSaves(): Promise<SavedContext[]> {
    const savesDir = path.join(this.basePath, '.hodge', 'saves');

    try {
      const dirs = await fs.readdir(savesDir);
      const saves: SavedContext[] = [];

      for (const dir of dirs) {
        const contextPath = path.join(savesDir, dir, 'context.json');

        try {
          const contextData = await fs.readFile(contextPath, 'utf-8');
          const context = JSON.parse(contextData) as {
            feature?: string;
            mode?: string;
            timestamp?: string;
            session?: { keyAchievements?: string[] };
            nextPhase?: string;
          };

          saves.push({
            name: dir,
            path: path.join(savesDir, dir),
            feature: context.feature ?? 'unknown',
            mode: context.mode ?? 'unknown',
            timestamp: context.timestamp ?? 'unknown',
            summary: context.session?.keyAchievements?.[0] ?? context.nextPhase ?? '',
          });
        } catch {
          // Skip invalid saves
        }
      }

      // Sort by timestamp (most recent first)
      saves.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      return saves;
    } catch {
      return [];
    }
  }

  /**
   * Format timestamp as human-readable "time ago" string
   * @param timestamp ISO timestamp string
   * @returns Human-readable time ago (e.g., "2 hours ago", "3 days ago")
   */
  formatTimeAgo(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      // Handle invalid dates (NaN)
      if (isNaN(diffMs)) {
        return 'recently';
      }

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      }
    } catch {
      return 'recently';
    }
  }
}
