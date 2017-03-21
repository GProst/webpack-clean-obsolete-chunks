const expect = require('chai').expect;


describe('my test', function() {
  it('SHOULD say "Hello!"', function() {
    expect("Hello!").to.not.equal("By!");
  });
});