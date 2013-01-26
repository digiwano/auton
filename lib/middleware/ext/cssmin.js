
var common = require('../common');
var cssmin;

try { cssmin = require('cssmin'); } catch (e){};

if (cssmin) {

  module.exports = function(opts) {
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

} else {

  module.exports = common.noModuleFound('cssmin');

}

