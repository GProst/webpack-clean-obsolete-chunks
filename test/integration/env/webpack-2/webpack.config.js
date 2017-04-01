"use strict";

const webpack2 = require("webpack");
const CleanObsoleteChunks = require("./../../../../index");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackChunkHash = require("webpack-chunk-hash");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");


module.exports = function getConfig() {
  return {
    target: "web",
    context: __dirname,
    entry: {
      "app": "./../../test-entry-files/app/index.js",
      "vendor": "./../../test-entry-files/vendor/index.js"
    },
    cache: true,
    devtool: "source-map",
    
    module: {
      rules: [
        {
          test: /\.css/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: "css-loader?sourceMap"
          })
        }
      ]
    },
    
    plugins: [
      new ExtractTextPlugin("styles.[contenthash].css"),
      
      new webpack2.optimize.CommonsChunkPlugin({
        names: ["commons", "vendor", "manifest"],
        chunks: ["vendor", "app"],
        minChuncks: Infinity
      }),
      
      new WebpackChunkHash(),
      
      new CleanWebpackPlugin(["test-output-files"], {
        root: path.join(__dirname, "../../"),
        verbose: true,
        dry: false
      }),
      
      new CleanObsoleteChunks()
    ],
    
    output: {
      path: path.join(__dirname, "../../test-output-files"),
      filename: "[name].[chunkhash].js",
      chunkFilename: "[name].[chunkhash].js"
    }
  };
};
