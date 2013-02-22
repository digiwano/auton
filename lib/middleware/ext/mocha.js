var _        = require( 'underscore' );
var common   = require( '../common' );
var Mocha;

try { Mocha = require('mocha'); } catch (e){};

if ( Mocha ) {
  var Base = Mocha.reporters.Base;

  module.exports = function mochaPlugin( opts ) {

    return function(file, next) {
      var mocha = new Mocha;
      mocha.reporter( reporter );

      function reporter(runner) {
        var failures = [];
        Base.call( this, runner );
        runner.on('fail', function(t) { failures.push(t); });
        runner.on('end',  function( ) {
          if (! failures.length) { return next(); }

          failures.forEach(function(f) {
            file.error("test failed: "+test.fullTitle+": "+f.err.message;
          });
          next("failed tests :(");
        });
      }

    };

  };

} else {

  module.exports = common.noModuleFound('mocha');

}


