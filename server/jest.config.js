export default {
  testEnvironment: 'node',
  roots: ['<rootDir>', '<rootDir>/../tests/server'],
  testMatch: ['**/*.test.js'],
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  collectCoverageFrom: ['**/*.js', '!**/tests/**', '!**/node_modules/**', '!**/coverage/**', '!**/jest.config.js', '!index.js', '!seed.js'],
  coverageReporters: ['text', 'html', 'json-summary'],
  coverageDirectory: './coverage',
};
