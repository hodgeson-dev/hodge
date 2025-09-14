const { LinearClient } = require('@linear/sdk');

async function fetchIssue() {
  const linear = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
  });

  try {
    const issue = await linear.issue('HOD-6');
    console.log('📋 Issue: ' + issue.identifier + ' - ' + issue.title);
    console.log('📝 Description:', issue.description || 'No description');

    // Get state
    const state = await issue.state;
    console.log('🏷️  State:', state ? state.name : 'Unknown');

    // Get labels
    const labels = await issue.labels();
    if (labels.nodes.length > 0) {
      console.log('🏷️  Labels:', labels.nodes.map((l) => l.name).join(', '));
    }

    // Get comments
    const comments = await issue.comments();
    if (comments.nodes.length > 0) {
      console.log('\n💬 Comments:');
      comments.nodes.forEach((c) => {
        console.log('  -', c.body);
      });
    }
  } catch (error) {
    console.error('Error fetching issue:', error.message);
  }
}

fetchIssue();
