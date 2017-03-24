const expect = require('chai').expect;
const sinon = require('sinon');
const del = require('del');
const util = require('util');

const CleanObsoleteChunks = require('./../../index');

describe('CleanObsoleteChunks', () => {
  describe('instance', () => {
    let inst;
    
    beforeEach(() => {
      inst = new CleanObsoleteChunks();
    });
    
    describe(
      `in order to be able to work as a webpack plugin and remove obsolete chunks files in webpack 
      watch mode`,
      () => {
        it('SHOULD have a apply(compiler) method to call', () => {
          expect(inst).to.respondTo('apply');
        });
        
        it('SHOULD have a _removeObsoleteFiles(compilation, done) method to call', () => {
          expect(inst).to.respondTo('_removeObsoleteFiles');
        });
      });
    
    describe('in order to keep chunks versions', () => {
      it('SHOULD have an empty object in its chunkVersions property after constructed', () => {
        expect(inst).to.have.property('chunkVersions').that.deep.equals({});
      });
    });
    
    describe('in order to save chunks versions', () => {
      it('SHOULD have a _saveChunkConfig method to call', () => {
        expect(inst).to.respondTo('_saveChunkConfig');
      });
    });
    
    describe(`in order to get obsolete chunk files`, () => {
      it('SHOULD have a _getObsoleteFiles method to call', () => {
        expect(inst).to.respondTo('_getObsoleteFiles');
      });
      
      it('SHOULD have a _getChunkObsoleteFiles method to call', () => {
        expect(inst).to.respondTo('_getChunkObsoleteFiles');
      });
    });
    
    describe(`method _saveChunkConfig(chunk)`, () => {
      describe('in order to save chunks versions', () => {
        it(`SHOULD add or update its deep chunkVersions[chunk.name] property`, () => {
          let chunkName = 'testChunkName';
          expect(inst.chunkVersions).to.not.have.property(chunkName);
          let chunk = {
            name: chunkName,
            files: ['test-file-name1'],
            hash: 'hash1'
          };
          inst._saveChunkConfig(chunk);
          expect(inst.chunkVersions).to.have.property(chunk.name);
          let oldValue = inst.chunkVersions[chunk.name];
          let updatedChunk = Object.assign(chunk, {files: ['test-file-name2'], hash: 'hash2'});
          inst._saveChunkConfig(updatedChunk);
          expect(oldValue).to.not.be.equal(inst.chunkVersions[updatedChunk.name]);
        });
        
        it(
          `SHOULD set its deep chunkVersions[chunk.name]['hash'] property with chunk.hash value`,
          () => {
            let testHash = '7df8ue0ucsd0asdwd20';
            let chunk = {
              name: 'test',
              files: ['test'],
              hash: testHash
            };
            inst._saveChunkConfig(chunk);
            expect(inst.chunkVersions[chunk.name]['hash']).to.be.equal(testHash);
          }
        );
        
        it(
          `SHOULD set its deep chunkVersions[chunk.name]['files'] property with chunk.files value`,
          () => {
            let files = ['file1', 'file2', 'file3'];
            let chunk = {
              name: 'test',
              files: files,
              hash: 'hash'
            };
            inst._saveChunkConfig(chunk);
            expect(inst.chunkVersions[chunk.name]['files']).to.be.equal(files);
          }
        );
      });
      
    });
    
    describe(`method _getObsoleteFiles(compilation)`, () => {
      describe(`in order to get obsolete chunk files`, () => {
        it(`SHOULD call _getChunkObsoleteFiles(chunk) for each chunk in compilation.chunks`,
          () => {
            let compilation = {
              chunks: ['chunk1', 'chunk2', 'chunk3']
            };
            let _getChunkObsoleteFiles = sinon.stub(inst, '_getChunkObsoleteFiles');
            expect(_getChunkObsoleteFiles.notCalled).to.be.true;
            inst._getObsoleteFiles(compilation);
            expect(_getChunkObsoleteFiles.callCount).to.be.equal(3);
            expect(_getChunkObsoleteFiles.args[0][0]).to.be.equal(compilation.chunks[0]);
            expect(_getChunkObsoleteFiles.args[1][0]).to.be.equal(compilation.chunks[1]);
            expect(_getChunkObsoleteFiles.args[2][0]).to.be.equal(compilation.chunks[2]);
          });
        
        it(`SHOULD return concatenated array of obsolete files of all of the chunks (if any)`,
          () => {
            let compilation = {
              chunks: ['chunk1', 'chunk2', 'chunk3']
            };
            let _getChunkObsoleteFiles = sinon.stub(inst, '_getChunkObsoleteFiles');
            _getChunkObsoleteFiles.onFirstCall().returns(['file1', 'file2']);
            _getChunkObsoleteFiles.onSecondCall().returns(['file3', 'file4', 'file5']);
            _getChunkObsoleteFiles.onThirdCall().returns(['file6']);
            expect(inst._getObsoleteFiles(compilation)).to.be.deep.equal(
              ['file1', 'file2', 'file3', 'file4', 'file5', 'file6']
            );
          });
        
        it(`SHOULD return empty array if there are no chunks`, () => {
          let compilation = {
            chunks: []
          };
          expect(inst._getObsoleteFiles(compilation)).to.be.deep.equal([]);
        });
        
        it(`SHOULD return empty array if there are no obsolete files in all of the chunks`, () => {
          let compilation = {
            chunks: ['chunk1', 'chunk2', 'chunk3']
          };
          let _getChunkObsoleteFiles = sinon.stub(inst, '_getChunkObsoleteFiles').returns([]);
          expect(inst._getObsoleteFiles(compilation)).to.be.deep.equal([]);
        });
        
      });
    });
    
    
    describe(`method _getChunkObsoleteFiles(chunk)`, () => {
      describe(`in order to get obsolete chunk files`, () => {
        it(`SHOULD return empty array if there is no chunkVersions[chunk.name]`, () => {
          let chunk = {
            name: 'test'
          };
          expect(inst._getChunkObsoleteFiles(chunk)).to.be.deep.equal([]);
        });
        
        it(`SHOULD return empty array if chunk hasn't been changed`, () => {
          let oldChunk = {
            name: 'test',
            hash: 'abcde'
          };
          inst.chunkVersions[oldChunk.name] = oldChunk;
          let newChunk = Object.assign({}, oldChunk);
          expect(inst._getChunkObsoleteFiles(newChunk)).to.be.deep.equal([]);
        });
        
        it(`SHOULD return only obsolete files if chunk has been changed`, () => {
          let oldChunk = {
            name: 'test',
            hash: 'hash1',
            files: ['file1(old-name)', 'file2(old-name)', 'file3(old-name)']
          };
          inst.chunkVersions[oldChunk.name] = {
            hash: oldChunk.hash,
            files: oldChunk.files
          };
          let newChunk = Object.assign(oldChunk, {
            hash: 'hash2',
            files: ['file1(old-name)', 'file2(old-name)', 'file3(new-name)']
          });
          expect(inst._getChunkObsoleteFiles(newChunk)).to.be.deep.equal(['file3(old-name)']);
        });
        
        it(`SHOULD call _saveChunkConfig(chunk) method in any case`,
          () => {
            let chunk = {
              name: 'test',
              hash: 'abcde'
            };
            let _saveChunkConfig = sinon.stub(inst, '_saveChunkConfig');
            
            // 1) if there is no chunkVersions[chunk.name]
            expect(_saveChunkConfig.called).to.be.false;
            inst._getChunkObsoleteFiles(chunk);
            expect(_saveChunkConfig.callCount).to.be.equal(1);
            expect(_saveChunkConfig.args[0][0]).to.be.deep.equal(chunk);
            _saveChunkConfig.reset();
            
            // 2) otherwise
            inst.chunkVersions[chunk.name] = chunk;
            expect(_saveChunkConfig.called).to.be.false;
            inst._getChunkObsoleteFiles(chunk);
            expect(_saveChunkConfig.callCount).to.be.equal(1);
            expect(_saveChunkConfig.args[0][0]).to.be.deep.equal(chunk);
          });
        
      });
    });
    
    
    describe(`method apply(compiler)`, () => {
      describe('in order to remove obsolete chunks files in webpack watch mode', () => {
        it(
          `SHOULD get hooked on compiler 'after-emit' event and pass _removeObsoleteFiles method 
          as a callback`,
          () => {
            let compiler = {
              plugin: sinon.stub()
            };
            sinon.stub(inst._removeObsoleteFiles, 'bind').returns(inst._removeObsoleteFiles);
            inst.apply(compiler);
            expect(compiler.plugin.callCount).to.be.equal(1);
            expect(compiler.plugin.args[0][0]).to.be.equal('after-emit');
            expect(compiler.plugin.args[0][1]).to.be.equal(inst._removeObsoleteFiles);
            expect(inst._removeObsoleteFiles.bind.called).to.be.true;
            expect(inst._removeObsoleteFiles.bind.args[0][0]).to.be.equal(inst);
            expect(inst._removeObsoleteFiles.bind.args[0][1]).to.be.equal(compiler);
          });
      });
    });
    
    
    describe(`method _removeObsoleteFiles(compiler, compilation, done)`, () => {
      describe(`in order to remove obsolete chunks files in webpack watch mode`, () => {
        let done;
        let compilation;
        let compiler;
        let _getObsoleteFiles;
        beforeEach(() => {
          compilation = Math.random();
          _getObsoleteFiles = sinon.stub(inst, '_getObsoleteFiles').returns([]);
          done = sinon.stub();
          sinon.stub(del, 'sync');
        });
        
        afterEach(() => {
          del.sync.restore();
        });
        
        it(`SHOULD call _getObsoleteFiles(compilation) method`, () => {
          expect(_getObsoleteFiles.notCalled).to.be.true;
          inst._removeObsoleteFiles(compiler, compilation, done);
          expect(_getObsoleteFiles.callCount).to.be.equal(1);
          expect(_getObsoleteFiles.args[0][0]).to.be.equal(compilation);
        });
        
        it(`SHOULD call del.sync(filePath) for each obsolete file`, () => {
          compiler = {
            outputPath: 'absolute/path/to/output/folder/'
          };
          let obsoleteFiles = ['obsolete-file1', 'obsolete-file2', 'obsolete-file3'];
          _getObsoleteFiles.returns(obsoleteFiles);
          expect(del.sync.notCalled).to.be.true;
          inst._removeObsoleteFiles(compiler, compilation, done);
          expect(del.sync.callCount).to.be.equal(obsoleteFiles.length);
          expect(del.sync.args[0][0]).to.be.equal(compiler.outputPath + obsoleteFiles[0]);
          expect(del.sync.args[1][0]).to.be.equal(compiler.outputPath + obsoleteFiles[1]);
          expect(del.sync.args[2][0]).to.be.equal(compiler.outputPath + obsoleteFiles[2]);
        });
        
        it(`SHOULD call done() callback at the end`, () => {
          expect(done.notCalled).to.be.true;
          inst._removeObsoleteFiles(compiler, compilation, done);
          expect(done.callCount).to.be.equal(1);
        });
      });
    });
    
  });
});