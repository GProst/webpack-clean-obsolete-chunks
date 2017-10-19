'use strict'

const fs = require('fs')
const del = require('del')
const {
  JSFileToChange, CSSFileToChange, outsideOutputDirectory, JSFileInitialContent,
  JSFileNewContent, CSSFileInitialContent, CSSFileNewContent
} = require('./test-config').common

const webpackVersion = require('minimist')(process.argv.slice(2)).webpack
if (!webpackVersion)
  throw Error('No webpack version provided!')

const {checkFilesLengthIsConstant, getWebpackConfig, startWebpackWatch} = require('./helper-functions')

describe(`webpack-clean-obsolete-chunks plugin in webpack${webpackVersion} watch mode`, () => {
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

  it('SHOULD remove all obsolete js files and their maps', (done) => {
    fileToChange = JSFileToChange
    changedFileInitialContent = JSFileInitialContent
    newContent = changedFileInitialContent + JSFileNewContent
    config = getWebpackConfig({webpackVersion})
    const testFunction = checkFilesLengthIsConstant(webpackVersion, fileToChange, newContent)
    startWebpackWatch({webpackVersion, config, testFunction}, done)
  })

  it('SHOULD be able to remove files in the outside of the working directory', (done) => {
    fileToChange = JSFileToChange
    changedFileInitialContent = JSFileInitialContent
    newContent = changedFileInitialContent + JSFileNewContent
    config = getWebpackConfig({webpackVersion})
    config.output.path = outsideOutputDirectory
    const testFunction = checkFilesLengthIsConstant(webpackVersion, fileToChange, newContent)
    startWebpackWatch({webpackVersion, config, testFunction}, done)
  })

  it('SHOULD remove obsolete css files and their maps', (done) => {
    config = getWebpackConfig({webpackVersion})
    fileToChange = CSSFileToChange
    changedFileInitialContent = CSSFileInitialContent
    newContent = changedFileInitialContent + CSSFileNewContent
    const testFunction = checkFilesLengthIsConstant(webpackVersion, fileToChange, newContent)
    startWebpackWatch({webpackVersion, config, testFunction}, done)
  })
})
