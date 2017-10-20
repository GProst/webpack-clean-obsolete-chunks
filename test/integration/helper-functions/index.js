'use strict'

const {startWebpackWatch, startWebpack} = require('./start-webpack')

module.exports = {
  handleErrors: require('./handle-errors'),
  getWebpack: require('./get-webpack'),
  startWebpackWatch,
  startWebpack,
  getWebpackConfig: require('./get-webpack-config'),
  testFunctions: require('./test-functions')
}
