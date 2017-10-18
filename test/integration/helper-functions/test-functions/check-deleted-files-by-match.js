'use strict'

const expect = require('chai').expect
const fs = require('fs')

module.exports = function checkDeletedFilesByMatch(fileToChange, newContent, obsoleteFilesMatch) {
  let firstCompilation = true
  let oldFiles
  let newFiles

  return (config, stopCompilation) => {
    if (firstCompilation) {
      oldFiles = fs.readdirSync(config.output.path)
      fs.writeFileSync(fileToChange, newContent)
      firstCompilation = false
    } else {
      newFiles = fs.readdirSync(config.output.path)
      // deleted === changed
      let deletedFiles = oldFiles.filter(oldFile => newFiles.indexOf(oldFile) === -1)
      expect(deletedFiles).to.have.length.above(0)
      deletedFiles.forEach(deletedFile => {
        expect(deletedFile).to.match(obsoleteFilesMatch)
      })
      stopCompilation()
    }
  }
}
