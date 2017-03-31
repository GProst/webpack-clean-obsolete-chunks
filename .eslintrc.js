module.exports = {
  "env": {
    "commonjs": true,
    "node": true,
    "es6": true,
    "mocha": true
  },
  "extends": ["eslint:recommended"],
  "rules": {
    "no-console": [1, {allow: ["warn", "error"]}]
  }
};