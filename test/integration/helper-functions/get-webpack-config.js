'use strict'

const path = require('path')
const CleanObsoleteChunks = require('./../../../index')

const {
  common: {entries: commonEntries}, codeSplitting: {entries: codeSplittingEntries}, outputDir
} = require('../test-config')
const getWebpack = require('./get-webpack')

module.exports = function getConfig({webpackVersion = 4, codeSplitting = false, deep = false} = {}) {
  const webpack = getWebpack(webpackVersion)
  const node_modules = path.resolve(__dirname, `../env/webpack-${webpackVersion}/node_modules/`)

  const ExtractTextPlugin = require(path.resolve(node_modules, 'extract-text-webpack-plugin'))
  const WebpackChunkHash = require(path.resolve(node_modules, 'webpack-chunk-hash'))
  const CleanWebpackPlugin = require(path.resolve(node_modules, 'clean-webpack-plugin'))
  const modernWebpack = webpackVersion >= 4
  let commonsChunkPlugin = null
  if (!modernWebpack) {
    commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
      names: ['commons', 'vendor', 'manifest'],
      chunks: ['vendor', 'app'],
      minChunks: Infinity
    })
  }

  let config = {
    target: 'web',
    context: __dirname,
    entry: codeSplitting ? codeSplittingEntries : commonEntries,
    cache: true,
    devtool: 'source-map',

    module: {
      rules: [{
        test: /\.css/,
        use: ExtractTextPlugin.extract({
          fallback: path.resolve(node_modules, 'style-loader'),
          use: `${path.resolve(node_modules, 'css-loader')}?sourceMap`
        })
      }]
    },

    plugins: [
      codeSplitting ? null : new ExtractTextPlugin('styles.[hash].css'),

      commonsChunkPlugin,

      new WebpackChunkHash(),

      new CleanWebpackPlugin(['*'], {
        root: outputDir,
        verbose: false,
        dry: false
      }),

      new CleanObsoleteChunks({verbose: false, deep})
    ].filter(Boolean),

    output: {
      path: outputDir,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js'
    }
  }

  if (modernWebpack) {
    // Setting runtimeChunk:true mimics the manifest chunk we use for webpack < 3
    return Object.assign({}, config, {mode: 'development', optimization: {runtimeChunk: true}})
  } else {
    return config
  }
}
