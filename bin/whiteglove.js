#!/usr/bin/env node

/* eslint import/no-unresolved:0 */
const cli = require('../lib/cli');
cli.execute(process.argv, (run) => {
  if (!run || run && run.reportedTests().length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
