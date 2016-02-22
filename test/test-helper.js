process.env.NODE_ENV = process.env.NODE_ENV || 'test';

global.chai = require('chai');
global.expect = global.chai.expect;
