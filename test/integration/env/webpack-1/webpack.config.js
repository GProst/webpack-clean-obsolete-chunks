const webpack1 = require('webpack');
const CleanObsoleteChunks = require('./../../../../index');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');


module.exports = {
  context: __dirname,
  entry: {
    'app': './../../test-entry-files/app/index.js',
    'vendor': './../../test-entry-files/vendor/index.js'
  },
  cache: true,
  devtool: 'source-map',
  
  module: {
    loaders: [
      {
        test: /\.css/,
        loader: ExtractTextPlugin.extract(
          require.resolve("style-loader"),
          require.resolve("css-loader") + '?sourceMap'
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
    
    new CleanWebpackPlugin(['test-output-files'], {
      root: path.join(__dirname, '../../'),
      verbose: true,
      dry: false
    }),
    
    new CleanObsoleteChunks()
  ],
  
  output: {
    path: path.join(__dirname, '../../test-output-files'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  }
};