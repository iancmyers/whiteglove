"use strict";
const path = require('path');
const fs = require('fs');
const walk = require('recursive-readdir');
const chunk = require('chunk');
const chalk = require('chalk');
const exec = require('child_process').exec;
const spinner = require('char-spinner');
const options = require('./options');
const logger = require('./logger');

let waiting;

function getAllTestPaths(dir, patterns) {
  return new Promise((resolve, reject) => {
    const ignores = ignoreFileFunction(patterns);
    walk(dir, [ignores], function (err, paths) {
      if(err) {
        reject(err);
      } else {
        resolve(paths);
      }
    });
  });
}

function ignoreFileFunction(patterns) {
  const regexps = patterns.map(pattern => new RegExp(pattern));
  return function(file) {
    return !regexps.some(regexp => regexp.test(file))
  }
}

function bisectPaths(runner, spec, paths) {
  return new Promise((resolve) => {
    const resolvedValues = [];
    let execCount = 0;

    (function bisect(paths) {
      const chunks = chunk(paths, Math.ceil(paths.length / 3));
      execCount += chunks.length;

      chunks.forEach((pathList) => {
        exec(`${runner} ${pathList.join(' ')} ${spec}`, (err) => {
          execCount--;
          if (err && pathList.length > 1) {
            bisect(pathList);
          } else if (err) {
            resolvedValues.push(pathList[0]);
          }
          if (!execCount) { resolve(resolvedValues) }
        })
      });
    }(paths));
  });
}

function verifyResults(runner, paths) {
  return Promise.all(paths.map((path) => {
    return new Promise((resolve) => {
      exec(`${runner} ${path}`, (err) => { resolve( err ? null : path ); });
    });
  }));
}

function generateOutput(paths) {
  return new Promise((resolve) => {
    const verifiedPaths = paths.filter(path => path !== null);
    if (!verifiedPaths.length) {
      logger.info(`\n> goplanet found ${chalk.green(0)} leaky tests`);
    } else {
      logger.info(`\n> goplanet found ${chalk.red(paths.length)} leaky ${verifiedPaths.length > 1 ? 'tests' : 'test'}:\n`);
      verifiedPaths.forEach((badPath) => {
        logger.info(`    ${chalk.red('\u2716')} ${path.relative(process.cwd(), badPath)}`);
      });
    }
    logger.info('\n');
    resolve(verifiedPaths);
  });
}

function execute(options, spec, dir, done) {
  getAllTestPaths(dir, options.patterns)
    .then((paths) => {
      return bisectPaths(options.runner, spec, paths);
    })
    .catch((err) => {
      logger.error(`\n> There was a problem traversing the test directory: ${chalk.red(err.message)}\n`);
      process.exit(1);
    })
    .then((paths) => {
      return verifyResults(options.runner, paths);
    })
    .then(generateOutput)
    .then((paths) => {
      clearInterval(waiting);
      done(paths);
    });
}

exports.execute = function(args, done) {
  const runtimeOptions = options.parse(args);
  let spec;
  let dir;

  if (runtimeOptions.help) {
    logger.info(options.generateHelp());
    process.exit(0);
  }

  if (runtimeOptions._.length !== 2) {
    logger.error("\n  You must provide a spec that passes in isolation and the path to a test directory");
    process.exit(1);
  }

  spec = path.resolve(process.cwd(), runtimeOptions._.shift());
  dir = path.resolve(process.cwd(), runtimeOptions._.shift());

  try {
    fs.accessSync(spec, fs.R_OK);
  } catch(e) {
    logger.error("\n  Unable to read the known good spec:\n\n", e);
    process.exit(1);
  }

  logger.info(`> runner: ${runtimeOptions.runner}, patterns: ${runtimeOptions.patterns}`);

  waiting = spinner();
  execute(runtimeOptions, spec, dir, done);
}

process.on('unhandledRejection', (err) => {
  clearInterval(waiting);
  logger.error(`\n> Unexpected error encountered: ${chalk.red(err)}`);
});
