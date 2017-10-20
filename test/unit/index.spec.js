'use strict'

const expect = require('chai').expect
const sinon = require('sinon')
const del = require('del')
const path = require('path')

const CleanObsoleteChunks = require('./../../index')

describe('CleanObsoleteChunks', () => {
  describe('instance', () => {
    let inst
    
    beforeEach(() => {
      inst = new CleanObsoleteChunks()
    })
    
    describe('method _saveChunkConfig(chunk)', () => {
      describe('in order to save chunks versions', () => {
        it('SHOULD add or update its deep chunkVersions[chunk.name] property', () => {
          let chunkId = 1
          expect(inst.chunkVersions.get(chunkId)).to.be.equal(undefined)
          let chunk = {
            uniqueId: chunkId,
            files: ['test-file-name1'],
            hash: 'hash1'
          }
          inst._saveChunkConfig(chunk)
          let oldValue = inst.chunkVersions.get(chunkId)
          expect(oldValue).to.not.be.equal(undefined)
          let updatedChunk = Object.assign(chunk, {files: ['test-file-name2'], hash: 'hash2'})
          inst._saveChunkConfig(updatedChunk)
          expect(oldValue).to.not.be.equal(inst.chunkVersions.get(chunkId))
        })
        
        it(
          'SHOULD set its deep chunkVersions[chunk.name][\'files\'] property with chunk.files value',
          () => {
            let files = ['file1', 'file2', 'file3']
            let chunkId = 1
            let chunk = {
              uniqueId: chunkId,
              files: files,
              hash: 'hash'
            }
            inst._saveChunkConfig(chunk)
            expect(inst.chunkVersions.get(chunkId)['files']).to.be.equal(files)
          }
        )
      })
      
    })
    
    describe('method _getObsoleteFiles(compilation)', () => {
      describe('in order to get obsolete chunk files', () => {
        it('SHOULD call _getChunkObsoleteFiles(chunk) for each chunk in compilation.chunks',
          () => {
            let compilation = {
              chunks: [{id: 1}, {id: 2}, {id: 3}]
            }
            let _getChunkObsoleteFiles = sinon.stub(inst, '_getChunkObsoleteFiles')
            expect(_getChunkObsoleteFiles.notCalled).to.be.true
            inst._getObsoleteFiles(compilation)
            expect(_getChunkObsoleteFiles.callCount).to.be.equal(3)
            _getChunkObsoleteFiles.args.forEach((args, index) => {
              expect(args[0].id).to.be.deep.equal(compilation.chunks[index].id)
            })
          })
        
        it('SHOULD return concatenated array of obsolete files of all of the chunks (if any)',
          () => {
            let compilation = {
              chunks: ['chunk1', 'chunk2', 'chunk3']
            }
            let _getChunkObsoleteFiles = sinon.stub(inst, '_getChunkObsoleteFiles')
            _getChunkObsoleteFiles.onFirstCall().returns(['file1', 'file2'])
            _getChunkObsoleteFiles.onSecondCall().returns(['file3', 'file4', 'file5'])
            _getChunkObsoleteFiles.onThirdCall().returns(['file6'])
            expect(inst._getObsoleteFiles(compilation)).to.be.deep.equal(
              ['file1', 'file2', 'file3', 'file4', 'file5', 'file6']
            )
          })
        
        it('SHOULD return empty array if there are no chunks', () => {
          let compilation = {
            chunks: []
          }
          expect(inst._getObsoleteFiles(compilation)).to.be.deep.equal([])
        })
        
        it('SHOULD return empty array if there are no obsolete files in all of the chunks', () => {
          let compilation = {
            chunks: ['chunk1', 'chunk2', 'chunk3']
          }
          sinon.stub(inst, '_getChunkObsoleteFiles').returns([])
          expect(inst._getObsoleteFiles(compilation)).to.be.deep.equal([])
        })
        
      })
    })
    
    
    describe('method _getChunkObsoleteFiles(chunk)', () => {
      describe('in order to get obsolete chunk files', () => {
        it('SHOULD return empty array if there is no chunkVersions[chunk.name]', () => {
          let chunk = {
            uniqueId: 1
          }
          expect(inst._getChunkObsoleteFiles(chunk)).to.be.deep.equal([])
        })
        
        it('SHOULD return only obsolete files', () => {
          const chunkId = 1
          let oldChunk = {
            uniqueId: chunkId,
            files: ['file1(old-name)', 'file2(old-name)', 'file3(old-name)']
          }
          inst.chunkVersions.set(chunkId, {
            files: oldChunk.files
          })
          let newChunk = Object.assign(oldChunk, {
            files: ['file1(old-name)', 'file2(old-name)', 'file3(new-name)']
          })
          expect(inst._getChunkObsoleteFiles(newChunk)).to.be.deep.equal(['file3(old-name)'])
        })
        
        it('SHOULD call _saveChunkConfig(chunk) method in any case',
          () => {
            let chunk = {
              name: 'test',
              files: ['file1', 'file2']
            }
            let _saveChunkConfig = sinon.stub(inst, '_saveChunkConfig')
            
            // 1) if there is no chunkVersions[chunk.name]
            expect(_saveChunkConfig.called).to.be.false
            inst._getChunkObsoleteFiles(chunk)
            expect(_saveChunkConfig.callCount).to.be.equal(1)
            expect(_saveChunkConfig.args[0][0]).to.be.deep.equal(chunk)
            _saveChunkConfig.reset()
            
            // 2) otherwise
            inst.chunkVersions[chunk.name] = {files: chunk.files}
            expect(_saveChunkConfig.called).to.be.false
            inst._getChunkObsoleteFiles(chunk)
            expect(_saveChunkConfig.callCount).to.be.equal(1)
            expect(_saveChunkConfig.args[0][0]).to.be.deep.equal(chunk)
          })
        
      })
    })
    
    
    describe('method apply(compiler)', () => {
      describe('in order to remove obsolete chunks files in webpack watch mode', () => {
        it(
          `SHOULD get hooked on compiler 'after-emit' event and pass _removeObsoleteFiles method
          as a callback`,
          () => {
            let compiler = {
              plugin: sinon.stub()
            }
            sinon.stub(inst._removeObsoleteFiles, 'bind').returns(inst._removeObsoleteFiles)
            inst.apply(compiler)
            expect(compiler.plugin.callCount).to.be.equal(1)
            expect(compiler.plugin.args[0][0]).to.be.equal('after-emit')
            expect(compiler.plugin.args[0][1]).to.be.equal(inst._removeObsoleteFiles)
            expect(inst._removeObsoleteFiles.bind.called).to.be.true
            expect(inst._removeObsoleteFiles.bind.args[0]).to.be.deep.equal([inst, compiler])
          })
      })
    })
    
    
    describe('method _removeObsoleteFiles(compiler, compilation, done)', () => {
      describe('in order to remove obsolete chunks files in webpack watch mode', () => {
        let done
        let compilation
        let compiler
        let _getObsoleteFiles
        beforeEach(() => {
          compilation = Math.random()
          _getObsoleteFiles = sinon.stub(inst, '_getObsoleteFiles').returns([])
          done = sinon.stub()
          sinon.stub(del, 'sync')
        })
        
        afterEach(() => {
          del.sync.restore()
        })
        
        it('SHOULD call _getObsoleteFiles(compilation) method', () => {
          expect(_getObsoleteFiles.notCalled).to.be.true
          inst._removeObsoleteFiles(compiler, compilation, done)
          expect(_getObsoleteFiles.callCount).to.be.equal(1)
          expect(_getObsoleteFiles.args[0][0]).to.be.equal(compilation)
        })
        
        it('SHOULD call del.sync(filePath) for each obsolete file', () => {
          compiler = {
            outputPath: 'absolute/path/to/output/folder/'
          }
          let obsoleteFiles = ['obsolete-file1', 'obsolete-file2', 'obsolete-file3']
          _getObsoleteFiles.returns(obsoleteFiles)
          expect(del.sync.notCalled).to.be.true
          inst._removeObsoleteFiles(compiler, compilation, done)
          expect(del.sync.callCount).to.be.equal(obsoleteFiles.length)
          del.sync.args.forEach((args, index) => {
            expect(args[0]).to.be.deep.equal(path.join(compiler.outputPath, obsoleteFiles[index]))
          })
        })
        
        it('SHOULD call done() callback at the end', () => {
          expect(done.notCalled).to.be.true
          inst._removeObsoleteFiles(compiler, compilation, done)
          expect(done.callCount).to.be.equal(1)
        })
      })
    })

    describe('method _setOptions()', () => {
      describe('in order to set default options correctly', () => {
        beforeEach(() => {
          inst._setOptions() // no options provided
        })
        it(
          'SHOULD set verbose option to true',
          () => {
            expect(inst.options.verbose).to.be.true
          })
      })

      describe('in order to act correctly with verbose option', () => {
        beforeEach(() => {
          sinon.stub(console, 'info') // no options provided
        })
        afterEach(() => {
          console.info.restore() // eslint-disable-line no-console
        })

        it(
          'SHOULD call console.info if verbose option === true',
          () => {
            inst._setOptions({verbose: true})
            expect(console.info.notCalled).to.be.true // eslint-disable-line no-console
            inst._consoleInfo('test')
            expect(console.info.callCount).to.be.equal(1) // eslint-disable-line no-console
          })

        it(
          'SHOULD NOT call console.info if verbose option === false',
          () => {
            inst._setOptions({verbose: false})
            inst._consoleInfo('test')
            expect(console.info.notCalled).to.be.true // eslint-disable-line no-console
          })
      })
    })
    
  })
})
