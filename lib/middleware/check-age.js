var _      = require('underscore');
var fs     = require('fs');
var path   = require('path');
var getDestination = require('./common').getDestination;

module.exports = function checkAgePlugin( opts ) {
  var o = _.extend( {}, opts );
  return function(file, next) {
    var fpath = file.fullpath;
    var testPath = getDestination( file, o );
    var fullTestPath = path.resolve( file.root, testPath );
    file.debug( "[middleware: checkAge] checking "+ file.path +" against "+testPath );

    fs.stat( fpath, function(err, srcStat) {
      if (err) { file.debug2("[middleware: checkAge] got error on source stat", err); return next(err); }

      fs.stat( fullTestPath, function(err, dstStat) {
        if (err) {
          if (err.code === 'ENOENT') {
            file.debug2("checkAge: destination does not exist, allow!");
            return next();
          }
          file.debug2("[middleware: checkAge] got error on destination stat", err);
          return next(err);
        }

        file.debug2('[middleware: checkAge] src: ' + srcStat.mtime + ' / ' + srcStat.mtime.getTime() );
        file.debug2('[middleware: checkAge] dst: ' + dstStat.mtime + ' / ' + dstStat.mtime.getTime() );

        if (srcStat.mtime > dstStat.mtime) {
          file.debug2("[middleware: checkAge] source is newer, allow! ");
          return next(); // yes, please re-compile
        }
        file.debug2("[middleware: checkAge] destination is newer, deny!");
        next('rule'); // this rule failed!
      });

    });

  };
};
