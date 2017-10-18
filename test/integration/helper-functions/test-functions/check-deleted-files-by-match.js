'use strict'

const expect = require('chai').expect
const fs = require('fs')

module.exports = function checkDeletedFilesByMatch(webpackVersion, fileToChange, newContent, obsoleteFilesMatch) {
  let firstCompilation = true
  let oldFiles
  let newFiles

  return (config, stopCompilation) => {
    if (firstCompilation) {
      oldFiles = fs.readdirSync(config.output.path)
      if (webpackVersion === 1) {
        //sometimes webpack1 doesn't see these changes, so we need to wait a little
        setTimeout(() => {
          fs.writeFileSync(fileToChange, newContent)
        }, 1000)
      } else {
        fs.writeFileSync(fileToChange, newContent)
      }
      firstCompilation = false
    } else {
      newFiles = fs.readdirSync(config.output.path)
      // deleted === changed
      let deletedFiles = oldFiles.filter(oldFile => newFiles.indexOf(oldFile) === -1)
      expect(deletedFiles).to.have.length.above(0)
      if (deletedFiles.length > 0) { // sometimes in webpack1 we might get there before files were overwritten...
        deletedFiles.forEach(deletedFile => {
          expect(deletedFile).to.match(obsoleteFilesMatch)
        })
        stopCompilation()
      }
    }
  }
}
