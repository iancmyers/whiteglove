/* eslint no-console:0 */
import winston from 'winston';

const transports = process.env.NODE_ENV !== 'test' ? [new (winston.transports.Console)()] : [];
const logger = new winston.Logger({ transports });

logger.cli();
logger.level = 'info';

export const error = logger.error;
export const warn = logger.warn;
export const info = process.env.NODE_ENV !== 'test' ? console.log : () => {};
export const verbose = logger.verbose;
export const silly = logger.silly;
export function level(newLevel) {
  logger.level = newLevel;
}
