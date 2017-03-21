"use strict";

const del = require('del');

module.exports = CleanObsoleteChunks;


function CleanObsoleteChunks() {
  this.chunkVersions = {};
}

CleanObsoleteChunks.prototype.apply = function(compiler) {
  compiler.plugin('after-emit', (compilation, callback) => {
    
    let obsoleteFiles = this.getObsoleteFiles(compilation);
    let obsoleteFilesPaths = obsoleteFiles.map(fileName => compiler.outputPath + fileName);
    
    obsoleteFilesPaths.forEach((filePath) => {
      del.sync(filePath);
      console.info('old chunk file has been removed: ', filePath);
    });
    
    callback();
  });
};

CleanObsoleteChunks.prototype.getObsoleteFiles = function(compilation) {
  let obsoleteFiles = [];
  
  compilation.chunks.forEach((chunk) => {
    let oldVersionChunk = this.chunkVersions[chunk.name];
    
    //we don't consider chunks at the first compilation, just save configs
    if (typeof oldVersionChunk === 'undefined') {
      this.saveChunkConfig(chunk);
      return false;
    }
    
    //if chunk has been changed since last comilation
    if (chunk.hash !== oldVersionChunk.hash) {
      //searching for the actual files which has been changed in this chunk
      oldVersionChunk.files.forEach((oldChunkFile) => {
        if (chunk.files.indexOf(oldChunkFile) === -1) {
          obsoleteFiles.push(oldChunkFile);
        }
      });
    }
    this.saveChunkConfig(chunk);
  });
  
  return obsoleteFiles;
};

CleanObsoleteChunks.prototype.saveChunkConfig = function(chunk) {
  this.chunkVersions[chunk.name] = {
    hash: chunk.hash,
    files: chunk.files
  };
};