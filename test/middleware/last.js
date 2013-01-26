var assert = require('chai').assert;
var last   = require('../../lib/middleware/last');
var fileStub = require('../_utils/file-stub');

suite("Auton.Middleware.last()", function() {
  test("should set file._lastRule", function(done) {
    var file = fileStub('example/file/path.js');
    var mw = last();
    mw(file, function(err) {
      assert.isUndefined(err);
      assert.propertyVal(file, '_lastRule', true);
      done();
    });
  });
});