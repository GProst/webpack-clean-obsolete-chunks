'use strict'

const expect = require('chai').expect
const fs = require('fs')

module.exports.checkFilesLengthIsConstant = (webpackVersion, fileToChange, newContent) => {
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
      expect(newFiles).to.have.length(oldFiles.length)
      stopCompilation()
    }
  }
}

