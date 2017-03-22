const expect = require('chai').expect;

const CleanObsoleteChunks = require('./../../index');

describe('CleanObsoleteChunks', () => {
  describe('instance', () => {
    let inst;
    
    beforeEach(() => {
      inst = new CleanObsoleteChunks();
    });
    
    describe('in order to keep chunks versions', () => {
      it('SHOULD have an empty object in its chunkVersions property after constructed', () => {
        expect(inst).to.have.property('chunkVersions').that.deep.equals({});
      });
    });
    
    describe('in order to save chunks versions', () => {
      it('SHOULD have a saveChunkConfig method to call', () => {
        expect(inst).to.respondTo('saveChunkConfig');
      });
      
      describe('via its saveChunkConfig(chunk) method', () => {
        it(`SHOULD add or update its deep chunkVersions[chunk.name] property`, () => {
          let chunkName = 'testChunkName';
          expect(inst.chunkVersions).to.not.have.property(chunkName);
          let chunk = {
            name: chunkName,
            files: ['test-file-name1'],
            hash: 'hash1'
          };
          inst.saveChunkConfig(chunk);
          expect(inst.chunkVersions).to.have.property(chunk.name);
          let oldValue = inst.chunkVersions[chunk.name];
          let updatedChunk = Object.assign(chunk, {files: ['test-file-name2'], hash: 'hash2'});
          inst.saveChunkConfig(updatedChunk);
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
            inst.saveChunkConfig(chunk);
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
            inst.saveChunkConfig(chunk);
            expect(inst.chunkVersions[chunk.name]['files']).to.be.equal(files);
          }
        );
        
      });
    });
    
  });
});