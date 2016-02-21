var optionator = require('optionator');

module.exports = optionator({
    prepend: "\n> goplanet spec.js dir [options]",
    append: "\n",
    defaults: {
        mergeRepeatedObjects: true
    },
    options: [
      {
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'Display the help menu'
      },
      {
        option: 'runner',
        alias: 'r',
        type: 'String',
        default: 'mocha',
        description: 'The test running command'
      }
    ]
});
