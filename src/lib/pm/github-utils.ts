/**
 * GitHub PM Adapter Utility Functions
 * HODGE-377.5: Extracted from github-adapter.ts to reduce file length
 */

import type { PMIssue, StateType } from './types.js';

/**
 * Convert GitHub issue to PMIssue format
 * Helper to reduce duplication in epic/story creation
 */
export function convertGitHubIssueToPMIssue(issue: {
  number: number;
  title: string;
  state?: string;
  body?: string | null;
  html_url: string;
}): PMIssue {
  return {
    id: issue.number.toString(),
    title: issue.title,
    state: {
      id: issue.state ?? 'open',
      name: issue.state === 'closed' ? 'Closed' : 'Open',
      type: issue.state === 'closed' ? ('completed' as StateType) : ('started' as StateType),
    },
    description: issue.body ?? '',
    url: issue.html_url,
  };
}

/**
 * Update epic body with links to stories
 * Helper to reduce function length in createEpicWithStories
 */
export async function updateEpicWithStoryLinks(
  octokit: {
    issues: {
      update: (params: {
        owner: string;
        repo: string;
        issue_number: number;
        body: string;
      }) => Promise<unknown>;
    };
  },
  owner: string,
  repo: string,
  epicIssueNumber: number,
  epicDescription: string,
  stories: PMIssue[]
): Promise<void> {
  const storyLinks = stories.map((story) => `- [ ] #${story.id} - ${story.title}`).join('\n');
  const updatedBody = `${epicDescription}\n\n## Stories\n${storyLinks}`;

  await octokit.issues.update({
    owner,
    repo,
    issue_number: epicIssueNumber,
    body: updatedBody,
  });
}
