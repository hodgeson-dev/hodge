/**
 * Local ESLint rules for Hodge project
 *
 * These rules are project-specific and NOT published to npm.
 * They enforce patterns discovered through production issues.
 *
 * Context:
 * - HODGE-341.5 - Fixed persistent timeout issues caused by Date.now()
 * - HODGE-366 - Fixed test isolation violations from process.chdir()
 */

'use strict';

module.exports = {
  'no-process-chdir-in-tests': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow process.chdir() in test files to ensure test isolation',
        category: 'Best Practices',
        recommended: true,
      },
      messages: {
        noProcessChdir:
          'Avoid process.chdir() in tests. Use basePath parameter in command constructors instead to ensure proper test isolation and prevent race conditions in parallel execution.',
      },
      schema: [],
    },

    create(context) {
      // Only apply to test files
      const filename = context.getFilename();
      const isTestFile = /\.(test|spec)\.ts$/.test(filename) || filename.includes('/test/');

      if (!isTestFile) {
        return {};
      }

      return {
        // Detect: process.chdir()
        CallExpression(node) {
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.object.name === 'process' &&
            node.callee.property.name === 'chdir'
          ) {
            context.report({
              node,
              messageId: 'noProcessChdir',
            });
          }
        },
      };
    },
  },

  'no-date-now-in-tests': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow Date.now() for directory naming in test files',
        category: 'Best Practices',
        recommended: true,
      },
      messages: {
        noDateNow:
          'Avoid Date.now() for directory naming in tests. Use TempDirectoryFixture instead to prevent race conditions in parallel execution.',
      },
      schema: [],
    },

    create(context) {
      // Only apply to test files
      const filename = context.getFilename();
      const isTestFile = /\.(test|spec)\.ts$/.test(filename) || filename.includes('/test/');

      if (!isTestFile) {
        return {};
      }

      return {
        // Detect: Date.now()
        CallExpression(node) {
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.object.name === 'Date' &&
            node.callee.property.name === 'now'
          ) {
            // Check if it's being used in string concatenation or template literal (typical pattern for directory naming)
            const parent = node.parent;
            const isInTemplateLiteral = parent && parent.type === 'TemplateLiteral';
            const isInBinaryExpression =
              parent && parent.type === 'BinaryExpression' && parent.operator === '+';
            const isInTaggedTemplate = parent && parent.type === 'TaggedTemplateExpression';

            // Check if it's in a variable declarator that looks like directory naming
            // (contains "dir", "path", "temp", "test")
            const isInDirRelatedVar =
              parent &&
              parent.type === 'VariableDeclarator' &&
              parent.id &&
              parent.id.name &&
              /dir|path|temp|test/i.test(parent.id.name);

            if (
              isInTemplateLiteral ||
              isInBinaryExpression ||
              isInTaggedTemplate ||
              isInDirRelatedVar
            ) {
              context.report({
                node,
                messageId: 'noDateNow',
              });
            }
          }
        },
      };
    },
  },
};
