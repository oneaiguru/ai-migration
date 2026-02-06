module.exports = {
  default: {
    require: ['dist/features/step_definitions/common.steps.js'],
    requireModule: [],
    format: ['progress-bar', 'html:test-results.html'],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    tags: 'not @skip',
    parallel: 1
  }
};
