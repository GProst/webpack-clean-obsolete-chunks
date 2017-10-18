'use strict'

const fs = require('fs')
const del = require('del')
const {
  JSFileToChange, CSSFileToChange, outsideOutputDirectory, JSObsoleteFileMatch, CSSObsoleteFileMatch, JSFileInitialContent,
  JSFileNewContent, CSSFileInitialContent, CSSFileNewContent
} = require('./test-config').common

const webpackVersion = require('minimist')(process.argv.slice(2)).webpack
if (!webpackVersion)
  throw Error('No webpack version provided!')

const getConfig = require(`./env/webpack-${webpackVersion}/webpack.config.js`)
const {startWebpack} = require(`./env/webpack-${webpackVersion}`)

describe(`webpack-clean-obsolete-chunks plugin in webpack${webpackVersion} watch mode`, () => {
  let fileToChange //the file we are going to change
  let changedFileInitialContent //initial content of the file we are going to change

  let newContent //new content in file we are going to change
  let obsoleteFilesMatch //RegExp that SHOULD match obsolete file names

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
    obsoleteFilesMatch = JSObsoleteFileMatch
    config = getConfig()
    startWebpack(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })

  it('SHOULD be able to remove files in the outside of the working directory', (done) => {
    fileToChange = JSFileToChange
    changedFileInitialContent = JSFileInitialContent
    newContent = changedFileInitialContent + JSFileNewContent
    obsoleteFilesMatch = JSObsoleteFileMatch
    config = getConfig()
    config.output.path = outsideOutputDirectory
    startWebpack(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })

  it('SHOULD remove obsolete css files and their maps', (done) => {
    config = getConfig()
    fileToChange = CSSFileToChange
    changedFileInitialContent = CSSFileInitialContent
    newContent = changedFileInitialContent + CSSFileNewContent
    obsoleteFilesMatch = CSSObsoleteFileMatch
    startWebpack(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })
})
