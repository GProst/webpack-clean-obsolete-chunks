'use strict'

const webpack = require('webpack')
const expect = require('chai').expect
const fs = require('fs')
const {handleErrors} = require('../../helper-functions')

module.exports.startWebpack = function startWebpack(config, fileToChange, newContent, obsoleteFilesMatch, done) {
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
