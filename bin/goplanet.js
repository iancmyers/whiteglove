#!/usr/bin/env node

var cli = require('../lib/cli');
cli.execute(process.argv, (paths) => {
  if (paths.length) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
