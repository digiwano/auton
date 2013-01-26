var fs = require('fs');
var _  = require( 'underscore' );

module.exports = function readPlugin( opts ) {
  var o = _.extend( {}, { encoding: 'utf8' }, opts );
  return function(file, next) {
    file.debug("[middleware: read]");
    var fpath = file.fullpath;
    fs.readFile(fpath, o.encoding, function(err, data) {
      if (err) { return next(err); }
      file.data = data;
      file.debug2("[middleware: read] read " + data.length + " bytes");
      next();
    });
  };
};
