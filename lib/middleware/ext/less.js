var _        = require( 'underscore' );
var common   = require('../common');

var less;
try { less = require( 'less' ); } catch(e){};

if (less) {
  module.exports = function lessPlugin(opts) {
    var o = _.extend( {}, opts );

    return function(file, next) {
      file.debug("[middleware: less]");
      var that = this;
      var realOpts = _.extend({}, {filename: file.path}, opts);
      less.render(file.data, realOpts, function(err, css){
        if (err) { return next(err.message); }
        file.data = css;
        next();
      });
    };
  };
} else {
  module.exports = common.noModuleFound('less');
}