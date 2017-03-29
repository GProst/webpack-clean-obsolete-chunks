# webpack-clean-obsolete-chunks
[![npm version](https://badge.fury.io/js/webpack-clean-obsolete-chunks.svg)](https://badge.fury.io/js/webpack-clean-obsolete-chunks)
[![Coverage Status](https://coveralls.io/repos/github/GProst/webpack-clean-obsolete-chunks/badge.svg?branch=master)](https://coveralls.io/github/GProst/webpack-clean-obsolete-chunks?branch=master)

A webpack plugin to remove obsolete chunk files in webpack watch mode. 
Especially useful when use hashes in output file names.

## Installation

```
npm install webpack-clean-obsolete-chunks --save-dev
```

## Usage

Just add this plugin as usual.

``` javascript
// webpack.config.js
var CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');

module.exports = {
    // ...
    plugins: [
        new CleanObsoleteChunks()
    ]
    // ...
};
```

## How it works

Plugin searches for all updated chunks and deletes obsolete files in output directory after each 
webpack compilation.


# Contribution

You're free to contribute to this project by submitting
[issues](https://github.com/GProst/webpack-clean-obsolete-chunks/issues) and/or 
[pull requests](https://github.com/GProst/webpack-clean-obsolete-chunks/pulls). 
This project is test-driven, so keep in mind that every change and new feature should be covered 
by tests.


# License

This project is licensed under 
[MIT](https://github.com/GProst/webpack-clean-obsolete-chunks/blob/master/LICENSE).