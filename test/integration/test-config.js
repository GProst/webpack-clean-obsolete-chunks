'use strict'
const path = require('path')

const entryFileDir = path.join(__dirname, './test-entry-files')

module.exports = {
  JSFileToChange: path.join(entryFileDir, 'app/partB.js'),
  CSSFileToChange: path.join(entryFileDir, 'app/styles/stylesA.css'),
  outsideOutputDirectory: path.join(process.cwd(), '../test-output-files')
}
