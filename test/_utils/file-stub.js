var path = require('path');
var sinon = require('sinon');

module.exports = function fileStub( p ) {
  var file = {};
  file.path = p;
  file.root = "root_dir";
  file.fullPath = path.join(file.path, file.root);

  file.log     = sinon.stub();
  file.info    = sinon.stub();
  file.error   = sinon.stub();
  file.debug   = sinon.stub();
  file.debug2  = sinon.stub();
  file.warn    = sinon.stub();
  file.success = sinon.stub();

  return file;
};