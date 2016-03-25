import { exec } from 'child_process';

class ExecQueue {
  constructor({ concurrency }) {
    this.queue = [];
    this.inFlight = 0;
    this.concurrency = concurrency;
  }

  size() {
    return this.queue.length + this.inFlight;
  }

  service() {
    if (!this.queue.length) return;
    const { cmd, resolve } = this.queue.shift();
    this.inFlight += 1;
    exec(cmd, (err) => {
      this.inFlight -= 1;
      resolve(err);
      this.service();
    });
  }

  enqueue(cmd) {
    return new Promise((resolve) => {
      this.queue.push({ cmd, resolve });
      if (this.queue.length < this.concurrency) {
        process.nextTick(() => this.service());
      }
    });
  }
}

export default ExecQueue;
