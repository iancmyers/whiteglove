function TestableClass() {
  this.returnValue = true;
}

TestableClass.prototype.setBoolean = function (bool) {
  this.returnValue = bool;
};

TestableClass.prototype.returnBoolean = function () {
  return this.returnValue;
};

TestableClass.prototype.toggleReturn = function () {
  this.setBoolean(!this.returnValue);
};

module.exports = TestableClass;
