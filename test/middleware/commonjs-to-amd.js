var assert   = require('chai').assert;
var sinon    = require('sinon');
var commonJsToAmd = require('../../lib/middleware/commonjs-to-amd');
var fileStub = require('../_utils/file-stub');
var fs       = require('fs');

suite("Auton.Middleware.commonJsToAmd()", function() {
  var file;
  var mw;
  setup(function() {
    file = fileStub('example/file/path.js');
    file.data = "\n//line 2\nconsole.log('hi');";
  });

  teardown(function(){
    file = null;
  });

  test("should wrap file.data in AMD wrapping suitable for require.js or similar, wrapping one indent level", function(done) {
    var mw = commonJsToAmd();
    mw(file, function(err) {
      assert.isUndefined(err);
      assert.property(file, 'data');
      assert.propertyVal( file, 'data', "define(function(require, exports, module) { \n  //line 2\n  console.log('hi');\n});\n");
      done();
    });
  });

  test("should accept indent:null for no re-indentation", function(done) {
    var mw = commonJsToAmd({indent:null});
    mw(file, function(err) {
      assert.isUndefined(err);
      assert.property(file, 'data');
      assert.propertyVal( file, 'data', "define(function(require, exports, module) { \n//line 2\nconsole.log('hi');\n});\n");
      done();
    });
  });

  test("should accept indent:\"ArbitraryString\" for no re-indentation", function(done) {
    var mw = commonJsToAmd({indent:"/* BOUNCE */  "});
    mw(file, function(err) {
      assert.isUndefined(err);
      assert.property(file, 'data');
      assert.propertyVal( file, 'data', "define(function(require, exports, module) { \n/* BOUNCE */  //line 2\n/* BOUNCE */  console.log('hi');\n});\n");
      done();
    });
  });


});