"use strict";

const expect = require("chai").expect;
const fs = require("fs");
const del = require("del");
const webpack = require("webpack");

describe("webpack-clean-obsolete-chunks plugin in webpack2 watch mode", () => {
  const config = require("./webpack.config.js");
  const outputFilesDir = config.output.path;

  afterEach(() => {
    //removing created directory after tests
    del.sync(outputFilesDir + "/**", {force: true});
  });

  it("SHOULD not delete dynamic chunks on first compilation", (done) => {
    const compiler = webpack(config);

    compiler.run((err, stats) => {
      handleErrors(err, stats);

      const files = fs.readdirSync(outputFilesDir);
      expect(files.length).to.be.equal(14); //yeah, that's not cool checking
      done();
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
