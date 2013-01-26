var assert   = require('chai').assert;
var sinon    = require('sinon');
var common   = require('../../lib/middleware/common');
var save     = require('../../lib/middleware/save');
var fileStub = require('../_utils/file-stub');
var fs       = require('fs');
var path     = require('path');

suite("Auton.Middleware.save()", function() {
  var file;
  var mw;
  setup(function() {
    file = fileStub('example/file/path.js');
  });

  teardown(function(){
    fs.writeFile.restore();
    common.mkdirp.restore();
    file = null;
  });

  test("should send .data", function(done) {
    file.data = "hello baby";
    file.destination = "output/file/path.js";
    sinon.stub(fs, 'writeFile').yields(null);
    sinon.stub(common, 'mkdirp').yields();
    var mw = save();
    mw(file, function(err) {
      assert.isUndefined(err);
      assert.isTrue( fs.writeFile.called );
      var args = fs.writeFile.getCall(0).args;
      assert.equal( args[0], path.resolve(file.root, 'output/file/path.js') );
      assert.equal( args[1], 'hello baby' );
      assert.equal( args[2], 'utf8' );
      done();
    });
  });

  test("should send error and fail gracefully on file read error", function(done) {
    file.data = "hello baby";
    file.destination = "output/file/path.js";
    sinon.stub(fs, 'writeFile').yields(new Error("YOUR FILESYSTEM SUCKS BRO"));
    sinon.stub(common, 'mkdirp').yields();
    var mw = save();
    mw(file, function( err ) {
      assert.isNotNull( err );
      assert.isDefined( err );
      assert.match( err.toString(), /SUCKS/ );
      done();
    });
  });

  test("should send error and fail gracefully on mkdir error", function(done) {
    file.data = "hello baby";
    file.destination = "output/file/path.js";
    sinon.stub(fs, 'writeFile').yields(null, "data");
    sinon.stub(common, 'mkdirp').yields(new Error("Bananas"));
    var mw = save();
    mw(file, function( err ) {
      assert.isNotNull( err );
      assert.isDefined( err );
      assert.match( err.toString(), /Bananas/ );
      done();
    });
  });


});