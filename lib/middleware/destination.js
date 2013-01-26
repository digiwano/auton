var destname = require('./common').destname;
var _        = require( 'underscore' );

module.exports = function destinationPlugin( opts ) {
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
