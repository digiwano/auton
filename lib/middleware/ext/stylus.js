var _        = require( 'underscore' );
var common   = require( '../common' );
var stylus;
var nib;

try { stylus = require('stylus'); } catch (e){};
try { nib    = require('nib');    } catch (e){};

if (stylus) {

  module.exports = function stylusPlugin( opts ) {
    return function(file, next) {
      var o = _.extend( {}, {filename: file.path}, opts );
      var x = stylus( file.data, o );

      if (nib) {
        x.use( nib() );
      }

      x.render(function(err, css) {
        if (err) { return next(err); }
        file.data = css;
        next();
      });
    };
  };

} else {

  module.exports = common.noModuleFound('stylus');

}

