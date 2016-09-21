#!/usr/bin/env node

/* eslint import/no-unresolved:0 no-mixed-operators:0 */
const execute = require('../lib/cli').default;

execute(process.argv, (run) => {
  if (!run || run && run.reportedTests().length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
