Captain Planet
==============

[![npm Version](https://img.shields.io/npm/v/goplanet.svg)](https://www.npmjs.com/package/goplanet) [![License](https://img.shields.io/npm/l/goplanet.svg)](https://www.npmjs.com/package/goplanet) [![Build Status](https://travis-ci.org/iancmyers/captain-planet.svg)](https://travis-ci.org/iancmyers/captain-planet)

Fight against the specs that are polluting your test suite! Captain Planet finds the specs that aren't cleaning up after themselves thereby contaminating the larger test suite.

```bash
$ npm install -g goplanet
```

All we need to hunt down these polluting specs is **(1)** the path to spec that passes in isolation, but fails when run with the larger test suite, **(2)** the path to your test directory, and **(3)** your test runner command (_defaults to_ `mocha`):

```bash
$ goplanet /path/to/spec.js /path/to/test/dir -r mocha
```
