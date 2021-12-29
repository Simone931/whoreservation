module.exports = {
  rootDir: '.',
  testMatch: ['**/test/**/*.test.(js)'],
  verbose: false,
  clearMocks: true,
  resetModules: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__fixtures__/',
    '/test/',
    '/(__)?mock(s__)?/',
    '/__jest__/',
    '.?.min.js',
  ],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'json'],
};
