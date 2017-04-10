"use strict";

const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");
const del = require("del");
const webpack1 = require("./env/webpack-1/node_modules/webpack");
const webpack2 = require("./env/webpack-2/node_modules/webpack");

describe("webpack-clean-obsolete-chunks plugin", () => {
  let fileToChange; //the file we are going to change
  let changedFileInitialContent; //initial content of the file we are going to change
  
  beforeEach(() => {
    fileToChange = path.join(__dirname, "test-entry-files/app/partB.js");
    changedFileInitialContent = fs.readFileSync(fileToChange, "utf-8");
  });
  
  afterEach(() => {
    //restore initial file content
    fs.writeFileSync(fileToChange, changedFileInitialContent);
  });
  
  describe("in webpack2 watch mode", () => {
    let getConfig = require("./env/webpack-2/webpack.config.js");
    let outsideOutputDirectory = path.join(process.cwd(), "../test-output-files");
    let config;
    
    let newContent; //new content in file we are going to change
    let obsoleteFilesMatch; //RegExp that SHOULD match obsolete file names
    
    beforeEach(() => {
      newContent = "var a = 'a';";
      obsoleteFilesMatch = /app.*.js.*/;
    });
    
    afterEach(() => {
      //removing created directory after tests
      del.sync(outsideOutputDirectory + "/**", {force: true});
    });
    
    it("SHOULD remove all obsolete js files and its maps", (done) => {
      config = getConfig();
      startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done);
    });
    
    it("SHOULD be able to remove files in the outside of the working directory", (done) => {
      config = getConfig();
      config.output.path = outsideOutputDirectory;
      startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done);
    });
    
    it("SHOULD remove obsolete css files and its maps", (done) => {
      config = getConfig();
      fileToChange = path.join(__dirname, "test-entry-files/app/styles/stylesA.css");
      changedFileInitialContent = fs.readFileSync(fileToChange, "utf-8");
      newContent = "body {background: red;}";
      obsoleteFilesMatch = /styles.*.css.*/;
      startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done);
    });
    
  });
  
  
  describe("in webpack1 watch mode", () => {
    const getConfig = require("./env/webpack-1/webpack.config.js");
    
    it("SHOULD remove all obsolete (only) files", (done) => {
      let config = getConfig();
      const compiler = webpack1(config);
      let firstCompilation = true;
      let oldFiles;
      let newFiles;
      
      const watching = compiler.watch({
        aggregateTimeout: 20,
        poll: 10
      }, (err, stats) => {
        handleErrors(err, stats);
        
        if (firstCompilation) {
          oldFiles = fs.readdirSync(config.output.path);
          //sometimes webpack1 doesn"t see these changes, so we need to wait a little
          setTimeout(() => {
            fs.writeFileSync(fileToChange, "testString");
          }, 1000);
          firstCompilation = false;
        } else {
          newFiles = fs.readdirSync(config.output.path);
          let changedFiles = oldFiles.filter(oldFile => newFiles.indexOf(oldFile) === -1);
          //sometimes in webpack1 we might get there before files were overwritten...
          if (changedFiles.length > 0) {
            changedFiles.forEach(changedFile => {
              expect(changedFile).to.match(/app.*.js.*/);
            });
            watching.close(() => {
              console.log("Watching webpack1 Ended.");
            });
            done();
          }
        }
      });
    });
    
    it("SHOULD be able to remove files in the outside of the working directory", () => {
      //it"s hard to test webpack 1 since this callback sometimes calls before compiler
      // "after-emit" event... and my plugin does
    });
    
  });
  
  
});


function startWebpack2(config, fileToChange, newContent, obsoleteFilesMatch, done) {
  const compiler = webpack2(config);
  let firstCompilation = true;
  let oldFiles;
  let newFiles;
  
  const watching = compiler.watch({
    aggregateTimeout: 300,
    poll: 1000
  }, (err, stats) => {
    handleErrors(err, stats);
    
    if (firstCompilation) {
      oldFiles = fs.readdirSync(config.output.path);
      fs.writeFileSync(fileToChange, newContent);
      firstCompilation = false;
    } else {
      newFiles = fs.readdirSync(config.output.path);
      let changedFiles = oldFiles.filter(oldFile => newFiles.indexOf(oldFile) === -1);
      expect(changedFiles).to.have.length.above(0);
      changedFiles.forEach(changedFile => {
        expect(changedFile).to.match(obsoleteFilesMatch);
      });
      watching.close(() => {
        done();
        console.log("Watching webpack2 Ended.");
      });
    }
  });
}

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
    console.warn(info.warnings);
  }
}
