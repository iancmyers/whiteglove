import EventEmitter from 'events';
import os from 'os';
import ExecQueue from './exec-queue';
import * as logger from './logger';

const CONCURRENCY = os.cpus().length - 1;

class IsoFinder extends EventEmitter {
  constructor(runner) {
    super();
    this.runner = runner;
    this.queue = new ExecQueue({ concurrency: CONCURRENCY });
  }

  find(tests) {
    logger.verbose(`Starting search with concurrency of ${CONCURRENCY}`);
    logger.verbose(`Enqueuing ${tests.length} tests`);
    const { runner, queue } = this;
    tests.forEach((test) => {
      queue.enqueue(`${runner} ${test}`).then((err) => {
        if (err) {
          this.emit('failure', test);
        }
        if (!queue.size()) {
          this.emit('end');
        }
      });
    });
  }
}

export default IsoFinder;
