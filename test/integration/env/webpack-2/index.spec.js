'use strict'

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const del = require('del')
const webpack = require('webpack')

describe('webpack-clean-obsolete-chunks plugin in webpack2 watch mode', () => {
  let fileToChange //the file we are going to change
  let changedFileInitialContent //initial content of the file we are going to change
  const entryFileDir = path.join(__dirname, '../../test-entry-files')

  let newContent //new content in file we are going to change
  let obsoleteFilesMatch //RegExp that SHOULD match obsolete file names

  let getConfig = require('./webpack.config.js')
  let outsideOutputDirectory = path.join(process.cwd(), '../test-output-files')
  let config

  beforeEach(() => {
    fileToChange = path.join(entryFileDir, 'app/partB.js')
    changedFileInitialContent = fs.readFileSync(fileToChange, 'utf-8')
    newContent = 'var a = \'a\';'
    obsoleteFilesMatch = /app.*.js.*/
  })

  afterEach(() => {
    //restore initial file content
    fs.writeFileSync(fileToChange, changedFileInitialContent)
    //removing created directory after tests
    del.sync(outsideOutputDirectory + '/**', {force: true})
  })


  it('SHOULD remove all obsolete js files and its maps', (done) => {
    config = getConfig()
    startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })

  it('SHOULD be able to remove files in the outside of the working directory', (done) => {
    config = getConfig()
    config.output.path = outsideOutputDirectory
    startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })

  it('SHOULD remove obsolete css files and its maps', (done) => {
    config = getConfig()
    fileToChange = path.join(entryFileDir, 'app/styles/stylesA.css')
    changedFileInitialContent = fs.readFileSync(fileToChange, 'utf-8')
    newContent = 'body {background: red;}'
    obsoleteFilesMatch = /styles.*.css.*/
    startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done)
  })

})


function startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done) {
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
        console.log('Watching webpack2 Ended.') //eslint-disable-line no-console
      })
    }
  })
}

function handleErrors(err, stats) {
  if (err) {
    console.error(err.stack || err)
    if (err.details) {
      console.error(err.details)
    }
    return
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.error(info.errors)
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings)
  }
}
