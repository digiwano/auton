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
