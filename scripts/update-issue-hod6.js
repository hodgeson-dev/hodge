const { LinearClient } = require('@linear/sdk');

async function updateIssue() {
  const linear = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
  });

  try {
    // Add decision comment
    const comment = `## ✅ Hodge Decision Made
- Date: 2025-09-13
- Chosen approach: Smart Context-Aware Init
- Rationale: Truly minimal (0-1 questions), comprehensive auto-detection including project name
- Next step: Ready for /build`;

    await linear.createComment({
      issueId: 'HOD-6',
      body: comment,
    });

    console.log('✅ Decision comment added to HOD-6');
  } catch (error) {
    console.error('Error updating issue:', error.message);
  }
}

updateIssue();
