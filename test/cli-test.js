const cli = require('../lib/cli');
const assert = require('assert');

describe('cli', function() {
  it('finds leaky tests when they exist', (done) => {
    cli.execute([
      '','','./test/fixtures/leaky/fine.js', './test/fixtures/leaky', '-r', 'mocha'
    ], (paths) => {
      try {
        expect(paths).to.have.length(1);
        expect(paths[0]).to.match(/leaky\/leaky\.js$/)
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('handles the no leaky tests case', (done) => {
    cli.execute([
      '','','./test/fixtures/stable/fine.js', './test/fixtures/stable', '-r', 'mocha'
    ], (paths) => {
      try {
        expect(paths).to.have.length(0);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('does not report tests that are failing', (done) => {
    cli.execute([
      '','','./test/fixtures/failing/fine.js', './test/fixtures/failing', '-r', 'mocha'
    ], (paths) => {
      try {
        expect(paths).to.have.length(0);
        done();
      } catch (e) {
        done(e);
      }
    });
  })
});
