var paths         = module.exports = {};
var _             = require( 'underscore' );
var common        = require( './common' );
var destname      = common.destname;
paths.destination = common.makePathPlugin( 'destination' );
paths.testPath    = common.makePathPlugin( 'testPath' );
