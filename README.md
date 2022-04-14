# cz-conventional-changelog-for-gitlab

# ⚠️ ⚠️ ⚠️ THIS IS A WIP.  NOT SUITABLE FOR PRODUCTION ⚠️ ⚠️ ⚠️ 

Part of the [commitizen](https://github.com/commitizen/cz-cli) family. Prompts for [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) standard and also prompts for a mandatory GitLab issue.

[![npm version](https://img.shields.io/npm/v/@gangster/cz-conventional-changelog-for-gitlab.svg?style=flat-square)](https://www.npmjs.org/package/@gangster/cz-conventional-changelog-for-gitlab)
[![npm downloads](https://img.shields.io/npm/dm/@gangster/cz-conventional-changelog-for-gitlab.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@gangster/cz-conventional-changelog-for-gitlab)
[![Build Status](https://img.shields.io/travis/gangster/cz-conventional-changelog-for-gitlab.svg?style=flat-square)](https://travis-ci.org/gangster/cz-conventional-changelog-for-gitlab)

## Features

- Works seamlessly with semantic-release 🚀
- Automatically detects the GitLab issue from the branch name

## Quickstart

### Installation

```bash
npm install commitizen @gangster/cz-conventional-changelog-for-gitlab
```

and then add the following to package.json:

```json
{
  "scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/@gangster/cz-conventional-changelog-for-gitlab"
    }
  }
}
```

### Usage

![Gif of terminal when using cz-conventional-changelog-for-gitlab](https://raw.githubusercontent.com/gangster/cz-conventional-changelog-for-gitlab/master/images/demo.gif)

## Configuration

Like commitizen, you can specify the configuration of cz-conventional-changelog-for-gitlab through the package.json's `config.commitizen` key, or with environment variables.

| Environment variable | package.json    | Default           | Description                                                                                                                                                             |
|----------------------|-----------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CZ_GITLAB_MODE       | gitlabMode      | true              | If this is set to true, CZ will ask for a GitLab issue and put it in the commit head. If set to false CZ will ask for the issue in the end, and can be used for GitHub. |
| CZ_MAX_HEADER_WIDTH  | maxHeaderWidth  | 72                | This limits how long a commit message head can be.                                                                                                                      |
| CZ_MIN_HEADER_WIDTH  | minHeaderWidth  | 2                 | This limits how short a commit message can be.                                                                                                                          |
| CZ_MAX_LINE_WIDTH    | maxLineWidth    | 100               | Commit message bodies are automatically wrapped. This decides how long the lines will be.                                                                               |
| CZ_SKIP_SCOPE        | skipScope       | true              | If scope should be used in commit messages.                                                                                                                             |
|                      | scopes          | undefined         | A list (JS Array) of scopes that will be available for selection. Note that adding this will change the scope field from Inquirer 'input' to 'list'.                    |
| CZ_TYPE              | defaultType     | undefined         | The default type.                                                                                                                                                       |
| CZ_SCOPE             | defaultScope    | undefined         | The default scope.                                                                                                                                                      |
| CZ_CUSTOM_SCOPE      | customScope     | false             | Whether user can provide custom scope in addition to predefined ones                                                                                                    |
| CZ_SUBJECT           | defaultSubject  | undefined         | A default subject.                                                                                                                                                      |
| CZ_BODY              | defaultBody     | undefined         | A default body.                                                                                                                                                         |
| CZ_ISSUES            | defaultIssues   | undefined         | A default issue.                                                                                                                                                        |
| CZ_GITLAB_OPTIONAL   | gitlabOptional  | false             | If this is set to true, you can leave the GITLAB field blank.                                                                                                           |
| CZ_GITLAB_PREFIX     | gitlabPrefix    | "DAZ"             | If this is set it will be will be displayed as the default GITLAB ticket prefix                                                                                         |
| CZ_GITLAB_LOCATION   | gitlabLocation  | "pre-description" | Changes position of GITLAB ID. Options: `pre-type`, `pre-description`, `post-description`, `post-body`                                                                  |
| CZ_GITLAB_PREPEND    | gitlabPrepend   | ""                | Prepends GITLAB ID with an optional decorator. e.g.: `[DAZ-1234`                                                                                                        |
| CZ_GITLAB_APPEND     | gitlabAppend    | ""                | Appends GITLAB ID with an optional decorator. e.g.: `DAZ-1234]`                                                                                                         |
| CZ_EXCLAMATION_MARK  | exclamationMark | false             | On breaking changes, adds an exclamation mark (!) after the scope, e.g.: `type(scope)!: break stuff`. When activated, reduces the effective allowed header length by 1. |

### GitLab Location Options

pre-type:
```text
1234 type(scope): commit subject
```

pre-description:
```text
type(scope): 1234 commit subject
```

post-description:
```text
type(scope): commit subject 1234
```

post-body:
```text
type(scope): commit subject

1234
```
```text
type(scope): commit subject

this is a commit body

1234
```

## Dynamic Configuration

Alternatively, if you want to create your own profile, you can use the _configurable_ approach.
Here is an example:
**./index.js**
```javascript
const custom = require('@gangster/cz-conventional-changelog-for-gitlab/configurable');
// You can do this optionally if you want to extend the commit types
const defaultTypes = require('@gangster/cz-conventional-changelog-for-gitlab/types');

module.exports = custom({
  types: {
    ...defaultTypes,
    perf: {
      description: 'Improvements that will make your code perform better',
      title: 'Performance'
    }
  },
  skipScope: false,
  scopes: ['myScope1', 'myScope2'],
  customScope: true
});
```
**./package.json**
```json
{
  "config": {
    "commitizen": {
      "path": "./index.js"
    }
  }
}
```

This example would:
* Display _"perf"_ as an extra commit type
* Ask you to add a commit scope
* Limit the scope selection to either `myScope` or `myScope2`

List of all supported configurable options when using the _configurable_ approach:

| Key             | Default           | Description                                                                                                                                                                                                                                  |
|-----------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| gitlabMode      | true              | If this is set to true, CZ will ask for a GitLab issue and put it in the commit head. If set to false CZ will ask for the issue in the end, and can be used for GitHub.                                                                      |
| maxHeaderWidth  | 72                | This limits how long a commit message head can be.                                                                                                                                                                                           |
| minHeaderWidth  | 2                 | This limits how short a commit message can be.                                                                                                                                                                                               |
| maxLineWidth    | 100               | Commit message bodies are automatically wrapped. This decides how long the lines will be.                                                                                                                                                    |
| skipScope       | true              | If scope should be used in commit messages.                                                                                                                                                                                                  |
| defaultType     | undefined         | The default type.                                                                                                                                                                                                                            |
| defaultScope    | undefined         | The default scope.                                                                                                                                                                                                                           |
| defaultSubject  | undefined         | A default subject.                                                                                                                                                                                                                           |
| defaultBody     | undefined         | A default body.                                                                                                                                                                                                                              |
| defaultIssues   | undefined         | A default issue.                                                                                                                                                                                                                             |
| gitlabPrefix    | 'DAZ'             | The default GITLAB ticket prefix that will be displayed.                                                                                                                                                                                     |
| types           | ./types.js        | A list (JS Object) of supported commit types.                                                                                                                                                                                                |
| scopes          | undefined         | A list (JS Array) of scopes that will be available for selection. Note that adding this will change the scope field from Inquirer 'input' to 'list'.                                                                                         |
| customScope     | false             | If this is set to true, users are given an option to provide custom scope aside the ones predefined in 'scopes' array. In this case a new option named 'custom' appears in the list and once chosen a prompt appears to provide custom scope |
| gitlabOptional  | false             | If this is set to true, you can leave the GITLAB field blank.                                                                                                                                                                                |
| gitlabLocation  | "pre-description" | Changes position of GITLAB ID. Options: `pre-type`, `pre-description`, `post-description`, `post-body`                                                                                                                                       |
| gitlabPrepend   | ""                | Prepends GITLAB ID with an optional decorator. e.g.: `[DAZ-1234`                                                                                                                                                                             |
| gitlabAppend    | ""                | Appends GITLAB ID with an optional decorator. e.g.: `DAZ-1234]`                                                                                                                                                                              |
| exclamationMark | false             | On breaking changes, adds an exclamation mark (!) after the scope, e.g.: `type(scope)!: break stuff`. When activated, reduces the effective allowed header length by 1.                                                                      |


### Commitlint

If using the [commitlint](https://github.com/conventional-changelog/commitlint) js library, the "maxHeaderWidth" configuration property will default to the configuration of the "header-max-length" rule instead of the hard coded value of 72. This can be ovewritten by setting the 'maxHeaderWidth' configuration in package.json or the CZ_MAX_HEADER_WIDTH environment variable.
