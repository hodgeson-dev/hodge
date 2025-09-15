# Approach 1: Minimal Claude-Only Integration

## Quick Prototype

```typescript
// Add to src/commands/init.ts

private async checkAndOfferClaudeIntegration(
  projectInfo: ProjectInfo,
  hodgePath: string
): Promise<void> {
  // Only offer if Claude is detected but integration not installed
  if (!projectInfo.detectedTools.hasClaudeCode) {
    return;
  }

  const integrationPath = path.join(hodgePath, 'integrations', 'claude');
  const hasIntegration = await fs.pathExists(integrationPath);

  if (hasIntegration) {
    console.log(chalk.gray('   ✓ Hodge-Claude integration already installed'));
    return;
  }

  // Offer to install
  const shouldInstall = await confirm({
    message: 'Install Hodge integration for Claude Code?',
    default: true,
  });

  if (!shouldInstall) {
    console.log(chalk.gray('   Skipped Claude integration (install later with: hodge integrations add claude)'));
    return;
  }

  // Install the integration
  await this.installClaudeIntegration(hodgePath);
  console.log(chalk.green('   ✓ Claude integration installed successfully!'));
}

private async installClaudeIntegration(hodgePath: string): Promise<void> {
  const integrationPath = path.join(hodgePath, 'integrations', 'claude');
  await fs.ensureDir(integrationPath);

  // Create integration README
  const readmeContent = `# Hodge Integration for Claude Code

This integration enhances Claude's understanding of your Hodge workflow.

## Available Context

Claude can now access and understand:
- \`.hodge/standards.md\` - Your project's coding standards
- \`.hodge/decisions.md\` - Architectural decisions history
- \`.hodge/features/\` - Feature exploration and implementation
- \`.hodge/patterns/\` - Extracted code patterns

## Suggested Workflow

1. **Explore**: Start with \`hodge explore <feature>\`
2. **Ask Claude**: "Help me implement [feature] following Hodge standards"
3. **Build**: Use \`hodge build\` to structure implementation
4. **Ship**: Complete with \`hodge ship\` for git integration

## Claude Instructions

When working on this project, Claude should:
- Reference standards in \`.hodge/standards.md\`
- Check decisions in \`.hodge/decisions.md\` before proposing changes
- Use patterns from \`.hodge/patterns/\` when applicable
- Follow the explore → build → ship workflow

## Tips

- Claude can read all files in \`.hodge/\` directory
- Ask Claude to "follow Hodge standards" for consistent code
- Use "check Hodge decisions" to ensure architectural alignment
`;

  await fs.writeFile(
    path.join(integrationPath, 'README.md'),
    readmeContent
  );

  // Add reference to CLAUDE.md if it exists
  const claudeMdPath = path.join(this.rootPath, 'CLAUDE.md');
  if (await fs.pathExists(claudeMdPath)) {
    const existingContent = await fs.readFile(claudeMdPath, 'utf-8');

    // Only add if not already referenced
    if (!existingContent.includes('.hodge/integrations/claude')) {
      const appendContent = `

## Hodge Integration

This project uses Hodge for development workflow. See \`.hodge/integrations/claude/README.md\` for integration details.
`;
      await fs.appendFile(claudeMdPath, appendContent);
    }
  }
}
```

## Integration Files Structure

```
.hodge/
├── integrations/
│   └── claude/
│       ├── README.md          # Main integration doc
│       ├── workflow.md         # Hodge workflow guide
│       └── context-usage.md   # How to use Hodge context
```

## User Experience

```
$ hodge init

🎉 Hodge initialized successfully!

📁 Created structure:
   .hodge/
   ├── config.json
   ├── standards.md
   ├── decisions.md
   └── ...

📝 Claude Code detected!
   CLAUDE.md found. Hodge context files in .hodge/ are available to Claude.

? Install Hodge integration for Claude Code? (Y/n) › Y

   ✓ Claude integration installed successfully!
   See .hodge/integrations/claude/README.md for usage tips

🚀 Next steps:
   hodge explore <feature>  # Start exploring a new feature
   hodge status              # Check current status
```

## Benefits
- Minimal changes to existing code
- Clear value proposition
- Non-intrusive (just adds helpful docs)
- Easy to understand and maintain
- Can be extended later