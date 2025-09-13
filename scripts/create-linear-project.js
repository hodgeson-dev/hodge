#!/usr/bin/env node

/**
 * Create the Hodge project in Linear with 7 weekly epics
 */

const { LinearClient } = require('@linear/sdk');
const dotenv = require('dotenv');

dotenv.config();

const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY
});

// Helper function to get or create a label
async function getOrCreateLabel(teamId, labelName, color = '#6B46C1') {
  try {
    // Try to find existing label
    const labels = await linear.issueLabels({
      filter: {
        team: { id: { eq: teamId } },
        name: { eq: labelName }
      }
    });
    
    if (labels.nodes.length > 0) {
      return labels.nodes[0].id;
    }
    
    // Create new label if not found
    const label = await linear.createIssueLabel({
      teamId,
      name: labelName,
      color
    });
    
    return label.issueLabel.id;
  } catch (error) {
    console.warn(`⚠️ Could not create/find label "${labelName}": ${error.message}`);
    return null;
  }
}

async function createHodgeProject() {
  try {
    // Get the configured team name
    const teamName = process.env.LINEAR_TEAM_NAME;
    
    if (!teamName) {
      console.error('❌ LINEAR_TEAM_NAME environment variable not set');
      console.error('\nTo fix this:');
      
      // List available teams to help user
      const teams = await linear.teams();
      if (teams.nodes.length > 0) {
        console.error('\nAvailable teams in your Linear workspace:');
        teams.nodes.forEach(t => {
          console.error(`  - ${t.name}`);
        });
        console.error('\nAdd to your .env file:');
        console.error(`LINEAR_TEAM_NAME="${teams.nodes[0].name}"`);
      } else {
        console.error('No teams found. Please check your Linear API key.');
      }
      process.exit(1);
    }
    
    // Find the specified team
    const teams = await linear.teams();
    const team = teams.nodes.find(t => t.name === teamName);
    
    if (!team) {
      console.error(`❌ Team "${teamName}" not found`);
      console.error('\nAvailable teams:');
      teams.nodes.forEach(t => {
        console.error(`  - ${t.name}`);
      });
      process.exit(1);
    }
    
    console.log(`Using team: ${team.name}`);
    
    // Create the Hodge project
    const project = await linear.createProject({
      teamIds: [team.id],
      name: 'Hodge 0.1.0 Alpha',
      description: 'Initial alpha release: Freedom to explore, discipline to build, confidence to ship',
      targetDate: new Date('2025-03-01'), // 7 weeks from now
      state: 'started'
    });
    
    console.log(`\n✅ Created project: Hodge 0.1.0 Alpha`);
    console.log(`🔗 View project: https://linear.app/${team.key}/project/${project.project.slugId}`);
    
    // Get states for issues
    const states = await team.states();
    const todoState = states.nodes.find(s => s.name === 'Todo' || s.name === 'Backlog');
    
    if (!todoState) {
      throw new Error('Todo/Backlog state not found');
    }
    
    // Create labels
    const labelIds = [];
    const labels = ['hodge', 'cli', 'ai-integration', 'typescript'];
    for (const labelName of labels) {
      const labelId = await getOrCreateLabel(team.id, labelName);
      if (labelId) {
        labelIds.push(labelId);
      }
    }
    
    // Define the 7 weekly epics with their stories
    const weeklyEpics = [
      {
        title: 'Week 1: Foundation & CLI',
        description: 'Basic CLI structure with core commands and local testing',
        stories: [
          {
            title: 'Set up Commander.js CLI framework',
            description: 'Initialize the CLI with Commander.js',
            tasks: [
              'Configure Commander.js',
              'Set up command structure',
              'Add help documentation'
            ]
          },
          {
            title: 'Implement hodge init command',
            description: 'One-question setup for new projects',
            tasks: [
              'Create init command handler',
              'Generate .hodge directory structure',
              'Create hodge.json config',
              'Add validation'
            ]
          },
          {
            title: 'Set up local testing with npm link',
            description: 'Enable local development testing',
            tasks: [
              'Configure npm link',
              'Create test harness script',
              'Document testing process'
            ]
          }
        ]
      },
      {
        title: 'Week 2: Three-Mode System',
        description: 'Explore, Build, and Harden modes with context building',
        stories: [
          {
            title: 'Implement ModeManager class',
            description: 'Core mode management system',
            tasks: [
              'Create ModeManager class',
              'Implement mode transitions',
              'Add mode validation'
            ]
          },
          {
            title: 'Create explore/build/harden commands',
            description: 'Implement the three core mode commands',
            tasks: [
              'Implement explore command',
              'Implement build command',
              'Implement harden command',
              'Add progressive standards enforcement'
            ]
          },
          {
            title: 'Build ContextBuilder',
            description: 'Context awareness system',
            tasks: [
              'Create ContextBuilder class',
              'Add mode awareness',
              'Create prompt templates'
            ]
          }
        ]
      },
      {
        title: 'Week 3: Learning Engine',
        description: 'Pattern extraction and standards detection',
        stories: [
          {
            title: 'Implement PatternLearner class',
            description: 'Extract patterns from code',
            tasks: [
              'Create PatternLearner class',
              'Add AST parsing',
              'Implement pattern hashing',
              'Add pattern normalization'
            ]
          },
          {
            title: 'Build StandardsEngine',
            description: 'Detect and enforce standards',
            tasks: [
              'Create StandardsEngine class',
              'Add three enforcement levels',
              'Auto-detect from package.json',
              'Implement hodge learn command'
            ]
          }
        ]
      },
      {
        title: 'Week 4: AI Integration',
        description: 'Connect with AI tools with mock mode for testing',
        stories: [
          {
            title: 'Create base AIAdapter class',
            description: 'Foundation for AI integrations',
            tasks: [
              'Design adapter interface',
              'Add mock mode',
              'Create response handling'
            ]
          },
          {
            title: 'Implement Claude integration',
            description: 'Claude CLI and API modes',
            tasks: [
              'Create ClaudeAdapter',
              'Add CLI mode',
              'Add API mode',
              'Implement manual/clipboard mode'
            ]
          },
          {
            title: 'Add Cursor and Aider integration',
            description: 'Additional AI tool support',
            tasks: [
              'Create CursorAdapter',
              'Create AiderAdapter',
              'Test integrations'
            ]
          }
        ]
      },
      {
        title: 'Week 5: Warp Code Integration',
        description: 'Deep integration with Warp terminal and workflows',
        stories: [
          {
            title: 'Create WarpCodeAdapter',
            description: 'Warp terminal integration',
            tasks: [
              'Create adapter class',
              'Add terminal detection',
              'Optimize output for Warp blocks'
            ]
          },
          {
            title: 'Build workflow generation',
            description: 'Generate Warp workflows',
            tasks: [
              'Create workflow templates',
              'Add hodge warp setup command',
              'Generate parameterized workflows',
              'Enable workflow sharing'
            ]
          }
        ]
      },
      {
        title: 'Week 6: Advanced Features',
        description: 'Decision tracking, pattern reuse, test generation',
        stories: [
          {
            title: 'Implement hodge decide command',
            description: 'Decision tracking system',
            tasks: [
              'Create decide command',
              'Add decision storage',
              'Build decision UI'
            ]
          },
          {
            title: 'Add pattern reuse system',
            description: 'Reuse learned patterns',
            tasks: [
              'Implement --like flag',
              'Add pattern matching',
              'Create pattern library'
            ]
          },
          {
            title: 'Build test generation',
            description: 'Auto-generate tests',
            tasks: [
              'Create test templates',
              'Add test generation logic',
              'Integrate with existing test runners'
            ]
          }
        ]
      },
      {
        title: 'Week 7: Polish & Release',
        description: 'Documentation, testing, and NPM publishing',
        stories: [
          {
            title: 'Write comprehensive documentation',
            description: 'Complete docs for all features',
            tasks: [
              'Write API documentation',
              'Create user guides',
              'Add examples'
            ]
          },
          {
            title: 'Add comprehensive tests',
            description: 'Unit and integration tests',
            tasks: [
              'Write unit tests',
              'Create integration tests',
              'Set up CI/CD'
            ]
          },
          {
            title: 'Publish to NPM',
            description: 'Release v0.1.0',
            tasks: [
              'Final testing',
              'Create release notes',
              'Publish to NPM',
              'Create announcement'
            ]
          }
        ]
      }
    ];
    
    // Create epics and stories
    console.log('\n📂 Creating weekly epics...\n');
    
    for (const [index, epicData] of weeklyEpics.entries()) {
      // Create epic
      const epicPayload = await linear.createIssue({
        teamId: team.id,
        projectId: project.project.id,
        title: epicData.title,
        description: epicData.description,
        stateId: todoState.id,
        priority: 2, // High priority
        labelIds: labelIds,
      });
      
      const epic = await epicPayload.issue;
      console.log(`✅ Created Epic ${index + 1}: ${epicData.title}`);
      
      // Create stories under epic
      for (const story of epicData.stories) {
        const storyPayload = await linear.createIssue({
          teamId: team.id,
          projectId: project.project.id,
          parentId: epic?.id,
          title: story.title,
          description: story.description,
          stateId: todoState.id,
          priority: 3, // Normal priority
          labelIds: labelIds,
        });
        
        const storyIssue = await storyPayload.issue;
        console.log(`  📋 ${story.title}`);
        
        // Create tasks under story
        if (story.tasks && story.tasks.length > 0) {
          for (const task of story.tasks) {
            await linear.createIssue({
              teamId: team.id,
              projectId: project.project.id,
              parentId: storyIssue?.id,
              title: task,
              stateId: todoState.id,
            });
          }
          console.log(`     ✓ Added ${story.tasks.length} tasks`);
        }
      }
      console.log(''); // Empty line between epics
    }
    
    console.log(`\n📊 Project Summary:`);
    console.log(`  - Project: Hodge 0.1.0 Alpha`);
    console.log(`  - 7 Weekly Epics created`);
    console.log(`  - ~21 Stories created`);
    console.log(`  - ~60+ Tasks created`);
    console.log(`  - Target completion: March 1, 2025`);
    
    return project;
  } catch (error) {
    console.error('❌ Failed to create project:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  if (!process.env.LINEAR_API_KEY) {
    console.error('❌ LINEAR_API_KEY environment variable not set');
    console.error('\nTo set it:');
    console.error('1. Get your API key from: https://linear.app/settings/api');
    console.error('2. Add to your .env file: LINEAR_API_KEY=your_key_here');
    process.exit(1);
  }
  
  // Note: LINEAR_TEAM_NAME check happens inside createHodgeProject()
  // This allows us to list available teams first
  
  console.log('🚀 Creating Hodge project in Linear...\n');
  await createHodgeProject();
}

main();