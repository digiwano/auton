var _        = require( 'underscore' );
var common   = require('../common');

var jshint;
try { jshint = require( 'jshint' ).JSHINT; } catch(e){};

if (jshint) {

  module.exports = function( opts ) {
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

} else {
  module.exports = common.noModuleFound('jshint');
}