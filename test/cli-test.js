const cli = require('../lib/cli');

describe('cli', () => {
  it('finds leaky tests when they exist', (done) => {
    cli.execute([
      '', '', './test/fixtures/leaky/fine.js', './test/fixtures/leaky', '-r', 'mocha',
    ], (run) => {
      try {
        expect(run.reportedTests()).to.have.length(1);
        expect(run.reportedTests()[0]).to.match(/leaky\/leaky\.js$/);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('handles the no leaky tests case', (done) => {
    cli.execute([
      '', '', './test/fixtures/stable/fine.js', './test/fixtures/stable', '-r', 'mocha',
    ], (run) => {
      try {
        expect(run.reportedTests()).to.have.length(0);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('does not report tests that are failing', (done) => {
    cli.execute([
      '', '', './test/fixtures/failing/fine.js', './test/fixtures/failing', '-r', 'mocha',
    ], (run) => {
      try {
        expect(run.reportedTests()).to.have.length(0);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
