var path     = require( 'path' );
var fs       = require( 'fs' );

var mkdirp   = require( 'mkdirp' );
var _        = require( 'underscore' );

var jshint   = require( 'jshint' ).JSHINT;
var UglifyJS = require( 'uglify-js' );

var stylus   = require( 'stylus' );
var nib      = require( 'nib' );
var cssmin   = require( 'cssmin' );

var _slice   = Array.prototype.slice;


var mw       = module.exports = {};
mw.helpers   = {};

var destname = mw.helpers.destname = function destname( arg, fpath ) {
  if (! arg) { return null; }
  if (_.isString(arg)) {
    arg = { filename: arg };
  } else if (_.isFunction(arg)) {
    arg = { transform: arg };
  } else if (_.isArray(arg) && arg.length === 2) {
    arg = { pattern: arg[0], replace: arg[1] };
  }

  if (arg.pattern && arg.replace) { return fpath.replace( arg.pattern, arg.replace ); }
  if (arg.transform) { return arg.transform( fpath ); }
  if (arg.filename) { return arg.filename; }
  return null;
};

var getDestination = mw.helpers.getDestination = function( file, opts ) {
  return destname( opts.destination, file.path ) || file.destination || null;
};

mw.destination = function( opts ) {
  if (arguments.length === 2) {
    opts = _slice.call(arguments);
  }
  var o = _.extend( {}, opts );
  var errstr = ".destination() requires one of the following: \n" +
               "  * if you want to transform using origPath.replace( pattern, replacementString );\n" +
               "    mw.destination( {pattern: regexOrString, replace: replacementString } ); \n" +
               "    mw.destination( [ regexOrString, replacementString ] ); \n" +
               "    \n" +
               "  * to use a function which returns the destination filename" +
               "    mw.destination( { transform: aFunction } ); \n" +
               "    mw.destination( aFunction ); \n" +
               "    \n" +
               "  * to use a literal string as the filename: \n" +
               "    mw.destination( { filename: aString } ); \n" +
               "    mw.destination( aString ); \n" ;
  return function(file, next) {
    var fn = destname( opts, file.path );

    if (fn) {
      file.destination = fn;
      return next();
    }

    next( new Error(errstr) );
  };
};

mw.read = function( opts ) {
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

mw.save = function( opts ) {
  var o = _.extend( {}, { encoding: 'utf8' }, opts );
  return function(file, next) {
    var outputPath = getDestination( file, o );
    if (! outputPath) {
      return next( new Error(".save() requires either a .destination set on file, or .save({destination: ...}) passed!") );
    }
    var fullOP = path.resolve( file.root, outputPath );
    var outdir = path.dirname( fullOP );
    file.debug("[middleware: save] "+file.path+" -> "+outputPath);
    mkdirp(outdir, function(err) {
      if (err) { return next(err); }
      fs.writeFile( fullOP, _.result(o, 'data') || file.data, file.encoding, function(){
        file.success('saved ' + outputPath);
        next();
      } );
    });
  };
};

mw.copy = function( opts ) {
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

mw.checkAge = function( opts ) {
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

mw.stop = function( opts ) {
  return function( file, next ) {
    file.debug("[middleware: stop]" + (opts.last ? " last rule" : " continue to next rule") );
    if (opts.last) { file._lastRule = true; }
    next('rule');
  }
};

mw.last = function( opts ) {
  return function(file, next) {
    file.debug("[middleware: last]");
    file._lastRule = true;
    next();
  };
};

var _cjsOpts = {
  indent: '  ', // set to null to avoid one-level-deep indentation. change to modify what 'one level deep' means
};
mw.commonJsToAmd = function( opts ) {
  var o = _.extend( {}, _cjsOpts, opts );
  return function( file, next ) {
    file.debug("[middleware: commonJsToAmd]");
    file.data =
      "define(function(require, exports, module) { " + // no \n here so that we preserve line numbers!
        (o.indent === null ? file.data : file.data.replace(/\n/g, '\n'+o.indent)) +
      "\n});\n";
    next();
  };
};

mw.jshint = function( opts ) {
  var o = _.extend( {}, opts );

  return function(file, next) {
    file.debug("[middleware: jshint]");
    var result = jshint( file.data, o );
    if (result) {
      return next();
    }

    var errorString = "Error in " + file.path + ": \n";

    (jshint.errors || []).forEach(function(e){
      if (e === null) { errorString += "JSHint returned 'null'\n"; return; }
      errorString += e.id + " [Line " + e.line + ", Char " + e.character + "] " + e.reason + "\n" +
                     " >>> " + e.evidence + "\n";
    });

    next( new Error("JSHint error: " + errorString) );
  };
};

mw.uglifyjs = function( opts ) {
  return function( file, next ) {
    var wf = UglifyJS.AST_Node.warn_function;
    UglifyJS.AST_Node.warn_function = function(info) {
      file.warn(info);
    };
    var toplevelAst = UglifyJS.parse( file.data, {});
    toplevelAst.figure_out_scope();

    var compressor    = UglifyJS.Compressor();
    var compressedAst = toplevelAst.transform(compressor);

    compressedAst.figure_out_scope();
    compressedAst.compute_char_frequency();
    compressedAst.mangle_names();

    var code = compressedAst.print_to_string();
    UglifyJS.AST_Node.warn_function = wf;
    file.data = code + "\n";
    next();
  }
};

mw.stylus = function( opts ) {
  return function(file, next) {
    var o = _.extend( {}, {filename: file.path}, opts );
    stylus( file.data, o ).use( nib() ).render(function(err, css) {
      if (err) { return next(err); }
      file.data = css;
      next();
    });
  };
};

mw.cssmin = function(opts) {
  // opts is ignored for cssmin
  return function(file, next) {
    try {
      var d = cssmin.cssmin( file.data );
      file.data = d;
      next();
    } catch (e) {
      next(e);
    }
  };
};


