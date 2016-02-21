#!/usr/bin/env node

const cli = require('../lib/cli');
cli.execute(process.argv, (paths) => {
  if (paths.length) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
