'use strict'
const path = require('path')
const fs = require('fs')

const commonEntryFileDir = path.join(__dirname, './test-entry-files/common')
const codeSplittingEntryFileDir = path.join(__dirname, './test-entry-files/code-splitting')

module.exports.outputDir = path.join(__dirname, './test-output-files')

module.exports.common = {
  entries: {
    app: path.join(commonEntryFileDir, 'app/index.js'),
    vendor: path.join(commonEntryFileDir, 'vendor/index.js')
  },
  JSFileToChange: path.join(commonEntryFileDir, 'app/partB.js'),
  get JSFileInitialContent() {
    return fs.readFileSync(this.JSFileToChange, 'utf-8')
  },
  CSSFileToChange: path.join(commonEntryFileDir, 'app/styles/stylesA.css'),
  get CSSFileInitialContent() {
    return fs.readFileSync(this.CSSFileToChange, 'utf-8')
  },
  outsideOutputDirectory: path.join(process.cwd(), '../test-output-files'),
  JSObsoleteFileMatch: /app.*.js.*/,
  CSSObsoleteFileMatch: /styles.*.css.*/,
  JSFileNewContent: '\nvar a = \'a\';',
  CSSFileNewContent: '\nbody {background: red;}'
}

module.exports.codeSplitting = {
  entries: {
    app: path.join(codeSplittingEntryFileDir, 'app/app.js')
  },
  resultingFileAmount: 14
}
