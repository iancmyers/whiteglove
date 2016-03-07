class CLIRun {
  constructor(spec, dir, options) {
    this.runner = options.runner;
    this.patterns = options.patterns;
    this.spec = spec;
    this.dir = dir;
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
