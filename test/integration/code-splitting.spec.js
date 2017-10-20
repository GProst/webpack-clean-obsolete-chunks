'use strict'

const expect = require('chai').expect
const fs = require('fs')
const del = require('del')

const {resultingFileAmount} = require('./test-config').codeSplitting
const {getWebpackConfig, startWebpack} = require('./helper-functions')

const webpackVersion = require('minimist')(process.argv.slice(2)).webpack
if (!webpackVersion)
  throw Error('No webpack version provided!')

describe(`webpack-clean-obsolete-chunks plugin in webpack${webpackVersion} watch mode (code splitting)`, () => {
  const config = getWebpackConfig({webpackVersion, codeSplitting: true})
  const outputFilesDir = config.output.path

  afterEach(() => {
    //removing created directory after tests
    del.sync(outputFilesDir + '/**', {force: true})
  })

  it('SHOULD not delete dynamic chunks after first compilation', (done) => {
    const testFunction = () => {
      const files = fs.readdirSync(outputFilesDir)
      expect(files.length).to.be.equal(resultingFileAmount) //that's not very neat checking
      done()
    }
    startWebpack(webpackVersion, config, testFunction, done)
  })
})
