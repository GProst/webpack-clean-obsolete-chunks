'use strict'

const webpack2 = require('webpack')
const CleanObsoleteChunks = require('./../../../../index')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackChunkHash = require('webpack-chunk-hash')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const {common: {entries}, outputDir} = require('../../test-config')

module.exports = function getConfig() {
  return {
    target: 'web',
    context: __dirname,
    entry: entries,
    cache: true,
    devtool: 'source-map',
    
    module: {
      rules: [
        {
          test: /\.css/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader?sourceMap'
          })
        }
      ]
    },
    
    plugins: [
      new ExtractTextPlugin('styles.[contenthash].css'),
      
      new webpack2.optimize.CommonsChunkPlugin({
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
