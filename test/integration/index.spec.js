const expect = require('chai').expect;
const webpack2 = require('webpack');
const config = require('./webpack.config');
const path = require('path');
const fs = require('fs');

describe('webpack-clean-obsolete-chunks plugin', () => {
  describe('in webpack2 watch mode', () => {
    it(`SHOULD remove all obsolete (only) files`, (done) => {
      const compiler = webpack2(config);
      let firstCompilation = true;
      let oldFiles;
      let newFiles;
      let fileToChange = path.join(__dirname, 'test-entry-files/app/partB.js');
      let changedFileInitialContent;
      
      const watching = compiler.watch({
        aggregateTimeout: 300,
        poll: 1000
      }, (err, stats) => {
        handleErrors(err, stats);
        
        if (firstCompilation) {
          oldFiles = fs.readdirSync(path.join(__dirname, 'test-output-files'));
          changedFileInitialContent = fs.readFileSync(fileToChange, 'utf-8');
          //following should only change app.*.js and app.*.js.map
          fs.writeFileSync(fileToChange, 'testString');
          firstCompilation = false;
        } else {
          //restore initial file content
          fs.writeFileSync(fileToChange, changedFileInitialContent);
          
          newFiles = fs.readdirSync(path.join(__dirname, 'test-output-files'));
          let changedFiles = oldFiles.filter(oldFile => newFiles.indexOf(oldFile) === -1);
          expect(changedFiles).to.have.length.above(0);
          changedFiles.forEach(changedFile => {
            expect(changedFile).to.match(/app.*.js.*/);
          });
          done();
        }
      });
      
    });
  });
});

function handleErrors(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }
  
  const info = stats.toJson();
  
  if (stats.hasErrors()) {
    console.error(info.errors);
  }
  
  if (stats.hasWarnings()) {
    console.warn(info.warnings)
  }
}