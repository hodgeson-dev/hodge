const { LinearClient } = require('@linear/sdk');

async function updateIssue() {
  const linear = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
  });

  try {
    // Add decision comment
    const comment = `## ✅ Hodge Decision Made
- Date: 2025-09-13
- Chosen approach: Watch Mode with Auto-linking
- Rationale: Optimal DX with auto-rebuild, TypeScript integration
- Next step: Ready for /build`;

    await linear.createComment({
      issueId: 'HOD-11',
      body: comment,
    });

    console.log('✅ Decision comment added to HOD-11');

    // Try to add label
    try {
      const labels = await linear.issueLabels();
      const decidedLabel = labels.nodes.find((l) => l.name === 'hodge-decided');

      if (decidedLabel) {
        const issue = await linear.issue('HOD-11');
        const currentLabels = await issue.labels();
        const labelIds = currentLabels.nodes.map((l) => l.id);

        if (!labelIds.includes(decidedLabel.id)) {
          labelIds.push(decidedLabel.id);
          await linear.updateIssue(issue.id, { labelIds });
          console.log('✅ Added hodge-decided label');
        }
      } else {
        console.log('ℹ️  hodge-decided label not found, skipping label update');
      }
    } catch (e) {
      console.log('ℹ️  Could not update labels:', e.message);
    }
  } catch (error) {
    console.error('Error updating issue:', error.message);
  }
}

updateIssue();
