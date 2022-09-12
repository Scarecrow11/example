// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const data = {
  preset: 'ts-jest',
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testTimeout: 20000,
  roots: ['<rootDir>/test/unit', '<rootDir>/test/i9n'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '(.*.spec)\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  coveragePathIgnorePatterns: [
    '<rootDir>/src/iviche/logger',
    '<rootDir>/src/iviche/routes/controllers/users',
    '<rootDir>/src/iviche/mailer/templates',
    '<rootDir>/config',
    '<rootDir>/database/migrations',
    '<rootDir>/src/iviche/db/DBConnection.ts',
    '<rootDir>/src/iviche/scheduler/utility/ChildProcessHandler.ts',
    '<rootDir>/src/iviche/scheduler/SchedulerModule.ts',
    '<rootDir>/src/iviche/notification/notifiers',
    '<rootDir>/test',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

const getConfig = (mode = 'full') => {
  if (mode === 'unit') {
    data.roots = ['<rootDir>/test/unit']
  }

  if (mode === 'i9n') {
    data.roots = ['<rootDir>/test/i9n']
  }

  return data
}

module.exports = getConfig(process.env.TEST_MODE)
