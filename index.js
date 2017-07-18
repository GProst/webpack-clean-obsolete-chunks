'use strict'

const del = require('del')
const path = require('path')

module.exports = CleanObsoleteChunks

function CleanObsoleteChunks(options) {
  this.chunkVersions = new Map()
  this.setOptions(options)
}

CleanObsoleteChunks.prototype.setOptions = function({verbose = true} = {}) {
  this.options = {}
  this.options.verbose = verbose
}

CleanObsoleteChunks.prototype.apply = function(compiler) {
  compiler.plugin('after-emit', this._removeObsoleteFiles.bind(this, compiler))
}

CleanObsoleteChunks.prototype._removeObsoleteFiles = function(compiler, compilation, done) {
  let obsoleteFiles = this._getObsoleteFiles(compilation)
  let obsoleteFilesPaths = obsoleteFiles.map(fileName => path.join(compiler.outputPath, fileName))
  
  obsoleteFilesPaths.forEach((filePath) => {
    del.sync(filePath, {force: true})
    this.options.verbose && console.info('Old chunk file has been removed: ', filePath) // eslint-disable-line no-console
  })
  
  done()
}

CleanObsoleteChunks.prototype._getObsoleteFiles = function(compilation) {
  let chunksObsoleteFiles = []
  
  compilation.chunks.forEach((chunk) => {
    chunksObsoleteFiles = chunksObsoleteFiles.concat(this._getChunkObsoleteFiles(chunk))
  })
  
  return chunksObsoleteFiles
}

CleanObsoleteChunks.prototype._saveChunkConfig = function(chunk) {
  this.chunkVersions.set(chunk.id, {
    files: chunk.files
  })
}

CleanObsoleteChunks.prototype._getChunkObsoleteFiles = function(chunk) {
  let chunkObsoleteFiles = []
  let oldVersionChunk = this.chunkVersions.get(chunk.id)
  
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
