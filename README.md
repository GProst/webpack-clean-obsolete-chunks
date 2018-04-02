# webpack-clean-obsolete-chunks

[![npm version](https://badge.fury.io/js/webpack-clean-obsolete-chunks.svg)](https://badge.fury.io/js/webpack-clean-obsolete-chunks)
[![Coverage Status](https://coveralls.io/repos/github/GProst/webpack-clean-obsolete-chunks/badge.svg?branch=master)](https://coveralls.io/github/GProst/webpack-clean-obsolete-chunks?branch=master)
[![Build Status](https://travis-ci.org/GProst/webpack-clean-obsolete-chunks.svg?branch=master)](https://travis-ci.org/GProst/webpack-clean-obsolete-chunks)
[![dependencies](https://david-dm.org/gprost/webpack-clean-obsolete-chunks.svg)](https://david-dm.org/gprost/webpack-clean-obsolete-chunks)
[![devDependencies](https://david-dm.org/gprost/webpack-clean-obsolete-chunks/dev-status.svg)](https://david-dm.org/gprost/webpack-clean-obsolete-chunks?type=dev)
[![Code Climate](https://codeclimate.com/github/GProst/webpack-clean-obsolete-chunks/badges/gpa.svg)](https://codeclimate.com/github/GProst/webpack-clean-obsolete-chunks)

A webpack plugin to remove obsolete chunk files in webpack watch mode.
Especially useful when use hashes in output file names.

## Installation

Via [yarn](https://yarnpkg.com/lang/en/):

```
yarn add webpack-clean-obsolete-chunks --dev
```

or via [npm](https://github.com/npm/npm):

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
        new CleanObsoleteChunks(options)
    ]
    // ...
};
```

### Options

``` javascript
{
  // Write logs to console.
  // Default: true
  verbose: true,

  // Clean obsolete chunks of webpack child compilations.
  // Default: false
  deep: true
}
```

> NOTE: `{deep: true}` option will work only if all descendent
compilations of the initial compilation have **unique** names

## How it works

Plugin searches for all updated chunks and deletes obsolete files in output
directory after each webpack compilation.

## Support

We currently support **Node.js** of version ^6, ^7, ^8 and **Webpack**
of version ^2, ^3, or ^4 (but ^1 should work also).

## Contribution

You're free to contribute to this project by submitting
[issues](https://github.com/GProst/webpack-clean-obsolete-chunks/issues) and/or
[pull requests](https://github.com/GProst/webpack-clean-obsolete-chunks/pulls).
Please be sure to read the
[contribution guidelines](https://github.com/GProst/webpack-clean-obsolete-chunks/blob/master/CONTRIBUTING.md)
before making changes for a pull request.

## License

This project is licensed under
[MIT](https://github.com/GProst/webpack-clean-obsolete-chunks/blob/master/LICENSE).