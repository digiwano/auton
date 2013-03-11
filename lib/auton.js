var util    = require('util');
var _       = require('underscore');
var EE2     = require('eventemitter2').EventEmitter2;
var wrench  = require('wrench');
var UI      = require('./ui');
var Runner  = require('./runner');
var Watcher = require('./watcher');
var Server  = require('./server');
var MW      = require('./middleware');
var _plugin = require('./plugin');
var VERSION = require("../package.json").version;
var path    = require('path');
var async   = require('async');

var _slice = Array.prototype.slice;

var defaultOptions = {};
var optionNames = ['root'];

function Auton( opts ) {
  var self = this;
  var o    = _.extend( {}, defaultOptions, opts );
  _.extend( this, _.pick(o, optionNames) );

  var _e          = process.env;
  this.env        = o.env || _e.AUTON_ENV || _e.NODE_ENV || 'development';
  this.options    = o;
  this.root       = o.root;
  this.started    = null;
  this.rules      = [];

  var ui          = new UI({ verbosity: o.cliVerbosity })

  this.plugin( 'ui', ui );
  this.ui.startup( VERSION, this.env );

  var _r          = {root: this.root, ui: ui };
  var _wo         = _.extend( {}, _r, o.watcherOptions );
  var _ro         = _.extend( {}, _r, o.runnerOptions  );
  var watcher     = new Watcher( _wo );
  var runner      = new Runner(  _ro );
  this.plugin( 'watcher', watcher );
  this.plugin( 'runner',  runner );

  if (o.watch) {
    this.watch( o.watch );
  }

  if (o.server) {
    var _so = _.extend( {ui: ui}, o.server );
    this.plugin( 'server', new Server( _so ) );
  }
};

util.inherits( Auton, EE2 );
_.extend( Auton.prototype, _plugin );

Auton.Emitter    = EE2;
Auton.Middleware = MW;

Auton.prototype.plugin = function( pluginName, pluginInstance ) {
  var self = this;
  var p    = this[pluginName] = pluginInstance;
  p.on( 'trigger', function( type, file ) {
    self.trigger( type, file );
  } );
};

Auton.prototype.scanAll = function(cb) {
  var self = this;
  cb = cb || function(){};

  self.info("Scanning all files!");
  async.forEachSeries(this.watcher.paths, function(p, next) {
    self.debug("scanning "+path.resolve(self.root, p));
    wrench.readdirRecursive( p, function(err, files) {
      if (  err   ) { return next(err); }
      if (! files ) { return next(); }

      files.forEach(function(f){ f = path.join(p,f); self.trigger('file', f); });
    });
  }, function(err) {
    if (err) {
      self.error(err);
      return cb(err);
    }
    self.info("all files scanned!");
    cb();
  });
};

Auton.prototype._preStartError = function(name) {
  throw new Error("."+name+"() must be called before .start()!");
};

// handles watch("foo"), watch("foo","bar"), and watch(["foo", "bar"])
Auton.prototype.watch = function watch( file ) {
  if (this.started) {
    return this._preStartError();
  }
  var self = this;
  var w    = (arguments.length === 1) ? [].concat( file ) : _slice.call( arguments );
  w.forEach(function(_w) {
    self.watcher.add( _w );
  });
};

Auton.prototype.trigger = function( type, filepath, cb ) {
  var self = this;
  return this.runner.run( type, filepath, function(err) {
    if (err) {
      return cb && cb( err );
    }
  });
};

Auton.prototype.configure = function( env, conf ) {
  if (arguments.length === 1   && typeof  env === 'function') { return  env(this); }
  if (this.env         === env && typeof conf === 'function') { return conf(this); }
};

Auton.prototype.use = function( pattern, fn ) {
  var self = this;
  if (arguments.length === 1) {
    fn      = pattern;
    pattern = true;
  }
  var ary = _.flatten( _slice.call(arguments, 1) );
  ary.forEach(function(mw) {
    self.runner.addMiddleware( pattern, mw );
  });
};

function _mkRuleFn(t) {
  Auton.prototype[t] = function( /* pattern[, middleware, middleware, ...], rule */ ) {
    var args    = _slice.call( arguments );
    var pattern = args.shift();
    var rest    = _.flatten( args );
    this.debug("adding "+t+" rule for pattern: "+pattern.toString());
    this.runner.addRule( t, pattern, rest );
  };
}
'file del dir rmdir'.split(' ').forEach( _mkRuleFn );

module.exports.Auton = Auton;
