whiteglove
==========

[![npm Version](https://img.shields.io/npm/v/whiteglove.svg)](https://www.npmjs.com/package/whiteglove) [![License](https://img.shields.io/npm/l/whiteglove.svg)](https://www.npmjs.com/package/whiteglove) [![Build Status](https://travis-ci.org/iancmyers/whiteglove.svg)](https://travis-ci.org/iancmyers/whiteglove) [![Coverage Status](https://coveralls.io/repos/github/iancmyers/whiteglove/badge.svg?branch=master)](https://coveralls.io/github/iancmyers/whiteglove?branch=master)

Find the dirty tests making a mess of your test suite! `whiteglove` finds tests that aren't cleaning up after themselves thereby contaminating the larger test suite.

```bash
$ npm install -g whiteglove
```

All we need to hunt down these polluting specs is **(1)** the path to spec that passes in isolation, but fails when run with the larger test suite, **(2)** the path to your test directory, and **(3)** your test runner command (_defaults to_ `node`):

```bash
$ whiteglove /path/to/spec.js /path/to/test/dir -r mocha
```

You can also specify a filename matcher to filter out non-test files (_defaults to_ `.js`):

```bash
$ whiteglove /path/to/spec.js /path/to/test/dir -r mocha -p .jsx -p .js
```

And here's the full list of available options:

```bash
whiteglove spec.js dir [options]

  -r, --runner String      Command used to run the test suite - default: node
  -p, --patterns [String]  Filename patterns matching your spec files - default: ['.js']
  --verbose                Output a ridiculous amount of information
  -h, --help               Display this helpful help menu
```
