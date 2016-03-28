import EventEmitter from 'events';
import chunk from 'chunk';
import os from 'os';
import ExecQueue from './exec-queue';
import { verbose } from './logger';

const CONCURRENCY = os.cpus().length - 1;

class BisectFinder extends EventEmitter {
  constructor(runner, test) {
    super();
    this.runner = runner;
    this.test = test;
    this.queue = new ExecQueue({ concurrency: CONCURRENCY });
  }

  find(tests) {
    verbose(`Starting search with concurrency of ${CONCURRENCY}`);
    this.execute(tests);
  }

  execute(tests) {
    const { runner, test, queue } = this;
    const chunks = chunk(tests, Math.ceil(tests.length / CONCURRENCY));
    chunks.forEach((list) => {
      queue.enqueue(`${runner} ${list.join(' ')} ${test}`).then((err) => {
        if (err) {
          this.emit('failure', list);
          if (list.length > 1) { this.execute(list); }
        }
        if (!queue.size()) {
          this.emit('end');
        }
      });
    });
  }
}

export default BisectFinder;
