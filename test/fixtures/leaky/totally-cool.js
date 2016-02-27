'use strict';
const assert = require('assert');
const sinon = require('sinon');
const TestableClass = require('../testable');
let testable;

describe('Totally Cool TestableClass', () => {
  beforeEach(() => {
    testable = new TestableClass();
  });

  it('#returnBoolean initially returns true', () => {
    assert(testable.returnBoolean());
  });

  it('#toggleBoolean sets the correct boolean', () => {
    sinon.spy(TestableClass.prototype, 'setBoolean');
    testable.toggleReturn();
    assert(testable.setBoolean.calledWith(false));
    TestableClass.prototype.setBoolean.restore();
  });
});
