/* eslint max-len:0, consistent-return:0 */
import path from 'path';
import fs from 'fs';
import walk from 'recursive-readdir';
import chalk from 'chalk';
import { exec } from 'child_process';
import spinner from 'char-spinner';
import pluralize from 'pluralize';
import options from './options';
import logger, { info, warn, error, verbose, levels } from './logger';
import CLIRun from './cli-run';
import BisectFinder from './bisect-finder';
import IsoFinder from './iso-finder';
import assign from 'object-assign';

let waiting;
let startTime;

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

function findAffectingTests(run) {
  const { runner, spec, tests } = run;
  return new Promise((resolve) => {
    const finder = new BisectFinder(runner, spec);

    finder.on('failure', (list) => {
      if (list.length === 1) {
        run.reportTest(list[0]);
        verbose(`Found potentially dirty test: ${relative(list[0])}`);
      } else {
        verbose(`Test run failed with ${list.length} tests`);
      }
    });

    finder.on('end', () => {
      resolve(run);
    });

    finder.find(tests);
  });
}

function findIsolatedFailingTests(run) {
  const { runner, tests } = run;
  return new Promise((resolve) => {
    const finder = new IsoFinder(runner);

    finder.on('failure', (test) => {
      run.reportTest(test);
      verbose(`Found test that fails in isolation: ${relative(test)}`);
    });

    finder.on('end', () => {
      resolve(run);
    });

    finder.find(tests);
  });
}

function verify(run, test) {
  const { runner } = run;
  return new Promise((resolve) => {
    exec(`${runner} ${test}`, (err) => {
      if (err) {
        warn(`Test run failed for single test: ${runner} ${relative(test)}`);
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

function generateBisectOutput(run) {
  return new Promise((resolve) => {
    const { spec } = run;
    const paths = run.reportedTests();
    const relativeSpecPath = relative(spec);
    const time = `${(Date.now() - startTime) / 1000}s`;

    if (!paths.length) {
      info(`Found ${chalk.green(0)} problematic tests affecting ${chalk.underline(relativeSpecPath)} ${chalk.dim(time)}`);
    } else {
      info(`Found ${chalk.red(paths.length)} problematic ${pluralize('test', paths.length)} affecting ${chalk.underline(relativeSpecPath)} ${chalk.dim(time)}\n`);
      paths.forEach(badPath => info(`    ${chalk.red('\u2716')} ${relative(badPath)}`));
      info('\n');
    }
    resolve(run);
  });
}

function generateIsoOutput(run) {
  return new Promise((resolve) => {
    const paths = run.reportedTests();
    const time = `${(Date.now() - startTime) / 1000}s`;

    if (!paths.length) {
      info(`Found ${chalk.green(0)} tests failing in isolation ${chalk.dim(time)}`);
    } else {
      info(`Found ${chalk.red(paths.length)} ${pluralize('test', paths.length)} failing in isolation ${chalk.dim(time)}\n`);
      paths.forEach(badPath => info(`    ${chalk.red('\u2716')} ${relative(badPath)}`));
      info('\n');
    }
    resolve(run);
  });
}

export function execute(argv, exit) {
  startTime = Date.now();
  const runtimeOptions = options(argv);
  const cmd = runtimeOptions._.shift();
  const {
    directory: dir,
    test: spec,
  } = runtimeOptions;
  const run = new CLIRun(assign({ spec, dir }, runtimeOptions));

  if (runtimeOptions.verbose) {
    logger(levels.VERBOSE);
  }

  if (spec) {
    try {
      fs.accessSync(spec, fs.R_OK);
    } catch (e) {
      error(`Unable to read the known good test: ${chalk.underline(relative(spec))}`);
      return exit();
    }
  }

  try {
    fs.accessSync(dir, fs.R_OK);
  } catch (e) {
    error(`Unable to read the test directory: ${chalk.underline(relative(dir))}`);
    return exit();
  }

  info(`runner: ${chalk.cyan(runtimeOptions.runner)}, patterns: ${chalk.cyan(runtimeOptions.patterns)}`);

  waiting = spinner();

  if (cmd === 'bisect') {
    findTestPaths(run)
      .then(findAffectingTests)
      .then(verifyResults)
      .then(generateBisectOutput)
      .then((finishedRun) => {
        clearInterval(waiting);
        exit(finishedRun);
      });
  }

  if (cmd === 'iso') {
    findTestPaths(run)
      .then(findIsolatedFailingTests)
      .then(generateIsoOutput)
      .then((finishedRun) => {
        clearInterval(waiting);
        exit(finishedRun);
      });
  }
}

process.on('unhandledRejection', (err) => {
  clearInterval(waiting);
  error(`Unexpected error encountered: ${chalk.red(err)}`);
});
