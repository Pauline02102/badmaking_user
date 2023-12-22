// jest.config.js
module.exports = {
    preset: "jest-expo",
    roots: ["."],
    setupFiles: ['./__mocks__/@react-native-async-storage/async-storage.js'],
  };