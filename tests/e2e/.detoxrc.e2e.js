// Detox configuration for E2E tests
// This file is used by Detox to configure the test environment

module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
};

