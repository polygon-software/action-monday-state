module.exports = {
  roots: [
    "test",
  ],
  verbose: true,
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  coverageReporters: [
    "lcov",
    "json",
    "text-summary",
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/src/**"
  ],
  testResultsProcessor: "jest-sonar-reporter",
  coverageDirectory: "./reports/coverage/",
};
