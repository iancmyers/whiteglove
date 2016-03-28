class CLIRun {
  constructor(options) {
    this.runner = options.runner;
    this.patterns = options.patterns;
    this.spec = options.spec;
    this.dir = options.dir;
    this.tests = [];
    this.paths = Object.create({});
  }

  registerTests(paths) {
    this.tests = paths;
    return this;
  }

  reportTest(path) {
    this.paths[path] = true;
    return this;
  }

  unverifyTest(path) {
    delete this.paths[path];
    return this;
  }

  reportedTests() {
    return Object.keys(this.paths);
  }
}

export default CLIRun;
