'use strict'

const expect = require('chai').expect
const fs = require('fs')
const del = require('del')
const webpack = require('webpack')
const {
  JSFileToChange, CSSFileToChange, outsideOutputDirectory, JSObsoleteFileMatch, CSSObsoleteFileMatch, JSFileInitialContent,
  JSFileNewContent, CSSFileInitialContent, CSSFileNewContent
} = require('../../test-config').common
const {handleErrors} = require('./helper-functions')

const getConfig = require('./webpack.config.js')

describe('webpack-clean-obsolete-chunks plugin in webpack3 watch mode', () => {
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

  it('SHOULD remove all obsolete js files and its maps', (done) => {
    fileToChange = JSFileToChange
    changedFileInitialContent = JSFileInitialContent
    newContent = changedFileInitialContent + JSFileNewContent
    obsoleteFilesMatch = JSObsoleteFileMatch
    config = getConfig()
    startWebpack3(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })

  it('SHOULD be able to remove files in the outside of the working directory', (done) => {
    fileToChange = JSFileToChange
    changedFileInitialContent = JSFileInitialContent
    newContent = changedFileInitialContent + JSFileNewContent
    obsoleteFilesMatch = JSObsoleteFileMatch
    config = getConfig()
    config.output.path = outsideOutputDirectory
    startWebpack3(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })

  it('SHOULD remove obsolete css files and its maps', (done) => {
    config = getConfig()
    fileToChange = CSSFileToChange
    changedFileInitialContent = CSSFileInitialContent
    newContent = changedFileInitialContent + CSSFileNewContent
    obsoleteFilesMatch = CSSObsoleteFileMatch
    startWebpack3(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })
})


function startWebpack3(config, fileToChange, newContent, obsoleteFilesMatch, done) {
  const compiler = webpack(config)
  let firstCompilation = true
  let oldFiles
  let newFiles

  const watching = compiler.watch({
    aggregateTimeout: 300,
    poll: 1000
  }, (err, stats) => {
    handleErrors(err, stats)

    if (firstCompilation) {
      oldFiles = fs.readdirSync(config.output.path)
      fs.writeFileSync(fileToChange, newContent)
      firstCompilation = false
    } else {
      newFiles = fs.readdirSync(config.output.path)
      let changedFiles = oldFiles.filter(oldFile => newFiles.indexOf(oldFile) === -1)
      expect(changedFiles).to.have.length.above(0)
      changedFiles.forEach(changedFile => {
        expect(changedFile).to.match(obsoleteFilesMatch)
      })
      watching.close(() => {
        done()
      })
    }
  })
}
