var _ = require('underscore');

var _cjsOpts = {
  indent: '  ', // set to null to avoid one-level-deep indentation. change to modify what 'one level deep' means
};
module.exports = function commonJsToAmd( opts ) {
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
