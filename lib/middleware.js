var path     = require( 'path' );
var fs       = require( 'fs' );

var mkdirp   = require( 'mkdirp' );
var _        = require( 'underscore' );

var jshint   = require( 'jshint' ).JSHINT;
var UglifyJS = require( 'uglify-js' );

var _slice   = Array.prototype.slice;


var mw           = module.exports = {};
mw.common        = require('./middleware/common');

// includes .destination() and .testPath()
_.extend( mw, require('./middleware/paths') );

mw.destination   = require('./middleware/destination');
mw.testpath      = require('./middleware/testpath');

mw.read          = require('./middleware/read');
mw.last          = require('./middleware/last');
mw.copy          = require('./middleware/copy');
mw.save          = require('./middleware/save');
mw.checkAge      = require('./middleware/check-age');
mw.commonJsToAmd = require('./middleware/commonjs-to-amd');

mw.stylus        = require('./middleware/ext/stylus');
mw.cssmin        = require('./middleware/ext/cssmin');
mw.uglifyjs      = require('./middleware/ext/uglifyjs');
mw.jshint        = require('./middleware/ext/jshint');
mw.less          = require('./middleware/ext/less');
mw.coffee        = require('./middleware/ext/coffee');
mw.gzip          = require('./middleware/gzip');
