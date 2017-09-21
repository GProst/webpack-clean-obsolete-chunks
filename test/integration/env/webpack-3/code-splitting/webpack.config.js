'use strict'

const webpack = require('webpack')
const CleanObsoleteChunks = require('./../../../../../index')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const {codeSplitting: {entries}, outputDir} = require('../../../test-config')

module.exports = {
  target: 'web',
  context: __dirname,
  entry: entries,
  cache: true,
  devtool: 'source-map',

  plugins: [
    new CleanWebpackPlugin(['*'], {
      root: outputDir,
      verbose: false,
      dry: false
    }),

    new CleanObsoleteChunks({verbose: false}),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
  ],

  output: {
    path: outputDir,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  }
}
