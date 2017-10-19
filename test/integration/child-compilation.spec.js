'use strict'

const fs = require('fs')
const del = require('del')
const {
  JSFileToChange, outsideOutputDirectory, JSFileInitialContent, JSFileNewContent
} = require('./test-config').common

const webpackVersion = require('minimist')(process.argv.slice(2)).webpack
if (!webpackVersion)
  throw Error('No webpack version provided!')

const {checkFilesLengthIsConstant, getWebpackConfig, startWebpackWatch} = require('./helper-functions')

describe(`webpack-clean-obsolete-chunks plugin in webpack${webpackVersion} watch mode (child compilation)`, () => {
  let fileToChange //the file we are going to change
  let changedFileInitialContent //initial content of the file we are going to change
  let newContent //new content in file we are going to change

  let config

  afterEach(() => {
    //restore initial file content
    fs.writeFileSync(fileToChange, changedFileInitialContent)
    //removing created directory after tests
    del.sync(outsideOutputDirectory + '/**', {force: true})
  })

  it('SHOULD remove all obsolete js files and their maps in main and child compilations', (done) => {
    fileToChange = JSFileToChange
    changedFileInitialContent = JSFileInitialContent
    newContent = changedFileInitialContent + JSFileNewContent
    config = getWebpackConfig({webpackVersion})
    const testFunction = checkFilesLengthIsConstant(webpackVersion, fileToChange, newContent)
    startWebpackWatch({webpackVersion, config, testFunction, withChildCompilation: true}, done)
  })
})
