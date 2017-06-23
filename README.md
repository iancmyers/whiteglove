whiteglove
==========

[![npm Version](https://img.shields.io/npm/v/whiteglove.svg)](https://www.npmjs.com/package/whiteglove) [![License](https://img.shields.io/npm/l/whiteglove.svg)](https://www.npmjs.com/package/whiteglove) [![Build Status](https://travis-ci.org/iancmyers/whiteglove.svg)](https://travis-ci.org/iancmyers/whiteglove) [![Coverage Status](https://coveralls.io/repos/github/iancmyers/whiteglove/badge.svg?branch=master)](https://coveralls.io/github/iancmyers/whiteglove?branch=master)

```bash
$ npm install -g whiteglove
```

Find the dirty tests making a mess of your test suite! `whiteglove` helps you find tests that aren't cleaning up after themselves (failing to restore stubs, polluting the global namespace) and tests that are inadvertently relying on the mess.

```
Usage: whiteglove <command> [options]

Commands:
  bisect <test> <directory>  find leaky tests affecting a target test
  iso <directory>            find tests that fail in isolation

Options:
  --runner, -r    Command used to run the test suite  [string] [default: "node"]
  --patterns, -p  Filename patterns matching your spec files
                                       [array] [default: [".js",".jsx",".node"]]
  --verbose       Output a ridiculous amount of information            [boolean]
  -h, --help      Show help                                            [boolean]
  -v, --version   Show version number                                  [boolean]

Examples:
  whiteglove bisect ./tests/foo.js ./tests
  whiteglove iso ./tests
```

### whiteglove bisect

Use `whiteglove bisect` when you have a test that passes in isolation, but fails when run with the larger test suite. The bisect function will determine which tests are affecting your target test.

You might also use it after running `whiteglove iso`, with the fails-in-isolation tests as the argument. That way, you can find the leaky tests they relied on, and fix the leaks.

### whiteglove iso

Use `whiteglove iso` to find tests that are inadvertently relying other leaky tests in order to pass.
