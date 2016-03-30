import sinon from 'sinon';
import ExecQueue from '../src/exec-queue';
import childProcess from 'child_process';

describe('ExecQueue', () => {
  let queue;

  beforeEach(() => {
    sinon.stub(childProcess, 'exec', () => {});
    queue = new ExecQueue({ concurrency: 3 });
  });

  afterEach(() => {
    childProcess.exec.restore();
  });

  it('immediately services requests if execs are available', (done) => {
    ['1', '2', '3'].forEach(cmd => queue.enqueue(cmd));
    process.nextTick(() => {
      expect(queue.queue.length).to.equal(0);
      done();
    });
  });

  it('queues requests flooded with requests', (done) => {
    ['1', '2', '3', '4'].forEach(cmd => queue.enqueue(cmd));
    process.nextTick(() => {
      expect(queue.queue.length).to.equal(1);
      done();
    });
  });

  it('queues requests all execs are in flight', (done) => {
    ['1', '2', '3'].forEach(cmd => queue.enqueue(cmd));
    process.nextTick(() => {
      expect(queue.queue.length).to.equal(0);
      queue.enqueue('4');
      process.nextTick(() => {
        expect(queue.queue.length).to.equal(1);
        done();
      });
    });
  });
});
