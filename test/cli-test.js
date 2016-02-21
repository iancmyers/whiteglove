const cli = require('../lib/cli');
const assert = require('assert');

describe('cli', function() {
  this.timeout(10000);

  it('finds leaky tests when they exist', (done) => {
    cli.execute([
      '','','./test/fixtures/leaky/fine.js', './test/fixtures/leaky', '-r', 'mocha'
    ], (paths) => {
      assert(paths.length === 1);
      assert(/leaky\/leaky\.js$/.test(paths[0]))
      done();
    });
  });

  it('handles the no leaky tests case', (done) => {
    cli.execute([
      '','','./test/fixtures/stable/fine.js', './test/fixtures/stable', '-r', 'mocha'
    ], (paths) => {
      assert(paths.length === 0);
      done();
    });
  });
});
