'use strict'

const del = require('del')
const path = require('path')

module.exports = CleanObsoleteChunks

function CleanObsoleteChunks(options) {
  this.chunkVersions = new Map()
  this._setOptions(options)
}

CleanObsoleteChunks.prototype._setOptions = function(options = {}) {
  const defaultOptions = {verbose: true, deep: false}
  this.options = Object.assign({}, defaultOptions, options)
}

CleanObsoleteChunks.prototype.apply = function(compiler) {
  const callback = this._removeObsoleteFiles.bind(this, compiler)
  if (compiler.hooks) {
    compiler.hooks.afterEmit.tapAsync('webpack-clean-obsolete-chunks', callback)
  } else {
    compiler.plugin('after-emit', callback)
  }
}

CleanObsoleteChunks.prototype._removeObsoleteFiles = function(compiler, compilation, done) {
  let obsoleteFiles = this._getObsoleteFiles(compilation)
  let obsoleteFilesPaths = obsoleteFiles.map(fileName => path.join(compiler.outputPath, fileName))
  
  obsoleteFilesPaths.forEach((filePath) => {
    del.sync(filePath, {force: true})
    this._consoleInfo('Old chunk file has been removed: ', filePath)
  })

  done()
}

CleanObsoleteChunks.prototype._getObsoleteFiles = function(compilation) {
  let chunksObsoleteFiles = []
  const chunks = this._retrieveAllChunks([compilation])
  chunks.forEach((chunk) => {
    chunksObsoleteFiles = chunksObsoleteFiles.concat(this._getChunkObsoleteFiles(chunk))
  })
  return chunksObsoleteFiles
}

CleanObsoleteChunks.prototype._retrieveAllChunks = function(compilations) {
  return compilations.reduce((allChunks, compilation) => {
    const compilationName = compilation.name || '__clean-obsolete-chunks-initial-compilation__'
    let chunks = compilation.chunks.map(chunk => {
      const copy = Object.assign({}, chunk)
      copy.uniqueId = `${compilationName}--${copy.id}`
      return copy
    })
    if (this.options.deep)
      chunks = chunks.concat(this._retrieveAllChunks(compilation.children))
    return allChunks.concat(chunks)
  }, [])
}

CleanObsoleteChunks.prototype._saveChunkConfig = function(chunk) {
  this.chunkVersions.set(chunk.uniqueId, {
    files: chunk.files
  })
}

CleanObsoleteChunks.prototype._getChunkObsoleteFiles = function(chunk) {
  let chunkObsoleteFiles = []
  let oldVersionChunk = this.chunkVersions.get(chunk.uniqueId)
  
  //we don't consider chunks at the first compilation, just save configs
  if (typeof oldVersionChunk === 'undefined') {
    this._saveChunkConfig(chunk)
    return chunkObsoleteFiles
  }
  
  //searching for the actual files which has been changed in this chunk
  chunkObsoleteFiles = oldVersionChunk.files.filter(
    oldChunkFile => chunk.files.indexOf(oldChunkFile) === -1
  )
  
  this._saveChunkConfig(chunk)
  return chunkObsoleteFiles
}

CleanObsoleteChunks.prototype._consoleInfo = function(...args) {
  this.options.verbose && console.info(...args) // eslint-disable-line no-console
}
