const optionator = require('optionator');

module.exports = optionator({
  prepend: 'whiteglove spec.js dir [options]',
  defaults: {
    mergeRepeatedObjects: true,
    concatRepeatedArrays: true,
  },
  options: [
    {
      option: 'runner',
      alias: 'r',
      type: 'String',
      default: 'node',
      description: 'Command used to run the test suite',
    },
    {
      option: 'patterns',
      alias: 'p',
      type: '[String]',
      default: '[\'.js\']',
      description: 'Filename patterns matching your spec files',
    },
    {
      option: 'verbose',
      type: 'Boolean',
      description: 'Output a ridiculous amount of information',
    },
    {
      option: 'help',
      alias: 'h',
      type: 'Boolean',
      description: 'Display this helpful help menu',
    },
  ],
});
