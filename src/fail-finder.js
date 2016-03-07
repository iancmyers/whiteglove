import EventEmitter from 'events';
import chunk from 'chunk';
import os from 'os';
import { exec } from 'child_process';
import { verbose } from './logger';

class FailFinder extends EventEmitter {
  constructor(runner, test) {
    super();
    this.runner = runner;
    this.test = test;
    this.concurrency = os.cpus().length;
    this.execCount = 0;
  }

  find(tests) {
    verbose(`Starting search with concurrency of ${this.concurrency}`);
    this.execute(tests);
  }

  execute(tests) {
    const { runner, test, concurrency } = this;
    const chunks = chunk(tests, Math.ceil(tests.length / concurrency));
    this.execCount += chunks.length;

    chunks.forEach((list) => {
      exec(`${runner} ${list.join(' ')} ${test}`, (err) => {
        this.execCount -= 1;
        if (err) {
          this.emit('failure', list);
          if (list.length > 1) { this.execute(list); }
        }
        if (!this.execCount) { this.emit('end'); }
      });
    });
  }
}

export default FailFinder;
