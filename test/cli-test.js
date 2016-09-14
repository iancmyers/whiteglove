const execute = require('../src/cli').default;
const logger = require('../src/logger');
const sinon = require('sinon');

describe('whiteglove', () => {
  describe('bisect', () => {
    it('finds leaky tests', (done) => {
      execute([
        '', '', 'bisect', './test/fixtures/leaky/fine.js', './test/fixtures/leaky', '-r', 'mocha',
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
      execute([
        '', '', 'bisect', './test/fixtures/stable/fine.js', './test/fixtures/stable', '-r', 'mocha',
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
      execute([
        '',
        '',
        'bisect',
        './test/fixtures/failing/fine.js',
        './test/fixtures/failing',
        '-r',
        'mocha',
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

  describe('iso', () => {
    it('finds failing tests', (done) => {
      execute([
        '',
        '',
        'iso',
        './test/fixtures/failing',
        '-r',
        'mocha',
      ], (run) => {
        try {
          expect(run.reportedTests()).to.have.length(1);
          expect(run.reportedTests()[0]).to.match(/failing\/failing\.js$/);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('does not report leaky tests', (done) => {
      execute([
        '',
        '',
        'iso',
        './test/fixtures/leaky',
        '-r',
        'mocha',
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
      logger.level('info');
    });

    it('produces verbose output with --verbose', (done) => {
      sinon.spy(logger, 'verbose');
      execute([
        '',
        '',
        'bisect',
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
  });
});
