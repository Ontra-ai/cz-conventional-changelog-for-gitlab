'format cjs';

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var rightPad = require('right-pad');
var chalk = require('chalk');
const { execSync } = require('child_process');
const boxen = require('boxen');

var defaults = require('./defaults');
const LimitedInputPrompt = require('./LimitedInputPrompt');
var filter = function(array) {
  return array.filter(function(x) {
    return x;
  });
};

var filterSubject = function(subject) {
  subject = subject.trim();
  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1);
  }
  return subject;
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function(options) {
  var getFromOptionsOrDefaults = function(key) {
    return options[key] || defaults[key];
  };
  var getGitlabIssueLocation = function(location, type, scope, gitlabWithDecorators, subject) {
    switch(location) {
      case 'pre-type':
        return gitlabWithDecorators + type + scope + ': ' + subject;
        break;
      case 'pre-description':
        return type + scope + ': ' + gitlabWithDecorators + subject;
        break;
      case 'post-description':
        return type + scope + ': ' + subject + ' ' + gitlabWithDecorators;
        break;
      case 'post-body':
        return type + scope + ': ' + subject;
        break;
      default:
        return type + scope + ': ' + gitlabWithDecorators + subject;
    }
  };
  var types = getFromOptionsOrDefaults('types');

  var length = longest(Object.keys(types)).length + 1;
  var choices = map(types, function(type, key) {
    return {
      name: rightPad(key + ':', length) + ' ' + type.description,
      value: key
    };
  });

  const minHeaderWidth = getFromOptionsOrDefaults('minHeaderWidth');
  const maxHeaderWidth = getFromOptionsOrDefaults('maxHeaderWidth');

  const branchName = execSync('git branch --show-current').toString().trim();
  const gitlabIssueRegex = /(?<gitlabIssue>(\d+))-[a-z]+/;
  const matchResult = branchName.match(gitlabIssueRegex);
  const gitlabIssue =
    matchResult && matchResult.groups && matchResult.groups.gitlabIssue;
  const hasScopes =
    options.scopes &&
    Array.isArray(options.scopes) &&
    options.scopes.length > 0;
  const customScope = !options.skipScope && hasScopes && options.customScope;
  const scopes = customScope ? [...options.scopes, 'custom' ]: options.scopes;

  var getProvidedScope = function(answers) {
    return answers.scope === 'custom' ? answers.customScope : answers.scope;
  }

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function(cz, commit, testMode) {
      cz.registerPrompt('limitedInput', LimitedInputPrompt);

      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'type',
          message: "Select the type of change that you're committing:",
          choices: choices,
          default: options.defaultType
        },
        {
          type: 'input',
          name: 'gitlab',
          message:
            'Enter Gitlab issue (12345)' +
            (options.gitlabOptional ? ' (optional)' : '') +
            ':',
          when: options.gitlabMode,
          default: gitlabIssue || '',
          validate: function(gitlab) {
            return (
              (options.gitlabOptional && !gitlab) ||
              /^\d+$/.test(gitlab)
            );
          },
          filter: function(gitlab) {
            return gitlab.toUpperCase();
          }
        },
        {
          type: hasScopes ? 'list' : 'input',
          name: 'scope',
          when: !options.skipScope,
          choices: hasScopes ? scopes : undefined,
          message:
            'What is the scope of this change (e.g. component or file name): ' +
            (hasScopes ? '(select from the list)' : '(press enter to skip)'),
          default: options.defaultScope,
          filter: function(value) {
            return value.trim().toLowerCase();
          }
        },
        {
          type: 'input',
          name: 'customScope',
          when: (({ scope }) => scope === 'custom'),
          message: 'Type custom scope (press enter to skip)'
        },
        {
          type: 'limitedInput',
          name: 'subject',
          message: 'Write a short, imperative tense description of the change:',
          default: options.defaultSubject,
          maxLength: maxHeaderWidth - (options.exclamationMark ? 1 : 0),
          leadingLabel: answers => {
            const gitlab = answers.gitlab && options.gitlabLocation !== 'post-body' ? ` ${answers.gitlab}` : '';

            let scope = '';
            const providedScope = getProvidedScope(answers);
            if (providedScope && providedScope !== 'none') {
              scope = `(${providedScope})`;
            }

            return `${answers.type}${scope}:${gitlab}`;
          },
          validate: input =>
            input.length >= minHeaderWidth ||
            `The subject must have at least ${minHeaderWidth} characters`,
          filter: function(subject) {
            return filterSubject(subject);
          }
        },
        {
          type: 'input',
          name: 'body',
          message:
            'Provide a longer description of the change: (press enter to skip)\n',
          default: options.defaultBody
        },
        {
          type: 'confirm',
          name: 'isBreaking',
          message: 'Are there any breaking changes?',
          default: false
        },
        {
          type: 'confirm',
          name: 'isBreaking',
          message: 'You do know that this will bump the major version, are you sure?',
          default: false,
          when: function(answers) {
            return answers.isBreaking;
          }
        },
        {
          type: 'input',
          name: 'breaking',
          message: 'Describe the breaking changes:\n',
          when: function(answers) {
            return answers.isBreaking;
          }
        },

        {
          type: 'confirm',
          name: 'isIssueAffected',
          message: 'Does this change affect any open issues?',
          default: options.defaultIssues ? true : false,
          when: !options.gitlabMode
        },
        {
          type: 'input',
          name: 'issuesBody',
          default: '-',
          message:
            'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself:\n',
          when: function(answers) {
            return (
              answers.isIssueAffected && !answers.body && !answers.breakingBody
            );
          }
        },
        {
          type: 'input',
          name: 'issues',
          message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
          when: function(answers) {
            return answers.isIssueAffected;
          },
          default: options.defaultIssues ? options.defaultIssues : undefined
        }
      ]).then(async function(answers) {
        var wrapOptions = {
          trim: true,
          cut: false,
          newline: '\n',
          indent: '',
          width: options.maxLineWidth
        };

        // parentheses are only needed when a scope is present
        const providedScope = getProvidedScope(answers);
        var scope = providedScope ? '(' + providedScope + ')' : '';

        const addExclamationMark = options.exclamationMark && answers.breaking;
        scope = addExclamationMark ? scope + '!' : scope;

        // Get Gitlab issue prepend and append decorators
        var prepend = options.gitlabPrepend || ''
        var append = options.gitlabAppend || ''
        var gitlabWithDecorators = answers.gitlab ? prepend + answers.gitlab + append + ' ': '';

        // Hard limit this line in the validate
        const head = getGitlabIssueLocation(options.gitlabLocation, answers.type, scope, gitlabWithDecorators, answers.subject);

        // Wrap these lines at options.maxLineWidth characters
        var body = answers.body ? wrap(answers.body, wrapOptions) : false;
        if (options.gitlabMode && options.gitlabLocation === 'post-body') {
          if (body === false) {
            body = '';
          } else {
            body += "\n\n";
          }
          body += gitlabWithDecorators.trim();
        }

        // Apply breaking change prefix, removing it if already present
        var breaking = answers.breaking ? answers.breaking.trim() : '';
        breaking = breaking
          ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '')
          : '';
        breaking = breaking ? wrap(breaking, wrapOptions) : false;

        var issues = answers.issues ? wrap(answers.issues, wrapOptions) : false;

        const fullCommit = filter([head, body, breaking, issues]).join('\n\n');

        if (testMode) {
          return commit(fullCommit);
        }

        console.log();
        console.log(chalk.underline('Commit preview:'));
        console.log(boxen(chalk.green(fullCommit), { padding: 1, margin: 1 }));

        const { doCommit } = await cz.prompt([
          {
            type: 'confirm',
            name: 'doCommit',
            message: 'Are you sure that you want to commit?'
          }
        ]);

        if (doCommit) {
          commit(fullCommit);
        }
      });
    }
  };
};
