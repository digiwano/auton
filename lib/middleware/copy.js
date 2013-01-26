var _      = require('underscore');
var mkdirp = require('mkdirp');
var fs     = require('fs');
var getDestination = require('./helpers').getDestination;


module.exports = function copyPlugin( opts ) {
  var o = _.extend( {}, opts );
  return function(file, next) {
    var fpath = file.fullpath;
    var outputPath = getDestination( file, o );
    file.debug("[middleware: copy] "+file.path+" -> "+outputPath);
    if (! outputPath) {
      return next( new Error(".copy() requires either a .destination set on file, or .copy({destination: ...}) passed!") );
    }
    var outputFull = path.resolve( file.root, outputPath );
    var outdir     = path.dirname( outputFull );

    file.debug2("[middleware: copy] ensure dir exists: "+ outdir);
    mkdirp(outdir, function(err) {
      if (err) { file.debug2("[middleware: copy] mkdir error: "+err); return next(err); }
      file.debug2("[middleware: copy] beginning file copy: " + [fpath,outputFull].join(' / '));
      var instream  = fs.createReadStream( fpath );
      var outstream = fs.createWriteStream( outputFull );

      instream .on('error', function(err) { file.debug2("[middleware: copy] file copy error: "+err); return next(err); });
      outstream.on('error', function(err) { file.debug2("[middleware: copy] file copy error: "+err); return next(err); });
      outstream.on('close', function() {
        file.success('saved ' + outputPath);
        return next();
      });

      instream.pipe( outstream );
    });
  };
};
