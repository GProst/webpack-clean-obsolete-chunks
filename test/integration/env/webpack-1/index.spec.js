'use strict'

const expect = require('chai').expect
const fs = require('fs')
const webpack = require('webpack')

const {
  JSFileToChange, JSObsoleteFileMatch, JSFileInitialContent, JSFileNewContent
} = require('../../test-config').common

const getConfig = require('./webpack.config.js')

describe('webpack-clean-obsolete-chunks plugin in webpack1 watch mode', () => {
  let fileToChange //the file we are going to change
  let changedFileInitialContent //initial content of the file we are going to change

  afterEach(() => {
    //restore initial file content
    fs.writeFileSync(fileToChange, changedFileInitialContent)
  })

  it('SHOULD remove all obsolete (only) files', (done) => {
    fileToChange = JSFileToChange
    changedFileInitialContent = JSFileInitialContent
    const newContent = changedFileInitialContent + JSFileNewContent

    let config = getConfig()
    const compiler = webpack(config)
    let firstCompilation = true
    let oldFiles
    let newFiles

    compiler.watch({
      aggregateTimeout: 20,
      poll: 10
    }, (err, stats) => {
      handleErrors(err, stats)

      if (firstCompilation) {
        oldFiles = fs.readdirSync(config.output.path)
        //sometimes webpack1 doesn"t see these changes, so we need to wait a little
        setTimeout(() => {
          fs.writeFileSync(fileToChange, newContent)
        }, 1000)
        firstCompilation = false
      } else {
        newFiles = fs.readdirSync(config.output.path)
        let changedFiles = oldFiles.filter(oldFile => newFiles.indexOf(oldFile) === -1)
        //sometimes in webpack1 we might get there before files were overwritten...
        if (changedFiles.length > 0) {
          changedFiles.forEach(changedFile => {
            expect(changedFile).to.match(JSObsoleteFileMatch)
          })
          done()
        }
      }
    })
  })

  it('SHOULD be able to remove files in the outside of the working directory', () => {
    //it"s hard to test webpack 1 since this callback sometimes calls before compiler
    // "after-emit" event... and my plugin does
    // TODO: need to isolate tests
  })
})

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
