var path     = require( 'path' );
var fs       = require( 'fs' );

var mkdirp   = require( 'mkdirp' );
var _        = require( 'underscore' );

var jshint   = require( 'jshint' ).JSHINT;
var UglifyJS = require( 'uglify-js' );

var _slice   = Array.prototype.slice;


var mw           = module.exports = {};
mw.common        = require('./middleware/common');

mw.destination   = require('./middleware/destination');
mw.read          = require('./middleware/read');
mw.copy          = require('./middleware/copy');
mw.save          = require('./middleware/save');
mw.checkAge      = require('./middleware/check-age');
mw.commonJsToAmd = require('./middleware/commonjs-to-amd');

mw.stylus        = require('./middleware/ext/stylus');
mw.cssmin        = require('./middleware/ext/cssmin');
mw.uglifyjs      = require('./middleware/ext/uglifyjs');
mw.jshint        = require('./middleware/ext/jshint');
