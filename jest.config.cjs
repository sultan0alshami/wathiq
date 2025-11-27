/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Map Supabase lib to the test mock BEFORE the generic alias,
    // so imports like "@/lib/supabase" use the mock (avoids import.meta.env in Jest)
    '^@/lib/supabase$': '<rootDir>/__tests__/__mocks__/supabase.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          types: ['jest', 'node', '@testing-library/jest-dom'],
        },
      },
    ],
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageReporters: ['text','lcov','cobertura'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }
};