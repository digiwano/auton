var util    = require('util');
var forever = require('forever-monitor');
var Monitor = forever.Monitor;
var _plugin = require('./plugin');
var _       = require('underscore');
var EE2     = require('eventemitter2').EventEmitter2;

module.exports = Server;

var _defaults = { spinSleepTime: 1000, silent: true };

function Server( opts ) {
  var config    = _.extend( {}, _defaults, _.omit(opts, 'path', 'ui') );
  this.path     = opts.path;
  this.ui       = opts.ui;
  this.uiSource = 'core'; // this.path;
  this.config   = config;

  var child = this.process = new Monitor( this.path, this.config );
  child.on('start',   this._serverStart   .bind(this) );
  child.on('stop',    this._serverStop    .bind(this) );
  child.on('restart', this._serverRestart .bind(this) );
  child.on('stdout',  this._serverStdout  .bind(this) );
  child.on('stderr',  this._serverStderr  .bind(this) );
  child.on('error',   this._serverError   .bind(this) );
  child.on('exit',    this._serverExit    .bind(this) );
};

util.inherits( Server, EE2 );
_.extend( Server.prototype, _plugin );

Server.prototype.middleware = function(opts) {
  var o = _.extend( {action:'restart'}, opts );
  var self = this;
  switch (o.action) {
    case 'restart' :
    case 'start'   :
    case 'stop'    : return function(f,n) { self[ o.action ](); n(); } ;
    default        : throw new Error("Server Middleware: action '"+ o.action +"' is unknown!");
  }
};

Server.prototype.start = function( ) { 
  this.started = true;
  this.process.start();
};
Server.prototype.restart = function( ) {
  if (!this.started) { return; }
  this.process.restart();
};
Server.prototype.stop = function( ) {
  if (!this.started) { return; }
  this.process.stop();
};

Server.prototype._serverStart   = function( ) { this.success('server started');   };
Server.prototype._serverRestart = function( ) { this.success('server restarted'); };
Server.prototype._serverStop    = function( ) { this.info('server stopped');      };
Server.prototype._serverExit    = function( ) { this.info('server exited');       };
Server.prototype._serverError   = function(e) { this.error('server error : ' + e); };

Server.prototype._serverStdout  = function(data) {
  var self = this;
  var lines = data.toString().split('\n');
  if (! lines[lines.length-1].length) {
    lines.pop();
  }
  lines.forEach(function(line) {
    self.info('[stdout] ' + line );
  });
};

Server.prototype._serverStderr = function(data) {
  var self = this;
  var lines = data.toString().split('\n');
  if (! lines[lines.length-1].length) {
    lines.pop();
  }
  lines.forEach(function(line) {
    self.error('[stderr] ' + line );
  });
};
