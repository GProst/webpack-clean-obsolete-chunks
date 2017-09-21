'use strict'
const path = require('path')
const fs = require('fs')

const entryFileDir = path.join(__dirname, './test-entry-files')

module.exports = {
  JSFileToChange: path.join(entryFileDir, 'app/partB.js'),
  get JSFileInitialContent() {
    return fs.readFileSync(this.JSFileToChange, 'utf-8')
  },
  CSSFileToChange: path.join(entryFileDir, 'app/styles/stylesA.css'),
  get CSSFileInitialContent() {
    return fs.readFileSync(this.CSSFileToChange, 'utf-8')
  },
  outsideOutputDirectory: path.join(process.cwd(), '../test-output-files'),
  JSObsoleteFileMatch: /app.*.js.*/,
  CSSObsoleteFileMatch: /styles.*.css.*/,
  JSFileNewContent: '\nvar a = \'a\';',
  CSSFileNewContent: '\nbody {background: red;}'
}
