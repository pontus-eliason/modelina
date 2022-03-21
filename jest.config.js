// eslint-disable-next-line no-undef
module.exports = {
  coverageReporters: [
    'json-summary',
    'lcov',
    'text'
  ],
  preset: 'ts-jest',
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>'],
  
  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@cst/(.*)$': '<rootDir>/src/cst/$1',
    '^@generators$': '<rootDir>/src/generators',
    '^@generators/(.*)$': '<rootDir>/src/generators/$1',
    '^@utils': '<rootDir>/src/utils',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@models': '<rootDir>/src/models',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@interpreter/(.*)$': '<rootDir>/src/interpreter/$1',
    '^@helpers': '<rootDir>/src/helpers',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
  },
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**'
  ]
};
