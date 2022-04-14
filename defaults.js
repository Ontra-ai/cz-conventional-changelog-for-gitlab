var conventionalCommitTypes = require('./types');

module.exports = {
  types: conventionalCommitTypes,
  gitlabMode: true,
  skipScope: false,
  customScope: false,
  maxHeaderWidth: 72,
  minHeaderWidth: 2,
  maxLineWidth: 100,
  gitlabPrefix: null,
  gitlabOptional: false,
  gitlabLocation: 'pre-description',
  gitlabPrepend: '',
  gitlabAppend: '',
  exclamationMark: false
};
