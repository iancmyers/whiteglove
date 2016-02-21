var assert = require('assert');
var sinon = require ('sinon');
var TestableClass = require('../testable');
var testable;

describe('Leaky TestableClass', () => {
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
  });
});
