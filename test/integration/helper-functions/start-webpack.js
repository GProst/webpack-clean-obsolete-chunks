'use strict'

const handleErrors = require('./handle-errors')
const getWebpack = require('./get-webpack')

module.exports.startWebpackWatch = function startWebpackWatch(webpackVersion, config, testFunction, done) {
  const webpack = getWebpack(webpackVersion)
  const compiler = webpack(config)

  const watching = compiler.watch({
    aggregateTimeout: 300,
    poll: 1000
  }, (err, stats) => {
    handleErrors(err, stats, done)

    testFunction(config, stopCompilation)
  })

  const stopCompilation = () => {
    watching.close(() => {
      done()
    })
  }
}

module.exports.startWebpack = function startWebpack(webpackVersion, config, testFunction, done) {
  const webpack = getWebpack(webpackVersion)
  const compiler = webpack(config)

  compiler.run((err, stats) => {
    handleErrors(err, stats, done)

    testFunction(config)
  })
}
