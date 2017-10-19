'use strict'

const expect = require('chai').expect
const fs = require('fs')

module.exports.checkFilesLength = ({fileToChange, newContent, sameLength = true}) => {
  let firstCompilation = true
  let oldFiles
  let newFiles

  return (config, stopCompilation) => {
    if (firstCompilation) {
      oldFiles = fs.readdirSync(config.output.path)
      fs.writeFileSync(fileToChange, newContent)
      firstCompilation = false
    } else {
      try {
        newFiles = fs.readdirSync(config.output.path)
        if (sameLength) {
          expect(newFiles).to.have.length(oldFiles.length)
        } else {
          expect(newFiles).not.to.have.length(oldFiles.length)
        }
        stopCompilation()
      } catch (err) {
        stopCompilation(err)
      }
    }
  }
}

