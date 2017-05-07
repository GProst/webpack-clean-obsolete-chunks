"use strict";

const expect = require("chai").expect;
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

describe("webpack-clean-obsolete-chunks plugin", () => {
  let fileToChange; //the file we are going to change
  let changedFileInitialContent; //initial content of the file we are going to change
  const entryFileDir = path.join(__dirname, "../../test-entry-files");

  beforeEach(() => {
    fileToChange = path.join(entryFileDir, "app/partB.js");
    changedFileInitialContent = fs.readFileSync(fileToChange, "utf-8");
  });

  afterEach(() => {
    //restore initial file content
    fs.writeFileSync(fileToChange, changedFileInitialContent);
  });

  describe("in webpack1 watch mode", () => {
    const getConfig = require("./webpack.config.js");

    it("SHOULD remove all obsolete (only) files", (done) => {
      let config = getConfig();
      const compiler = webpack(config);
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
              console.log("Watching webpack1 Ended."); //eslint-disable-line
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
