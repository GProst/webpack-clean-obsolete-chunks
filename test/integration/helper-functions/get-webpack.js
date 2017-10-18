'use strict'

module.exports = function getWebpack(version) {
  return require(`../env/webpack-${version}/node_modules/webpack`)
}
