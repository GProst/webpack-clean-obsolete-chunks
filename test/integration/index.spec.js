const webpack2 = require('webpack');
const config = require('./webpack.config');

describe('webpack-clean-obsolete-chunks plugin', () => {
  describe('in webpack2 watch mode', () => {
    it(`SHOULD remove all obsolete files`, () => {
      const compiler = webpack2(config);
      
      const watching = compiler.watch({
        aggregateTimeout: 300,
        poll: 1000
      }, (err, stats) => {
        handleErrors(err, stats);
        
        //TODO: saving and checking files
        
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