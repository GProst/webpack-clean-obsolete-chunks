'use strict'

const webpack1 = require('webpack')
const CleanObsoleteChunks = require('./../../../../index')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackChunkHash = require('webpack-chunk-hash')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const {common: {entries}, outputDir} = require('../../test-config')


module.exports = function getConfig() {
  return {
    context: __dirname,
    entry: entries,
    cache: true,
    devtool: 'source-map',
    
    module: {
      loaders: [
        {
          test: /\.css/,
          loader: ExtractTextPlugin.extract(
            require.resolve('style-loader'),
            require.resolve('css-loader') + '?sourceMap'
          )
        }
      ]
    },
    
    plugins: [
      new ExtractTextPlugin('styles.[contenthash].css'),
      
      new webpack1.optimize.CommonsChunkPlugin({
        names: ['commons', 'vendor', 'manifest'],
        chunks: ['vendor', 'app'],
        minChuncks: Infinity
      }),
      
      new WebpackChunkHash(),
      
      new CleanWebpackPlugin(['*'], {
        root: outputDir,
        verbose: false,
        dry: false
      }),
      
      new CleanObsoleteChunks({verbose: false})
    ],
    
    output: {
      path: outputDir,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js'
    }
  }
}
