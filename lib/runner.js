var minimatch = require('minimatch');
var path      = require('path');
var async     = require('async');
var util      = require('util');
var EE2       = require('eventemitter2').EventEmitter2;
var _plugin   = require('./plugin');
var _         = require('underscore');

module.exports = Runner;

function Runner( opts ) {
  var o = _.extend({}, opts);
  this.root       = o.root;
  this.ui         = o.ui;
  this.uiSource   = 'core'; // Runner doesn't need its own type
  this.middleware = [];
  this.rules      = [];
}

util.inherits( Runner, EE2 );
_.extend( Runner.prototype, _plugin );

Runner.prototype.addRule = function( type, pattern, middleware ) {
  this.rules.push( {type: type, pattern: pattern, mw: middleware });
};

Runner.prototype.addMiddleware = function( pattern, fn ) {
  this.middleware.push( {type: 'file', pattern: pattern, fn: fn });
};

Runner.prototype.run = function( type, filepath, cb ) {
  this.debug('running ' + filepath );
  cb = cb || function(){};
  var self     = this;
  var noop     = function(file, next) { return next(); };
  var thisType = function(v) { return v.type === type; };

  async.forEachSeries(this.rules.filter(thisType), function iter( ruleSet, next) {
    dispatchRule(self, type, filepath, ruleSet, next);
  }, function end(err) {
    if (err === 'stop') { return cb();    }
    if (err           ) { return cb(err); }
    cb();
  });
};

function dispatchRule( runner, type, filepath, ruleSet, callback ) {
  var file     = new File( runner.root, runner.ui, filepath ); // each rule gets its own file instance
  var thisType = function( v) { return v.type === type; };
  var _matches = function(_m) { return match( _m.pattern, file.path ); };
  var _getfn   = function(_m) { return _m.fn; };

  if (! match(ruleSet.pattern, file.path)) {
    return callback();
  }

  var mwlist = [].concat( runner.middleware ).filter( thisType ).filter( _matches ).map( _getfn ).concat( ruleSet.mw );

  async.forEachSeries( mwlist, function iter(mw, next) {
    mw(file, function(err) {
      if (err === 'rule') { return file._lastRule ? callback('stop') : callback(); }
      if (err           ) { return next(err);  }
      next();
    });
  }, function done(err) {
    if (err) { return callback(err); }

    callback();
  });
}

function match( pattern, path ) {
  if ( pattern === true              ) { return true;                       }
  if ( pattern instanceof RegExp     ) { return pattern.test( path );       }
  if ( typeof pattern === 'string'   ) { return minimatch( path, pattern, {matchBase: true} ); }
  if ( typeof pattern === 'function' ) { return !! pattern( path );         }
  return !! pattern;
}

function File( root, ui, filepath ) {
  this.root      = root;
  this.ui        = ui;
  this.uiSource  = filepath;
  this.path      = filepath;
  this.fullpath  = path.resolve( this.root, filepath );
  this._output   = [];
  this._lastRule = false;
}
util.inherits( File, EE2 );
_.extend( File.prototype, _plugin );


