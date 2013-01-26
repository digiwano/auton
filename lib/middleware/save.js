var common = require('./common');
var _      = require( 'underscore' );
var fs     = require( 'fs' );
var path   = require( 'path' );

module.exports = function savePlugin( opts ) {
  var o = _.extend( {}, { encoding: 'utf8' }, opts );
  return function(file, next) {
    var outputPath = common.getDestination( file, o );
    if (! outputPath) {
      return next( new Error(".save() requires either a .destination set on file, or .save({destination: ...}) passed!") );
    }
    var fullOP = path.resolve( file.root, outputPath );
    var outdir = path.dirname( fullOP );
    file.debug("[middleware: save] "+file.path+" -> "+outputPath);
    common.mkdirp(outdir, function(err) {
      if (err) { return next(err); }
      fs.writeFile( fullOP, _.result(o, 'data') || file.data, o.encoding, function(err) {
        if (err) { return next(err); }
        file.success('saved ' + outputPath);
        next();
      } );
    });
  };
};

