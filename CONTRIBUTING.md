# Contributing

From opening a bug report to creating a pull request: every contribution is
appreciated and welcome. Please be sure to read the contribution guidelines
before making changes for a pull request.

## Installation

* Install [yarn](https://yarnpkg.com/en/docs/install)

* In a project directory run:

    ```sh
    yarn run install-dev
    ```

## Testing

This project is test-driven, so keep in mind that every change and new feature
should be covered by tests where possible. We use [mocha](https://mochajs.org/)
\+ [chai](http://chaijs.com/)
\+ [sinon](http://sinonjs.org/) combination for testing. In order to check tests
passing and coverage we use
[Travis CI](https://travis-ci.org/GProst/webpack-clean-obsolete-chunks)
and
[Coveralls](https://coveralls.io/github/GProst/webpack-clean-obsolete-chunks?branch=master)
services.

To run the entire test suite use:

```sh
yarn test
```

## Code style

We use [ESLint](http://eslint.org/) to keep consistent style. You probably want
to install a plugin for your editor and use our **.eslintrc.js** configuration
file.

The ESLint test will be run via
[CodeClimate](https://codeclimate.com/github/GProst/webpack-clean-obsolete-chunks)
service when you make a pull request. Your build will fail if it doesn't pass
the style check.

>**Note:** some ESlint `warnings` may be false-positive, so if you're sure your 
code is OK, you may create a PR.

You can also install
[CodeClimate CLI](https://github.com/codeclimate/codeclimate)
to check your code style for errors on your machine.

## Commit message style

Please try to write [great commit messages](https://chris.beams.io/posts/git-commit/).