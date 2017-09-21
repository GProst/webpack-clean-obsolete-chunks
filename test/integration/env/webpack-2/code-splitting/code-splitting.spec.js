'use strict'

const expect = require('chai').expect
const fs = require('fs')
const del = require('del')
const webpack = require('webpack')

const {resultingFileAmount} = require('../../../test-config').codeSplitting
const {handleErrors} = require('../helper-functions')

describe('webpack-clean-obsolete-chunks plugin in webpack2 watch mode', () => {
  const config = require('./webpack.config.js')
  const outputFilesDir = config.output.path

  afterEach(() => {
    //removing created directory after tests
    del.sync(outputFilesDir + '/**', {force: true})
  })

  it('SHOULD not delete dynamic chunks after first compilation', (done) => {
    const compiler = webpack(config)

    compiler.run((err, stats) => {
      handleErrors(err, stats)

      const files = fs.readdirSync(outputFilesDir)
      expect(files.length).to.be.equal(resultingFileAmount) //yeah, that's not very nice checking
      done()
    })
  })

})
