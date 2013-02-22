var mkdirp = require('mkdirp');
var _      = require('underscore');
var common = module.exports = {};

common.mkdirp = function(p,cb) {
  return mkdirp(p, cb);
};

common.noModuleFound = function( pluginName, requiredModule ) {
  if (! requiredModule) { requiredModule = pluginName; }

  var msg = "Auton.middleware." + pluginName + "() requires the npm package '"+requiredModule+"'. use `npm install "+requiredModule+"` to give Auton support for this middleware.";
  return function(file, next) {
    var err = new Error( msg );
    next( err );
  };
};

common.destname = function destname( arg, fpath ) {
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

common.getDestination = function( file, opts ) {
  return common.destname( opts.destination, file.path ) || file.destination || null;
};

// used by paths.js to create the .destination() and .testPath() middlewares. provided for other plugins use
common.makePathPlugin = function makePathPlugin( pluginName ) {
  var errstr =
    "."+pluginName+"() requires one of the following: \n" +
    "  * if you want to transform using origPath.replace( pattern, replacementString );\n" +
    "    mw."+pluginName+"( {pattern: regexOrString, replace: replacementString } ); \n" +
    "    mw."+pluginName+"( [ regexOrString, replacementString ] ); \n" +
    "    \n" +
    "  * to use a function which returns the new filename" +
    "    mw."+pluginName+"( { transform: aFunction } ); \n" +
    "    mw."+pluginName+"( aFunction ); \n" +
    "    \n" +
    "  * to use a literal string as the filename: \n" +
    "    mw."+pluginName+"( { filename: aString } ); \n" +
    "    mw."+pluginName+"( aString ); \n" ;

  return function( opts ) {
    if (arguments.length === 2) {
      opts = _slice.call(arguments);
    }
    var o = _.extend( {}, opts );

    return function(file, next) {
      var fn = destname( opts, file.path );

      if (fn) {
        file[pluginName] = fn;
        return next();
      }

      next( new Error(errstr) );
    };
  };

};
