import yargs from 'yargs';

export default function get(argv) {
  return yargs
    .usage('Usage: $0 <command> [options]')
    .demand(1, 'must provide a valid command')
    .option('runner', {
      alias: 'r',
      default: 'node',
      describe: 'Command used to run the test suite',
      type: 'string',
      global: true,
    })
    .option('patterns', {
      alias: 'p',
      default: ['.js', '.jsx', '.node'],
      describe: 'Filename patterns matching your spec files',
      type: 'array',
      global: true,
    })
    .option('verbose', {
      describe: 'Output a ridiculous amount of information',
      type: 'boolean',
      global: true,
    })
    .command('bisect <test> <directory>', 'find leaky tests affecting a target test')
    .example('$0 bisect ./tests/foo.js ./tests')
    .command('iso <directory>', 'find tests that fail in isolation')
    .example('$0 iso ./tests')
    .version()
    .help()
    .showHelpOnFail(false, 'Specify --help,-h for available options')
    .alias('h', 'help')
    .alias('v', 'version')
    .strict()
    .parse(argv.slice(2));
}
