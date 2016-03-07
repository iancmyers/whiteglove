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
import FailFinder from './fail-finder';

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
    const finder = new FailFinder(runner, spec);

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

function generateOutput(run) {
  return new Promise((resolve) => {
    const { spec } = run;
    const paths = run.reportedTests();
    const relativeSpecPath = relative(spec);
    const time = `${(Date.now() - startTime) / 1000}s`;

    if (!paths.length) {
      info(`Found ${chalk.green(0)} problematic tests found affecting ${chalk.underline(relativeSpecPath)} ${chalk.dim(time)}`);
    } else {
      info(`Found ${chalk.red(paths.length)} problematic ${pluralize('test', paths.length)} found affecting ${chalk.underline(relativeSpecPath)} ${chalk.dim(time)}\n`);
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
    error('You must provide the path to a test and the path to a test directory');
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

  info(`runner: ${chalk.cyan(runtimeOptions.runner)}, patterns: ${chalk.cyan(runtimeOptions.patterns)}`);

  waiting = spinner();
  const run = new CLIRun(spec, dir, runtimeOptions);

  findTestPaths(run)
    .then(findAffectingTests)
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
