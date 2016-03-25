#!/usr/bin/env node

const cli = require('../lib/cli');
cli.execute(process.argv, (run) => {
  if (run || run.reportedTests().length < 1) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
