// jest.config.js
module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)" // Exclure uuid de la transformation
  ],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  }
};
