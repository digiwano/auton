var _        = require( 'underscore' );
var zlib     = require( 'zlib' );

module.exports = function(opts) {
  return function(file, next) {
    var origSize = file.data.length;
    zlib.gzip(file.data, function(err, compressed) {
      if (err) {
        return next(err);
      }
      var cmpSize = compressed.length;
      file.data = compressed;
      file.info("Gzipped "+origSize+" bytes to "+cmpSize+" bytes");
      next();
    });
  };
};


