var _ = require('underscore');

var helpers = module.exports = {};

var destname = helpers.destname = function destname( arg, fpath ) {
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

var getDestination = helpers.getDestination = function( file, opts ) {
  return destname( opts.destination, file.path ) || file.destination || null;
};
