'use strict'

const handleErrors = require('./handle-errors')
const getWebpack = require('./get-webpack')
const {common: {entries}} = require('../test-config')

module.exports.startWebpackWatch = ({webpackVersion, config, testFunction, withChildCompilation = false}, done) => {
  const SingleEntryPlugin = require(`../env/webpack-${webpackVersion}/node_modules/webpack/lib/SingleEntryPlugin`)
  const webpack = getWebpack(webpackVersion)
  const compiler = webpack(config)

  if (withChildCompilation) {
    compiler.plugin('make', (compilation, callback) => {
      const childCompiler = compilation.createChildCompiler('my-child-compiler')

      childCompiler.apply(new SingleEntryPlugin(compiler.context, entries.app, 'child-compilation-chunk'))

      childCompiler.runAsChild(err => {
        callback(err)
      })
    })
  }

  const watching = compiler.watch({
    aggregateTimeout: 300,
    poll: 1000
  }, (err, stats) => {
    handleErrors(err, stats, done)

    testFunction(config, stopCompilation)
  })

  const stopCompilation = (err) => {
    watching.close(() => {
      done(err)
    })
  }
}

module.exports.startWebpack = (webpackVersion, config, testFunction, done) => {
  const webpack = getWebpack(webpackVersion)
  const compiler = webpack(config)

  compiler.run((err, stats) => {
    handleErrors(err, stats, done)

    testFunction(config)
  })
}

