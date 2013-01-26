var _        = require( 'underscore' );
var common   = require('../common');

var coffee;
try { coffee = require( 'coffee-script' ); } catch(e){};

if (coffee) {
  module.exports = function coffeePlugin(opts) {
    return function(file, next) {
      file.debug("[middleware: coffee]");
      var data;

      try       { data = coffee.compile( file.data ); }
      catch (e) { return next(e); }

      file.data = data;
      next();
    };
  };
} else {
  module.exports = common.noModuleFound('coffee', 'coffee-script');
}
