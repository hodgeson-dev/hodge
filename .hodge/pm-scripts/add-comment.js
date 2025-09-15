#!/usr/bin/env node
/**
 * Add Comment to Linear Issue
 * Usage: node add-comment.js <issue-id> <comment>
 */
'use strict';

const { LINEAR_API_KEY } = process.env;

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY environment variable is required');
  process.exit(1);
}

const issueId = process.argv[2];
const comment = process.argv.slice(3).join(' ') || process.argv[3];

if (!issueId || !comment) {
  console.error('Usage: node add-comment.js <issue-id> <comment>');
  console.error('Example: node add-comment.js HOD-20 "Decision made: using lightweight pattern"');
  process.exit(1);
}

async function addComment() {
  try {
    const { LinearClient } = require('@linear/sdk');
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

    // Create comment on the issue
    await linear.createComment({
      issueId: issueId,
      body: comment,
    });

    console.log(`✅ Comment added to ${issueId}`);
  } catch (error) {
    console.error('❌ Error adding comment:', error.message);
    process.exit(1);
  }
}

addComment();
