/* eslint prefer-rest-params:0 no-console:0 */
import chalk from 'chalk';

export const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  VERBOSE: 3,
};

let currentLevel = levels.INFO;

export default function (level) {
  currentLevel = level;
}

export function verbose(message) {
  if (process.env.NODE_ENV !== 'test' && currentLevel >= levels.VERBOSE) {
    console.log(`${chalk.cyan('verbose:')} ${message}`);
  }
}

export function info(message) {
  if (process.env.NODE_ENV !== 'test' && currentLevel >= levels.INFO) {
    console.log(message);
  }
}

export function warn(message) {
  if (process.env.NODE_ENV !== 'test' && currentLevel >= levels.WARN) {
    console.log(`${chalk.yellow('warn:')} ${message}`);
  }
}

export function error(message) {
  if (process.env.NODE_ENV !== 'test' && currentLevel >= levels.ERROR) {
    console.log(`${chalk.red('error:')} ${message}`);
  }
}
