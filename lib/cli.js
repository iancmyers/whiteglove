var path = require('path');
var fs = require('fs');
var walk = require('recursive-readdir');
var chunk = require('chunk');
var chalk = require('chalk');
var exec = require('child_process').exec;
var options = require('./options');
var logger = require('./logger');

function getAllTestPaths(dir, patterns) {
  return new Promise((resolve, reject) => {
    var ignores = ignoreFileFunction(patterns);
    walk(dir, [ignores], function (err, paths) {
      if(err) {
        logger.error("There was a problem traversing the test directory: ", err);
        reject(err);
      } else {
        resolve(paths);
      }
    });
  });
}

function ignoreFileFunction(patterns) {
  var regexps = patterns.map(pattern => new RegExp(pattern));
  return function(file) {
    return !regexps.some(regexp => regexp.test(file))
  }
}

function bisectPaths(runner, spec, paths) {
  return new Promise((resolve) => {
    var resolvedValues = [];
    var execCount = 0;

    (function bisect(paths) {
      var chunks = chunk(paths, Math.ceil(paths.length / 3));
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

function generateOutput(paths) {
  return new Promise((resolve) => {
    if (!paths.length) {
      logger.info(`\n> goplanet found ${chalk.green(0)} leaky tests`);
    } else {
      logger.info(`\n> goplanet found ${chalk.red(paths.length)} leaky ${paths.length > 1 ? 'tests' : 'test'}:\n`);
      paths.forEach((badPath) => {
        logger.info(`    ${chalk.red('\u2716')} ${path.relative(process.cwd(), badPath)}`);
      });
    }
    logger.info('\n');
    resolve(paths);
  });
}

function execute(options, spec, dir, done) {
  getAllTestPaths(dir, options.patterns)
    .then((paths) => {
      return bisectPaths(options.runner, spec, paths);
    })
    .then(generateOutput)
    .then(done);
}

exports.execute = function(args, done) {
  var runtimeOptions = options.parse(args);
  var spec;
  var dir;

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
  execute(runtimeOptions, spec, dir, done);
}
