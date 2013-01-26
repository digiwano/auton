var _        = require( 'underscore' );
var common   = require('../common');

var gzip;
try { gzip = require( 'gzip-script' ); } catch(e){};

if (gzip) {
  module.exports = function lessPlugin(opts) {
    var o = _.extend( {}, {level:9}, opts );
    return function(file, next) {
      file.debug("[middleware: gzip]");
      var origSize = file.data.length;
      return gzip( file.data, o.level, function(err, compressed) {
        var cmpSize = compressed.length;
        file.data = compressed;
        file.info("Gzipped "+origSize+" bytes to "+cmpSize+" bytes");
        next();
      });
    };
  };
} else {
  module.exports = common.noModuleFound('gzip');
}

