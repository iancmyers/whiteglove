const cli = require('../src/cli');
const logger = require('../src/logger');
const options = require('../src/options');
const sinon = require('sinon');

describe('cli', () => {
  describe('test reporting', () => {
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

  describe('options', () => {
    beforeEach(() => {
      logger.default(logger.levels.INFO);
    });

    it('produces verbose output with --verbose', (done) => {
      sinon.spy(logger, 'verbose');
      cli.execute([
        '',
        '',
        './test/fixtures/failing/fine.js',
        './test/fixtures/failing',
        '-r', 'mocha',
        '--verbose',
      ], () => {
        expect(logger.verbose.called).to.equal(true);
        logger.verbose.restore();
        done();
      });
    });

    it('shows the help menu with -h', (done) => {
      sinon.spy(options, 'generateHelp');
      cli.execute([
        '',
        '',
        '-h',
      ], () => {
        expect(options.generateHelp.called).to.equal(true);
        options.generateHelp.restore();
        done();
      });
    });
  });

  describe('error cases', () => {
    beforeEach(() => {
      logger.default(logger.levels.INFO);
      sinon.spy(logger, 'error');
    });

    afterEach(() => {
      logger.error.restore();
    });

    it('should error when there are fewer than 2 positional arguments', (done) => {
      cli.execute(['', '', './test/fixtures/failing/fine.js'], () => {
        expect(logger.error.calledOnce).to.equal(true);
        done();
      });
    });
  });
});
