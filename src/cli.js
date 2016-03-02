/* eslint max-len:0, consistent-return:0 */
import path from 'path';
import fs from 'fs';
import os from 'os';
import walk from 'recursive-readdir';
import chunk from 'chunk';
import chalk from 'chalk';
import { exec } from 'child_process';
import spinner from 'char-spinner';
import pluralize from 'pluralize';
import options from './options';
import logger, { info, warn, error, verbose, levels } from './logger';
import BisectRun from './bisect-run';

let waiting;
let startTime;

function pad(size) {
  return new Array(size + 1).join(' ');
}

function relative(absolutePath) {
  return path.relative(process.cwd(), absolutePath);
}

function generateIgnores(patterns) {
  const regexps = patterns.map(pattern => new RegExp(pattern));
  return function (file) {
    return !fs.statSync(file).isDirectory() && !regexps.some(regexp => regexp.test(file));
  };
}

function findTestPaths(run) {
  verbose(`Finding all test paths in ${relative(run.dir)}`);
  return new Promise((resolve, reject) => {
    const ignores = generateIgnores(run.patterns);
    walk(run.dir, [ignores], (err, paths) => {
      if (err) { reject(err); }
      verbose(`Found ${paths.length} test files`);
      run.registerTests(paths);
      resolve(run);
    });
  }).then(
    () => run,
    () => {
      error(`Error encountered while traversing directory: ${relative(run.dir)}`);
    }
  );
}

function bisectPaths(run) {
  return new Promise((resolve) => {
    let execCount = 0;
    const { runner, spec } = run;
    const divisor = os.cpus().length;
    verbose(`Starting bisection with parallelism of ${divisor}`);

    (function bisect(paths) {
      // Here we parallelize such that each cpu gets one process.
      const chunks = chunk(paths, Math.ceil(paths.length / divisor));
      execCount += chunks.length;

      chunks.forEach((pathList) => {
        exec(`${runner} ${pathList.join(' ')} ${spec}`, (err) => {
          execCount--;
          if (err && pathList.length > 1) {
            verbose(`Found problematic test in path list of size ${pathList.length}:\n${pad(9)}${pathList.join(`\n${pad(9)}`)}`);
            bisect(pathList);
          } else if (err) {
            verbose(`Found problematic test: ${relative(pathList[0])}`);
            run.reportTest(pathList[0]);
          }
          if (!execCount) { resolve(run); }
        });
      });
    }(run.tests));
  });
}

function verify(run, test) {
  const { runner } = run;
  return new Promise((resolve) => {
    exec(`${runner} ${test}`, (err) => {
      if (err) {
        warn(`Isolated test run failed: ${runner} ${relative(test)}`);
        run.unverifyTest(test);
      }
      resolve();
    });
  });
}

function verifyResults(run) {
  const paths = run.reportedTests();
  verbose(`Verifying current reported tests: ${run.reportedTests().map(test => relative(test))}`);
  return Promise.all(paths.map(test => verify(run, test)))
    .then(() => run);
}

function generateOutput(run) {
  return new Promise((resolve) => {
    const { spec } = run;
    const paths = run.reportedTests();
    const relativeSpecPath = relative(spec);
    const time = `${(Date.now() - startTime) / 1000}s`;

    if (!paths.length) {
      info(`${chalk.green(0)} leaky tests found affecting ${chalk.underline(relativeSpecPath)} ${chalk.dim(time)}`);
    } else {
      info(`${chalk.red(paths.length)} leaky ${pluralize('test', paths.length)} found affecting ${chalk.underline(relativeSpecPath)} ${chalk.dim(time)}\n`);
      paths.forEach(badPath => info(`    ${chalk.red('\u2716')} ${relative(badPath)}`));
      info('\n');
    }
    resolve(run);
  });
}

export function execute(args, exit) {
  let runtimeOptions;

  try {
    runtimeOptions = options.parse(args);
  } catch (e) {
    error(e.message);
    return exit();
  }

  if (runtimeOptions.help) {
    info(options.generateHelp());
    return exit(true);
  }

  if (runtimeOptions.verbose) {
    logger(levels.VERBOSE);
  }

  if (runtimeOptions._.length !== 2) {
    error('You must provide a spec that passes in isolation and the path to a test directory');
    return exit();
  }

  startTime = Date.now();
  const spec = path.resolve(process.cwd(), runtimeOptions._.shift());
  const dir = path.resolve(process.cwd(), runtimeOptions._.shift());

  try {
    fs.accessSync(spec, fs.R_OK);
  } catch (e) {
    error(`Unable to read the known good test: ${chalk.underline(relative(spec))}`);
    return exit();
  }

  try {
    fs.accessSync(dir, fs.R_OK);
  } catch (e) {
    error(`Unable to read the test directory: ${chalk.underline(relative(dir))}`);
    return exit();
  }

  info(`runner: ${runtimeOptions.runner}, patterns: ${runtimeOptions.patterns}`);

  waiting = spinner();
  const run = new BisectRun(spec, dir, runtimeOptions);

  findTestPaths(run)
    .then(bisectPaths)
    .then(verifyResults)
    .then(generateOutput)
    .then((finishedRun) => {
      clearInterval(waiting);
      exit(finishedRun);
    });
}

process.on('unhandledRejection', (err) => {
  clearInterval(waiting);
  error(`Unexpected error encountered: ${chalk.red(err)}`);
});
