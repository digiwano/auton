var assert   = require('chai').assert;
var sinon    = require('sinon');
var read     = require('../../lib/middleware/read');
var fileStub = require('../_utils/file-stub');
var fs       = require('fs');

suite("Auton.Middleware.read()", function() {
  var file;
  var mw;
  setup(function() {
    file = fileStub('example/file/path.js');
  });

  teardown(function(){
    fs.readFile.restore();
  });

  test("should set file.data", function(done) {
    sinon.stub(fs, 'readFile').yields(null, "console.log('hello');");
    var mw = read();
    mw(file, function(err) {
      assert.isUndefined(err);
      assert.propertyVal( file, 'data', "console.log('hello');");
      done();
    });
  });

  test("should send error and fail gracefully on file read error", function(done) {
    sinon.stub(fs, 'readFile').yields(new Error("YOUR FILESYSTEM SUCKS MAN"));
    var mw = read();
    mw(file, function(err) {
      assert.isNotNull( err );
      assert.isDefined( err );
      assert.match( err.toString(), /SUCKS/ );
      done();
    });
  });


});