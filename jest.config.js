// jest.config.js
module.exports = {
    preset: "jest-expo",
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|my-unsupport-module|another-module)/)',
    ],
    roots: ["."],
    setupFiles: ['./__mocks__/@react-native-async-storage/async-storage.js'],
  };