'use strict'

const webpack = require('webpack')
const CleanObsoleteChunks = require('./../../../../../index')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')

module.exports = {
  target: 'web',
  context: __dirname,
  entry: {
    'app': './test-entry-files/app/app.js',
  },
  cache: true,
  devtool: 'source-map',

  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: __dirname,
      verbose: false,
      dry: false
    }),

    new CleanObsoleteChunks({verbose: false}),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
  ],

  output: {
    path: path.join(__dirname, 'test-output-files'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  }
}
