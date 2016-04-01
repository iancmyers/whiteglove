/* eslint no-console:0 */
import winston from 'winston';

const transports = process.env.NODE_ENV !== 'test' ? [new (winston.transports.Console)()] : [];
const logger = new winston.Logger({ transports });

logger.cli();
logger.level = 'info';

export default {
  error: logger.error,
  warn: logger.warn,
  info: process.env.NODE_ENV !== 'test' ? console.log : () => {},
  verbose: logger.verbose,
  silly: logger.silly,
  level: (level) => {
    logger.level = level;
  },
};
